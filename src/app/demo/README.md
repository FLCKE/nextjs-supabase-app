# 🎬 Pages de Démonstration

Explorez les fonctionnalités de RestoPay sans installation complexe!

## 📍 Accès aux Démos

- **Page principale** : `/demo`
- **Dashboard** : `/demo/dashboard`
- **Gestion des commandes** : `/demo/orders`
- **Gestion des menus** : `/demo/menus`
- **Analytics** : `/demo/analytics`
- **QR Codes** : `/demo/qr`

## 🎯 Chaque Démo Contient

### Dashboard Principal
- 📊 Vue d'ensemble en temps réel
- 💹 Graphiques de tendance (ventes, commandes)
- 🍽️ Distribution par catégories
- 📋 Dernières commandes
- 💡 Conseil personnalisé

### Gestion des Commandes
- 📥 Commandes reçues et en attente
- ⏱️ Heure de réception
- 👨‍🍳 Passage en cuisine
- ✅ Validation du statut
- 🖨️ Impression de tickets

### Gestion des Menus
- 🏷️ Catégories de produits
- 💰 Prix en temps réel
- 📝 Descriptions détaillées
- ✏️ Édition instantanée
- 📋 Import/Export CSV

### Analytics
- 📈 Tendance des revenus (6 mois)
- 🕐 Heures de pointe
- 🏆 Menus populaires
- 📊 Répartition par catégories
- 💡 Insights clés

### QR Codes
- 🔲 Génération par table
- 📱 Scan via smartphone
- 📥 Accès au menu directement
- 🖨️ Impression et téléchargement
- ♻️ Personnalisation par restaurant

## 🚀 Caractéristiques

✅ **100% Interactif**
- Les démos sont totalement fonctionnelles
- Modifiez les commandes en temps réel
- Aucune sauvegarde en base (données de test)

✅ **Responsive Design**
- Optimisé mobile, tablette, desktop
- Tests sur tous les appareils

✅ **Design Moderne**
- Animations fluides avec Framer Motion
- Couleurs cohérentes
- Typographie claire

✅ **Données Réalistes**
- Chiffres vraisemblables
- Scénarios authentiques
- Horaires vraie cuisine

## 💡 Cas d'Usage

### Pour les propriétaires de restaurant
- 📱 Voir la plateforme avant inscription
- 📊 Comprendre les analytics disponibles
- 🎯 Visualiser la gestion des commandes

### Pour les intégrateurs/partenaires
- 🔧 Démonstration technique
- 📚 Documentation interactive
- 🎨 Référence UI/UX

### Pour le support/onboarding
- 📖 Tutoriel visuel
- 🎓 Formation new users
- 🆘 Aide contextuelle

## 🛠️ Technologie

```typescript
// Stack utilisé
- Next.js 16 (React Server Components)
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- Recharts (graphiques)
- Lucide Icons (icônes)
```

## 📝 Notes

- **Données** : Toutes les données sont générées client-side
- **Pas de connexion BD** : Les démos ne se connectent pas à Supabase
- **Real-time** : Les mises à jour sont instantanées
- **Persistence** : Les données se réinitialisent au rechargement

## 🎓 Pour Ajouter une Nouvelle Démo

1. Créer un dossier dans `/src/app/demo/<nom>`
2. Créer le fichier `page.tsx`
3. Ajouter le lien dans `/src/app/demo/page.tsx`
4. Ajouter à la liste des features

Exemple structure:
```typescript
'use client';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MyDemo() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      {/* Content */}
    </div>
  );
}
```

---

**Version:** 1.0.0  
**Dernière mise à jour:** 28 Mars 2026
