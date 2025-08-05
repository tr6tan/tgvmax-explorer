const express = require('express');
const router = express.Router();
const { getCityInfo, getDemographicData } = require('../services/dataService');

// Route pour obtenir les informations d'une ville
router.get('/city/:cityName', async (req, res) => {
  try {
    const { cityName } = req.params;
    const cityInfo = await getCityInfo(cityName);
    
    if (!cityInfo) {
      return res.status(404).json({
        error: 'Ville non trouvée'
      });
    }
    
    res.json({
      success: true,
      data: cityInfo
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des informations de la ville:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des informations de la ville'
    });
  }
});

// Route pour obtenir les données démographiques
router.get('/demographics/:cityName', async (req, res) => {
  try {
    const { cityName } = req.params;
    const demographicData = await getDemographicData(cityName);
    
    res.json({
      success: true,
      data: demographicData
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des données démographiques:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des données démographiques'
    });
  }
});

// Route pour obtenir les statistiques globales
router.get('/stats', async (req, res) => {
  try {
    const stats = await getGlobalStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des statistiques'
    });
  }
});

module.exports = router; 