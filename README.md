# Domy v Itálii - Italian Property Platform

A modern Next.js 14 application for helping Czech buyers find properties in Italy. Built with Supabase, Sanity CMS, and a comprehensive email notification system.

## 🚀 Quick Start (Local Development)

### Prerequisites

- **Node.js 18+** and **npm/yarn**
- **Supabase account** (free tier available)
- **Git**

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd new-domy-main
npm install
# or
yarn install
```

### 2. Environment Setup

```bash
# Copy the environment template
cp env.template .env.local

# Edit .env.local with your actual values
# At minimum, you need Supabase credentials
```

### 3. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key to `.env.local`
3. Run the database setup scripts in Supabase SQL Editor:

```sql
-- Run these in order:
-- 1. setup-database-fixed.sql (main schema)
-- 2. setup-email-notifications.sql (email preferences)
```

### 4. Start Development Server

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## 📋 Detailed Setup Guide

### Required Services

#### 🔐 Supabase (Required)
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Get your credentials from Settings > API:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Run the SQL scripts in the SQL Editor

#### 🎨 Sanity CMS (Optional for MVP)
1. Create account at [sanity.io](https://sanity.io)
2. Create a new project
3. Add credentials to `.env.local`
4. **Skip this initially** - the app includes sample data

#### 📧 SendGrid (Optional for MVP)
1. Create account at [sendgrid.com](https://sendgrid.com)
2. Generate API key
3. Add to `.env.local`
4. **Skip this initially** - emails will be logged to console

### Database Schema

The platform uses PostgreSQL (via Supabase) with these main tables:

- **profiles** - User information
- **favorites** - User's saved properties  
- **saved_searches** - Search criteria with alerts
- **inquiries** - Property inquiries
- **notification_preferences** - Email settings
- **email_logs** - Email tracking

### Development Workflow

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## 🏗 Architecture Overview

### Tech Stack
- **Frontend**: Next.js 14, React 18, Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (Supabase)
- **CMS**: Sanity (optional)
- **Email**: SendGrid
- **Maps**: Leaflet/OpenStreetMap

### Key Features
- 🔐 User authentication with Supabase
- 🏠 Property browsing and search
- ❤️ Favorites system
- 🔍 Saved searches with email alerts
- 📧 Email notifications
- 🗺️ Interactive maps
- 📱 Responsive design
- 🌍 Multi-language support (EN/CS/IT)

## 🧪 Testing

### Authentication Test
Run this in your browser console after starting the app:

```javascript
// Available in test-auth.js
testAuthentication()
```

### Manual Testing Checklist
- [ ] Homepage loads with sample properties
- [ ] User can register/login
- [ ] Dashboard is accessible after login
- [ ] Properties can be favorited
- [ ] Search functionality works
- [ ] Responsive design on mobile

## 📁 Project Structure

```
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   ├── dashboard/         # User dashboard
│   ├── properties/        # Property pages
│   └── admin/            # Admin interface
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   └── *.js              # Custom components
├── lib/                   # Utilities and services
│   ├── supabase.js       # Database client
│   ├── sanity.js         # CMS client
│   └── emailService.js   # Email service
├── hooks/                 # Custom React hooks
└── *.sql                 # Database setup scripts
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `NEXT_PUBLIC_BASE_URL` | ✅ | App URL (localhost:3000 for dev) |
| `SENDGRID_API_KEY` | ❌ | Email service (optional) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | ❌ | CMS (optional) |
| `OPENAI_API_KEY` | ❌ | AI content generation (optional) |

### Development vs Production

**Development Mode:**
- Uses sample property data
- Emails logged to console
- Hot reloading enabled
- Debug logging active

**Production Mode:**
- Requires all external services
- Real email sending
- Optimized builds
- Error tracking

## 🚨 Troubleshooting

### Common Issues

**"Supabase client error"**
- Check your Supabase URL and keys in `.env.local`
- Ensure database scripts have been run

**"Authentication not working"**
- Verify Supabase project is active
- Check RLS policies are enabled
- Run `setup-database-fixed.sql`

**"Properties not loading"**
- Sample data should work without Sanity
- Check console for API errors
- Verify API routes are working

**"Emails not sending"**
- Normal in development - check console logs
- For production, add SendGrid API key

### Getting Help

1. Check the browser console for errors
2. Check the terminal for server errors
3. Verify all required environment variables are set
4. Ensure database scripts have been executed

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The app works on any Node.js hosting platform:
- Netlify
- Railway
- DigitalOcean
- AWS/GCP/Azure

## 📝 Development Notes

### Sample Data
The app includes hardcoded sample properties for development. For production, connect to Sanity CMS or modify the API to use your data source.

### Email Development
In development mode, emails are logged to the console instead of being sent. This allows you to test the email functionality without configuring SendGrid.

### Authentication Flow
1. User registers/logs in via Supabase
2. Profile automatically created via database trigger
3. User can access protected dashboard routes
4. Row Level Security ensures data privacy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

[Your License Here]

---

**Happy coding! 🇮🇹🏠**
