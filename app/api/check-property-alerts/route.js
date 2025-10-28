import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { client } from '@/lib/sanity';
import emailService from '@/lib/emailService';

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    
    // Get all users with saved searches who have property alerts enabled
    const { data: savedSearches, error: searchError } = await supabase
      .from('saved_searches')
      .select(`
        *,
        profiles (
          full_name,
          email
        ),
        notification_preferences (
          property_alerts,
          frequency,
          email_enabled
        )
      `);

    if (searchError) {
      console.error('Error fetching saved searches:', searchError);
      return NextResponse.json({ error: 'Failed to fetch saved searches' }, { status: 500 });
    }

    const alertsSent = [];
    
    for (const search of savedSearches) {
      // Skip if user doesn't want property alerts or email is disabled
      const prefs = search.notification_preferences?.[0];
      if (!prefs?.property_alerts || !prefs?.email_enabled) {
        continue;
      }

      // Check if we should send alert based on frequency
      const lastSent = search.last_alert_sent ? new Date(search.last_alert_sent) : null;
      const now = new Date();
      
      let shouldSend = false;
      if (!lastSent) {
        shouldSend = true; // Never sent before
      } else {
        const hoursSinceLastSent = (now - lastSent) / (1000 * 60 * 60);
        
        switch (prefs.frequency) {
          case 'instant':
            shouldSend = hoursSinceLastSent >= 1; // At least 1 hour between instant alerts
            break;
          case 'daily':
            shouldSend = hoursSinceLastSent >= 24;
            break;
          case 'weekly':
            shouldSend = hoursSinceLastSent >= 168; // 24 * 7
            break;
          default:
            shouldSend = hoursSinceLastSent >= 24;
        }
      }

      if (!shouldSend) continue;

      try {
        // Query Sanity for matching properties
        const searchCriteria = search.search_criteria;
        let sanityQuery = `*[_type == "property"`;
        const params = {};

        if (searchCriteria.type) {
          sanityQuery += ` && type == $type`;
          params.type = searchCriteria.type;
        }
        
        if (searchCriteria.city) {
          sanityQuery += ` && city == $city`;
          params.city = searchCriteria.city;
        }
        
        if (searchCriteria.priceMin) {
          sanityQuery += ` && price >= $priceMin`;
          params.priceMin = searchCriteria.priceMin;
        }
        
        if (searchCriteria.priceMax) {
          sanityQuery += ` && price <= $priceMax`;
          params.priceMax = searchCriteria.priceMax;
        }

        // Only get properties created/updated since last alert or in the last 24 hours
        const checkDate = lastSent || new Date(now.getTime() - 24 * 60 * 60 * 1000);
        sanityQuery += ` && _updatedAt > $checkDate`;
        params.checkDate = checkDate.toISOString();

        sanityQuery += `] | order(_updatedAt desc)[0...10]`;

        const properties = await client.fetch(sanityQuery, params);

        if (properties && properties.length > 0) {
          // Send property alert email
          const emailResult = await emailService.sendPropertyAlert({
            userEmail: search.profiles?.email,
            userName: search.profiles?.full_name || 'Valued Customer',
            properties,
            searchCriteria
          });

          if (emailResult.success) {
            // Update last_alert_sent timestamp
            await supabase
              .from('saved_searches')
              .update({ last_alert_sent: now.toISOString() })
              .eq('id', search.id);

            alertsSent.push({
              userId: search.user_id,
              email: search.profiles?.email,
              propertiesCount: properties.length
            });
          }
        }
      } catch (error) {
        console.error(`Error processing alert for user ${search.user_id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      alertsSent: alertsSent.length,
      details: alertsSent
    });

  } catch (error) {
    console.error('Error in check-property-alerts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}