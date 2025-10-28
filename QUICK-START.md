# 🚀 Quick Start Guide

Get your Italian Property Platform running locally in 5 minutes!

## Prerequisites
- Node.js 18+ installed
- A Supabase account (free at [supabase.com](https://supabase.com))

## Step 1: Setup Environment

### Windows Users:
```bash
# Run the setup script
setup-local-development.bat
```

### Mac/Linux Users:
```bash
# Make script executable and run
chmod +x setup-local-development.sh
./setup-local-development.sh
```

### Manual Setup:
```bash
# Install dependencies
npm install

# Copy environment template
cp env.template .env.local
```

## Step 2: Configure Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Get your credentials from Settings > API:
   - Project URL
   - Public anon key
   - Service role key (optional)

4. Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Step 3: Setup Database

1. Go to your Supabase project dashboard
2. Click "SQL Editor" in the sidebar
3. Create a new query and copy-paste the contents of `setup-database-fixed.sql`
4. Run the query
5. Create another query and copy-paste the contents of `setup-email-notifications.sql`
6. Run the second query

## Step 4: Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## ✅ Test Everything Works

1. **Homepage**: Should show sample properties
2. **Register**: Click "Login" → "Sign Up" → Create account
3. **Login**: Login with your credentials
4. **Dashboard**: Should be accessible after login
5. **Favorites**: Try favoriting a property

## 🎉 You're Ready!

The platform now runs with:
- ✅ Sample property data
- ✅ User authentication
- ✅ Database integration
- ✅ Email system (development mode)

## Next Steps

- **Add Real Data**: Connect Sanity CMS for property management
- **Email Service**: Add SendGrid for real email notifications
- **Customize**: Modify the sample data and styling
- **Deploy**: Push to Vercel, Netlify, or your preferred platform

## Troubleshooting

**Can't see properties?** 
- Check browser console for errors
- Verify environment variables are set

**Authentication not working?**
- Ensure Supabase credentials are correct
- Check database scripts were run successfully

**Need help?** Check the full README.md for detailed instructions.

---

**Happy coding! 🇮🇹🏠**
