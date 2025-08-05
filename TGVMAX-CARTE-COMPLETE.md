# 🚅 Carte TGVmax - Application Complète

## 🎯 **Vue d'ensemble**

L'application affiche maintenant **tous les trajets TGVmax de la journée** sur une carte interactive de la France, avec :

- ✅ **Carte interactive** avec tous les trajets TGVmax
- ✅ **Trajets passés grisés** selon l'heure actuelle
- ✅ **Statistiques en temps réel** (trains disponibles/passés)
- ✅ **Design système macOS** avec effets de verre
- ✅ **API SNCF réelle** avec données en temps réel

## 🗺️ **Fonctionnalités Principales**

### **1. Carte Interactive**
- **Carte Leaflet** centrée sur la France
- **Marqueurs** pour chaque destination avec trajets
- **Lignes colorées** pour représenter les trajets :
  - 🔵 **Bleu** : Trains aller (Paris → Destination)
  - 🟢 **Vert** : Trains retour (Destination → Paris)
  - ⚫ **Gris** : Trains passés (non disponibles)

### **2. Gestion du Temps**
- **Heure actuelle** affichée en temps réel
- **Trajets passés automatiquement grisés** selon l'heure
- **Mise à jour automatique** toutes les minutes
- **Sélecteur de date** pour voir les trajets d'autres jours

### **3. Statistiques en Temps Réel**
- **Nombre total de destinations**
- **Nombre total de trains**
- **Trains disponibles** (non passés)
- **Trains passés** (non disponibles)

### **4. Informations Détaillées**
- **Popups sur les marqueurs** : Détails des destinations
- **Popups sur les lignes** : Détails des trains (horaires, durée, numéro)
- **Statut des trains** : Disponible ou passé

## 🔧 **Architecture Technique**

### **Backend (Node.js/Express)**
```
server/
├── services/
│   ├── allTrainsService.js    # Service pour récupérer tous les trajets
│   ├── dataService.js         # Données des villes
│   └── trainDataService.js    # Service SNCF existant
├── routes/
│   └── allTrains.js          # API pour tous les trajets
└── index.js                   # Serveur principal
```

### **Frontend (React/TypeScript)**
```
client/src/
├── components/
│   ├── TGVmaxDashboard.tsx    # Dashboard principal
│   ├── TGVmaxMap.tsx         # Carte interactive
│   ├── MacOSButton.tsx       # Composants design macOS
│   ├── MacOSBadge.tsx
│   └── MacOSCard.tsx
├── types/
│   └── index.ts              # Types TypeScript
└── styles/
    └── macos-design-system.css # Design système macOS
```

## 🎨 **Design Système macOS**

### **Effets de Verre**
- **Backdrop filter** avec flou de 20px
- **Transparence** avec bordures subtiles
- **Ombres** douces pour la profondeur

### **Composants**
- **MacOSCard** : Cards avec effet de verre
- **MacOSBadge** : Badges pour les statistiques
- **MacOSButton** : Boutons avec niveaux de prominence
- **Status indicators** : Indicateurs d'état colorés

### **Palette de Couleurs**
- **Bleu accent** : `#007AFF`
- **Vert succès** : `#34C759`
- **Orange warning** : `#FF9500`
- **Rouge erreur** : `#FF3B30`

## 📊 **API Endpoints**

### **GET /api/all-trains**
Récupère tous les trajets TGVmax de la journée

**Paramètres :**
- `date` (optionnel) : Date au format YYYY-MM-DD

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": "lyon",
      "city": "Lyon",
      "coordinates": { "lat": 45.7578137, "lng": 4.8320114 },
      "outboundTrains": [...],
      "returnTrains": [...],
      "totalTrains": 3,
      "availableTrains": 2
    }
  ],
  "statistics": {
    "totalTrains": 15,
    "availableTrains": 12,
    "totalDestinations": 5,
    "date": "2025-08-05"
  }
}
```

### **GET /api/all-trains/statistics**
Récupère les statistiques détaillées

## 🚀 **Fonctionnalités Avancées**

### **1. Cache Intelligent**
- **Cache des données** pendant 5 minutes
- **Fallback** vers données locales si API SNCF indisponible
- **Optimisation** des performances

### **2. Gestion des Erreurs**
- **Messages d'erreur** élégants
- **Fallback automatique** vers données de test
- **Logs détaillés** pour le debugging

### **3. Interface Responsive**
- **Adaptation mobile** automatique
- **Légende interactive** sur la carte
- **Navigation fluide** entre les vues

### **4. Mise à Jour Temps Réel**
- **Actualisation automatique** de l'heure
- **Recalcul** des trains disponibles/passés
- **Interface** toujours à jour

## 📱 **Utilisation**

### **1. Arrivée sur l'App**
- L'utilisateur voit une **carte de la France**
- **Tous les trajets TGVmax** sont affichés
- **Trajets passés grisés** selon l'heure actuelle

### **2. Navigation**
- **Cliquer sur les marqueurs** pour voir les détails des destinations
- **Cliquer sur les lignes** pour voir les détails des trains
- **Changer la date** pour voir les trajets d'autres jours

### **3. Informations Disponibles**
- **Horaires de départ/arrivée**
- **Durée des trajets**
- **Numéros de train**
- **Statut (disponible/passé)**

## 🎯 **Avantages**

### **1. Vue d'Ensemble**
- **Tous les trajets** visibles en un coup d'œil
- **Gestion du temps** automatique
- **Statistiques** en temps réel

### **2. Interface Moderne**
- **Design macOS** élégant
- **Effets de verre** modernes
- **Animations fluides**

### **3. Données Réelles**
- **API SNCF** intégrée
- **Données en temps réel**
- **Fallback** robuste

### **4. Performance**
- **Cache intelligent**
- **Optimisation** des requêtes
- **Interface réactive**

## 🌐 **Accès**

**🔗 Frontend** : `http://localhost:8081`
**🔗 Backend** : `http://localhost:9090`
**🔗 API** : `http://localhost:9090/api/all-trains`

---

*Application TGVmax complète avec carte interactive et design macOS* 🚅✨ 