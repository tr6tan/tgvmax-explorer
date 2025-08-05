const express = require('express');
const { getAllTGVmaxTrains } = require('../services/allTrainsService');

const router = express.Router();

/**
 * GET /api/all-trains
 * Récupère tous les trajets TGVmax de la journée
 */
router.get('/', async (req, res) => {
  try {
    const { date, refresh } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    const forceRefresh = refresh === 'true';
    
    console.log(`Recherche de tous les trajets TGVmax pour le ${targetDate}`);
    
    // Si refresh=true, forcer le rafraîchissement
    if (forceRefresh) {
      console.log('🔄 Forçage du rafraîchissement du cache...');
    }
    
    const destinations = await getAllTGVmaxTrains(targetDate, forceRefresh);
    
    // Calculer les statistiques globales
    const totalTrains = destinations.reduce((sum, dest) => sum + dest.totalTrains, 0);
    const availableTrains = destinations.reduce((sum, dest) => sum + dest.availableTrains, 0);
    const totalDestinations = destinations.length;
    
    res.json({
      success: true,
      data: destinations,
      statistics: {
        totalTrains,
        availableTrains,
        totalDestinations,
        date: targetDate
      },
      message: `${totalDestinations} destinations trouvées avec ${totalTrains} trains TGVmax`
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des trajets:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des trajets TGVmax',
      details: error.message
    });
  }
});

/**
 * GET /api/all-trains/statistics
 * Récupère les statistiques des trajets TGVmax
 */
router.get('/statistics', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const destinations = await getAllTGVmaxTrains(targetDate);
    
    // Statistiques détaillées
    const statistics = {
      date: targetDate,
      totalDestinations: destinations.length,
      totalTrains: destinations.reduce((sum, dest) => sum + dest.totalTrains, 0),
      availableTrains: destinations.reduce((sum, dest) => sum + dest.availableTrains, 0),
      outboundTrains: destinations.reduce((sum, dest) => sum + dest.outboundTrains.length, 0),
      returnTrains: destinations.reduce((sum, dest) => sum + dest.returnTrains.length, 0),
      destinations: destinations.map(dest => ({
        city: dest.city,
        totalTrains: dest.totalTrains,
        availableTrains: dest.availableTrains,
        outboundCount: dest.outboundTrains.length,
        returnCount: dest.returnTrains.length
      }))
    };
    
    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques',
      details: error.message
    });
  }
});

module.exports = router; 