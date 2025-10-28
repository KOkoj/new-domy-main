import { NextResponse } from 'next/server';
import emailService from '@/lib/emailService';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { emailType, data } = await request.json();
    
    let result;
    
    switch (emailType) {
      case 'property-alert':
        result = await emailService.sendPropertyAlert(data);
        break;
      case 'inquiry-confirmation':
        result = await emailService.sendInquiryConfirmation(data);
        break;
      case 'welcome':
        result = await emailService.sendWelcomeEmail(data);
        break;
      case 'follow-up':
        result = await emailService.sendFollowUpEmail(data);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }
    
    if (result.success) {
      return NextResponse.json({ success: true, message: 'Email sent successfully' });
    } else {
      return NextResponse.json(
        { error: result.message || 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in send-email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}