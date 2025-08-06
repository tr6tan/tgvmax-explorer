const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes API
const tgvmaxRoutes = require('./routes/tgvmax');
const ouisncfRoutes = require('./routes/ouisncf');
const sncfExplorerRoutes = require('./routes/sncf-explorer');

app.use('/api/tgvmax', tgvmaxRoutes);
app.use('/api/ouisncf', ouisncfRoutes);
app.use('/api/sncf-explorer', sncfExplorerRoutes);

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'API TGVmax Explorer fonctionnelle !' });
});

// Serve React app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 API disponible sur http://localhost:${PORT}/api`);
  console.log(`🌐 Application disponible sur http://localhost:${PORT}`);
}); 