# 🚨 QUICK FIX - Setup Your Environment Now

You're getting a **NetworkError** because `.env.local` is missing!

## ✅ Step 1: Create `.env.local` File

In your project root (`C:\Users\matbo\Desktop\new-domy-main\`), create a file named `.env.local`

**How to create it:**
1. Open your code editor (VS Code, etc.)
2. Create new file called `.env.local` in the root folder
3. Copy and paste this content:

```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Application URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

## ✅ Step 2: Get Supabase Credentials (2 minutes)

### Option A: Create New Supabase Project (Recommended)
1. Go to **https://supabase.com**
2. Sign up/login (FREE)
3. Click **"New Project"**
4. Wait 2 minutes for setup
5. Go to **Settings > API**
6. Copy:
   - **Project URL** → Replace `https://your-project-id.supabase.co`
   - **anon public** key → Replace `your-anon-key-here`

### Option B: Use Test/Demo Credentials
If you already have a Supabase project, use those credentials.

## ✅ Step 3: Setup Database (1 minute)

Once you have Supabase credentials:

1. Open Supabase Dashboard
2. Click **"SQL Editor"** (left sidebar)
3. Click **"New Query"**
4. Copy contents of `setup-database-fixed.sql`
5. Paste and click **"Run"**
6. Create another new query
7. Copy contents of `setup-email-notifications.sql`
8. Paste and click **"Run"**

## ✅ Step 4: Restart Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## ✅ Step 5: Test Login

1. Go to **http://localhost:3000/login**
2. Click **"Sign Up"** tab
3. Create account:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `123456`
4. Click **"Create Account"**
5. Switch to **"Login"** tab
6. Login with same credentials
7. Should redirect to Premium Club! 🎉

---

## 📝 Example `.env.local` with REAL values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMDAwMDAwMCwiZXhwIjoxOTQ1NTc2MDAwfQ.abc123xyz
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

(This is an example - use YOUR actual credentials!)

---

## ❌ Common Issues:

**Still getting NetworkError?**
- Make sure you saved `.env.local` in the root folder
- Make sure you replaced the placeholder values with REAL credentials
- Restart the dev server after creating `.env.local`

**Can't find .env.local?**
- It's in the same folder as `package.json`
- Make sure your editor shows hidden files
- File name must be exactly `.env.local` (not `.env.local.txt`)

---

**Need Help?** Double-check:
1. ✅ `.env.local` file exists in root folder
2. ✅ Supabase URL and key are filled in (not placeholder text)
3. ✅ Dev server was restarted after creating file
4. ✅ You ran the SQL setup scripts in Supabase

**You're almost there! 🚀**

