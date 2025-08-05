const express = require('express');
const router = express.Router();
const { getWeatherForecast } = require('../services/weatherService');

// Route pour obtenir les prévisions météo d'une ville
router.get('/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const { date } = req.query;
    
    if (!city) {
      return res.status(400).json({
        error: 'Nom de la ville requis'
      });
    }

    const weatherData = await getWeatherForecast(city, date);
    
    res.json({
      success: true,
      data: weatherData
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la météo:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des données météo'
    });
  }
});

// Route pour obtenir la météo actuelle
router.get('/current/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const currentWeather = await getCurrentWeather(city);
    
    res.json({
      success: true,
      data: currentWeather
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la météo actuelle:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération de la météo actuelle'
    });
  }
});

module.exports = router; 