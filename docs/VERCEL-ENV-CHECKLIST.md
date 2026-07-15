# 📋 Vercel Environment Variables Checklist

Copy and paste this checklist when setting up your environment variables in Vercel.

---

## ✅ Required Variables (Must Have)

Copy these into Vercel → Settings → Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_BASE_URL=
NODE_ENV=production
```

### Where to Get Each Value:

| Variable | Where to Find |
|----------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → Project API keys → anon/public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → Project API keys → service_role (click "Reveal") |
| `NEXT_PUBLIC_BASE_URL` | Your Vercel deployment URL (e.g., `https://your-app.vercel.app`) |
| `NODE_ENV` | Set to `production` |

---

## 🔧 Optional Variables (Add if Using These Services)

### Sanity CMS (For Property Content)

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2023-05-03
SANITY_API_TOKEN=
```

**Where to get:** Sanity → Project Settings → API

---

### Resend (For Email Notifications)

```env
RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

**Where to get:** Resend Dashboard → API Keys → Create API Key

**Permissions needed:** Sending access, plus a verified domain/sender for `RESEND_FROM_EMAIL`

---

### OpenAI (For AI Content Generation)

```env
OPENAI_API_KEY=
```

**Where to get:** OpenAI Platform → API Keys → Create new secret key

---

### CORS Configuration

```env
CORS_ORIGINS=https://your-app.vercel.app,https://your-custom-domain.com
```

**Format:** Comma-separated list of allowed origins (no spaces)

---

## 🔐 Security Best Practices

- ✅ **NEVER** commit `.env.local` or any file with real API keys to Git
- ✅ Keep `SUPABASE_SERVICE_ROLE_KEY` secret (it has admin access)
- ✅ Keep `RESEND_API_KEY` secret
- ✅ Keep `OPENAI_API_KEY` secret
- ✅ Only `NEXT_PUBLIC_*` variables are exposed to the browser
- ✅ All other variables are server-side only

---

## 🎯 Quick Copy Template (for Vercel)

Copy this template and fill in your values:

```env
# === REQUIRED ===
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
NODE_ENV=production

# === OPTIONAL (if using) ===
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2023-05-03
SANITY_API_TOKEN=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
OPENAI_API_KEY=
CORS_ORIGINS=https://your-app.vercel.app
```

---

## 📝 How to Add in Vercel

1. Go to your project in Vercel
2. Click **Settings** (top nav)
3. Click **Environment Variables** (left sidebar)
4. For each variable:
   - Enter **Key** (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Enter **Value** (your actual value)
   - Select **All Environments** (or choose specific ones)
   - Click **Save**
5. After adding all variables, **redeploy** your project

---

## ✨ Testing Your Variables

After deployment, you can verify environment variables are working:

### Test Supabase Connection:
1. Open your deployed site
2. Try to log in or sign up
3. Check browser console for errors

### Test API Routes:
1. Visit: `https://your-app.vercel.app/api/debug`
2. Should return JSON with database connection status

---

## 🔄 Updating Variables

If you need to change a variable:

1. Go to Vercel → Settings → Environment Variables
2. Find the variable
3. Click **Edit** or **Delete**
4. Update the value
5. **Important:** Redeploy for changes to take effect
   - Deployments → Three dots (⋮) → Redeploy

---

## 🚨 Common Issues

### Issue: Variables not working after adding them
**Solution:** Redeploy the project. Environment variables only apply to new deployments.

### Issue: "Supabase URL is undefined" error
**Solution:** Make sure variable name starts with `NEXT_PUBLIC_` for client-side access.

### Issue: Authentication not working
**Solution:** 
1. Check `SUPABASE_SERVICE_ROLE_KEY` is correct
2. Verify Supabase redirect URLs include your Vercel domain

### Issue: Emails not sending
**Solution:**
1. Verify `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are set
2. Check Resend dashboard for errors
3. Without Resend, emails log to console (check Vercel logs)

---

## 📚 More Info

- **Vercel Environment Variables:** [vercel.com/docs/concepts/projects/environment-variables](https://vercel.com/docs/concepts/projects/environment-variables)
- **Next.js Environment Variables:** [nextjs.org/docs/basic-features/environment-variables](https://nextjs.org/docs/basic-features/environment-variables)

---

**Happy Deploying! 🚀**

