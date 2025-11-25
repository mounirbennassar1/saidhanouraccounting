# 📋 Guide de Déploiement - Said App

## ✅ Checklist Complète

### 1. Prérequis Installés
- [x] Node.js 20+ installé
- [x] PostgreSQL installé et en cours d'exécution
- [x] npm ou yarn installé

### 2. Configuration du Projet

#### A. Base de Données PostgreSQL

**Option 1: PostgreSQL Local**
```bash
# Créer la base de données
createdb saidapp

# Ou avec psql
psql -U postgres
CREATE DATABASE saidapp;
\q
```

**Option 2: Docker (Recommandé pour le développement)**
```bash
docker run --name saidapp-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=saidapp \
  -p 5432:5432 \
  -d postgres:16
```

#### B. Variables d'Environnement

Le fichier `.env` a déjà été créé avec les valeurs par défaut:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/saidapp?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="super-secret-key-change-this-in-production-12345"
NODE_ENV="development"
```

**⚠️ IMPORTANT**: Si vous utilisez des identifiants PostgreSQL différents, modifiez le fichier `.env`

#### C. Installation et Configuration

```bash
# 1. Les dépendances sont déjà installées
# Si besoin de réinstaller:
npm install --legacy-peer-deps

# 2. Générer le client Prisma
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/saidapp?schema=public" npm run db:generate

# 3. Créer les tables dans la base de données
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/saidapp?schema=public" npm run db:push

# 4. Peupler la base de données avec des données de test
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/saidapp?schema=public" npm run db:seed
```

### 3. Lancer l'Application

```bash
npm run dev
```

L'application sera disponible sur: **http://localhost:3000**

### 4. Connexion

Utilisez les identifiants créés par le seed:
- **Email**: `admin@saidapp.com`
- **Password**: `admin123`

## 🎯 Vérification Post-Installation

Après le seed, vous devriez avoir:

### Caisses Créées
- ✅ **Caisse Magasin**: 10,000 DH
- ✅ **Caisse Événements**: 30,000 DH
- ✅ **Caisse Dépôt**: 3,000 DH (fixe)

### Données de Test
- ✅ 3 achats d'exemple
- ✅ 5 charges d'exemple
- ✅ Transactions initiales

### Fonctionnalités Disponibles
- ✅ Dashboard avec graphiques
- ✅ Gestion des caisses
- ✅ Gestion des achats
- ✅ Gestion des charges
- ✅ Authentification sécurisée

## 🔧 Commandes Utiles

```bash
# Développement
npm run dev                 # Démarrer le serveur de développement

# Base de données
npm run db:generate         # Générer le client Prisma
npm run db:push            # Pousser le schéma vers la DB
npm run db:seed            # Peupler la DB avec des données

# Production
npm run build              # Build de production
npm start                  # Démarrer en production
```

## 🐛 Résolution de Problèmes

### Erreur: "Cannot connect to database"

**Solution**:
```bash
# Vérifier que PostgreSQL est en cours d'exécution
# Pour Docker:
docker ps | grep saidapp-postgres

# Pour PostgreSQL local:
pg_isready

# Tester la connexion:
psql -U postgres -h localhost -d saidapp
```

### Erreur: "Port 3000 already in use"

**Solution**:
```bash
# Trouver et tuer le processus
lsof -ti:3000 | xargs kill -9

# Ou utiliser un autre port
PORT=3001 npm run dev
```

### Erreur: "Prisma Client not generated"

**Solution**:
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/saidapp?schema=public" npx prisma generate
```

### Erreur de connexion à la base de données

**Vérifications**:
1. PostgreSQL est-il en cours d'exécution?
2. Les identifiants dans `.env` sont-ils corrects?
3. La base de données `saidapp` existe-t-elle?
4. Le port 5432 est-il accessible?

## 📊 Structure de la Base de Données

### Tables Principales

1. **User** - Utilisateurs et authentification
2. **Caisse** - Caisses (Magasin, Événements, Dépôt)
3. **Achat** - Achats par catégorie
4. **Charge** - Charges et dépenses
5. **Transaction** - Historique des transactions

### Relations

- Un utilisateur peut avoir plusieurs transactions
- Une caisse peut avoir plusieurs transactions
- Un achat peut avoir plusieurs transactions
- Une charge peut avoir plusieurs transactions

## 🚀 Déploiement en Production

### Variables d'Environnement de Production

```env
DATABASE_URL="votre-url-postgresql-production"
NEXTAUTH_URL="https://votre-domaine.com"
NEXTAUTH_SECRET="générer-avec-openssl-rand-base64-32"
NODE_ENV="production"
```

### Build de Production

```bash
npm run build
npm start
```

### Plateformes Recommandées

- **Vercel** (Recommandé pour Next.js)
- **Railway** (Avec PostgreSQL inclus)
- **Render**
- **DigitalOcean App Platform**

## 📝 Notes Importantes

1. **Sécurité**:
   - Changez `NEXTAUTH_SECRET` en production
   - Utilisez des mots de passe forts
   - Activez HTTPS en production

2. **Base de Données**:
   - Faites des sauvegardes régulières
   - Utilisez des connexions SSL en production
   - Configurez un pool de connexions

3. **Performance**:
   - Activez le cache Prisma
   - Utilisez des index sur les colonnes fréquemment recherchées
   - Optimisez les requêtes avec `include` et `select`

## 🎨 Personnalisation

### Couleurs et Thème

Les couleurs sont définies dans `app/globals.css`:
```css
:root {
  --primary: #6366f1;
  --secondary: #ec4899;
  --accent: #14b8a6;
  /* ... */
}
```

### Ajouter de Nouvelles Catégories

Modifiez `prisma/schema.prisma` et exécutez:
```bash
npm run db:push
```

## 📞 Support

Pour toute question ou problème:
1. Consultez la documentation Prisma: https://www.prisma.io/docs
2. Documentation Next.js: https://nextjs.org/docs
3. Documentation NextAuth: https://next-auth.js.org

---

**Développé avec ❤️ pour Said App**
