const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * GET /api/ouisncf/search
 * Recherche les trajets OUI.sncf à 0€
 */
router.get('/search', async (req, res) => {
  try {
    const { from, date } = req.query;
    
    console.log(`🔍 Test de connexion API OUI.sncf depuis ${from} pour le ${date}...`);

    // Test de connexion à l'API Opendatasoft TGVmax
    const opendatasoftApiUrl = 'https://data.sncf.com/api/explore/v2.1/catalog/datasets/tgvmax/records';
    
          try {
        console.log(`📅 Recherche pour la date: ${date}`);
        
        // Recherche dans l'API Opendatasoft TGVmax
        const response = await axios.get(opendatasoftApiUrl, {
                  params: {
          where: `od_happy_card:"OUI"`,
          select: 'date,train_no,origine,destination,heure_depart,heure_arrivee,od_happy_card',
          limit: 50,
          order_by: 'heure_depart ASC'
        },
          timeout: 10000 // 10 secondes timeout
        });

      console.log(`✅ API OUI.sncf accessible - Status: ${response.status}`);
      console.log(`📊 Réponse API:`, response.data);

      // Traitement des données réelles
      const records = response.data.results || [];
      console.log(`📊 ${records.length} trajets récupérés de l'API Opendatasoft TGVmax`);
      
      // Convertir les trajets Opendatasoft en format compatible
      const convertedTrains = records.map((record, index) => {
        // Calculer la durée
        const [departureHour, departureMinute] = record.heure_depart.split(':').map(Number);
        const [arrivalHour, arrivalMinute] = record.heure_arrivee.split(':').map(Number);
        
        let durationMinutes = (arrivalHour * 60 + arrivalMinute) - (departureHour * 60 + departureMinute);
        if (durationMinutes < 0) durationMinutes += 24 * 60; // Gestion du passage de minuit
        
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        const duration = `${hours}h${minutes.toString().padStart(2, '0')}`;
        
        // Créer les dates complètes
        const departureTime = new Date(`${record.date}T${record.heure_depart}:00`);
        const arrivalTime = new Date(`${record.date}T${record.heure_arrivee}:00`);
        
        return {
          id: `tgvmax-${index}`,
          departureStation: record.origine || 'Gare inconnue',
          arrivalStation: record.destination || 'Gare inconnue',
          departureTime: departureTime.toISOString(),
          arrivalTime: arrivalTime.toISOString(),
          duration: duration,
          trainNumber: `TGV ${record.train_no}`,
          platform: Math.floor(Math.random() * 20) + 1,
          price: record.od_happy_card === 'OUI' ? '0€' : 'Prix variable',
          originalRecord: record
        };
      });
      
      console.log(`🎯 ${convertedTrains.length} trajets convertis`);

      res.json({
        success: true,
        trains: convertedTrains,
        search: {
          from,
          date,
          totalTrains: convertedTrains.length,
          source: 'Opendatasoft TGVmax API (Réelle)',
          apiStatus: 'Connecté',
          totalRecords: records.length,
          convertedTrains: convertedTrains.length
        }
      });

    } catch (apiError) {
      console.error('❌ Erreur API OUI.sncf:', apiError.message);
      
      res.json({
        success: false,
        trains: [],
        search: {
          from,
          date,
          totalTrains: 0,
          source: 'OUI.sncf API',
          apiStatus: 'Non connecté',
          error: apiError.message
        },
        error: 'API OUI.sncf non accessible',
        message: 'Vérifiez la clé API et les paramètres'
      });
    }

  } catch (error) {
    console.error('Erreur lors du test API OUI.sncf:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du test API OUI.sncf',
      message: error.message
    });
  }
});

module.exports = router; 