# Data Engineer CSV Export

## Vue d'ensemble

L'endpoint `/api/export/data-engineer` génère un fichier **ZIP contenant des CSVs structurés** optimisés pour les data engineers et les outils d'analyse.

## Contenu du ZIP

Le fichier ZIP contient **6 fichiers CSV** avec **uniquement des données structurées** (pas de textes descriptifs) :

### 1. `01_orders.csv`
Toutes les commandes (max 10 000)
- `order_id` - ID unique
- `restaurant_id` - Restaurant concerné
- `table_number` - Numéro de table
- `status` - Statut (PENDING, PAYING, PAID, SERVED, CANCELLED)
- `total_amount` - Montant en unités de devise (divisé par 100)
- `currency` - Devise (USD, EUR, etc)
- `payment_method` - Méthode (CASH, CARD, MOBILE, ONLINE)
- `customer_name` - Nom du client
- `customer_phone` - Téléphone
- `special_requests` - Demandes spéciales
- `created_at` - Date de création (ISO)
- `updated_at` - Date de mise à jour (ISO)

### 2. `02_payments.csv`
Transactions de paiement (max 10 000)
- `payment_id` - ID unique
- `order_id` - Commande liée
- `restaurant_id` - Restaurant
- `amount` - Montant (en unités)
- `currency` - Devise
- `payment_method` - Méthode
- `status` - Statut (PENDING, COMPLETED, FAILED)
- `transaction_id` - ID de transaction unique
- `moneroo_reference` - Référence Moneroo
- `error_message` - Message d'erreur si présent
- `created_at` - Création
- `updated_at` - Mise à jour

### 3. `03_payments_by_day.csv`
Agrégation quotidienne des revenus (max 365 jours)
- `date` - Date (YYYY-MM-DD)
- `restaurant_id` - Restaurant
- `total_amount` - Revenu total du jour
- `currency` - Devise
- `transaction_count` - Nombre de transactions
- `status` - Statut
- `created_at` - Création du record

### 4. `04_products.csv`
Catalogue des produits (max 5 000)
- `product_id` - ID unique
- `restaurant_id` - Restaurant
- `name` - Nom du produit
- `description` - Description
- `price` - Prix en unités
- `currency` - Devise
- `category` - Catégorie
- `image_url` - URL de l'image
- `available` - Disponibilité (true/false)
- `created_at` - Création
- `updated_at` - Mise à jour

### 5. `05_restaurants.csv`
Métadonnées des restaurants (max 1 000)
- `restaurant_id` - ID unique
- `name` - Nom
- `slug` - Slug URL
- `description` - Description
- `address` - Adresse
- `city` - Ville
- `country` - Pays
- `phone` - Téléphone
- `email` - Email
- `currency` - Devise défaut
- `timezone` - Fuseau horaire
- `active` - Actif (true/false)
- `created_at` - Création
- `updated_at` - Mise à jour

### 6. `06_hourly_analytics.csv`
Analytique horaire (90 derniers jours)
- `hour` - Heure en ISO format (UTC)
- `order_count` - Nombre de commandes
- `total_revenue` - Revenu total de l'heure

## Format et encodage

- **Encodage** : UTF-8
- **Délimiteur** : Virgule (`,`)
- **Guillemets** : Échappement auto pour valeurs complexes
- **Null values** : Cellules vides
- **Dates** : ISO 8601 format (UTC)
- **Montants** : Nombres décimaux, pas de symboles de devise

## Exemple d'utilisation

### Python (Pandas)
```python
import zipfile
import pandas as pd
import requests

# Télécharger l'export
response = requests.get('https://your-app.com/api/export/data-engineer')
with open('export.zip', 'wb') as f:
    f.write(response.content)

# Extraire et charger
with zipfile.ZipFile('export.zip', 'r') as z:
    # Charger les données de commandes
    orders_df = pd.read_csv(z.open('01_orders.csv'))
    payments_df = pd.read_csv(z.open('02_payments.csv'))
    
    # Fusionner et analyser
    merged = orders_df.merge(payments_df, on='order_id', how='left')
    print(merged.groupby('restaurant_id')['amount'].sum())
```

### SQL (DuckDB)
```sql
INSTALL httpfs;
LOAD httpfs;

-- Télécharger et lire directement
SELECT * 
FROM read_csv_auto('https://your-app.com/api/export/data-engineer/orders.csv');
```

### Node.js
```javascript
import fetch from 'node-fetch';
import unzipper from 'unzipper';
import fs from 'fs';

const response = await fetch('https://your-app.com/api/export/data-engineer');
response.body
  .pipe(unzipper.Extract({ path: './export' }))
  .on('close', () => {
    console.log('Export extracted');
    // Utiliser les CSVs
  });
```

## Limitations et performance

- **Max rows** : 10 000 pour orders/payments, 365 pour daily, 5 000 pour products
- **Timeout** : 60 secondes
- **Fréquence** : Pas de limitation (générer à la demande)
- **Taille ZIP** : ~1-5MB selon volume de données

## Notes techniques

- Les montants sont stockés en **cents** en base et divisés par 100 dans l'export
- Les timestamps sont en **UTC**
- Les valeurs NULL deviennent des cellules vides
- L'escaping CSV gère automatiquement les caractères spéciaux

## Évolutions futures

- Support des formats Parquet, JSON Lines, DuckDB
- Compression GZIP optionnelle
- Filtrage par date/restaurant
- Exports programmés
- Webhooks d'export complété
