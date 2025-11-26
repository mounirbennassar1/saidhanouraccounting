# Vercel Deployment Troubleshooting Guide

## ❌ Error: `net::ERR_HTTP_RESPONSE_CODE_FAILURE 500` on `/api/auth/error`

### Problem
Authentication fails with 500 error when trying to log in on Vercel.

### Root Cause
Environment variables are not properly configured in Vercel, specifically:
- `NEXTAUTH_URL` is missing or pointing to localhost
- `NEXTAUTH_SECRET` is not set
- Database URL is not configured

### ✅ Solution

#### 1. Go to Vercel Dashboard
```
https://vercel.com/[your-username]/saidhanouraccounting/settings/environment-variables
```

#### 2. Add/Update Environment Variables

Add these **exact** variables in Vercel:

| Variable Name | Value | Environment |
|--------------|--------|-------------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_pKLZVf1NQyi8@ep-dawn-hill-adjp82c6-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require` | Production, Preview, Development |
| `POSTGRES_PRISMA_URL` | `postgresql://neondb_owner:npg_pKLZVf1NQyi8@ep-dawn-hill-adjp82c6-pooler.c-2.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require` | Production, Preview, Development |
| `NEXTAUTH_SECRET` | `odg9YwFZzqVx9J3a5kVwT1s2Ih8rXb6Nq4HrT0pLm9E=` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://saidhanouraccounting-d673.vercel.app` | Production |
| `NEXTAUTH_URL` | `https://[preview-url].vercel.app` | Preview |

**⚠️ CRITICAL:** 
- Use `https://` (NOT `http://`)
- Use your actual Vercel URL (NOT `localhost:3000`)
- Select all environments (Production, Preview, Development)

#### 3. Redeploy

After adding variables:
1. Go to **Deployments** tab
2. Click **three dots (•••)** on latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

#### 4. Clear Browser Cache

Sometimes old cookies cause issues:
```
1. Open Chrome DevTools (F12)
2. Go to Application tab
3. Clear all cookies for your domain
4. Refresh the page
```

---

## Other Common Issues

### Issue: Build Fails with Prisma Error

**Error:**
```
Error: @prisma/client did not initialize yet
```

**Solution:**
- Ensure `DATABASE_URL` is set in Vercel environment variables
- The build script should automatically run `prisma generate`
- Check that your `package.json` has:
  ```json
  "scripts": {
    "build": "prisma generate && next build"
  }
  ```

### Issue: Database Connection Error

**Error:**
```
Can't reach database server
```

**Solution:**
1. Verify `DATABASE_URL` is correct in Vercel
2. Check Neon database is active (not suspended)
3. Ensure SSL mode is enabled: `?sslmode=require`
4. Check Neon dashboard for connection limits

### Issue: "Exceeded Function Size Limit"

**Error:**
```
Edge Function "middleware" size is 1.01 MB
```

**Solution:**
Already fixed in commit `523248a`. The middleware now uses lightweight JWT tokens (42.2 kB).

If you still see this:
1. Pull latest code: `git pull origin main`
2. Ensure `middleware.ts` uses `getToken` from `next-auth/jwt`
3. Check `next.config.ts` has `serverExternalPackages`

### Issue: Session Not Persisting

**Symptoms:**
- User logs in but gets logged out immediately
- Session doesn't save

**Solution:**
1. Ensure `NEXTAUTH_SECRET` is set and same across all deployments
2. Verify `NEXTAUTH_URL` matches your domain exactly
3. Check browser allows cookies
4. Try incognito/private browsing mode

### Issue: "Invalid Credentials" on Correct Password

**Solution:**
1. Database might be empty - run seed script:
   ```bash
   npm run db:seed
   ```
2. Check user exists in database
3. Verify bcrypt is working (should be in dependencies)

---

## How to Check Logs in Vercel

1. Go to your project dashboard
2. Click on **"Deployments"**
3. Click on your deployment
4. Click **"Functions"** tab
5. Look for errors in function logs

---

## Testing Locally Before Deploy

Always test locally first:

```bash
# Set production-like environment
cp .env.production.example .env.local

# Update NEXTAUTH_URL to localhost
# Change: NEXTAUTH_URL="http://localhost:3000"

# Test build
npm run build

# Test production mode
npm start

# Try to login at http://localhost:3000
```

---

## Environment Variables Checklist

Before deploying, verify you have:

- ✅ `DATABASE_URL` - Neon PostgreSQL connection
- ✅ `POSTGRES_PRISMA_URL` - Neon with timeout parameter
- ✅ `NEXTAUTH_SECRET` - Random secure string (same across all envs)
- ✅ `NEXTAUTH_URL` - Your Vercel URL with `https://`

All should be set for:
- ✅ Production
- ✅ Preview (optional but recommended)
- ✅ Development (optional)

---

## Quick Fix Command Line

If you prefer CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Set environment variables
vercel env add DATABASE_URL production
vercel env add POSTGRES_PRISMA_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production

# Redeploy
vercel --prod
```

---

## Still Having Issues?

### 1. Check Vercel Logs
```bash
vercel logs [your-deployment-url] --follow
```

### 2. Enable Debug Mode
Add to Vercel environment variables:
```
DEBUG=true
NODE_ENV=production
```

### 3. Verify Database Connection
Test database from local machine:
```bash
npx prisma db pull
```

### 4. Contact Support
- Vercel Support: https://vercel.com/support
- Neon Support: https://neon.tech/docs/introduction/support

---

## Success Indicators

You know it's working when:
- ✅ Login page loads without errors
- ✅ Can log in with: admin@saidapp.com / admin123
- ✅ Redirected to dashboard after login
- ✅ No errors in browser console
- ✅ Session persists across page refreshes

---

**Last Updated:** After fixing Edge Function size issue (commit 523248a)




