# Rapport & Analyses - Documentation Complète

## Vue d'ensemble

La section **Rapports** offre une vue complète et détaillée de toutes les activités financières de votre entreprise. Cette fonctionnalité permet de générer des rapports personnalisés basés sur une période spécifique et d'exporter les données pour une analyse plus approfondie.

## Fonctionnalités principales

### 1. Sélection de période
- **Date de début** : Choisissez le premier jour de la période à analyser
- **Date de fin** : Choisissez le dernier jour de la période à analyser
- Par défaut, le rapport couvre le mois en cours

### 2. Données incluses dans le rapport

Le rapport comprend les informations suivantes :

#### A. Résumé financier (Summary Cards)
- **Revenus Total** : Somme de tous les revenus générés
- **Dépenses Total** : Total des dépenses (achats + charges + paiements fournisseurs)
- **Bénéfice Net** : Différence entre revenus et dépenses
- **Achats** : Total des achats effectués

#### B. État des Caisses
Pour chaque caisse, le rapport affiche :
- Nom de la caisse
- Type (MAGASIN, EVENEMENTS, DEPOT)
- Solde actuel
- Nombre de transactions dans la période

#### C. Transactions
Liste détaillée de toutes les transactions avec :
- Date de la transaction
- Type (REVENUE, ACHAT, CHARGE, TRANSFER)
- Description
- Caisse associée
- Montant (positif pour les revenus, négatif pour les dépenses)

#### D. Achats
Liste complète des achats comprenant :
- Description de l'achat
- Montant
- Catégorie (MAGASIN, SOCIETE, EVENEMENT)
- Date
- Référence (optionnelle)

#### E. Charges
Détail de toutes les charges avec :
- Description
- Montant
- Catégorie
- Date
- Statut (Payé / Non payé)

#### F. Commandes Clients
Tableau des commandes clients incluant :
- Numéro de commande
- Nom du client
- Date de la commande
- Montant total
- Montant payé
- Montant restant
- Statut (DRAFT, CONFIRMED, PARTIALLY_PAID, FULLY_PAID, CANCELLED)

#### G. Commandes Fournisseurs
Tableau des commandes fournisseurs avec :
- Numéro de commande
- Nom du fournisseur
- Date de la commande
- Montant total
- Montant payé
- Montant restant
- Statut (DRAFT, CONFIRMED, PARTIALLY_PAID, FULLY_PAID, CANCELLED)

### 3. Export des données

#### Export CSV
Le bouton **"Exporter CSV"** permet de télécharger toutes les données du rapport dans un fichier CSV qui peut être ouvert avec Excel, Google Sheets, ou tout autre tableur.

Le fichier CSV inclut :
- Tous les achats
- Toutes les charges
- Toutes les commandes clients
- Toutes les commandes fournisseurs

Format du fichier : `rapport_[date_debut]_[date_fin].csv`

## Utilisation

### Générer un rapport

1. **Accédez à l'onglet "Rapports"** depuis la navigation principale
2. **Sélectionnez la période** :
   - Choisissez une date de début
   - Choisissez une date de fin
3. **Cliquez sur "Générer"** pour afficher le rapport
4. Le rapport s'affiche automatiquement avec tous les détails

### Exporter les données

1. Après avoir généré un rapport
2. Cliquez sur le bouton **"Exporter CSV"**
3. Le fichier CSV sera téléchargé automatiquement
4. Ouvrez-le avec votre tableur préféré pour une analyse détaillée

## Architecture technique

### Composants

#### `/components/Reports.tsx`
Composant React principal qui gère :
- L'interface utilisateur du rapport
- La sélection de dates
- L'affichage des données
- L'export CSV
- Le formatage des montants en MAD (Dirham marocain)

#### `/app/api/reports/route.ts`
API route qui :
- Authentifie l'utilisateur
- Valide les paramètres de date
- Récupère toutes les données depuis la base de données
- Calcule les totaux et les statistiques
- Retourne les données formatées en JSON

### Requêtes de base de données

Le système effectue des requêtes parallèles pour optimiser les performances :
- Caisses avec comptage des transactions
- Achats filtrés par date
- Charges filtrées par date
- Commandes clients avec informations client
- Commandes fournisseurs avec informations fournisseur
- Transactions avec informations caisse

### Calculs financiers

```typescript
totalRevenue = Σ transactions(type=REVENUE)
totalAchats = Σ achats
totalCharges = Σ charges
clientPayments = Σ commandes_clients.montantPayé
supplierPayments = Σ commandes_fournisseurs.montantPayé
totalExpenses = totalAchats + totalCharges + supplierPayments
netProfit = totalRevenue + clientPayments - totalExpenses
```

## Design & UI

Le rapport utilise le même système de design que le reste de l'application :
- **Cards glassmorphiques** pour une apparence moderne
- **Code couleur** :
  - Vert : Revenus et montants positifs
  - Rouge : Dépenses et montants négatifs
  - Jaune : Achats
  - Violet : Charges
  - Indigo : Informations et statuts
  - Orange : Montants restants/partiels
- **Tableaux responsifs** qui s'adaptent à tous les écrans
- **Animations fluides** pour une meilleure expérience utilisateur

## Cas d'usage

### 1. Rapport mensuel
Générez un rapport du 1er au dernier jour du mois pour avoir une vue complète de l'activité mensuelle.

### 2. Rapport trimestriel
Sélectionnez une période de 3 mois pour analyser les tendances trimestrielles.

### 3. Analyse d'une période spécifique
Choisissez n'importe quelle période pour analyser une campagne, un événement, ou une saison particulière.

### 4. Clôture comptable
Utilisez les rapports pour préparer vos documents de clôture comptable avec toutes les données nécessaires.

### 5. Analyse des fournisseurs et clients
Visualisez rapidement les performances de vos relations commerciales sur une période donnée.

## Améliorations futures possibles

- **Graphiques et visualisations** : Ajouter des graphiques pour visualiser les tendances
- **Comparaisons de périodes** : Comparer plusieurs périodes côte à côte
- **Export PDF** : Générer des rapports PDF professionnels
- **Filtres avancés** : Filtrer par catégorie, client, fournisseur, etc.
- **Rapports prédéfinis** : Templates de rapports (hebdomadaire, mensuel, annuel)
- **Alertes** : Notifications pour les anomalies ou seuils dépassés
- **Budgets** : Comparer les dépenses réelles avec les budgets prévus

## Support

Pour toute question ou problème avec la fonctionnalité de rapports, vérifiez :
1. Que vous êtes authentifié
2. Que les dates sélectionnées sont valides
3. Que la base de données contient des données pour la période choisie
4. Les logs de la console pour les éventuelles erreurs

## Notes techniques

- Le rapport limite l'affichage à 10 transactions récentes dans le tableau principal
- Les listes d'achats et charges sont limitées à 396px de hauteur avec scroll
- Le format de devise utilisé est MAD (Dirham marocain)
- Les dates sont affichées au format français (jour/mois/année)
- L'API nécessite une authentification NextAuth valide



