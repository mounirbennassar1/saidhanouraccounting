#!/bin/bash

echo "🚀 Said App - Configuration Initiale"
echo "===================================="
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "✅ Fichier .env trouvé"
else
    echo "📝 Création du fichier .env..."
    cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/saidapp?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# App
NODE_ENV="development"
EOF
    echo "✅ Fichier .env créé"
    echo "⚠️  IMPORTANT: Modifiez le fichier .env avec vos informations PostgreSQL"
    echo ""
fi

echo "📦 Installation des dépendances..."
npm install --legacy-peer-deps

echo ""
echo "🔧 Génération du client Prisma..."
npm run db:generate

echo ""
echo "🗄️  Création de la base de données..."
npm run db:push

echo ""
echo "🌱 Peuplement de la base de données..."
npm run db:seed

echo ""
echo "✨ Configuration terminée!"
echo ""
echo "Pour démarrer l'application:"
echo "  npm run dev"
echo ""
echo "Identifiants de connexion:"
echo "  Email: admin@saidapp.com"
echo "  Password: admin123"
echo ""
