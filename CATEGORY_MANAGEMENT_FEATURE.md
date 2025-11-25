# ✨ Dynamic Charge Category Management

## 📋 Overview

You now have a complete system to **add, edit, and delete charge categories** dynamically. Categories are stored in the database and can be managed through the UI.

## 🎯 Features Implemented

### 1. **ChargeCategory Database Model**
- New `ChargeCategory` table in the database
- Fields: `id`, `name`, `description`, `color`, `isActive`, `createdAt`, `updatedAt`
- Unique constraint on category names
- Soft-delete support for categories in use

### 2. **API Endpoints** (`/api/charge-categories`)
- ✅ `GET` - Fetch all active categories
- ✅ `POST` - Create a new category
- ✅ `PATCH` - Update an existing category
- ✅ `DELETE` - Delete or soft-delete a category

### 3. **Category Manager UI Component**
- **Button**: "Gérer Catégories" in the action buttons area
- **List View**: See all categories with color indicators
- **Add/Edit Form**: Create or modify categories with:
  - Name (required, unique)
  - Description (optional)
  - Color selection (8 color options)
- **Delete**: Remove unused categories or soft-delete categories in use
- **Visual Design**: Matches your existing dark theme

### 4. **Dynamic Charge Form**
- Category dropdown now loads from database
- Real-time updates when categories change
- Warning message if no categories exist
- Color-coded category display (future enhancement possibility)

### 5. **Updated Seed Data**
- Default categories automatically created:
  1. 🟡 **Loyer de Dépôt** - Frais de location du dépôt mensuel
  2. 🔴 **Salaires Non Déclarés** - Paiements de salaires non déclarés
  3. 🟣 **Frais Bancaires** - Frais de retrait, virement et transactions
  4. 🔵 **Primes & Avances** - Primes, avances sur salaire et extras
  5. 🟢 **Entretien & Réparations** - Maintenance, réparations et entretien

## 🚀 How to Use

### Step 1: Run the Migration

Choose one of these options:

**Option A: Quick Reset (Development)**
```bash
./migrate-categories.sh
```

**Option B: Manual Commands**
```bash
npx prisma generate
npx prisma migrate reset --force
```

**Option C: Production Migration**
```bash
npx prisma generate
npx prisma migrate dev --name add_charge_categories
```

### Step 2: Access the Feature

1. **Login** to your dashboard (admin@saidapp.com / admin123)
2. Look for the **"Gérer Catégories"** button in the action buttons area
3. Click it to open the category management modal

### Step 3: Manage Categories

#### To Add a Category:
1. Click "Nouvelle Catégorie"
2. Enter a unique name
3. Add a description (optional)
4. Choose a color
5. Click "Créer"

#### To Edit a Category:
1. Hover over a category in the list
2. Click the edit (pencil) icon
3. Modify the details
4. Click "Mettre à jour"

#### To Delete a Category:
1. Hover over a category in the list
2. Click the delete (trash) icon
3. Confirm deletion
   - **Not in use**: Permanently deleted
   - **In use**: Marked as inactive (soft delete)

### Step 4: Create Charges with Categories

1. Click "Nouvelle Charge"
2. Select a category from the dropdown
3. Fill in other charge details
4. The category will be saved with the charge

## 🎨 Color Options

Categories can be assigned colors for visual organization:
- 🟡 Amber (`#f59e0b`)
- 🔴 Rose (`#ec4899`)
- 🟣 Violet (`#8b5cf6`)
- 🔵 Cyan (`#06b6d4`)
- 🟢 Emerald (`#10b981`)
- 🔵 Indigo (`#6366f1`)
- 🔴 Red (`#ef4444`)
- 🩵 Teal (`#14b8a6`)

## 📁 Files Added/Modified

### New Files:
- `app/api/charge-categories/route.ts` - API endpoints
- `components/CategoryManager.tsx` - UI component
- `prisma/migrations/add_charge_categories.sql` - Migration SQL
- `migrate-categories.sh` - Migration script
- `MIGRATION_GUIDE.md` - Detailed migration instructions
- `CATEGORY_MANAGEMENT_FEATURE.md` - This file

### Modified Files:
- `prisma/schema.prisma` - Added ChargeCategory model, changed Charge.category to string
- `prisma/seed.ts` - Added default categories
- `components/Forms.tsx` - Dynamic category dropdown
- `app/api/charges/route.ts` - Updated to work with string categories

## 🔒 Security Features

- ✅ Authentication required for all endpoints
- ✅ Unique constraint on category names (prevents duplicates)
- ✅ Soft-delete for categories in use (data integrity)
- ✅ Input validation and error messages

## 📊 Database Changes

**Before:**
```typescript
enum ChargeCategory {
  LOYER_DEPOT
  SALAIRES_NO_DECLARE
  EXTRACT_FEES
  EXTRA_SALAIRE
  ENTRETIEN
}

model Charge {
  category ChargeCategory
}
```

**After:**
```typescript
model ChargeCategory {
  id          String
  name        String   @unique
  description String?
  color       String?
  isActive    Boolean
}

model Charge {
  category String  // Now flexible!
}
```

## 🎯 Benefits

1. **Flexibility**: Add unlimited categories without code changes
2. **User-Friendly**: Non-technical users can manage categories
3. **Color-Coded**: Visual organization with custom colors
4. **Safe Deletion**: Categories in use are preserved
5. **Real-Time**: Changes reflect immediately in the UI

## 🐛 Troubleshooting

**"Aucune catégorie disponible"**
- Run the migration to create default categories
- Or create your first category using "Nouvelle Catégorie"

**"Une catégorie avec ce nom existe déjà"**
- Category names must be unique
- Try a different name or edit the existing one

**Categories not showing in dropdown**
- Refresh the page
- Check browser console for errors
- Verify API is working: `/api/charge-categories`

## 🔮 Future Enhancements

Possible additions:
- Category usage statistics
- Archive/restore functionality
- Category icons
- Bulk operations
- Export/import categories
- Category groups or hierarchies

## 🎉 Summary

You now have a **complete, production-ready category management system** for charges! This feature makes your application more flexible and user-friendly, allowing you to adapt to changing business needs without touching code.

**What's Dynamic:**
- ✅ Achats → Linked to Caisses (deducts balance)
- ✅ Charges → Linked to Categories (add/edit/delete from UI)
- ✅ Charges (paid) → Linked to Caisses (deducts balance)
- ✅ Dashboard → Shows real-time calculations
- ✅ Everything updates automatically! 🚀


