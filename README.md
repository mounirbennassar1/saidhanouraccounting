# Said App - Gestion de Caisse et Dépenses

Une application moderne et élégante de gestion de caisse, achats et charges construite avec Next.js, Prisma, PostgreSQL et NextAuth.

## 🚀 Fonctionnalités

### Gestion des Caisses
- **Caisse Magasin** - Revenue tracking pour le magasin
- **Caisse Événements** - Gestion des revenus d'événements  
- **Caisse Dépôt** - Caisse avec montant fixe

### Gestion des Achats
- Achats Magasin
- Achats Société
- Achats Événement

### Gestion des Charges
- Loyer de Dépôt
- Salaires Non Déclarés
- Extract Fees
- Extra Salaire
- Entretien

### Tableaux de Bord
- Vue d'ensemble des finances
- Graphiques interactifs (Pie charts, Bar charts)
- Statistiques en temps réel
- Historique des transactions

## 🛠️ Technologies

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4, CSS personnalisé avec glassmorphism
- **Base de données**: PostgreSQL avec Prisma ORM
- **Authentification**: NextAuth v5
- **Charts**: Recharts
- **Icons**: Lucide React

## 📦 Installation

1. **Cloner le projet** (déjà fait)

2. **Installer les dépendances**
```bash
npm install --legacy-peer-deps
```

3. **Configurer la base de données**

Créez un fichier `.env` à la racine du projet:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/saidapp?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"

# App
NODE_ENV="development"
```

**Important**: Remplacez `user`, `password`, et les autres valeurs par vos propres informations PostgreSQL.

4. **Générer le client Prisma**
```bash
npm run db:generate
```

5. **Créer la base de données**
```bash
npm run db:push
```

6. **Peupler la base de données avec des données de test**
```bash
npm run db:seed
```

Cela créera:
- Un utilisateur admin (email: `admin@saidapp.com`, password: `admin123`)
- 3 caisses (Magasin, Événements, Dépôt)
- Des achats et charges d'exemple
- Des transactions initiales

## 🚀 Lancement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📝 Connexion

Après avoir exécuté le seed:
- **Email**: admin@saidapp.com
- **Password**: admin123

## 🎨 Design

L'application utilise un design moderne avec:
- **Palette de couleurs vibrante** avec gradients
- **Glassmorphism** pour les effets de verre
- **Animations fluides** pour une meilleure UX
- **Design responsive** pour mobile et desktop
- **Dark mode** par défaut avec une esthétique premium

## 📊 Structure du Projet

```
saidhannour/
├── app/
│   ├── api/              # API Routes
│   │   ├── auth/         # NextAuth endpoints
│   │   ├── caisses/      # Caisse management
│   │   ├── achats/       # Purchase management
│   │   ├── charges/      # Expense management
│   │   └── dashboard/    # Dashboard stats
│   ├── globals.css       # Styles globaux
│   ├── layout.tsx        # Layout principal
│   └── page.tsx          # Page d'accueil
├── components/
│   ├── Dashboard.tsx     # Composant dashboard
│   ├── Forms.tsx         # Formulaires de création
│   ├── Modal.tsx         # Composant modal réutilisable
│   ├── Navigation.tsx    # Navigation principale
│   └── Tables.tsx        # Tables de données
├── lib/
│   ├── auth.ts          # Configuration NextAuth
│   └── prisma.ts        # Client Prisma
├── prisma/
│   ├── schema.prisma    # Schéma de base de données
│   └── seed.ts          # Script de peuplement
└── types/
    └── next-auth.d.ts   # Types TypeScript

```

## 🔐 Sécurité

- Mots de passe hashés avec bcrypt
- Sessions JWT sécurisées
- Variables d'environnement pour les secrets
- Validation des données côté serveur

## 📈 Prochaines Étapes

- [ ] Ajouter l'édition et la suppression des entrées
- [ ] Implémenter l'export PDF/Excel
- [ ] Ajouter des filtres et recherche avancée
- [ ] Créer des rapports mensuels/annuels
- [ ] Ajouter des notifications
- [ ] Implémenter la gestion multi-utilisateurs

## 🤝 Support

Pour toute question ou problème, contactez l'équipe de développement.

## 📄 License

Propriétaire - Said App © 2025
