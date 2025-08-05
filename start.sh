#!/bin/bash

echo "🚅 Démarrage de TGVmax Explorer..."

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/"
    exit 1
fi

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé. Veuillez l'installer."
    exit 1
fi

echo "📦 Installation des dépendances..."

# Installer les dépendances du backend
npm install

# Installer les dépendances du frontend
cd client && npm install && cd ..

echo "🔧 Configuration..."

# Créer le dossier data s'il n'existe pas
mkdir -p server/data

echo "🚀 Démarrage de l'application..."

# Démarrer l'application en mode développement
npm run dev

echo "✅ Application démarrée !"
echo "🌐 Ouvrez http://localhost:5000 dans votre navigateur" 