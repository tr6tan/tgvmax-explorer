# Dockerfile pour TGVmax Explorer
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY client/package*.json ./client/

# Installer les dépendances
RUN npm install
RUN cd client && npm install

# Copier le code source
COPY . .

# Construire l'application React
RUN cd client && npm run build

# Exposer le port
EXPOSE 5000

# Commande de démarrage
CMD ["npm", "start"] 