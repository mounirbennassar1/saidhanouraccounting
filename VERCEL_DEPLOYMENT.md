# Vercel Deployment Guide

This guide will help you deploy the Said Accounting System to Vercel with Neon PostgreSQL database.

## ✅ Prerequisites Completed

- ✅ Database schema synced with Neon PostgreSQL
- ✅ Database seeded with initial data
- ✅ Build tested and working
- ✅ GitHub repository configured

## 📋 Deployment Steps

### 1. Push to GitHub

The code is already pushed to GitHub:
```
https://github.com/mounirbennassar1/saidhanouraccounting
```

### 2. Connect to Vercel

1. Go to [Vercel](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New Project"
4. Import your repository: `mounirbennassar1/saidhanouraccounting`

### 3. Configure Environment Variables

In the Vercel project settings, add these environment variables:

#### Required Database Variables:
```bash
DATABASE_URL=postgresql://neondb_owner:npg_pKLZVf1NQyi8@ep-dawn-hill-adjp82c6-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

POSTGRES_PRISMA_URL=postgresql://neondb_owner:npg_pKLZVf1NQyi8@ep-dawn-hill-adjp82c6-pooler.c-2.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require
```

#### Required Auth Variables:
```bash
NEXTAUTH_SECRET=<generate-a-secure-random-string>
NEXTAUTH_URL=https://your-project-name.vercel.app
```

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Build Settings

Vercel should auto-detect Next.js. Verify these settings:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### 5. Deploy

Click "Deploy" and wait for the deployment to complete.

## 🔐 Login Credentials

After deployment, you can log in with:

```
Email: admin@saidapp.com
Password: admin123
```

⚠️ **IMPORTANT:** Change the admin password after first login!

## 📊 Database Information

### Neon Database Details:
- **Host:** ep-dawn-hill-adjp82c6-pooler.c-2.us-east-1.aws.neon.tech
- **Database:** neondb
- **User:** neondb_owner
- **Region:** us-east-1 (AWS)

### Pre-seeded Data:
- ✅ 1 Admin user
- ✅ 3 Caisses (Magasin, Événements, Dépôt)
- ✅ 5 Charge categories
- ✅ 14 Achats
- ✅ 11 Charges
- ✅ 7 Revenue transactions
- ✅ 3 Clients with 4 orders
- ✅ 3 Suppliers with 4 orders

## 🔧 Post-Deployment

### 1. Test the Application
- Visit your deployment URL
- Log in with admin credentials
- Verify all pages load correctly
- Test creating a new client/order

### 2. Update the Admin Password
- Go to Settings (when available)
- Change the default password

### 3. Configure Custom Domain (Optional)
- In Vercel project settings
- Go to "Domains"
- Add your custom domain

## 🐛 Troubleshooting

### Build Fails with Prisma Error
- Ensure `DATABASE_URL` is set in environment variables
- The build script automatically runs `prisma generate`

### Database Connection Error
- Verify the DATABASE_URL is correct
- Check that Neon database is active
- Ensure SSL mode is enabled (`?sslmode=require`)

### Authentication Issues
- Verify `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your deployment URL
- Clear browser cookies and try again

## 📝 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string | ✅ Yes |
| `POSTGRES_PRISMA_URL` | Prisma-optimized connection string | ✅ Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js encryption | ✅ Yes |
| `NEXTAUTH_URL` | Full URL of your deployment | ✅ Yes |

## 🚀 Continuous Deployment

Vercel automatically deploys when you push to the `main` branch:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

## 📱 Mobile Support

The application is fully responsive and works on:
- ✅ Desktop (1024px+)
- ✅ Tablet (768px - 1023px)
- ✅ Mobile (320px - 767px)

## 🔒 Security Notes

1. **Never commit `.env` or `.env.local` files** (already in .gitignore)
2. **Use strong passwords** for all accounts
3. **Rotate NEXTAUTH_SECRET** periodically
4. **Use Neon's connection pooling** for better performance
5. **Enable Neon's auto-suspend** to save costs during inactivity

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Neon Documentation](https://neon.tech/docs)
- [Prisma with Neon](https://www.prisma.io/docs/guides/database/using-prisma-with-neon)

## 🎉 Success!

Your Said Accounting System is now live on Vercel with Neon PostgreSQL!

---

**Support:** For issues or questions, check the project README or contact the development team.

