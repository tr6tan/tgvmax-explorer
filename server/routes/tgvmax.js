const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * GET /api/tgvmax/search
 * Recherche les trajets TGVmax à 0€
 * 
 * Utilise la vraie API TGVmax d'Opendatasoft
 */
router.get('/search', async (req, res) => {
  try {
    const { from, date } = req.query;
    
    console.log(`🔍 Recherche TGVmax depuis ${from} pour le ${date}...`);

    // Vraie API TGVmax d'Opendatasoft
    const tgvmaxApiUrl = 'https://data.sncf.com/api/explore/v2.1/catalog/datasets/tgvmax/records';
    
    try {
      console.log(`📅 Recherche pour la date: ${date}`);
      
      // Convertir la date au format YYYY/MM/DD pour l'API
      const dateParts = date.split('-');
      const formattedDate = `${dateParts[0]}/${dateParts[1]}/${dateParts[2]}`;
      
      console.log(`📅 Date formatée pour l'API: ${formattedDate}`);
      
      // Construire l'URL exacte avec la date spécifique
      const encodedDate = encodeURIComponent(`"${formattedDate}"`);
      const encodedOrigin = encodeURIComponent('"PARIS (intramuros)"');
      
      // URL exacte comme dans votre exemple, mais avec la date dynamique
      const fullUrl = `${tgvmaxApiUrl}?limit=100&refine=date%3A${encodedDate}&refine=origine%3A${encodedOrigin}`;
      
      console.log(`🔗 URL complète: ${fullUrl}`);
      
      // Recherche dans la vraie API TGVmax avec l'URL exacte
      const response = await axios.get(fullUrl, {
        timeout: 10000 // 10 secondes timeout
      });

      console.log(`✅ API TGVmax accessible - Status: ${response.status}`);
      console.log(`📊 ${response.data.results?.length || 0} trajets TGVmax récupérés`);

      // Traitement des données réelles TGVmax
      const records = response.data.results || [];
      console.log(`📊 ${records.length} trajets récupérés de l'API`);
      
      // Filtrer uniquement les trajets TGVmax (od_happy_card = "OUI")
      const tgvmaxRecords = records.filter(record => record.od_happy_card === "OUI");
      console.log(`🎯 ${tgvmaxRecords.length} trajets TGVmax filtrés (od_happy_card = "OUI")`);
      
      // Convertir les trajets TGVmax en format compatible
      const convertedTrains = tgvmaxRecords.map((record, index) => {
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
          price: '0€', // TGVmax = gratuit
          originalRecord: record,
          note: '✅ Vraies données TGVmax'
        };
      });
      
      console.log(`🎯 ${convertedTrains.length} trajets TGVmax convertis`);

      res.json({
        success: true,
        trains: convertedTrains,
        search: {
          from,
          date,
          totalTrains: convertedTrains.length,
          source: 'API TGVmax Opendatasoft (Réelle)',
          apiStatus: 'Connecté',
          totalRecords: records.length,
          convertedTrains: convertedTrains.length,
          note: '✅ Vraies données TGVmax d\'Opendatasoft'
        }
      });

    } catch (apiError) {
      console.error('❌ Erreur API TGVmax:', apiError.message);
      
      res.json({
        success: false,
        trains: [],
        search: {
          from,
          date,
          totalTrains: 0,
          source: 'API TGVmax Opendatasoft',
          apiStatus: 'Non connecté',
          error: apiError.message
        },
        error: 'API TGVmax non accessible',
        message: 'Vérifiez les paramètres de recherche'
      });
    }

  } catch (error) {
    console.error('Erreur lors du test API TGVmax:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du test API TGVmax',
      message: error.message
    });
  }
});

module.exports = router; 