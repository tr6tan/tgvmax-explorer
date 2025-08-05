# TGVmax Explorer 🚅

Application web moderne pour découvrir les destinations accessibles avec TGVmax en France. Trouvez facilement les villes que vous pouvez visiter en journée depuis votre gare de départ.

## 🎯 Fonctionnalités

- **Recherche intelligente** : Trouvez les villes accessibles en journée depuis votre gare de départ
- **Carte interactive** : Visualisez toutes les destinations sur une carte
- **Informations détaillées** : Météo, données démographiques, horaires des trains
- **Interface moderne** : Design responsive et intuitif
- **Données en temps réel** : Mise à jour automatique des données SNCF
- **APIs réelles** : Intégration des vraies APIs SNCF, OpenWeatherMap et INSEE

## 🚀 Technologies Utilisées

### Backend
- **Node.js** avec Express
- **APIs réelles** :
  - [SNCF TGVmax API](https://data.sncf.com/api/explore/v2.1/catalog/datasets/tgvmax/records) - Horaires de trains TGVmax
  - [OpenWeatherMap API](https://openweathermap.org/api) - Prévisions météo
  - [INSEE API](https://api.insee.fr/) - Données démographiques
- **Cache intelligent** pour optimiser les performances
- **Gestion d'erreurs** avec fallback vers données mockées

### Frontend
- **React 18** avec TypeScript
- **Tailwind CSS** pour le design moderne
- **Leaflet** pour les cartes interactives
- **Lucide React** pour les icônes
- **Axios** pour les requêtes API

## 📦 Installation

### Prérequis
- Node.js (version 16 ou supérieure)
- npm

### Installation rapide
```bash
# Cloner le projet
git clone <repository-url>
cd tgvmax-app

# Installer les dépendances
npm install
cd client && npm install && cd ..

# Démarrer l'application
npm run dev
```

L'application sera accessible sur `http://localhost:5000`

## 🔧 Configuration des APIs (Optionnel)

Pour utiliser toutes les fonctionnalités, créez un fichier `.env` à la racine :

```env
# API OpenWeatherMap (gratuite)
OPENWEATHER_API_KEY=votre_cle_openweather_ici

# API INSEE (gratuite)
INSEE_API_KEY=votre_cle_insee_ici

# Configuration serveur
PORT=5000
NODE_ENV=development
```

**Note** : L'API SNCF TGVmax est accessible sans clé et fonctionne immédiatement !

## 🎮 Utilisation

1. **Sélectionnez votre gare de départ** (ex: "Paris Gare de Lyon")
2. **Choisissez une date** pour votre voyage
3. **Définissez la durée minimale** de séjour sur place
4. **Lancez la recherche** et découvrez les destinations possibles
5. **Visualisez les résultats** sur la carte ou en liste
6. **Consultez les détails** : météo, démographie, horaires

## 📊 APIs Intégrées

### ✅ API SNCF TGVmax (Fonctionnelle)
- **Endpoint** : `https://data.sncf.com/api/explore/v2.1/catalog/datasets/tgvmax/records`
- **Données** : Horaires de trains TGVmax en temps réel
- **Statut** : ✅ Fonctionne sans clé API
- **Cache** : 1 heure pour optimiser les performances

### 🌤️ API OpenWeatherMap (Optionnelle)
- **Endpoint** : `https://api.openweathermap.org/data/2.5/`
- **Données** : Prévisions météo pour chaque destination
- **Statut** : ⚠️ Nécessite une clé API gratuite
- **Fallback** : Données simulées si pas de clé

### 📈 API INSEE (Optionnelle)
- **Endpoint** : `https://api.insee.fr/`
- **Données** : Démographie des villes françaises
- **Statut** : ⚠️ Nécessite une clé API gratuite
- **Fallback** : Données statiques si pas de clé

## 🏗️ Architecture

```
tgvmax-app/
├── server/                 # Backend Node.js/Express
│   ├── routes/            # Routes API
│   ├── services/          # Services métier
│   └── data/             # Données locales
├── client/                # Frontend React/TypeScript
│   ├── src/
│   │   ├── components/   # Composants React
│   │   ├── types/        # Types TypeScript
│   │   └── App.tsx       # Application principale
│   └── public/           # Assets statiques
├── Dockerfile            # Configuration Docker
├── docker-compose.yml    # Orchestration Docker
└── package.json          # Dépendances et scripts
```

## 🚀 Déploiement

### Avec Docker
```bash
# Construire et démarrer
docker-compose up --build

# Ou en arrière-plan
docker-compose up -d
```

### Déploiement manuel
```bash
# Build de production
npm run build

# Démarrer en production
npm start
```

## 🧪 Tests

Testez les APIs intégrées :
```bash
node test-api.js
```

## 📈 Fonctionnalités Avancées

- **Cache intelligent** : Optimisation des performances
- **Gestion d'erreurs** : Fallback automatique vers données mockées
- **Mise à jour automatique** : Données SNCF actualisées quotidiennement
- **Interface responsive** : Compatible mobile et desktop
- **Recherche en temps réel** : Suggestions de gares

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- **SNCF** pour l'API TGVmax open data
- **OpenWeatherMap** pour les données météo
- **INSEE** pour les données démographiques
- **Opendatasoft** pour la plateforme d'APIs

---

**🚅 TGVmax Explorer** - Découvrez la France en train avec les vraies données SNCF ! 