const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const fs = require('fs-extra');
const path = require('path');

// Routes
const searchRoutes = require('./routes/search');
const stationsRoutes = require('./routes/stations');
const weatherRoutes = require('./routes/weather');
const dataRoutes = require('./routes/data');
const allTrainsRoutes = require('./routes/allTrains');
const sncfApiRoutes = require('./routes/sncfApi');
const tgvmaxRoutes = require('./routes/tgvmax');
const ouisncfRoutes = require('./routes/ouisncf');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Routes API
app.use('/api/search', searchRoutes);
app.use('/api/stations', stationsRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/all-trains', allTrainsRoutes);
app.use('/api/sncf/all-trains', sncfApiRoutes);
app.use('/api/tgvmax', tgvmaxRoutes);
app.use('/api/ouisncf', ouisncfRoutes);

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Mise à jour automatique des données SNCF (tous les jours à 6h)
cron.schedule('0 6 * * *', async () => {
  console.log('Mise à jour automatique des données SNCF...');
  try {
    const { updateTrainData } = require('./services/trainDataService');
    await updateTrainData();
    console.log('Données SNCF mises à jour avec succès');
  } catch (error) {
    console.error('Erreur lors de la mise à jour des données SNCF:', error);
  }
});

app.listen(PORT, () => {
  console.log(`🚅 Serveur TGVmax démarré sur le port ${PORT}`);
}); 