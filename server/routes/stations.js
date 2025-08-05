const express = require('express');
const router = express.Router();
const { getAllStations, getStationInfo } = require('../services/stationService');

// Route pour obtenir toutes les gares
router.get('/', async (req, res) => {
  try {
    const stations = await getAllStations();
    res.json({
      success: true,
      data: stations
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des gares:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des gares'
    });
  }
});

// Route pour obtenir les informations d'une gare spécifique
router.get('/:stationCode', async (req, res) => {
  try {
    const { stationCode } = req.params;
    const stationInfo = await getStationInfo(stationCode);
    
    if (!stationInfo) {
      return res.status(404).json({
        error: 'Gare non trouvée'
      });
    }
    
    res.json({
      success: true,
      data: stationInfo
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des informations de la gare:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des informations de la gare'
    });
  }
});

// Route pour rechercher des gares par nom
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const stations = await searchStations(query);
    
    res.json({
      success: true,
      data: stations
    });
  } catch (error) {
    console.error('Erreur lors de la recherche de gares:', error);
    res.status(500).json({
      error: 'Erreur lors de la recherche de gares'
    });
  }
});

module.exports = router; 