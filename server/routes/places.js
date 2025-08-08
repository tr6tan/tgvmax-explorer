const express = require('express');
const router = express.Router();
const axios = require('axios');

// Clé API Google Maps
const GOOGLE_MAPS_API_KEY = 'AIzaSyB2JUQt8zn_2vnLr4C-87SWpfR0nufKY_Y';

// Endpoint pour rechercher des lieux et récupérer leurs photos
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    console.log(`🔍 Recherche Google Places pour: ${query}`);

    // 1. Rechercher le lieu
    const searchResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/place/textsearch/json`,
      {
        params: {
          query: query,
          key: GOOGLE_MAPS_API_KEY,
          language: 'fr',
          region: 'fr'
        }
      }
    );

    console.log('📊 Réponse de recherche:', searchResponse.data);

    if (searchResponse.data.status !== 'OK' || !searchResponse.data.results.length) {
      console.log('❌ Aucun résultat trouvé');
      return res.json({ photoUrl: null });
    }

    const place = searchResponse.data.results[0];
    console.log('✅ Place ID trouvé:', place.place_id);

    // 2. Récupérer les détails du lieu avec photos
    const detailsResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json`,
      {
        params: {
          place_id: place.place_id,
          key: GOOGLE_MAPS_API_KEY,
          fields: 'photos,name,formatted_address',
          language: 'fr'
        }
      }
    );

    console.log('📊 Réponse de détails:', detailsResponse.data);

    if (detailsResponse.data.status !== 'OK') {
      console.log('❌ Erreur lors de la récupération des détails');
      return res.json({ photoUrl: null });
    }

    const placeDetails = detailsResponse.data.result;

    // 3. Récupérer l'URL de la photo
    let photoUrl = null;
    if (placeDetails.photos && placeDetails.photos.length > 0) {
      const photo = placeDetails.photos[0];
      photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&maxheight=200&photo_reference=${photo.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`;
      console.log('✅ Photo URL générée:', photoUrl);
    }

    res.json({
      photoUrl,
      name: placeDetails.name,
      address: placeDetails.formatted_address
    });

  } catch (error) {
    console.error('❌ Erreur lors de la recherche Google Places:', error.message);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des données',
      photoUrl: null 
    });
  }
});

module.exports = router;
