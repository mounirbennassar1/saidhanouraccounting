#!/bin/bash

echo "🚀 Resetting Database and Seeding Data..."
echo ""

# Stop if any command fails
set -e

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with DATABASE_URL"
    exit 1
fi

echo "📦 Step 1: Generating Prisma Client..."
npx prisma generate

echo ""
echo "🗄️  Step 2: Pushing schema to database..."
npx prisma db push --force-reset

echo ""
echo "🌱 Step 3: Seeding database with sample data..."
npm run db:seed

echo ""
echo "✅ Database reset and seeded successfully!"
echo ""
echo "📊 Sample data created:"
echo "  👤 User: admin@saidapp.com (password: admin123)"
echo "  💰 3 Caisses with balances"
echo "  🛒 14 Achats"
echo "  💸 11 Charges (with 5 categories)"
echo "  👥 3 Clients"
echo "  📦 4 Orders"
echo "  💳 3 Payments"
echo ""
echo "🎯 You can now:"
echo "  1. Start the dev server: npm run dev"
echo "  2. Login with: admin@saidapp.com / admin123"
echo "  3. Check the Clients tab for client management"
echo ""



