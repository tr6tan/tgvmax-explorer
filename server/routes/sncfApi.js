const express = require('express');
const router = express.Router();
const { getAllTGVmaxTrains } = require('../services/sncfApiService');

/**
 * GET /api/sncf/all-trains
 * Récupère tous les trajets TGVmax depuis l'API SNCF officielle
 */
router.get('/', async (req, res) => {
  try {
    const { date, refresh } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    const forceRefresh = refresh === 'true';
    
    console.log(`🚅 Recherche de tous les trajets TGVmax via l'API SNCF officielle pour le ${targetDate}`);
    
    if (forceRefresh) {
      console.log('🔄 Forçage du rafraîchissement du cache...');
    }
    
    const destinations = await getAllTGVmaxTrains(targetDate, forceRefresh);
    
    // Calculer les statistiques
    const totalTrains = destinations.reduce((sum, dest) => sum + dest.totalTrains, 0);
    const availableTrains = destinations.reduce((sum, dest) => sum + dest.availableTrains, 0);
    
    res.json({
      success: true,
      data: destinations,
      statistics: {
        totalDestinations: destinations.length,
        totalTrains,
        availableTrains,
        date: targetDate,
        source: 'SNCF API Officielle'
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des trajets TGVmax:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des données',
      message: error.message
    });
  }
});

/**
 * GET /api/sncf/all-trains/statistics
 * Récupère les statistiques des trajets TGVmax
 */
router.get('/statistics', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    console.log(`📊 Récupération des statistiques TGVmax pour le ${targetDate}`);
    
    const destinations = await getAllTGVmaxTrains(targetDate);
    
    // Calculer les statistiques détaillées
    const totalTrains = destinations.reduce((sum, dest) => sum + dest.totalTrains, 0);
    const availableTrains = destinations.reduce((sum, dest) => sum + dest.availableTrains, 0);
    const outboundTrains = destinations.reduce((sum, dest) => sum + dest.outboundTrains.length, 0);
    const returnTrains = destinations.reduce((sum, dest) => sum + dest.returnTrains.length, 0);
    
    // Top 5 des destinations
    const topDestinations = destinations
      .sort((a, b) => b.totalTrains - a.totalTrains)
      .slice(0, 5)
      .map(dest => ({
        city: dest.city,
        totalTrains: dest.totalTrains,
        availableTrains: dest.availableTrains
      }));
    
    res.json({
      success: true,
      statistics: {
        totalDestinations: destinations.length,
        totalTrains,
        availableTrains,
        outboundTrains,
        returnTrains,
        date: targetDate,
        source: 'SNCF API Officielle',
        topDestinations
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques',
      message: error.message
    });
  }
});

module.exports = router; 