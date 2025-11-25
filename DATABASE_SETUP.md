# 🗄️ Database Setup Guide

## ⚠️ Problem: Database is Empty (0 rows)

Your database is empty because the schema hasn't been pushed to the database yet.

---

## ✅ Solution: Run These Commands

### **Option 1: Use the Script (Easiest)**

Stop your dev server (`Ctrl+C`), then run:

```bash
./reset-and-seed.sh
```

### **Option 2: Manual Commands**

Stop your dev server (`Ctrl+C`), then run these one by one:

```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Push schema to database (creates all tables)
npx prisma db push --force-reset

# 3. Seed the database with sample data
npm run db:seed
```

### **Option 3: Using Prisma Migrate (Production-ready)**

```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Create and apply migration
npx prisma migrate dev --name initial_setup

# The seed will run automatically after migration
```

---

## 📊 What Gets Created

After running the seed:

### **Users**
- 1 admin user (admin@saidapp.com / admin123)

### **Caisses** (3 total)
- Caisse Magasin: 45,000 DH
- Caisse Événements: 120,000 DH
- Caisse Dépôt: 5,000 DH

### **Charge Categories** (5 total)
- Loyer de Dépôt
- Salaires Non Déclarés
- Frais Bancaires
- Primes & Avances
- Entretien & Réparations

### **Achats** (14 purchases)
- Various purchases across different categories
- Total: ~92,000 DH

### **Charges** (11 charges)
- Some paid, some unpaid
- Total: ~37,500 DH

### **Clients** (3 clients)
1. **Mohammed Alami**
   - VIP client
   - 2 orders

2. **Fatima Zahra**
   - Individual client
   - 1 order (fully paid)

3. **Société ABC SARL**
   - Corporate client
   - 1 order (partially paid)

### **Orders** (4 orders)
1. ORD-00001: 50,000 DH (20,000 paid, 30,000 remaining)
2. ORD-00002: 12,000 DH (fully paid)
3. ORD-00003: 8,500 DH (3,500 paid, 5,000 remaining)
4. ORD-00004: 25,000 DH (confirmed, not yet paid)

### **Payments** (3 payments)
- Total paid by clients: 35,500 DH
- Total outstanding: 60,000 DH

---

## 🔍 Check if Data Exists

After seeding, you can verify with:

```bash
# Check database directly with Prisma Studio
npx prisma studio
```

Or start your app and check:
```bash
npm run dev
```

Then go to:
- Dashboard → Should show stats
- Clients → Should show 3 clients
- Caisses → Should show 3 caisses
- Achats → Should show 14 achats
- Charges → Should show 11 charges

---

## 🐛 Troubleshooting

### "prisma.client is undefined"
```bash
npx prisma generate
```

### "Table does not exist"
```bash
npx prisma db push --force-reset
```

### "No data showing"
```bash
npm run db:seed
```

### "Cannot connect to database"
Check your `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

### Start Fresh
```bash
npx prisma migrate reset --force
```
This deletes everything and recreates from scratch (includes seeding).

---

## 📝 After Setup

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Login:**
   - Email: `admin@saidapp.com`
   - Password: `admin123`

3. **Navigate to Clients tab** to see the client management system!

---

## 🎯 Expected Dashboard Stats After Seeding

- **Total Clients:** 3
- **Client Revenue:** 35,500 DH (paid amounts)
- **Outstanding Balance:** 60,000 DH (unpaid amounts)
- **Clients with Debt:** 3
- **Total Caisse Balance:** ~170,000 DH
- **Total Achats:** ~92,000 DH
- **Total Charges:** ~37,500 DH

---

## ✅ Success Indicators

You'll know it worked when:
- ✅ No errors in terminal
- ✅ Dashboard shows numbers (not 0)
- ✅ Clients tab shows 3 clients
- ✅ Can create new clients, orders, and payments
- ✅ All tabs have data

---

**Your database will be fully populated with realistic sample data!** 🎉


