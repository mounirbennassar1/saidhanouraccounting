# Migration Guide: Dynamic Charge Categories

This guide will help you migrate your database to support dynamic charge categories.

## What's New

- **ChargeCategory Model**: New table to manage charge categories dynamically
- **Add/Edit/Delete Categories**: Full CRUD operations for charge categories
- **Dynamic Category Dropdown**: Charge form now shows categories from the database
- **Color-coded Categories**: Each category can have its own color

## Migration Steps

### Option 1: Reset Database (Recommended for Development)

If you're in development and don't mind losing existing data:

```bash
# Generate new Prisma client
npx prisma generate

# Reset database and run seed
npx prisma migrate reset --force

# The seed file will automatically create default categories
```

### Option 2: Manual Migration (For Production)

If you want to keep existing data:

```bash
# 1. Generate new Prisma client
npx prisma generate

# 2. Create a new migration
npx prisma migrate dev --name add_charge_categories

# 3. If the migration fails, you may need to manually run the SQL
# Connect to your database and run the SQL from:
# prisma/migrations/add_charge_categories.sql
```

### Option 3: Using the SQL Script Directly

```bash
# Connect to your PostgreSQL database
psql your_database_url

# Run the migration SQL
\i prisma/migrations/add_charge_categories.sql
```

## Default Categories

The migration will create these default categories:

1. **Loyer de Dépôt** (Amber) - Frais de location du dépôt mensuel
2. **Salaires Non Déclarés** (Pink) - Paiements de salaires non déclarés
3. **Frais Bancaires** (Violet) - Frais de retrait, virement et transactions
4. **Primes & Avances** (Cyan) - Primes, avances sur salaire et extras
5. **Entretien & Réparations** (Emerald) - Maintenance, réparations et entretien

## Using the Feature

### Managing Categories

1. Go to the dashboard
2. Click on "Gérer Catégories" button
3. Add, edit, or delete categories as needed

### Creating Charges

1. Click "Nouvelle Charge"
2. Select a category from the dropdown
3. If no categories exist, you'll see a warning to create one first

## API Endpoints

New endpoints available:

- `GET /api/charge-categories` - Get all active categories
- `POST /api/charge-categories` - Create a new category
- `PATCH /api/charge-categories` - Update a category
- `DELETE /api/charge-categories?id={id}` - Delete a category

## Notes

- Deleting a category that's in use will soft-delete it (mark as inactive)
- Categories not in use will be permanently deleted
- Each category must have a unique name
- Categories can be color-coded for better visual organization

## Troubleshooting

If you encounter issues:

1. Make sure your DATABASE_URL is correctly set in `.env`
2. Ensure PostgreSQL is running
3. Try `npx prisma db push` to force schema sync
4. Check the Prisma logs for detailed error messages

## Rollback

To rollback this migration:

```bash
# Revert the schema changes in prisma/schema.prisma
# Then run:
npx prisma migrate dev --name rollback_charge_categories
```






