# ✅ Email Concierge - Testing Checklist

Use this checklist to verify everything works correctly.

---

## 🎯 Phase 1: Basic Testing (No API Keys)

### Start Dev Server
```bash
npm run dev
```

### Test 1: Visit Admin Email Test Page
- [ ] Navigate to `http://localhost:3000/admin/email-test`
- [ ] Page loads without errors
- [ ] System Status shows "Not Configured" badges (expected)
- [ ] Demo Mode alert appears

### Test 2: Send Welcome Email (Console Log)
- [ ] Enter test email: `test@example.com`
- [ ] Enter test name: `Test User`
- [ ] Click "Send Welcome Email"
- [ ] Success alert appears
- [ ] Badge shows "Static Template"
- [ ] Console shows email details (not actually sent)

### Test 3: Other Email Types
- [ ] Click "Send Inquiry Confirmation" → Success
- [ ] Click "Send Property Alert" → Success  
- [ ] Click "Run Cron Job" → Success (0 emails sent)
- [ ] All show "Static Template" badge

**Console Output Example:**
```
OpenAI not configured - using static templates for: welcome
SendGrid not configured - Email would be sent: { ... }
```

✅ **Phase 1 Complete:** Basic functionality works without API keys!

---

## 🔑 Phase 2: SendGrid Testing (Static Templates)

### Setup
```bash
# Add to .env.local
SENDGRID_API_KEY=SG.your_actual_key_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Restart server
npm run dev
```

### Test 4: SendGrid Configuration
- [ ] Visit `/admin/email-test`
- [ ] "SendGrid Email Service" badge shows "Configured"
- [ ] "OpenAI Content Generation" still shows "Not Configured"
- [ ] Alert shows "Static Mode" message

### Test 5: Send Real Email
- [ ] Enter YOUR REAL email address
- [ ] Click "Send Welcome Email"
- [ ] Success alert appears
- [ ] Check your inbox for email
- [ ] Email has professional static template content
- [ ] Badge shows "Static Template"

### Test 6: Verify Email Content
Check that email includes:
- [ ] Subject: "Welcome to Domy v Itálii - Your Italian Property Journey Begins!"
- [ ] Body starts with "Welcome [Your Name]!"
- [ ] Contains links to /properties, /dashboard, etc.
- [ ] Professional formatting with HTML

✅ **Phase 2 Complete:** Real emails sent with static templates!

---

## 🤖 Phase 3: AI Content Generation

### Setup
```bash
# Add to .env.local (keep SendGrid key)
OPENAI_API_KEY=sk-your_actual_openai_key_here

# Restart server
npm run dev
```

### Test 7: OpenAI Configuration
- [ ] Visit `/admin/email-test`
- [ ] Both badges show "Configured"
- [ ] Alert shows "Live Mode" message

### Test 8: AI Welcome Email
- [ ] Enter your real email
- [ ] Click "Send Welcome Email"
- [ ] Success alert appears
- [ ] Badge shows "AI-Generated Content" ✨
- [ ] Check inbox - content is warm and personalized
- [ ] Subject line is unique (not the static one)

### Test 9: AI Inquiry Email
- [ ] Click "Send Inquiry Confirmation"
- [ ] Badge shows "AI-Generated Content"
- [ ] Email arrives with personalized, warm tone
- [ ] References "Luxury Villa in Tuscany"
- [ ] Acknowledges the inquiry message

### Test 10: AI Property Alert
- [ ] Click "Send Property Alert"
- [ ] Badge shows "AI-Generated Content"
- [ ] Email is exciting about 3 new matches
- [ ] References Tuscany, villa, price range
- [ ] Has strong call-to-action

### Test 11: Compare AI vs Static
Send the same email twice:
- [ ] With OpenAI configured → Warm, conversational
- [ ] Without OpenAI → Professional, template-based
- [ ] Both are grammatically correct and useful

✅ **Phase 3 Complete:** AI generates personalized content!

---

## 📊 Phase 4: Database & Cron Job

### Setup Database
```sql
-- Run in Supabase SQL Editor
-- Paste contents of add-alert-columns.sql
```

### Test 12: Database Migration
- [ ] SQL runs without errors
- [ ] Success message appears
- [ ] Query `saved_searches` table
- [ ] New columns exist: `alertsEnabled`, `lastAlertSent`, `lastMatchCount`

### Test 13: Cron Job (No Saved Searches)
- [ ] Click "Run Cron Job" in admin panel
- [ ] Response shows: `emailsSent: 0`, `searchesProcessed: 0`
- [ ] Success status
- [ ] Timestamp is current

### Test 14: Create Test Saved Search
```sql
-- Run in Supabase SQL Editor
INSERT INTO saved_searches ("userId", name, filters, "alertsEnabled", "createdAt")
VALUES (
  (SELECT id FROM auth.users LIMIT 1), -- Use first user's ID
  'Test Search - Tuscany Villas',
  '{"type": "villa", "city": "Tuscany", "priceMax": 500000}'::jsonb,
  true,
  NOW()
);
```

### Test 15: Cron Job (With Saved Search)
- [ ] Click "Run Cron Job"
- [ ] Response shows: `searchesProcessed: 1`
- [ ] If properties match → `emailsSent: 1`
- [ ] Check email for property alert
- [ ] Alert includes search criteria from database

### Test 16: Manual Cron Trigger (curl)
```bash
curl -X POST http://localhost:3000/api/cron/alerts
```
- [ ] JSON response received
- [ ] Same data as admin panel test
- [ ] No errors

✅ **Phase 4 Complete:** Full automation works!

---

## 🚀 Phase 5: Production Readiness

### Environment Variables (Vercel)
- [ ] `SENDGRID_API_KEY` added to Vercel
- [ ] `SENDGRID_FROM_EMAIL` added to Vercel (Required!)
- [ ] `OPENAI_API_KEY` added to Vercel (optional)
- [ ] `NEXT_PUBLIC_BASE_URL` set to production URL
- [ ] `CRON_SECRET` generated and added (optional)

### Deployment
- [ ] Push code to repository
- [ ] Vercel deployment succeeds
- [ ] Visit production `/admin/email-test`
- [ ] Test email sends from production

### Sender Authentication (SendGrid)
- [ ] Domain verified in SendGrid
- [ ] SPF/DKIM records configured
- [ ] Test email not in spam folder

### Cron Schedule (Optional)
Choose one method:

**Option A: Vercel Cron**
- [ ] Add to `vercel.json`
- [ ] Redeploy
- [ ] Verify in Vercel dashboard

**Option B: External Service**
- [ ] Sign up for cron-job.org
- [ ] Add endpoint: `https://yourdomain.com/api/cron/alerts`
- [ ] Add Authorization header with `CRON_SECRET`
- [ ] Schedule daily at 9 AM

### Monitor First Run
- [ ] Wait for scheduled cron execution
- [ ] Check Vercel function logs
- [ ] Verify emails sent
- [ ] No errors in logs

✅ **Phase 5 Complete:** Live in production!

---

## 🐛 Troubleshooting

### Email Not Received
1. Check spam folder
2. Verify SendGrid sender authentication
3. Check Vercel function logs for errors
4. Test with different email provider

### AI Content Not Generated
1. Verify OpenAI API key is correct
2. Check OpenAI usage quota
3. Review function logs for OpenAI errors
4. Static templates should still work

### Cron Job Failing
1. Check saved_searches table has data
2. Verify notification_preferences allow emails
3. Ensure Sanity has properties
4. Review detailed error response

### Database Errors
1. Run `add-alert-columns.sql` again
2. Check RLS policies in Supabase
3. Verify user IDs exist in auth.users

---

## 📈 Success Metrics

You'll know everything works when:

- ✅ Admin panel sends test emails instantly
- ✅ Real users receive welcome emails on signup
- ✅ Inquiry confirmations arrive in seconds
- ✅ Cron job processes saved searches daily
- ✅ Property alerts include AI-generated content
- ✅ No errors in production logs
- ✅ Users engage with email content (track in SendGrid)

---

## 🎓 Reference Documents

- **EMAIL-CONCIERGE-SUMMARY.md** - Quick overview
- **EMAIL-CONCIERGE-GUIDE.md** - Full documentation
- **add-alert-columns.sql** - Database migration

---

## 🎉 You Did It!

Once you've completed this checklist, your email system is:
- ✅ AI-powered and personalized
- ✅ Automatically sending property alerts
- ✅ Fully testable from admin panel
- ✅ Production-ready and scalable

**Congratulations!** 🚀

---

**Last Updated:** January 18, 2026  
**Version:** 1.0
