# Domy v Itálii - Italian Property Platform

A modern Next.js 14 web application helping Czech buyers find properties in Italy. Built with Supabase, Sanity CMS, Resend, and Google Gemini AI.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [What's Working](#whats-working)
4. [What Needs Improvement](#what-needs-improvement)
5. [How to Fork & Continue Development](#how-to-fork--continue-development)
6. [Local Development Setup](#local-development-setup)
7. [Environment Variables](#environment-variables)
8. [Database Setup](#database-setup)
9. [Project Structure](#project-structure)
10. [Key Features & Components](#key-features--components)
11. [Deployment to Vercel](#deployment-to-vercel)
12. [Service Integrations](#service-integrations)
13. [Static Content & Translations](#static-content--translations)
14. [Troubleshooting](#troubleshooting)
15. [Contributing](#contributing)

---

## Project Overview

**Domy v Itálii** is a real estate platform designed for Czech users looking to purchase properties in Italy. The platform features:

- Property browsing and search functionality
- User authentication with premium "Club" membership area
- Admin panel for content management
- AI-powered email notifications
- Multi-language support (Czech, English, Italian)
- CMS for property management

**Live Site:** Deployed on Vercel (auto-updates on commits to main branch)

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Frontend** | React 18, Tailwind CSS, Radix UI (shadcn/ui) |
| **Database** | PostgreSQL via Supabase |
| **Authentication** | Supabase Auth |
| **CMS** | Sanity.io |
| **Email Service** | Resend |
| **AI** | Google Gemini (for AI-generated emails) |
| **Maps** | Leaflet / OpenStreetMap |
| **Animations** | Framer Motion |
| **Deployment** | Vercel |

---

## What's Working

### Core Functionality
- **Property Browsing** - View all properties, filter by type, price, region
- **Property Details** - Full property pages with images, descriptions, amenities
- **User Authentication** - Sign up, login, logout via Supabase
- **User Dashboard** - Favorites, saved searches, inquiries, notifications
- **Premium Club Area** - Exclusive content, documents, webinars, concierge support

### CMS (Sanity)
- Property management (create, edit, delete listings)
- Region and city management
- Image uploads and management
- Multi-language content support (EN/CS/IT)

### Email Service (Resend + Gemini AI)
- Welcome emails for new users
- Inquiry confirmation emails
- Property alert notifications
- AI-generated personalized email content via Google Gemini
- Fallback to static templates when AI unavailable

### Admin Panel (`/admin`)
- Dashboard with statistics
- User management
- Inquiry management
- Intake form review
- Document upload/management
- Club content management (videos, guides, articles)
- Email testing

### Multi-language Support
- Czech (primary), English, Italian
- Full translation system in `lib/translations.js`
- Localized content in Sanity CMS

---

## What Needs Improvement

### 1. Authentication & Legal Compliance

**Current State:** Basic email/password authentication via Supabase.

**Needs Work:**
- [ ] **GDPR Compliance** - Add explicit consent checkboxes for data processing
- [ ] **Cookie Consent** - Implement cookie banner for EU compliance
- [ ] **Privacy Policy** - Create and link proper privacy policy page
- [ ] **Terms of Service** - Create and link terms of service page
- [ ] **Email Verification** - Enforce email verification before full access
- [ ] **Password Reset** - Improve password reset flow and email templates
- [ ] **Session Management** - Add "remember me" functionality and session timeouts
- [ ] **Account Deletion** - Allow users to delete their accounts (GDPR right to erasure)

**Files to modify:**
- `app/login/page.js` - Add consent checkboxes
- `app/api/auth/*` - Implement verification endpoints
- Create `app/privacy-policy/page.js`
- Create `app/terms-of-service/page.js`

### 2. Email Recipients Configuration

**Current State:** Every inquiry (general contact, property, call booking,
concierge) submitted through `/api/inquiries` now sends two transactional
emails: an admin notification to `ADMIN_NOTIFY_EMAIL` with the inquiry
details and a link to `/admin/inquiries`, and a Czech-language confirmation
to the inquirer's email (sent regardless of auth state, never gated on the
`marketing_emails` preference). Both are logged to `email_logs`
(`inquiry_admin_notification` / `inquiry_confirmation`), and a failed send
never blocks the inquiry insert.

**Needs Work:**
- [ ] **Multiple Admin Recipients** - `ADMIN_NOTIFY_EMAIL` only supports a single address today; add CC/BCC or a list for team routing
- [ ] **Unsubscribe Links** - Add proper unsubscribe handling for marketing emails
- [ ] **Bounce Handling** - Implement bounce and complaint handling from Resend

**Configuration needed in `.env`:**
  ```
  ADMIN_NOTIFY_EMAIL=inquiries@domyvitalii.cz
  RESEND_FROM_EMAIL=noreply@domyvitalii.cz
  ```

### 3. Static Content Updates

**Current State:** Some hardcoded content exists in components.

**Needs Work:**
- [ ] **Homepage Hero** - Update hero images and text in `components/HeroSection.jsx`
- [ ] **About Page** - Update company information in `app/about/page.js`
- [ ] **Contact Information** - Update phone, email, address throughout
- [ ] **Footer Content** - Update links and company info in `components/Footer.jsx`
- [ ] **Region Images** - Replace placeholder images in `public/` folder
- [ ] **Logo & Branding** - Update `public/logo domy.svg` if needed
- [ ] **SEO Meta Tags** - Update default meta tags in layout files

**Files with static content:**
- `components/HeroSection.jsx`
- `components/Footer.jsx`
- `components/Header.jsx`
- `app/about/page.js`
- `app/contact/page.js`
- `app/process/page.js`
- `lib/translations.js` (all UI text)

---

## How to Fork & Continue Development

### Step 1: Fork the Repository

1. Go to the GitHub repository
2. Click **"Fork"** button in the top-right corner
3. Select your account/organization
4. Optionally rename the repository

### Step 2: Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_FORK_NAME.git
cd YOUR_FORK_NAME
```

### Step 3: Set Up Upstream (to receive updates)

```bash
# Add original repo as upstream
git remote add upstream https://github.com/ORIGINAL_OWNER/ORIGINAL_REPO.git

# Verify remotes
git remote -v
```

### Step 4: Keep Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Merge upstream changes into your main branch
git checkout main
git merge upstream/main

# Push updates to your fork
git push origin main
```

### Automatic Deployment on Commits

When your repository is connected to Vercel:

1. **Every push to `main` branch** triggers automatic production deployment
2. **Every push to other branches** creates a preview deployment
3. **Pull requests** get preview URLs automatically

To set this up:
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure environment variables
4. Deploy!

See [Deployment to Vercel](#deployment-to-vercel) section for details.

---

## Local Development Setup

### Prerequisites

- **Node.js 18+** ([Download](https://nodejs.org))
- **npm** or **yarn** package manager
- **Git** ([Download](https://git-scm.com))
- **Supabase Account** ([Sign up free](https://supabase.com))

### Quick Start

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd new-domy-main

# 2. Install dependencies
npm install
# or
yarn install

# 3. Set up environment variables
cp env.template .env.local
# Edit .env.local with your credentials

# 4. Start development server
npm run dev
# or
yarn dev

# 5. Open http://localhost:3000
```

### Available Scripts

```bash
npm run dev          # Start development server (with hot reload)
npm run dev:simple   # Start without hostname binding
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run clean        # Clear build cache
```

---

## Environment Variables

Create `.env.local` file in the project root:

```env
# =====================================
# REQUIRED - Core Functionality
# =====================================

# Supabase (Database & Auth)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Application URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# =====================================
# OPTIONAL - Enhanced Features
# =====================================

# Sanity CMS (Property Management)
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2023-05-03
SANITY_API_TOKEN=your_sanity_token

# Resend (Email Service)
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Inbox that receives a notification for every new inquiry
ADMIN_NOTIFY_EMAIL=admin@yourdomain.com

# Private free-PDF lead magnets (Supabase Storage; bucket must be PRIVATE)
FREE_PDF_BUCKET=pdfs-private
FREE_PDF_PATH_INSPECTIONS=free/inspections-guide.pdf
FREE_PDF_PATH_MISTAKES=free/nejcastejsi-chyby-pri-koupi-v-italii.pdf

# Google Gemini AI (AI Email Generation)
# Get free API key: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key

# =====================================
# DEVELOPMENT
# =====================================
NODE_ENV=development
DEBUG=true
```

### Environment Variable Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (keep secret!) |
| `NEXT_PUBLIC_BASE_URL` | Yes | Your app's URL (localhost:3000 for dev) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | No | Sanity CMS project ID |
| `SANITY_API_TOKEN` | No | Sanity API token for mutations |
| `RESEND_API_KEY` | No | Resend API key (must start with re_) |
| `RESEND_FROM_EMAIL` | No | Verified sender email for Resend |
| `ADMIN_NOTIFY_EMAIL` | No | Inbox that receives a notification for every new inquiry |
| `FREE_PDF_BUCKET` | Yes for lead gate | Private Supabase Storage bucket |
| `FREE_PDF_PATH_INSPECTIONS` | Yes for lead gate | Private inspections PDF object path |
| `FREE_PDF_PATH_MISTAKES` | Yes for lead gate | Private mistakes PDF object path |
| `GEMINI_API_KEY` | No | Google Gemini API key for AI emails |

---

## Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project (choose EU region for GDPR compliance)
3. Save your database password securely
4. Get credentials from Settings → API

### 2. Run Database Migrations

In Supabase SQL Editor, run these scripts in order:

```sql
-- 1. Main database schema (profiles, favorites, inquiries, etc.)
-- File: setup-database-fixed.sql

-- 2. Email notification preferences
-- File: setup-email-notifications.sql

-- 3. Premium club tables (optional)
-- File: add-premium-club-tables-only.sql

-- 4. Free PDF email leads
-- File: setup-leads.sql

-- 5. Inquiry inquiryType/propertyTitle columns (admin + confirmation emails)
-- File: add-inquiry-metadata-columns.sql
```

### 3. Configure Authentication

In Supabase Dashboard → Authentication → URL Configuration:

- **Site URL:** `http://localhost:3000` (dev) or your production URL
- **Redirect URLs:** Add `http://localhost:3000/**` and your production URL

### Database Tables Overview

| Table | Purpose |
|-------|---------|
| `profiles` | User profile information |
| `favorites` | User's saved properties |
| `saved_searches` | Search criteria with email alerts |
| `inquiries` | Property inquiries from users |
| `notification_preferences` | Email notification settings |
| `email_logs` | Email tracking and history |
| `leads` | Double-opt-in email leads for protected free PDFs |
| `intake_forms` | Client questionnaires |
| `club_documents` | Premium club documents |
| `club_content` | Premium videos, guides, articles |
| `concierge_tickets` | Support tickets |

---

## Project Structure

```
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API routes
│   │   ├── profile/              # User profile endpoints
│   │   ├── properties/           # Property data endpoints
│   │   ├── send-email/           # Email sending endpoint
│   │   └── ...
│   ├── admin/                    # Admin panel pages
│   │   ├── club-content/         # Manage premium content
│   │   ├── content/              # Property/region management
│   │   ├── documents/            # Document management
│   │   ├── email-test/           # Email testing interface
│   │   ├── inquiries/            # Inquiry management
│   │   ├── intake-forms/         # Client form review
│   │   ├── users/                # User management
│   │   ├── layout.js             # Admin layout wrapper
│   │   └── page.js               # Admin dashboard
│   ├── dashboard/                # User dashboard pages
│   │   ├── favorites/            # Saved properties
│   │   ├── searches/             # Saved searches
│   │   ├── inquiries/            # User's inquiries
│   │   ├── notifications/        # Notification settings
│   │   ├── profile/              # Profile settings
│   │   └── ...
│   ├── login/                    # Authentication page
│   ├── properties/               # Property listing & details
│   ├── regions/                  # Region listing
│   ├── about/                    # About page
│   ├── contact/                  # Contact page
│   ├── process/                  # Buying process guide
│   └── ...
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── Header.jsx                # Site header/navigation
│   ├── Footer.jsx                # Site footer
│   ├── HeroSection.jsx           # Homepage hero
│   ├── PropertyCard.jsx          # Property listing card
│   ├── PropertyGrid.jsx          # Property grid layout
│   └── ...
│
├── lib/                          # Utility libraries
│   ├── supabase.js               # Supabase client configuration
│   ├── sanity.js                 # Sanity CMS client & queries
│   ├── emailService.js           # Email service (Resend + Gemini)
│   ├── translations.js           # Multi-language translations
│   ├── currency.js               # Currency formatting
│   └── utils.js                  # General utilities
│
├── hooks/                        # Custom React hooks
│   ├── use-mobile.jsx            # Mobile detection hook
│   └── use-toast.js              # Toast notification hook
│
├── public/                       # Static assets
│   ├── hero bg/                  # Hero background images
│   ├── logo domy.svg             # Site logo
│   └── [region images]           # Region placeholder images
│
├── *.sql                         # Database setup scripts
├── env.template                  # Environment variable template
├── tailwind.config.js            # Tailwind CSS configuration
├── next.config.js                # Next.js configuration
└── package.json                  # Dependencies and scripts
```

---

## Key Features & Components

### Authentication Flow

1. User visits `/login`
2. Can sign up or log in via Supabase Auth
3. On successful auth, profile is created/fetched via `/api/profile`
4. User is redirected to `/club` (premium area) or `/dashboard`
5. Row Level Security (RLS) in Supabase ensures data privacy

### Email System

The email system (`lib/emailService.js`) supports:

1. **AI-Generated Content** - Uses Google Gemini to create personalized email content
2. **Fallback Templates** - Static templates when AI is unavailable
3. **Development Mode** - Logs emails to console when Resend isn't configured

Email types:
- `welcome` - New user onboarding
- `inquiry-response` - Property inquiry confirmation
- `property-alert` - New property notifications

### Free PDF email gate

1. Run `db/setup-leads.sql` after the email notification migration.
2. Create or reuse a **private** Supabase Storage bucket and upload the two
   files at the paths configured by `FREE_PDF_PATH_INSPECTIONS` and
   `FREE_PDF_PATH_MISTAKES`.
3. Anonymous visitors submit the form, receive a double-opt-in email, confirm,
   and are redirected to `/dekujeme`, where a fresh one-hour signed download
   starts. A one-hour signed backup link is also emailed at confirmation.
4. Logged-in Klub users download directly; the server records their lead using
   their authenticated email. An existing unsubscribe is never reversed by a
   download.
5. Both lead emails are written to `email_logs`. One-click unsubscribe uses the
   lead token and immediately marks the lead `unsubscribed`.

The public endpoint uses an in-memory IP limit (5 submissions per 15 minutes).
This is per application instance; use a distributed limiter before high-volume
deployment. Never copy gated files into `public/`: legacy `/pdfs/*.pdf` URLs are
not redirected, and the former inspections/mistakes asset URLs intentionally
return 404. Public PDFs unrelated to the lead gate may still exist.

### Translation System

All UI text is managed in `lib/translations.js`:

```javascript
import { t } from '@/lib/translations'

// Usage in components
const text = t('hero.title', 'cs') // Returns Czech translation
```

Languages: `cs` (Czech), `en` (English), `it` (Italian)

### Property Data Flow

1. Properties are managed in **Sanity CMS**
2. GROQ queries in `lib/sanity.js` fetch property data
3. API routes in `app/api/properties/` serve the data
4. Sample/hardcoded data is used when Sanity isn't configured

---

## Deployment to Vercel

### Initial Deployment

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js

3. **Configure Environment Variables**
   
   In Vercel Dashboard → Settings → Environment Variables, add all your `.env.local` variables.

4. **Deploy**
   
   Click "Deploy" - Vercel builds and deploys automatically.

### Automatic Deployments

Once connected, Vercel automatically:

- **Deploys** every push to `main` branch to production
- **Creates preview URLs** for all other branches
- **Runs builds** and checks for errors
- **Provides rollback** capability

### Post-Deployment Checklist

- [ ] Update `NEXT_PUBLIC_BASE_URL` to your Vercel URL
- [ ] Add Vercel URL to Supabase redirect URLs
- [ ] Configure custom domain (optional)
- [ ] Enable Vercel Analytics
- [ ] Test all functionality on production

See `VERCEL-DEPLOYMENT-GUIDE.md` for detailed instructions.

---

## Service Integrations

### Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Run SQL migration scripts
3. Configure authentication settings
4. Enable Row Level Security policies

### Sanity CMS Setup

1. Create project at [sanity.io](https://sanity.io)
2. Install Sanity CLI: `npm install -g @sanity/cli`
3. Configure schema for properties, regions, cities
4. Add API credentials to environment

### Resend Setup

1. Create account at [resend.com](https://resend.com)
2. Verify sender domain/email address
3. Generate API key
4. Add to `RESEND_API_KEY` environment variable

### Google Gemini Setup

1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Create API key (free!)
3. Add to `GEMINI_API_KEY` environment variable

---

## Static Content & Translations

### Editing Static Content

| Content | Location |
|---------|----------|
| Hero section | `components/HeroSection.jsx` |
| Navigation | `components/Header.jsx` |
| Footer | `components/Footer.jsx` |
| About page | `app/about/page.js` |
| Contact page | `app/contact/page.js` |
| Process guide | `app/process/page.js` |

### Editing Translations

All UI text is in `lib/translations.js`. Structure:

```javascript
export const translations = {
  en: { /* English translations */ },
  cs: { /* Czech translations */ },
  it: { /* Italian translations */ }
}
```

To add/edit translations:
1. Find the key in the file
2. Update the value for each language
3. Restart dev server to see changes

### Updating Images

- **Hero backgrounds:** `public/hero bg/`
- **Region images:** `public/[RegionName].jpg`
- **Logo:** `public/logo domy.svg`
- **Property placeholders:** `public/placeholder-property.jpg`

---

## Troubleshooting

### Common Issues

**"Supabase client error"**
- Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Ensure database migrations were run

**"Authentication not working"**
- Verify Supabase project is active
- Check redirect URLs in Supabase settings
- Ensure RLS policies are enabled

**"Properties not loading"**
- Check if Sanity is configured
- Verify Sanity API credentials
- Sample data should work without Sanity

**"Emails not sending"**
- In development, emails log to console (normal!)
- For production, verify `RESEND_API_KEY` starts with `re_`
- Check Resend sender verification

**"AI emails not generating"**
- Verify `GEMINI_API_KEY` is set
- Check console for Gemini errors
- System falls back to static templates automatically

### Debug Tips

1. Check browser console for client-side errors
2. Check terminal for server-side errors
3. Use `/admin/email-test` to test email functionality
4. Check Supabase Dashboard for database issues
5. Check Vercel deployment logs for production issues

---

## Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Make** your changes
4. **Test** thoroughly (local and preview deployment)
5. **Commit** with clear messages: `git commit -m "Add: description of feature"`
6. **Push** to your fork: `git push origin feature/your-feature`
7. **Create** a Pull Request

### Code Style

- Use ESLint configuration (run `npm run lint`)
- Follow existing component patterns
- Add translations for any new UI text
- Test on mobile and desktop

### Commit Message Format

```
Type: Short description

Longer description if needed.

Types: Add, Fix, Update, Remove, Refactor, Docs
```

---

## Support & Resources

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Sanity Docs:** [sanity.io/docs](https://sanity.io/docs)
- **Resend Docs:** [resend.com/docs](https://resend.com/docs)
- **Tailwind CSS:** [tailwindcss.com/docs](https://tailwindcss.com/docs)

---

## License

[Specify your license here]

---

**Last Updated:** January 2026

**Happy Coding!** 🇮🇹🏠
