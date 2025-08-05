const express = require('express');
const router = express.Router();
const { searchDestinations } = require('../services/searchService');

// Route principale de recherche
router.post('/destinations', async (req, res) => {
  try {
    const { departureStation, date, minDuration = 2 } = req.body;
    
    if (!departureStation || !date) {
      return res.status(400).json({
        error: 'Gare de départ et date requises'
      });
    }

    const destinations = await searchDestinations(departureStation, date, minDuration);
    
    res.json({
      success: true,
      data: destinations,
      count: destinations.length
    });
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    res.status(500).json({
      error: 'Erreur lors de la recherche des destinations'
    });
  }
});

// Route pour obtenir les détails d'un trajet
router.get('/journey/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const journeyDetails = await getJourneyDetails(id);
    
    res.json({
      success: true,
      data: journeyDetails
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des détails:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des détails du trajet'
    });
  }
});

module.exports = router; 