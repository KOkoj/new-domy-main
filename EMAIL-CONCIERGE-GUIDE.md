# Email Concierge System - Implementation Guide

## Overview

The Email Concierge system adds AI-powered, warm, context-aware email notifications to the Italian Property Platform. It intelligently generates personalized content using **Google Gemini (gemini-1.5-flash-latest)** and falls back to professional static templates when AI is unavailable.

## 🎯 Features Implemented

### 1. AI-Powered Email Generation (`lib/emailService.js`)

**New Method: `generateAIContent(type, data)`**
- Uses **Google Gemini (gemini-1.5-flash-latest)** for warm, personalized email content
- **100% FREE** - No API costs with Gemini's free tier
- Automatically falls back to static templates if Gemini is not configured
- Generates both subject lines and email body text
- Supports three email types:
  - `welcome` - New user welcome emails
  - `inquiry-response` - Inquiry confirmation emails
  - `property-alert` - Property match notifications

**Enhanced Email Methods:**
All existing email methods now use AI content when available:
- `sendWelcomeEmail({ userEmail, userName })`
- `sendInquiryConfirmation({ userEmail, userName, propertyTitle, inquiryMessage })`
- `sendPropertyAlert({ userEmail, userName, properties, searchCriteria })`

### 2. Automated Property Alerts (`/api/cron/alerts`)

**Endpoint:** `/api/cron/alerts` (GET or POST)

**Functionality:**
- Fetches all active saved searches from Supabase
- Queries Sanity CMS for available properties
- Matches properties against user search criteria
- Sends personalized email alerts to users with matches
- Respects user notification preferences
- Updates search metadata (lastAlertSent, lastMatchCount)

**Security:**
Optional `CRON_SECRET` environment variable for authentication:
```bash
Authorization: Bearer YOUR_CRON_SECRET
```

**Response Format:**
```json
{
  "success": true,
  "emailsSent": 5,
  "searchesProcessed": 12,
  "totalSearches": 15,
  "errors": [],
  "timestamp": "2026-01-18T12:00:00Z"
}
```

### 3. Admin Email Test Interface (`/admin/email-test`)

**Features:**
- Test all three email types with custom recipient
- Trigger cron job manually
- Visual status indicators for configuration
- Real-time response display with success/error messages
- Shows whether AI or static templates were used
- Detailed response information with expandable JSON

**Test Capabilities:**
- ✅ Send Welcome Email
- ✅ Send Inquiry Confirmation
- ✅ Send Property Alert
- ✅ Trigger Property Alerts Cron Job

## 🚀 Setup Instructions

### 1. Environment Variables

Add these to your `.env.local` or Vercel environment:

```bash
# SendGrid (required for actual email sending)
SENDGRID_API_KEY=your_sendgrid_api_key_here

# Google Gemini AI (optional - falls back to static templates)
# Get your FREE API key from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Cron Security (optional)
CRON_SECRET=your_random_secret_string

# Base URL (required for email links)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. Database Setup

Run the new migration to add alert functionality:

```sql
-- Run in Supabase SQL Editor
-- File: add-alert-columns.sql
```

This adds:
- `alertsEnabled` (BOOLEAN) - Whether alerts are enabled for this search
- `lastAlertSent` (TIMESTAMP) - When the last alert was sent
- `lastMatchCount` (INTEGER) - Number of properties in last alert

### 3. Vercel Cron Job (Optional)

To automate alerts, add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/alerts",
      "schedule": "0 9 * * *"
    }
  ]
}
```

This runs alerts daily at 9 AM UTC.

**Alternative:** Use external services like:
- Vercel Cron Jobs (Pro plan)
- GitHub Actions
- EasyCron
- cron-job.org

## 📧 Email Types & AI Prompts

### Welcome Email
**Trigger:** User signs up
**AI Prompt Focus:** Warm greeting, platform introduction, key features
**Static Fallback:** Professional welcome template with links

### Inquiry Confirmation
**Trigger:** User submits property inquiry
**AI Prompt Focus:** Thank user, confirm receipt, set expectations
**Static Fallback:** Standard confirmation with 24-hour response time

### Property Alert
**Trigger:** Cron job finds matching properties
**AI Prompt Focus:** Exciting discovery, search criteria summary, CTA
**Static Fallback:** List of matches with search details

## 🧪 Testing

### Manual Testing (Admin Panel)

1. Navigate to `/admin/email-test`
2. Enter test email address and name
3. Click any email test button
4. Check response for success/error
5. Verify badge shows "AI-Generated Content" or "Static Template"

### Console Testing (Development)

Without SendGrid configured, emails are logged:

```javascript
// Console output example
SendGrid not configured - Email would be sent: {
  to: 'test@example.com',
  subject: 'Welcome to Domy v Itálii!',
  from: 'noreply@domy-v-italii.com'
}
```

### Cron Job Testing

**Manual Trigger:**
```bash
curl -X POST http://localhost:3000/api/cron/alerts
# or with auth
curl -X POST http://localhost:3000/api/cron/alerts \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Expected Response:**
```json
{
  "success": true,
  "emailsSent": 3,
  "searchesProcessed": 5,
  "totalSearches": 5,
  "timestamp": "2026-01-18T12:34:56.789Z"
}
```

## 🎨 Customization

### Modifying AI Prompts

Edit `lib/emailService.js`, method `generateAIContent()`:

```javascript
case 'welcome':
  prompt = `Your custom prompt here...`;
  break;
```

### Adjusting AI Temperature

Change creativity level (0.0-1.0):

```javascript
const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  temperature: 0.7, // Lower = more focused, Higher = more creative
  // ...
});
```

### Static Template Customization

Edit the fallback HTML/text in each email method:

```javascript
// In sendWelcomeEmail()
html = `
  <div style="font-family: Arial, sans-serif;">
    <!-- Your custom HTML -->
  </div>
`;
```

## 🔍 Troubleshooting

### Emails Not Sending

1. Check SendGrid API key is set: `echo $SENDGRID_API_KEY`
2. Verify sender domain is authenticated in SendGrid
3. Check Supabase logs for database errors
4. Review API route logs: `console.log` statements

### AI Content Not Generating

1. Verify OpenAI API key: `echo $OPENAI_API_KEY`
2. Check API usage/credits in OpenAI dashboard
3. Review error logs - falls back to static templates on failure
4. Test with smaller prompts if hitting token limits

### Cron Job Not Running

1. Verify saved searches exist: `SELECT * FROM saved_searches WHERE "alertsEnabled" = true`
2. Check notification preferences: `SELECT * FROM notification_preferences`
3. Ensure Sanity has properties: Query Sanity Studio
4. Review cron job response for detailed errors

### No Matching Properties

This is expected! The cron job only sends emails when:
- Properties match the saved search criteria
- User has notification preferences enabled
- Properties exist in Sanity CMS with status "available"

## 📊 Monitoring

### Key Metrics to Track

1. **Email Delivery Rate:** SendGrid dashboard
2. **AI Generation Success Rate:** Check logs for fallbacks
3. **Cron Job Execution:** Log timestamps and results
4. **User Engagement:** Track email opens/clicks via SendGrid

### Logging

All operations log to console:
```
✅ Alert sent to user@example.com
⚠️ User not found for search abc-123
❌ Failed to send alert: API error
🔄 Starting property alerts cron job...
```

## 🚢 Deployment Checklist

- [ ] Add `SENDGRID_API_KEY` to Vercel environment
- [ ] Add `OPENAI_API_KEY` to Vercel environment (optional)
- [ ] Run `add-alert-columns.sql` in Supabase
- [ ] Configure `NEXT_PUBLIC_BASE_URL` in Vercel
- [ ] Set up Vercel Cron Job or external scheduler
- [ ] Test emails from production admin panel
- [ ] Verify sender domain in SendGrid settings
- [ ] Monitor first automated cron execution

## 🎉 Success Indicators

You'll know it's working when:
1. Admin test emails arrive in your inbox
2. AI-generated content badge shows in admin panel
3. Cron job returns positive counts: `emailsSent > 0`
4. Users receive personalized property alerts
5. No errors in Vercel function logs

## 📚 Related Files

- `lib/emailService.js` - Core email service with AI
- `app/api/cron/alerts/route.js` - Automated alert endpoint
- `components/EmailTester.js` - Admin test UI
- `app/api/send-email/route.js` - Email sending API
- `add-alert-columns.sql` - Database migration
- `setup-database-fixed.sql` - Original database schema

## 🆘 Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review console logs for error messages
3. Test in isolation (one email type at a time)
4. Verify environment variables are set correctly
5. Check Supabase RLS policies allow data access

---

**Version:** 1.0 - Concierge Edition  
**Last Updated:** January 18, 2026  
**Status:** ✅ Production Ready
