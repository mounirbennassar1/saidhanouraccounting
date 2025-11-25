# 🚀 Quick Start Guide - Said App

## Étape 1: Configuration de la Base de Données PostgreSQL

Vous devez avoir PostgreSQL installé et en cours d'exécution sur votre machine.

### Option A: PostgreSQL Local

Si vous avez déjà PostgreSQL installé:

1. Créez une nouvelle base de données:
```bash
createdb saidapp
```

2. Mettez à jour le fichier `.env` avec vos informations:
```env
DATABASE_URL="postgresql://VOTRE_USER:VOTRE_PASSWORD@localhost:5432/saidapp?schema=public"
```

### Option B: Utiliser Docker (Recommandé)

Si vous préférez utiliser Docker:

```bash
docker run --name saidapp-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=saidapp \
  -p 5432:5432 \
  -d postgres:16
```

Le fichier `.env` est déjà configuré pour cette option.

## Étape 2: Initialiser la Base de Données

```bash
# Pousser le schéma vers la base de données
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/saidapp?schema=public" npm run db:push

# Peupler avec des données de test
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/saidapp?schema=public" npm run db:seed
```

## Étape 3: Lancer l'Application

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## 🔑 Identifiants de Connexion

Après avoir exécuté le seed:
- **Email**: `admin@saidapp.com`
- **Password**: `admin123`

## ✅ Vérification

Vous devriez voir:
- ✅ 3 caisses créées (Magasin: 10,000 DH, Événements: 30,000 DH, Dépôt: 3,000 DH)
- ✅ Des achats d'exemple
- ✅ Des charges d'exemple
- ✅ Un dashboard avec des graphiques

## 🐛 Dépannage

### Erreur: "Cannot connect to database"
- Vérifiez que PostgreSQL est en cours d'exécution
- Vérifiez vos identifiants dans le fichier `.env`
- Testez la connexion: `psql -U postgres -h localhost`

### Erreur: "DATABASE_URL not found"
- Assurez-vous que le fichier `.env` existe à la racine du projet
- Vérifiez que DATABASE_URL est défini correctement

### Erreur de port 3000 déjà utilisé
```bash
# Trouver le processus
lsof -ti:3000

# Tuer le processus
kill -9 $(lsof -ti:3000)
```

## 📚 Commandes Utiles

```bash
# Développement
npm run dev

# Générer le client Prisma
npm run db:generate

# Pousser le schéma
npm run db:push

# Réinitialiser et peupler la base de données
npm run db:seed

# Build de production
npm run build
npm start
```

## 🎨 Fonctionnalités Disponibles

1. **Dashboard** - Vue d'ensemble avec statistiques et graphiques
2. **Caisses** - Gestion des caisses (Magasin, Événements, Dépôt)
3. **Achats** - Suivi des achats par catégorie
4. **Charges** - Gestion des charges et dépenses

## 📞 Besoin d'Aide?

Consultez le README.md principal pour plus de détails.
