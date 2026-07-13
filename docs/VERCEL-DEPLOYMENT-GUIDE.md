# 🚀 Vercel Deployment Guide

This guide will walk you through deploying your Italian Property Platform to Vercel with Supabase.

## Prerequisites

- [ ] GitHub, GitLab, or Bitbucket account
- [ ] Vercel account (free at [vercel.com](https://vercel.com))
- [ ] Supabase project (free at [supabase.com](https://supabase.com))

---

## Step 1: Prepare Supabase Database

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a **Database Password** (save it securely!)
3. Select a region close to your users (e.g., Europe for Czech users)
4. Wait for the project to be created (~2 minutes)

### 1.2 Set Up Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Run the following SQL files in order:
   - First: `setup-database-fixed.sql` (or `setup-database.sql`)
   - Then: `setup-email-notifications.sql`
   - Finally: `add-premium-club-tables-only.sql`

3. Verify tables were created in **Table Editor**

### 1.3 Get Supabase Credentials

From your Supabase project dashboard:

1. Go to **Project Settings** → **API**
2. Copy these values (you'll need them for Vercel):
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **Anon/Public Key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   
3. Go to **Project Settings** → **API** → **Service Role Key** (show and copy):
   - **Service Role Key** (`SUPABASE_SERVICE_ROLE_KEY`) ⚠️ Keep this secret!

---

## Step 2: Push Code to Git Repository

### Option A: Create New Repository (if not already done)

```bash
# Initialize git if needed
git init

# Add all files
git add .

# Create first commit
git commit -m "Prepare for Vercel deployment"

# Create GitHub repository and push
# (Follow GitHub's instructions to add remote and push)
```

### Option B: Push Existing Repository

```bash
# Make sure changes are committed
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

---

## Step 3: Deploy to Vercel

### 3.1 Import Project

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Vercel will auto-detect it's a Next.js project ✅

### 3.2 Configure Project Settings

**Framework Preset:** Next.js (auto-detected)  
**Root Directory:** `./` (leave as is)  
**Build Command:** `npm run build` (auto-detected)  
**Output Directory:** `.next` (auto-detected)  
**Install Command:** `npm install` (auto-detected)

### 3.3 Add Environment Variables

Click **Environment Variables** and add the following:

#### Required Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
NODE_ENV=production
```

#### Optional Variables (add if you're using these services):

```env
# Sanity CMS (if you have content)
NEXT_PUBLIC_SANITY_PROJECT_ID=your-sanity-project-id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2023-05-03
SANITY_API_TOKEN=your-sanity-token

# SendGrid (for email notifications)
SENDGRID_API_KEY=your-sendgrid-api-key

# OpenAI (for AI-generated content)
OPENAI_API_KEY=your-openai-api-key

# CORS (use your Vercel domain)
CORS_ORIGINS=https://your-app.vercel.app
```

💡 **Tip:** For each variable, select **"All Environments"** unless you need different values for production/preview/development.

### 3.4 Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes for the build to complete
3. You'll get a URL like: `https://your-app.vercel.app`

---

## Step 4: Post-Deployment Configuration

### 4.1 Update Supabase Auth Settings

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Vercel URL to **Site URL**: `https://your-app.vercel.app`
4. Add to **Redirect URLs**:
   - `https://your-app.vercel.app/**`
   - `https://*.vercel.app/**` (for preview deployments)

### 4.2 Update Environment Variable

Now that you have your Vercel URL:

1. In Vercel dashboard, go to **Settings** → **Environment Variables**
2. Update `NEXT_PUBLIC_BASE_URL` to your actual Vercel URL
3. Update `CORS_ORIGINS` to include your Vercel URL
4. Click **"Save"**
5. **Redeploy** the project (Vercel will prompt you)

### 4.3 Custom Domain (Optional)

1. In Vercel, go to **Settings** → **Domains**
2. Add your custom domain (e.g., `domyvitalii.cz`)
3. Follow Vercel's DNS instructions
4. Update `NEXT_PUBLIC_BASE_URL` to your custom domain
5. Add custom domain to Supabase redirect URLs

---

## Step 5: Test Your Deployment

### 5.1 Basic Tests

- [ ] Visit your Vercel URL
- [ ] Homepage loads correctly
- [ ] Images display properly
- [ ] Navigation works

### 5.2 Authentication Tests

- [ ] Click "Sign Up" or "Login"
- [ ] Create a new account
- [ ] Verify email functionality (if SendGrid is configured)
- [ ] Log in successfully
- [ ] Access `/dashboard` when logged in
- [ ] Log out works

### 5.3 Feature Tests

- [ ] Browse properties
- [ ] View regions
- [ ] Submit contact form
- [ ] Test favorites (if logged in)
- [ ] Access club area (if logged in)

---

## Troubleshooting

### Build Fails

**Error: "Module not found"**
```bash
# Run locally to check for issues
npm install
npm run build
```

**Error: "NEXT_PUBLIC_SUPABASE_URL is not defined"**
- Make sure all environment variables are set in Vercel
- Redeploy after adding variables

### Authentication Issues

**Error: "Invalid redirect URL"**
- Add Vercel URL to Supabase redirect URLs
- Check that URLs match exactly (https vs http)

**Can't log in**
- Check Supabase dashboard for error logs
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check browser console for errors

### Database Errors

**Error: "relation does not exist"**
- Make sure you ran all SQL setup scripts in Supabase
- Check table names in Supabase Table Editor

### Email Not Sending

**SendGrid not working**
- Verify `SENDGRID_API_KEY` is correct
- Check SendGrid dashboard for sending quota
- In development, emails are logged to console instead

---

## Continuous Deployment

Once set up, Vercel automatically:
- ✅ Deploys every push to `main` branch
- ✅ Creates preview deployments for pull requests
- ✅ Provides instant rollbacks
- ✅ Scales automatically

To deploy updates:
```bash
git add .
git commit -m "Your changes"
git push origin main
# Vercel automatically deploys!
```

---

## Monitoring & Analytics

### Vercel Dashboard

- **Analytics:** See page views, visitors, performance
- **Logs:** Real-time function logs for debugging
- **Deployments:** History of all deployments
- **Speed Insights:** Core Web Vitals monitoring

### Supabase Dashboard

- **Table Editor:** View and edit data
- **SQL Editor:** Run queries
- **Auth:** See users and authentication logs
- **Logs:** API logs and errors

---

## Cost Breakdown (Free Tier)

### Vercel Free Plan:
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Serverless functions
- ✅ Edge Network (CDN)

### Supabase Free Plan:
- ✅ 500 MB database
- ✅ 50,000 monthly active users
- ✅ Unlimited API requests
- ✅ 1 GB file storage
- ✅ Social OAuth providers

**Both services scale up when needed!**

---

## Next Steps

1. **Set up monitoring:** Enable Vercel Analytics
2. **Add custom domain:** Make it professional
3. **Configure SendGrid:** Enable email notifications
4. **Add Sanity CMS:** Start adding property content
5. **Set up backups:** Export Supabase data regularly

---

## Support Resources

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **Vercel Community:** [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

---

## Quick Reference

### Vercel CLI Commands (Optional)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from command line
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

---

**🎉 Congratulations!** Your Italian Property Platform is now live on Vercel!

If you encounter any issues, check the Troubleshooting section or review the Vercel deployment logs.

