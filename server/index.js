const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Logs de démarrage détaillés
console.log('🚀 Démarrage du serveur TGVmax Explorer...');
console.log('📁 Répertoire de travail:', process.cwd());
console.log('🔧 Variables d\'environnement:');
console.log('  - NODE_ENV:', process.env.NODE_ENV);
console.log('  - PORT:', process.env.PORT);
console.log('  - CORS_ORIGIN:', process.env.CORS_ORIGIN);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
console.log('🔧 Configuration des middlewares...');
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
console.log('✅ Middlewares configurés');

// Routes API
console.log('🔧 Chargement des routes API...');
try {
  const tgvmaxRoutes = require('./routes/tgvmax');
  const ouisncfRoutes = require('./routes/ouisncf');
  const sncfExplorerRoutes = require('./routes/sncf-explorer');
  const googlePlacesRoutes = require('./routes/google-places');
  const placesRoutes = require('./routes/places');

  app.use('/api/tgvmax', tgvmaxRoutes);
  app.use('/api/ouisncf', ouisncfRoutes);
  app.use('/api/sncf-explorer', sncfExplorerRoutes);
  app.use('/api/google-places', googlePlacesRoutes);
  app.use('/api/places', placesRoutes);
  console.log('✅ Routes API chargées avec succès');
} catch (error) {
  console.error('❌ Erreur lors du chargement des routes:', error.message);
  console.error('Stack trace:', error.stack);
}

// Route de test
app.get('/api/test', (req, res) => {
  console.log('🧪 Route de test appelée');
  res.json({ 
    message: 'API TGVmax Explorer fonctionnelle !',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: PORT
  });
});

// Route de santé
app.get('/api/health', (req, res) => {
  console.log('🏥 Route de santé appelée');
  res.json({ 
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Serve React app (désactivé car le frontend est sur Vercel)
if (process.env.NODE_ENV === 'production') {
  console.log('🌐 Mode production - serveur API uniquement');
  console.log('📡 Le frontend est déployé séparément sur Vercel');
  
  // Route racine pour indiquer que c'est un serveur API
  app.get('/', (req, res) => {
    res.json({ 
      message: 'TGVmax Explorer API Server',
      status: 'running',
      endpoints: {
        test: '/api/test',
        health: '/api/health',
        tgvmax: '/api/tgvmax',
        ouisncf: '/api/ouisncf'
      }
    });
  });
} else {
  console.log('🔧 Mode développement - pas de fichiers statiques');
}

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('💥 Erreur non capturée:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Promesse rejetée non gérée:', reason);
  console.error('Promise:', promise);
});

// Démarrage du serveur
console.log('🎯 Tentative de démarrage du serveur...');
app.listen(PORT, () => {
  console.log('🎉 Serveur démarré avec succès !');
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 API disponible sur http://localhost:${PORT}/api`);
  console.log(`🌐 Application disponible sur http://localhost:${PORT}`);
  console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
  console.log(`🏥 Santé: http://localhost:${PORT}/api/health`);
}).on('error', (error) => {
  console.error('❌ Erreur lors du démarrage du serveur:', error.message);
  console.error('Code d\'erreur:', error.code);
  process.exit(1);
}); 