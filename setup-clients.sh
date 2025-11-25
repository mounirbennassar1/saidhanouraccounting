#!/bin/bash

# Setup script for Client Management System
echo "🚀 Setting up Client Management System..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your DATABASE_URL"
    exit 1
fi

# Prompt user for confirmation
echo "⚠️  This will reset your database and create sample data including:"
echo "   - 3 sample clients"
echo "   - 4 orders (with various statuses)"
echo "   - Payment history (partial and full payments)"
echo ""
echo "Press Ctrl+C to cancel or Enter to continue..."
read

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Generating Prisma client..."
npx prisma generate

echo ""
echo "🗄️  Resetting database with new client models..."
npx prisma migrate reset --force

echo ""
echo "✅ Client Management System setup completed!"
echo ""
echo "📊 Sample data created:"
echo "  👤 Clients:"
echo "     - Mohammed Alami (2 orders: 1 partially paid, 1 confirmed)"
echo "     - Fatima Zahra (1 order: fully paid)"
echo "     - Société ABC SARL (1 order: partially paid)"
echo ""
echo "  📋 Orders:"
echo "     - ORD-00001: 50,000 DH (20,000 DH paid, 30,000 DH remaining)"
echo "     - ORD-00002: 12,000 DH (fully paid)"
echo "     - ORD-00003: 8,500 DH (3,500 DH paid, 5,000 DH remaining)"
echo "     - ORD-00004: 25,000 DH (confirmed, not yet paid)"
echo ""
echo "💰 Total Outstanding Balance: 60,000 DH"
echo "💚 Total Client Revenue: 35,500 DH"
echo ""
echo "🔐 Login credentials:"
echo "  Email: admin@saidapp.com"
echo "  Password: admin123"
echo ""
echo "🎯 Next steps:"
echo "  1. npm run dev"
echo "  2. Navigate to the Clients section"
echo "  3. Explore the client management features!"


