# Email Concierge - Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         EMAIL CONCIERGE SYSTEM                      │
│                      AI-Powered Email Automation                    │
└─────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│  ADMIN INTERFACE (/admin/email-test)                                  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │   Welcome    │  │   Inquiry    │  │   Property   │  │  Trigger │ │
│  │    Email     │  │Confirmation  │  │    Alert     │  │   Cron   │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └────┬─────┘ │
│         │                 │                 │                │        │
│         └─────────────────┴─────────────────┴────────────────┘        │
│                             │                                          │
└─────────────────────────────┼──────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────────┐
│  API ROUTES                                                            │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌─────────────────────────┐        ┌──────────────────────────┐     │
│  │ /api/send-email         │        │ /api/cron/alerts         │     │
│  │                         │        │                          │     │
│  │ • Validates request     │        │ • Fetches saved_searches │     │
│  │ • Calls emailService    │        │ • Queries Sanity CMS     │     │
│  │ • Returns AI status     │        │ • Matches properties     │     │
│  └────────┬────────────────┘        │ • Sends bulk alerts      │     │
│           │                         └────────┬─────────────────┘     │
│           │                                  │                        │
└───────────┼──────────────────────────────────┼────────────────────────┘
            │                                  │
            ▼                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│  EMAIL SERVICE (lib/emailService.js)                                   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  generateAIContent(type, data)                               │    │
│  │  ┌────────────────────────────────────────────────────┐      │    │
│  │  │  OpenAI Available?                                 │      │    │
│  │  │    ├─ YES → GPT-4o-mini generates content         │      │    │
│  │  │    │         • Warm, personalized subject         │      │    │
│  │  │    │         • Context-aware body text            │      │    │
│  │  │    │         • JSON format response               │      │    │
│  │  │    │                                               │      │    │
│  │  │    └─ NO  → Return null (use static templates)    │      │    │
│  │  └────────────────────────────────────────────────────┘      │    │
│  └────────────────────────┬─────────────────────────────────────┘    │
│                            │                                          │
│  ┌─────────────────────────┼──────────────────────────────────────┐  │
│  │  sendWelcomeEmail()     │  sendInquiryConfirmation()           │  │
│  │  sendPropertyAlert()    │  sendFollowUpEmail()                 │  │
│  │                         │                                       │  │
│  │  1. Try generateAIContent() → Get subject + body               │  │
│  │  2. If AI content → Use it with dynamic HTML wrapper           │  │
│  │  3. If null → Use static template (fallback)                   │  │
│  │  4. Call sendEmail() with final content                        │  │
│  └─────────────────────────┬──────────────────────────────────────┘  │
│                            │                                          │
│  ┌─────────────────────────┼──────────────────────────────────────┐  │
│  │  sendEmail({ to, subject, text, html })                        │  │
│  │                         │                                       │  │
│  │  SendGrid Configured?   │                                       │  │
│  │    ├─ YES → sgMail.send() → Email delivered                    │  │
│  │    └─ NO  → console.log() → Logged only (dev mode)             │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│  EXTERNAL SERVICES                                                     │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │  OpenAI API      │  │  SendGrid API    │  │  Supabase DB     │   │
│  │  ────────────    │  │  ────────────    │  │  ────────────    │   │
│  │  GPT-4o-mini     │  │  Email delivery  │  │  saved_searches  │   │
│  │  Content gen.    │  │  SPF/DKIM auth   │  │  notification_   │   │
│  │  JSON responses  │  │  Click tracking  │  │    preferences   │   │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│  AUTOMATION FLOW (Cron Job)                                           │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  1. Scheduler (Vercel Cron / External Service)                        │
│     └─► POST /api/cron/alerts                                         │
│                                                                        │
│  2. Fetch Data                                                         │
│     ├─► Supabase: saved_searches WHERE alertsEnabled = true           │
│     └─► Sanity CMS: All available properties                          │
│                                                                        │
│  3. Match Properties                                                   │
│     ├─► For each saved search:                                        │
│     │   • Filter properties by type, city, price, bedrooms            │
│     │   • Check notification preferences                              │
│     │   • Count matches                                               │
│     │                                                                  │
│     └─► If matches found:                                             │
│         • emailService.sendPropertyAlert()                            │
│         • Update lastAlertSent timestamp                              │
│         • Update lastMatchCount                                       │
│                                                                        │
│  4. Return Summary                                                     │
│     └─► { emailsSent, searchesProcessed, errors, timestamp }          │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│  CONFIGURATION STATES                                                  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  State 1: No API Keys (Dev Mode)                            │    │
│  │  ───────────────────────────────────────────────────────    │    │
│  │  SendGrid: ❌  OpenAI: ❌                                    │    │
│  │  Result: Emails logged to console with static templates     │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  State 2: SendGrid Only (Static Mode)                       │    │
│  │  ───────────────────────────────────────────────────────    │    │
│  │  SendGrid: ✅  OpenAI: ❌                                    │    │
│  │  Result: Real emails sent with professional static templates│    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  State 3: Full Concierge (AI Mode) ✨                       │    │
│  │  ───────────────────────────────────────────────────────    │    │
│  │  SendGrid: ✅  OpenAI: ✅                                    │    │
│  │  Result: Real emails with AI-generated personalized content │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│  DATA FLOW EXAMPLE: Welcome Email                                     │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  User Signs Up                                                         │
│      │                                                                 │
│      ▼                                                                 │
│  POST /api/send-email                                                  │
│      { emailType: 'welcome', data: { userEmail, userName } }          │
│      │                                                                 │
│      ▼                                                                 │
│  emailService.sendWelcomeEmail({ userEmail, userName })               │
│      │                                                                 │
│      ├─► generateAIContent('welcome', { userName })                   │
│      │   │                                                             │
│      │   ├─► OpenAI: "Generate warm welcome..."                       │
│      │   │   └─► Returns: { subject: "...", body: "..." }             │
│      │   │                                                             │
│      │   └─► Or null (falls back to static)                           │
│      │                                                                 │
│      ▼                                                                 │
│  sendEmail({ to, subject, text, html })                               │
│      │                                                                 │
│      └─► SendGrid API → Email delivered to user's inbox               │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│  KEY FEATURES                                                          │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ✅ Graceful Degradation                                               │
│     AI fails → Static templates automatically used                    │
│                                                                        │
│  ✅ Zero Downtime                                                      │
│     Works without any API keys for testing/development                │
│                                                                        │
│  ✅ Cost Efficient                                                     │
│     GPT-4o-mini: ~$0.001 per email with AI                            │
│     Static: $0.00 (no AI costs)                                       │
│                                                                        │
│  ✅ Personalized                                                       │
│     AI considers context: user name, property details, search criteria│
│                                                                        │
│  ✅ Automated                                                          │
│     Cron job handles daily property alerts automatically              │
│                                                                        │
│  ✅ Testable                                                           │
│     Admin panel for instant testing and validation                    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

## Component Interactions

### 1. Manual Email Test Flow
```
Admin Panel → API Route → Email Service → OpenAI (optional) → SendGrid
```

### 2. Automated Alert Flow
```
Cron Scheduler → /api/cron/alerts → Fetch Data → Match Properties → 
  For Each Match → Email Service → OpenAI (optional) → SendGrid
```

### 3. User-Triggered Email Flow
```
User Action (signup/inquiry) → API Route → Email Service → 
  OpenAI (optional) → SendGrid → User Inbox
```

## Failure Handling

```
OpenAI Fails → Log Error → Use Static Template → Continue
SendGrid Fails → Log Error → Return Error Response
Database Fails → Log Error → Skip That Search → Continue Others
```

## Security Considerations

1. **Cron Endpoint:** Optional CRON_SECRET for authorization
2. **Email Sending:** Rate limiting via SendGrid
3. **User Data:** Checks notification preferences before sending
4. **RLS Policies:** Supabase ensures users only see their own data

---

**This architecture ensures reliability, performance, and a great user experience!**
