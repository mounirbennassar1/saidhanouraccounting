#!/bin/bash

# Migration script for adding dynamic charge categories
# This script will reset the database and apply the new schema

echo "🔄 Starting migration for dynamic charge categories..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your DATABASE_URL"
    exit 1
fi

# Prompt user for confirmation
echo "⚠️  WARNING: This will reset your database and all data will be lost!"
echo "Press Ctrl+C to cancel or Enter to continue..."
read

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Generating Prisma client..."
npx prisma generate

echo ""
echo "🗄️  Resetting database..."
npx prisma migrate reset --force

echo ""
echo "✅ Migration completed successfully!"
echo ""
echo "📝 Default categories created:"
echo "  - Loyer de Dépôt (Amber)"
echo "  - Salaires Non Déclarés (Pink)"
echo "  - Frais Bancaires (Violet)"
echo "  - Primes & Avances (Cyan)"
echo "  - Entretien & Réparations (Emerald)"
echo ""
echo "🎉 You can now manage categories from the dashboard!"
echo ""
echo "🔐 Login credentials:"
echo "  Email: admin@saidapp.com"
echo "  Password: admin123"






