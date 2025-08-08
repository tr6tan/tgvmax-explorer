const express = require('express');
const axios = require('axios');
const router = express.Router();

// Clé API Google Maps
const GOOGLE_MAPS_API_KEY = 'AIzaSyB2JUQt8zn_2vnLr4C-87SWpfR0nufKY_Y';

// Route pour rechercher les coordonnées d'une ville
router.get('/search-city', async (req, res) => {
  try {
    const { cityName } = req.query;
    
    if (!cityName) {
      return res.status(400).json({ error: 'Nom de ville requis' });
    }

    console.log(`🔍 Recherche des coordonnées pour: ${cityName}`);

    // Étape 1: Rechercher le place_id avec l'API Places Search
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`;
    const searchParams = {
      input: `${cityName}, France`,
      inputtype: 'textquery',
      fields: 'place_id',
      key: GOOGLE_MAPS_API_KEY
    };

    const searchResponse = await axios.get(searchUrl, { params: searchParams });
    const searchData = searchResponse.data;

    console.log(`📊 Réponse de recherche:`, searchData);

    if (searchData.candidates && searchData.candidates.length > 0) {
      const placeId = searchData.candidates[0].place_id;
      console.log(`✅ Place ID trouvé: ${placeId}`);

      // Étape 2: Récupérer les détails avec l'API Places Details
      const detailsUrl = `https://places.googleapis.com/v1/places/${placeId}`;
      const detailsParams = {
        fields: 'id,displayName,location',
        key: GOOGLE_MAPS_API_KEY
      };

      const detailsResponse = await axios.get(detailsUrl, {
        params: detailsParams,
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': 'id,displayName,location'
        }
      });

      const detailsData = detailsResponse.data;
      console.log(`📊 Réponse de détails:`, detailsData);

      if (detailsData.location) {
        const coordinates = {
          latitude: detailsData.location.latitude,
          longitude: detailsData.location.longitude
        };

        const result = {
          success: true,
          cityName: detailsData.displayName?.text || cityName,
          coordinates: coordinates
        };

        console.log(`✅ Coordonnées trouvées: [${coordinates.latitude}, ${coordinates.longitude}]`);
        res.json(result);
      } else {
        console.log(`❌ Pas de coordonnées dans la réponse API`);
        res.json({ success: false, error: 'Pas de coordonnées trouvées' });
      }
    } else {
      console.log(`❌ Aucun candidat trouvé`);
      res.json({ success: false, error: 'Aucune ville trouvée' });
    }

  } catch (error) {
    console.error(`❌ Erreur lors de la récupération des coordonnées:`, error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la récupération des coordonnées',
      details: error.message 
    });
  }
});

module.exports = router;
