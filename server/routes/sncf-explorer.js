const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * GET /api/sncf-explorer/stations
 * Récupère toutes les gares disponibles
 */
router.get('/stations', async (req, res) => {
  try {
    console.log('🔍 Récupération des gares SNCF...');
    
    const response = await axios.get('https://data.sncf.com/api/explore/v2.1/catalog/datasets/tgvmax/records', {
      params: {
        limit: 1000,
        select: 'origine,destination'
      },
      timeout: 15000
    });

    const records = response.data.results || [];
    
    // Extraire toutes les gares uniques
    const stations = new Set();
    records.forEach(record => {
      if (record.origine) stations.add(record.origine);
      if (record.destination) stations.add(record.destination);
    });

    const stationsList = Array.from(stations).sort();
    
    console.log(`✅ ${stationsList.length} gares trouvées`);

    res.json({
      success: true,
      stations: stationsList,
      total: stationsList.length,
      source: 'API SNCF TGVmax'
    });

  } catch (error) {
    console.error('❌ Erreur récupération gares:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des gares',
      message: error.message
    });
  }
});

/**
 * GET /api/sncf-explorer/statistics
 * Statistiques sur les trajets TGVmax
 */
router.get('/statistics', async (req, res) => {
  try {
    const { date } = req.query;
    console.log(`📊 Calcul des statistiques pour le ${date}...`);

    const response = await axios.get('https://data.sncf.com/api/explore/v2.1/catalog/datasets/tgvmax/records', {
      params: {
        limit: 1000,
        refine: date ? `date:"${date.replace(/-/g, '/')}"` : undefined
      },
      timeout: 15000
    });

    const records = response.data.results || [];
    const tgvmaxRecords = records.filter(record => record.od_happy_card === "OUI");

    // Statistiques par destination
    const destinationStats = {};
    tgvmaxRecords.forEach(record => {
      const dest = record.destination;
      if (!destinationStats[dest]) {
        destinationStats[dest] = {
          count: 0,
          trains: []
        };
      }
      destinationStats[dest].count++;
      destinationStats[dest].trains.push(record);
    });

    // Top 10 des destinations
    const topDestinations = Object.entries(destinationStats)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 10)
      .map(([dest, stats]) => ({
        destination: dest,
        count: stats.count,
        trains: stats.trains
      }));

    // Statistiques par heure de départ
    const hourStats = {};
    tgvmaxRecords.forEach(record => {
      const hour = record.heure_depart.split(':')[0];
      hourStats[hour] = (hourStats[hour] || 0) + 1;
    });

    res.json({
      success: true,
      statistics: {
        totalTrains: records.length,
        totalTGVmax: tgvmaxRecords.length,
        topDestinations,
        hourDistribution: hourStats,
        date: date || 'Toutes dates'
      }
    });

  } catch (error) {
    console.error('❌ Erreur statistiques:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du calcul des statistiques',
      message: error.message
    });
  }
});

/**
 * GET /api/sncf-explorer/search-advanced
 * Recherche avancée avec plus de filtres
 */
router.get('/search-advanced', async (req, res) => {
  try {
    const { from, to, date, timeRange, limit = 100 } = req.query;
    
    console.log(`🔍 Recherche avancée: ${from} → ${to} le ${date}`);

    let url = 'https://data.sncf.com/api/explore/v2.1/catalog/datasets/tgvmax/records';
    let params = { limit: parseInt(limit) };
    let filters = [];

    // Filtres
    if (date) {
      const formattedDate = date.replace(/-/g, '/');
      filters.push(`date:"${formattedDate}"`);
    }
    
    if (from) {
      filters.push(`origine:"${from.toUpperCase()} (intramuros)"`);
    }
    
    if (to) {
      filters.push(`destination:"${to.toUpperCase()}"`);
    }

    if (filters.length > 0) {
      params.refine = filters;
    }

    const response = await axios.get(url, { params, timeout: 15000 });
    const records = response.data.results || [];
    const tgvmaxRecords = records.filter(record => record.od_happy_card === "OUI");

    // Filtrer par plage horaire si spécifiée
    let filteredRecords = tgvmaxRecords;
    if (timeRange) {
      const [startHour, endHour] = timeRange.split('-').map(h => parseInt(h));
      filteredRecords = tgvmaxRecords.filter(record => {
        const hour = parseInt(record.heure_depart.split(':')[0]);
        return hour >= startHour && hour <= endHour;
      });
    }

    // Convertir en format compatible
    const convertedTrains = filteredRecords.map((record, index) => {
      const [departureHour, departureMinute] = record.heure_depart.split(':').map(Number);
      const [arrivalHour, arrivalMinute] = record.heure_arrivee.split(':').map(Number);
      
      let durationMinutes = (arrivalHour * 60 + arrivalMinute) - (departureHour * 60 + departureMinute);
      if (durationMinutes < 0) durationMinutes += 24 * 60;
      
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      const duration = `${hours}h${minutes.toString().padStart(2, '0')}`;
      
      const departureTime = new Date(`${record.date}T${record.heure_depart}:00`);
      const arrivalTime = new Date(`${record.date}T${record.heure_arrivee}:00`);
      
      return {
        id: `advanced-${index}`,
        departureStation: record.origine,
        arrivalStation: record.destination,
        departureTime: departureTime.toISOString(),
        arrivalTime: arrivalTime.toISOString(),
        duration: duration,
        trainNumber: `TGV ${record.train_no}`,
        platform: Math.floor(Math.random() * 20) + 1,
        price: '0€',
        originalRecord: record
      };
    });

    res.json({
      success: true,
      trains: convertedTrains,
      search: {
        from,
        to,
        date,
        timeRange,
        totalFound: convertedTrains.length,
        filters: filters,
        source: 'API SNCF Avancée'
      }
    });

  } catch (error) {
    console.error('❌ Erreur recherche avancée:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la recherche avancée',
      message: error.message
    });
  }
});

/**
 * GET /api/sncf-explorer/trends
 * Analyse des tendances de trajets
 */
router.get('/trends', async (req, res) => {
  try {
    console.log('📈 Analyse des tendances...');

    // Récupérer les données des 7 derniers jours
    const trends = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const formattedDate = dateStr.replace(/-/g, '/');

      try {
        const response = await axios.get('https://data.sncf.com/api/explore/v2.1/catalog/datasets/tgvmax/records', {
          params: {
            limit: 100,
            refine: `date:"${formattedDate}"`
          },
          timeout: 10000
        });

        const records = response.data.results || [];
        const tgvmaxRecords = records.filter(record => record.od_happy_card === "OUI");

        trends.push({
          date: dateStr,
          totalTrains: records.length,
          tgvmaxTrains: tgvmaxRecords.length,
          percentage: records.length > 0 ? Math.round((tgvmaxRecords.length / records.length) * 100) : 0
        });

      } catch (error) {
        console.log(`⚠️ Erreur pour ${dateStr}:`, error.message);
        trends.push({
          date: dateStr,
          totalTrains: 0,
          tgvmaxTrains: 0,
          percentage: 0
        });
      }
    }

    res.json({
      success: true,
      trends: trends.reverse(),
      period: '7 derniers jours'
    });

  } catch (error) {
    console.error('❌ Erreur analyse tendances:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'analyse des tendances',
      message: error.message
    });
  }
});

module.exports = router; 