# Guide d'installation - TGVmax Explorer

## Prérequis
- **Node.js** (version 16 ou supérieure)
- **npm** (généralement installé avec Node.js)
- **Git** (pour cloner le projet)

## Installation rapide

### 1. Cloner le projet
```bash
git clone <repository-url>
cd tgvmax-app
```

### 2. Installer les dépendances
```bash
# Installer les dépendances du backend
npm install

# Installer les dépendances du frontend
cd client && npm install && cd ..
```

### 3. Configuration des APIs (Optionnel)

Pour utiliser les vraies APIs au lieu des données mockées, créez un fichier `.env` à la racine du projet :

```bash
# Configuration des APIs
OPENWEATHER_API_KEY=votre_cle_openweather_ici
SNCF_API_KEY=votre_cle_sncf_ici
INSEE_API_KEY=votre_cle_insee_ici

# Configuration du serveur
PORT=5000
NODE_ENV=development

# Configuration des URLs des APIs
SNCF_BASE_URL=https://api.sncf.com/v1
OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/2.5
INSEE_BASE_URL=https://api.insee.fr
```

#### Obtenir les clés API :

**OpenWeatherMap** (Météo) :
1. Allez sur https://openweathermap.org/
2. Créez un compte gratuit
3. Obtenez votre clé API dans votre dashboard

**SNCF** (Horaires de trains) :
1. Allez sur https://www.digital.sncf.com/startup/api
2. Créez un compte développeur
3. Demandez l'accès à l'API horaires

**INSEE** (Données démographiques) :
1. Allez sur https://api.insee.fr/
2. Créez un compte
3. Obtenez votre clé API

### 4. Lancer l'application

#### Mode développement
```bash
npm run dev
```

#### Ou avec le script automatique
```bash
chmod +x start.sh
./start.sh
```

L'application sera accessible sur `http://localhost:5000`

## Déploiement avec Docker

### 1. Construire l'image
```bash
docker build -t tgvmax-app .
```

### 2. Lancer avec Docker Compose
```bash
docker-compose up -d
```

### 3. Variables d'environnement pour Docker
Créez un fichier `.env` pour Docker :
```bash
# APIs
OPENWEATHER_API_KEY=votre_cle_openweather_ici
SNCF_API_KEY=votre_cle_sncf_ici
INSEE_API_KEY=votre_cle_insee_ici

# Configuration
NODE_ENV=production
PORT=5000
```

## Structure du projet

```
TGV-max-app/
├── server/                 # Backend Node.js/Express
│   ├── routes/            # Routes API
│   ├── services/          # Services métier
│   ├── data/             # Données locales
│   └── index.js          # Point d'entrée serveur
├── client/               # Frontend React
│   ├── src/
│   │   ├── components/   # Composants React
│   │   ├── types/        # Types TypeScript
│   │   └── App.tsx       # Composant principal
│   └── public/           # Assets statiques
├── Dockerfile            # Configuration Docker
├── docker-compose.yml    # Orchestration Docker
└── package.json          # Dépendances et scripts
```

## Fonctionnalités implémentées

### ✅ Fonctionnalités complètes
- **Recherche de destinations** : Trouvez les villes accessibles en journée
- **Carte interactive** : Visualisez les destinations sur une carte Leaflet
- **Informations détaillées** : Météo, démographie, horaires
- **Interface moderne** : Design responsive avec Tailwind CSS
- **Gestion d'erreurs** : Fallback vers les données mockées si les APIs échouent

### 🔄 APIs intégrées
- **SNCF Open Data** : Horaires et itinéraires TGVmax (avec fallback)
- **OpenWeatherMap** : Prévisions météo en temps réel (avec fallback)
- **INSEE** : Données démographiques des villes (avec fallback)

### 🎨 Interface utilisateur
- Barre de recherche intuitive avec autocomplétion
- Basculement entre vue carte et liste
- Cartes d'information détaillées
- Design responsive pour mobile et desktop

## Dépannage

### Problèmes courants

**1. Erreur de compilation React**
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

**2. Erreur de port déjà utilisé**
```bash
# Changer le port dans .env
PORT=5001
```

**3. APIs non configurées**
L'application fonctionne avec les données mockées même sans clés API.

**4. Erreur Docker**
```bash
# Nettoyer et reconstruire
docker-compose down
docker system prune -f
docker-compose up --build
```

### Logs et débogage

**Voir les logs du serveur :**
```bash
npm run server
```

**Voir les logs Docker :**
```bash
docker-compose logs -f
```

## Prochaines étapes possibles

- [ ] Intégration API SNCF réelle
- [ ] Base de données pour stocker les données
- [ ] Authentification utilisateur
- [ ] Notifications en temps réel
- [ ] PWA (Progressive Web App)
- [ ] Tests automatisés

## Support

Pour toute question ou problème, consultez les logs du serveur ou créez une issue sur le repository. 