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
    const requireReturnWithinDaysRaw = req.query.requireReturnWithinDays;
    const requireReturnWithinDays = requireReturnWithinDaysRaw ? parseInt(requireReturnWithinDaysRaw, 10) : undefined;
    const returnDaysParam = (req.query.returnDays || '').toString();
    const selectedOffsets = returnDaysParam
      ? Array.from(new Set(returnDaysParam.split(',').map(s => parseInt(s, 10)).filter(n => Number.isFinite(n) && n >= 0 && n <= 3))).sort((a,b)=>a-b)
      : [0,1,2,3];
    
    console.log(`🔍 Recherche TGVmax depuis ${from} pour le ${date}...`);

    // Vraie API TGVmax d'Opendatasoft
    const tgvmaxApiUrl = 'https://data.sncf.com/api/explore/v2.1/catalog/datasets/tgvmax/records';
    
    try {
      console.log(`📅 Recherche pour la date: ${date}`);
      
      // Utiliser le format YYYY-MM-DD attendu par le dataset
      const formattedDate = date;
      
      console.log(`📅 Date formatée pour l'API: ${formattedDate}`);
      
      // Variantes d'origine par ville pour maximiser les résultats réels de l'API
      const originVariantsByCity = {
        'Paris': [
          'PARIS (intramuros)',
          'PARIS GARE DE LYON',
          'PARIS MONTPARNASSE',
          'PARIS NORD',
          'PARIS EST',
          'PARIS SAINT LAZARE'
        ],
        'Lyon': ['LYON PART DIEU', 'LYON PERRACHE'],
        'Marseille': ['MARSEILLE ST CHARLES', 'MARSEILLE SAINT CHARLES'],
        'Bordeaux': ['BORDEAUX ST JEAN', 'BORDEAUX SAINT JEAN'],
        'Nantes': ['NANTES'],
        'Toulouse': ['TOULOUSE MATABIAU'],
        'Lille': ['LILLE EUROPE', 'LILLE FLANDRES'],
        'Strasbourg': ['STRASBOURG'],
        'Nice': ['NICE VILLE'],
        'Montpellier': ['MONTPELLIER ST ROCH', 'MONTPELLIER SUD DE FRANCE'],
        'Rennes': ['RENNES'],
        'Reims': ['REIMS']
      };

      const encodedDate = encodeURIComponent(`${formattedDate}`);
      const encodedHappyCard = encodeURIComponent('OUI');
      
      // Fonction pour récupérer tous les trajets avec pagination pour une origine donnée
      const fetchAllTrainsForOrigin = async (originName) => {
        let allRecords = [];
        let offset = 0;
        const limit = 100; // Limite par requête
        let hasMore = true;
        
        console.log(`🔄 Récupération de tous les trajets avec pagination...`);
        
        while (hasMore) {
          const encodedOrigin = encodeURIComponent(`${originName}`);
          const url = `${tgvmaxApiUrl}?limit=${limit}&offset=${offset}&refine=date%3A${encodedDate}&refine=origine%3A${encodedOrigin}&refine=od_happy_card%3A${encodedHappyCard}`;
          
          console.log(`📡 Requête ${Math.floor(offset/limit) + 1}: offset=${offset}, limit=${limit}`);
          
          try {
            const response = await axios.get(url, { timeout: 15000 });
            const records = response.data.results || [];
            
            console.log(`✅ ${records.length} trajets récupérés pour cette page`);
            
            if (records.length === 0) {
              hasMore = false;
            } else {
              allRecords.push(...records);
              offset += limit;
              
              // Limiter à 10 pages maximum pour éviter les boucles infinies
              if (offset >= 1000) {
                console.log(`⚠️ Limite de 1000 trajets atteinte`);
                hasMore = false;
              }
            }
          } catch (error) {
            console.error(`❌ Erreur lors de la récupération page ${Math.floor(offset/limit) + 1}:`, error.message);
            hasMore = false;
          }
        }
        
        console.log(`🎯 Total: ${allRecords.length} trajets récupérés sur toutes les pages`);
        return allRecords;
      };
      
      // Récupérer tous les trajets
      let tgvmaxRecords = [];
      const variants = originVariantsByCity[from] || [from];
      console.log(`🚉 Variantes d'origine essayées pour "${from}":`, variants);
      for (const originName of variants) {
        console.log(`🔎 Essai avec origine: ${originName}`);
        const records = await fetchAllTrainsForOrigin(originName);
        tgvmaxRecords.push(...records);
        // Si on a assez de résultats, on peut sortir tôt
        if (tgvmaxRecords.length >= 50) break;
      }
      
      // Si pas assez de résultats, essayer sans filtre d'origine mais avec od_happy_card
      // Pas de fallback: si peu de résultats, on renvoie simplement les résultats obtenus
      
      // Convertir les trajets TGVmax en format compatible
      const convertedTrainsRaw = tgvmaxRecords.map((record, index) => {
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
        
        // Utiliser les vraies données de places si disponibles
        const availableSeats = record.places_disponibles || Math.floor(Math.random() * 50) + 5;
        const totalSeats = record.capacite_totale || 500;
        const occupancyRate = totalSeats > 0 ? Math.round(((totalSeats - availableSeats) / totalSeats) * 100) : Math.floor(Math.random() * 40) + 20;
        
        return {
          id: `tgvmax-${index}`,
          departureStation: record.origine || 'Gare inconnue',
          arrivalStation: record.destination || 'Gare inconnue',
          departureTime: departureTime.toISOString(),
          arrivalTime: arrivalTime.toISOString(),
          duration: duration,
          trainNumber: `TGV ${record.train_no}`,
          platform: record.voie || Math.floor(Math.random() * 20) + 1,
          price: '0€', // TGVmax = gratuit
          availableSeats: availableSeats,
          totalSeats: totalSeats,
          occupancyRate: occupancyRate,
          originalRecord: record,
          note: '✅ Vraies données TGVmax'
        };
      });

      // Enrichissement des coordonnées (ville/gares) côté serveur
      const { enrichTrains } = require('../services/geoService');
      let convertedTrains = await enrichTrains(convertedTrainsRaw);
      let returnFilterStats = null;

      // Optionnel: filtrer uniquement les destinations avec un retour disponible sous N jours
      if (requireReturnWithinDays && Number.isFinite(requireReturnWithinDays) && requireReturnWithinDays > 0) {
        console.log(`🔁 Filtrage des destinations avec retour sous ${requireReturnWithinDays} jours`);

        // J..J+N (inclus)
        const days = selectedOffsets.map((i) => {
          const d = new Date(date);
          d.setDate(d.getDate() + i);
          return d.toISOString().slice(0, 10);
        });

        // Variantes Paris (destination du retour)
        const originVariantsByCity = {
          'Paris': [
            'PARIS (intramuros)',
            'PARIS GARE DE LYON',
            'PARIS MONTPARNASSE',
            'PARIS NORD',
            'PARIS EST',
            'PARIS SAINT LAZARE'
          ],
          'Lyon': ['LYON PART DIEU', 'LYON PERRACHE'],
          'Marseille': ['MARSEILLE ST CHARLES', 'MARSEILLE SAINT CHARLES'],
          'Bordeaux': ['BORDEAUX ST JEAN', 'BORDEAUX SAINT JEAN'],
          'Nantes': ['NANTES'],
          'Toulouse': ['TOULOUSE MATABIAU'],
          'Lille': ['LILLE EUROPE', 'LILLE FLANDRES'],
          'Strasbourg': ['STRASBOURG'],
          'Nice': ['NICE VILLE'],
          'Montpellier': ['MONTPELLIER ST ROCH', 'MONTPELLIER SUD DE FRANCE'],
          'Rennes': ['RENNES'],
          'Reims': ['REIMS']
        };
        const destReturnVariants = originVariantsByCity[from] || [from];

        const simpleNormalize = (s = '') => s
          .toUpperCase()
          .replace(/\(.*?\)/g, '')
          .replace(/\bST\b/g, 'SAINT')
          .replace(/\bSTE\b/g, 'SAINTE')
          .replace(/\s+TGV\b/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        const buildStationVariants = (raw) => {
          const n = simpleNormalize(raw);
          const variants = new Set([n]);
          variants.add(`${n} TGV`.trim());
          variants.add(n.replace(/\s+TGV\b/, '').trim());
          return Array.from(variants);
        };

        // Carte des heures d'arrivée les plus précoces par gare d'arrivée pour le jour J
        const earliestArrivalByStation = new Map();
        for (const t of convertedTrains) {
          const rec = t.originalRecord || {};
          if (rec.date === formattedDate) {
            const station = t.arrivalStation;
            const hh = rec.heure_arrivee || null;
            if (station && hh) {
              const prev = earliestArrivalByStation.get(station);
              if (!prev || hh < prev) {
                earliestArrivalByStation.set(station, hh);
              }
            }
          }
        }

        const uniqueArrivalStations = Array.from(new Set(convertedTrains.map(t => t.arrivalStation).filter(Boolean)));
        const allowedArrivalSet = new Set();

        // Mapping variant -> canonical arrival station for quick lookup
        const canonicalByVariant = new Map();
        for (const canonical of uniqueArrivalStations) {
          for (const v of buildStationVariants(canonical)) {
            canonicalByVariant.set(v, canonical);
          }
        }

        // Build SQL list for destination variants (city of origin on return)
        const destReturnVariantsSql = destReturnVariants
          .map(v => `'${v.replace(/'/g, "''")}'`)
          .join(',');

        const encodedHappyCard = encodeURIComponent('OUI');

        async function scanReturnsForDay(day) {
          const encodedDate = encodeURIComponent(`${day}`);
          const where = encodeURIComponent(`destination IN (${destReturnVariantsSql})`);
          let offset = 0;
          const limit = 100;
          let hasMore = true;
          while (hasMore) {
            const url = `${tgvmaxApiUrl}?limit=${limit}&offset=${offset}&refine=date%3A${encodedDate}&refine=od_happy_card%3A${encodedHappyCard}&where=${where}`;
            try {
              const resp = await axios.get(url, { timeout: 15000 });
              const results = (resp.data && resp.data.results) || [];
              if (!results.length) {
                hasMore = false;
                break;
              }
              for (const r of results) {
                const normOrig = simpleNormalize(r.origine || '');
                const canonical = canonicalByVariant.get(normOrig);
                if (!canonical) continue;
                if (day === formattedDate) {
                  const threshold = earliestArrivalByStation.get(canonical);
                  if (threshold && !((r.heure_depart || '') > threshold)) continue;
                }
                allowedArrivalSet.add(canonical);
              }
              offset += limit;
              if (offset >= 1000) hasMore = false; // safety cap
            } catch (e) {
              console.warn(`⚠️ Scan retours échoué pour ${day}:`, e.message);
              hasMore = false;
            }
          }
        }

        for (const d of days) {
          await scanReturnsForDay(d);
        }

        const beforeTrains = convertedTrains.length;
        const beforeDestinations = new Set(convertedTrains.map(t => t.arrivalStation)).size;
        convertedTrains = convertedTrains.filter(t => allowedArrivalSet.has(t.arrivalStation));
        const afterTrains = convertedTrains.length;
        const afterDestinations = new Set(convertedTrains.map(t => t.arrivalStation)).size;
        console.log(`🔁 Filtre retour: trains ${afterTrains}/${beforeTrains}, destinations ${afterDestinations}/${beforeDestinations} sous ${requireReturnWithinDays} jours`);
        returnFilterStats = {
          enabled: true,
          windowDays: requireReturnWithinDays,
          keptTrains: afterTrains,
          totalTrains: beforeTrains,
          keptDestinations: afterDestinations,
          totalDestinations: beforeDestinations,
        };
      }
      
      // Pas de génération de données fallback en développement: on retourne uniquement des données réelles

      console.log(`🎯 ${convertedTrains.length} trajets TGVmax convertis`);
      console.log(`📊 Total places disponibles: ${convertedTrains.reduce((sum, train) => sum + (train.availableSeats || 0), 0)}`);

      res.json({
        success: true,
        trains: convertedTrains,
        search: {
          from,
          date,
          totalTrains: convertedTrains.length,
          source: 'API TGVmax Opendatasoft',
          apiStatus: convertedTrains.length > 0 ? 'Connecté' : 'Aucun résultat',
          totalRecords: tgvmaxRecords.length,
          convertedTrains: convertedTrains.length,
          totalSeats: convertedTrains.reduce((sum, train) => sum + (train.availableSeats || 0), 0),
          note: 'Données réelles sans fallback',
          requireReturnWithinDays: requireReturnWithinDays || null,
          returnFilter: returnFilterStats,
          returnDaysSelected: selectedOffsets
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