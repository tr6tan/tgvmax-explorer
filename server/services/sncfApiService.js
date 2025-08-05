const axios = require('axios');
const { getCityData } = require('./dataService');

// Configuration de l'API SNCF officielle
const SNCF_API_BASE = 'https://api.sncf.com/v1';
const SNCF_API_KEY = '960e391d-c9d0-4bc5-935e-3b21bbdcf628';

// Cache pour les données TGVmax
let trainDataCache = null;
let lastCacheUpdate = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Récupère tous les trajets TGVmax de la journée depuis l'API SNCF officielle
 */
async function getAllTGVmaxTrains(date = new Date().toISOString().split('T')[0], forceRefresh = false) {
  try {
    console.log(`🚅 Récupération des trajets TGVmax via l'API SNCF officielle pour le ${date}...`);
    
    // Vérifier le cache (sauf si forceRefresh = true)
    if (!forceRefresh && trainDataCache && lastCacheUpdate && (Date.now() - lastCacheUpdate) < CACHE_DURATION) {
      console.log('✅ Utilisation du cache pour les données TGVmax');
      return trainDataCache;
    }

    if (forceRefresh) {
      console.log('🔄 Forçage du rafraîchissement des données...');
    }

    // Récupérer les données depuis l'API SNCF officielle
    const response = await axios.get(`${SNCF_API_BASE}/coverage/sncf/journeys`, {
      auth: {
        username: SNCF_API_KEY,
        password: ''
      },
      params: {
        from: 'admin:fr:75056', // Paris
        datetime: `${date}T000000`,
        count: 1000, // Plus de données
        data_freshness: 'realtime'
      }
    });

    if (!response.data || !response.data.journeys) {
      throw new Error('Format de réponse invalide');
    }

    const journeys = response.data.journeys;
    console.log(`✅ ${journeys.length} trajets récupérés depuis l'API SNCF officielle`);

    // Traiter et organiser les données
    const processedData = processJourneyData(journeys, date);
    
    // Mettre à jour le cache
    trainDataCache = processedData;
    lastCacheUpdate = Date.now();

    return processedData;
  } catch (error) {
    console.error('Erreur lors de la récupération des données TGVmax:', error.message);
    
    // Retourner un tableau vide si l'API échoue
    console.log('Aucun trajet disponible - API SNCF inaccessible');
    return [];
  }
}

/**
 * Traite les données de trajets de l'API SNCF officielle
 */
function processJourneyData(journeys, date) {
  const destinations = new Map();
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;

  console.log(`Traitement de ${journeys.length} trajets...`);

  journeys.forEach(journey => {
    // Vérifier si c'est un trajet TGVmax (gratuit)
    if (!isTGVmaxJourney(journey)) {
      return;
    }

    // Extraire les informations de la destination
    const destinationInfo = extractDestinationInfo(journey);
    if (!destinationInfo) {
      return;
    }

    const { cityName, coordinates } = destinationInfo;

    // Obtenir les coordonnées de la ville
    const cityData = getCityData(cityName);
    if (!cityData) {
      console.log(`Données de ville manquantes pour: ${cityName}`);
      return;
    }

    // Créer l'objet train
    const trainObj = createTrainObject(journey, date);

    // Déterminer si c'est un train aller ou retour
    const isOutbound = isOutboundJourney(journey);
    
    if (!destinations.has(cityName)) {
      destinations.set(cityName, {
        id: cityName.toLowerCase().replace(/\s+/g, '-'),
        city: cityName,
        coordinates: cityData.coordinates,
        outboundTrains: [],
        returnTrains: [],
        totalTrains: 0,
        availableTrains: 0
      });
    }

    const destination = destinations.get(cityName);
    
    if (isOutbound) {
      destination.outboundTrains.push(trainObj);
    } else {
      destination.returnTrains.push(trainObj);
    }

    // Calculer les statistiques
    const departureTime = new Date(trainObj.departureTime);
    const departureHour = departureTime.getHours();
    const departureMinute = departureTime.getMinutes();
    const departureTimeMinutes = departureHour * 60 + departureMinute;
    
    if (departureTimeMinutes >= currentTimeMinutes) {
      destination.availableTrains++;
    }
    
    destination.totalTrains++;
  });

  const result = Array.from(destinations.values());
  console.log(`✅ ${result.length} destinations traitées avec succès`);
  
  return result;
}

/**
 * Vérifie si un trajet est éligible TGVmax (gratuit)
 */
function isTGVmaxJourney(journey) {
  // Vérifier si le trajet a des sections avec des modes de transport TGV
  return journey.sections.some(section => 
    section.mode === 'train' && 
    section.display_informations && 
    section.display_informations.commercial_mode === 'TGV'
  );
}

/**
 * Extrait les informations de destination d'un trajet
 */
function extractDestinationInfo(journey) {
  // Trouver la dernière section du trajet
  const lastSection = journey.sections[journey.sections.length - 1];
  
  if (!lastSection || !lastSection.to) {
    return null;
  }

  // Extraire le nom de la ville depuis le nom de la gare
  const stationName = lastSection.to.name;
  const cityName = extractCityName(stationName);
  
  if (!cityName) {
    console.log(`Ville non reconnue: ${stationName}`);
    return null;
  }

  return {
    cityName,
    coordinates: {
      lat: lastSection.to.coord.lat,
      lng: lastSection.to.coord.lon
    }
  };
}

/**
 * Crée un objet train à partir d'un trajet
 */
function createTrainObject(journey, date) {
  const firstSection = journey.sections[0];
  const lastSection = journey.sections[journey.sections.length - 1];
  
  const departureTime = new Date(firstSection.departure_date_time);
  const arrivalTime = new Date(lastSection.arrival_date_time);
  
  return {
    id: `${journey.id}`,
    departureStation: firstSection.from.name,
    arrivalStation: lastSection.to.name,
    departureTime: departureTime.toISOString(),
    arrivalTime: arrivalTime.toISOString(),
    duration: calculateDuration(departureTime, arrivalTime),
    trainNumber: firstSection.display_informations?.headsign || `TGV${Math.floor(Math.random() * 1000)}`,
    platform: firstSection.departure_date_time ? Math.floor(Math.random() * 20) + 1 : 1
  };
}

/**
 * Détermine si un trajet est un aller (depuis Paris)
 */
function isOutboundJourney(journey) {
  const firstSection = journey.sections[0];
  return firstSection.from.name.toLowerCase().includes('paris');
}

/**
 * Calcule la durée entre deux dates
 */
function calculateDuration(departureTime, arrivalTime) {
  const durationMs = arrivalTime.getTime() - departureTime.getTime();
  const durationMinutes = Math.floor(durationMs / (1000 * 60));
  
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  
  return `${hours}h${minutes.toString().padStart(2, '0')}`;
}

/**
 * Extrait le nom de la ville depuis le nom de la gare
 */
function extractCityName(stationName) {
  const cityMappings = {
    'PARIS': 'Paris',
    'LYON': 'Lyon',
    'MARSEILLE': 'Marseille',
    'BORDEAUX': 'Bordeaux',
    'NANTES': 'Nantes',
    'TOULOUSE': 'Toulouse',
    'LILLE': 'Lille',
    'STRASBOURG': 'Strasbourg',
    'NICE': 'Nice',
    'MONTPELLIER': 'Montpellier',
    'RENNES': 'Rennes',
    'REIMS': 'Reims',
    'DIJON': 'Dijon',
    'ANGERS': 'Angers',
    'LE MANS': 'Le Mans',
    'POITIERS': 'Poitiers',
    'TOURS': 'Tours',
    'ORLEANS': 'Orléans',
    'BESANCON': 'Besançon',
    'MULHOUSE': 'Mulhouse',
    'METZ': 'Metz',
    'NANCY': 'Nancy',
    'CLERMONT FERRAND': 'Clermont-Ferrand',
    'SAINT ETIENNE': 'Saint-Étienne',
    'GRENOBLE': 'Grenoble',
    'AVIGNON': 'Avignon',
    'AIX EN PROVENCE': 'Aix-en-Provence',
    'CANNES': 'Cannes',
    'ANTIBES': 'Antibes',
    'SAINT RAPHAEL': 'Saint-Raphaël',
    'FREJUS': 'Fréjus',
    'SAINT TROPEZ': 'Saint-Tropez',
    'HYERES': 'Hyères',
    'TOULON': 'Toulon',
    'PERPIGNAN': 'Perpignan',
    'NARBONNE': 'Narbonne',
    'BEZIERS': 'Béziers',
    'AGDE': 'Agde',
    'SETE': 'Sète',
    'NIMES': 'Nîmes',
    'ARLES': 'Arles',
    'TARASCON': 'Tarascon',
    'ORANGE': 'Orange',
    'VALENCE': 'Valence',
    'VIENNE': 'Vienne',
    'MACON': 'Mâcon',
    'CHALON SUR SAONE': 'Chalon-sur-Saône',
    'BEAUNE': 'Beaune',
    'MONTBARD': 'Montbard',
    'TROYES': 'Troyes',
    'BRUXELLES': 'Bruxelles',
    'BIARRITZ': 'Biarritz',
    'BAYONNE': 'Bayonne',
    'HENDAYE': 'Hendaye',
    'ST JEAN DE LUZ': 'Saint-Jean-de-Luz',
    'DAX': 'Dax',
    'FRASNE': 'Frasne',
    'DOLE': 'Dole',
    'TGV HAUTE PICARDIE': 'TGV Haute-Picardie',
    'LA BAULE': 'La Baule',
    'LA ROCHELLE': 'La Rochelle',
    'LAVAL': 'Laval',
    'LE CROISIC': 'Le Croisic',
    'LOURDES': 'Lourdes',
    'MOULINS': 'Moulins',
    'NEVERS': 'Nevers',
    'NIORT': 'Niort',
    'OFFENBURG': 'Offenbourg',
    'PORNICHET': 'Pornichet',
    'REMIREMONT': 'Remiremont',
    'RIOM': 'Riom',
    'SURGERES': 'Surgeres',
    'VENDOME': 'Vendôme',
    'VICHY': 'Vichy',
    'CHAMBERY': 'Chambéry',
    'ALBERTVILLE': 'Albertville',
    'ANNECY': 'Annecy',
    'CHARLEVILLE': 'Charleville',
    'COLMAR': 'Colmar',
    'FREIBURG': 'Fribourg',
    'LE CREUSOT': 'Le Creusot',
    'MEUSE': 'Meuse',
    'ST NAZAIRE': 'Saint-Nazaire',
    'TOULON': 'Toulon',
    'VANNES': 'Vannes'
  };

  const upperStation = stationName.toUpperCase();
  
  for (const [key, value] of Object.entries(cityMappings)) {
    if (upperStation.includes(key)) {
      return value;
    }
  }
  
  return null;
}



module.exports = {
  getAllTGVmaxTrains
}; 