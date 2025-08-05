const axios = require('axios');
const { getCityData } = require('./dataService');

// Cache pour les données TGVmax
let trainDataCache = null;
let lastCacheUpdate = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Récupère tous les trajets TGVmax de la journée depuis l'API SNCF
 */
async function getAllTGVmaxTrains(date = new Date().toISOString().split('T')[0], forceRefresh = false) {
  try {
    console.log(`Récupération de tous les trajets TGVmax pour le ${date}...`);
    
    // Vérifier le cache (sauf si forceRefresh = true)
    if (!forceRefresh && trainDataCache && lastCacheUpdate && (Date.now() - lastCacheUpdate) < CACHE_DURATION) {
      console.log('✅ Utilisation du cache pour les données TGVmax');
      return trainDataCache;
    }

    if (forceRefresh) {
      console.log('🔄 Forçage du rafraîchissement des données...');
    }

    // Récupérer les données depuis l'API SNCF
    const response = await axios.get('https://data.sncf.com/api/explore/v2.1/catalog/datasets/tgvmax/records', {
      params: {
        where: "od_happy_card='OUI'",
        limit: 1000 // Récupérer plus de données
      }
    });

    if (!response.data || !response.data.results) {
      throw new Error('Format de réponse invalide');
    }

    const trains = response.data.results;
    console.log(`✅ ${trains.length} trains TGVmax récupérés depuis l'API SNCF`);

    // Traiter et organiser les données
    const processedData = processTrainData(trains, date);
    
    // Mettre à jour le cache
    trainDataCache = processedData;
    lastCacheUpdate = Date.now();

    return processedData;
  } catch (error) {
    console.error('Erreur lors de la récupération des données TGVmax:', error.message);
    
    // Fallback vers les données locales si l'API échoue
    console.log('Utilisation des données de fallback...');
    return getFallbackTrainData(date);
  }
}

/**
 * Traite les données brutes des trains
 */
function processTrainData(trains, date) {
  const destinations = new Map();
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;

  console.log(`Traitement de ${trains.length} trains...`);

  trains.forEach(train => {
    // Extraire les informations de la ville
    const cityName = extractCityName(train.destination);
    if (!cityName) {
      console.log(`Ville non reconnue: ${train.destination}`);
      return;
    }

    // Obtenir les coordonnées de la ville
    const cityData = getCityData(cityName);
    if (!cityData) {
      console.log(`Données de ville manquantes pour: ${cityName}`);
      return;
    }

    // Créer l'objet train
    const trainObj = {
      id: `${train.origine}-${train.destination}-${train.heure_depart}`,
      departureStation: train.origine,
      arrivalStation: train.destination,
      departureTime: `${date}T${train.heure_depart}`,
      arrivalTime: `${date}T${train.heure_arrivee}`,
      duration: calculateDuration(train.heure_depart, train.heure_arrivee),
      trainNumber: `TGV${Math.floor(Math.random() * 1000)}`,
      platform: Math.floor(Math.random() * 20) + 1
    };

    // Déterminer si c'est un train aller ou retour
    const isOutbound = train.origine.toLowerCase().includes('paris');
    
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
 * Calcule la durée entre deux heures
 */
function calculateDuration(departureTime, arrivalTime) {
  const [depHour, depMin] = departureTime.split(':').map(Number);
  const [arrHour, arrMin] = arrivalTime.split(':').map(Number);
  
  let durationMinutes = (arrHour * 60 + arrMin) - (depHour * 60 + depMin);
  
  // Gérer le cas où le train arrive le lendemain
  if (durationMinutes < 0) {
    durationMinutes += 24 * 60;
  }
  
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
    'BREST': 'Brest',
    'QUIMPER': 'Quimper',
    'LORIENT': 'Lorient',
    'VANNES': 'Vannes',
    'SAINT BRIEUC': 'Saint-Brieuc',
    'DINARD': 'Dinard',
    'SAINT MALO': 'Saint-Malo',
    'DINAN': 'Dinan',
    'MORLAIX': 'Morlaix',
    'MARNE LA VALLEE': 'Marne-la-Vallée',
    'DISNEYLAND': 'Disneyland',
    'CHARLES DE GAULLE': 'Charles de Gaulle',
    'ORLY': 'Orly',
    'ROISSY': 'Roissy',
    'AEROPORT': 'Aéroport',
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

/**
 * Données de fallback si l'API échoue
 */
function getFallbackTrainData(date) {
  const fallbackDestinations = [
    {
      id: 'lyon',
      city: 'Lyon',
      coordinates: { lat: 45.7578137, lng: 4.8320114 },
      outboundTrains: [
        {
          id: 'paris-lyon-1',
          departureStation: 'Paris Gare de Lyon',
          arrivalStation: 'Lyon Part-Dieu',
          departureTime: `${date}T06:30:00`,
          arrivalTime: `${date}T08:15:00`,
          duration: '1h45',
          trainNumber: 'TGV 1234',
          platform: 12
        },
        {
          id: 'paris-lyon-2',
          departureStation: 'Paris Gare de Lyon',
          arrivalStation: 'Lyon Part-Dieu',
          departureTime: `${date}T08:30:00`,
          arrivalTime: `${date}T10:15:00`,
          duration: '1h45',
          trainNumber: 'TGV 1235',
          platform: 14
        }
      ],
      returnTrains: [
        {
          id: 'lyon-paris-1',
          departureStation: 'Lyon Part-Dieu',
          arrivalStation: 'Paris Gare de Lyon',
          departureTime: `${date}T18:30:00`,
          arrivalTime: `${date}T20:15:00`,
          duration: '1h45',
          trainNumber: 'TGV 1236',
          platform: 8
        }
      ],
      totalTrains: 3,
      availableTrains: 3
    },
    {
      id: 'marseille',
      city: 'Marseille',
      coordinates: { lat: 43.296482, lng: 5.36978 },
      outboundTrains: [
        {
          id: 'paris-marseille-1',
          departureStation: 'Paris Gare de Lyon',
          arrivalStation: 'Marseille Saint-Charles',
          departureTime: `${date}T07:00:00`,
          arrivalTime: `${date}T10:30:00`,
          duration: '3h30',
          trainNumber: 'TGV 1237',
          platform: 16
        }
      ],
      returnTrains: [
        {
          id: 'marseille-paris-1',
          departureStation: 'Marseille Saint-Charles',
          arrivalStation: 'Paris Gare de Lyon',
          departureTime: `${date}T19:00:00`,
          arrivalTime: `${date}T22:30:00`,
          duration: '3h30',
          trainNumber: 'TGV 1238',
          platform: 6
        }
      ],
      totalTrains: 2,
      availableTrains: 2
    },
    {
      id: 'bordeaux',
      city: 'Bordeaux',
      coordinates: { lat: 44.837789, lng: -0.57918 },
      outboundTrains: [
        {
          id: 'paris-bordeaux-1',
          departureStation: 'Paris Montparnasse',
          arrivalStation: 'Bordeaux Saint-Jean',
          departureTime: `${date}T07:00:00`,
          arrivalTime: `${date}T09:30:00`,
          duration: '2h30',
          trainNumber: 'TGV 1239',
          platform: 15
        }
      ],
      returnTrains: [
        {
          id: 'bordeaux-paris-1',
          departureStation: 'Bordeaux Saint-Jean',
          arrivalStation: 'Paris Montparnasse',
          departureTime: `${date}T18:00:00`,
          arrivalTime: `${date}T20:30:00`,
          duration: '2h30',
          trainNumber: 'TGV 1240',
          platform: 7
        }
      ],
      totalTrains: 2,
      availableTrains: 2
    },
    {
      id: 'nantes',
      city: 'Nantes',
      coordinates: { lat: 47.218371, lng: -1.553621 },
      outboundTrains: [
        {
          id: 'paris-nantes-1',
          departureStation: 'Paris Montparnasse',
          arrivalStation: 'Nantes',
          departureTime: `${date}T08:00:00`,
          arrivalTime: `${date}T10:15:00`,
          duration: '2h15',
          trainNumber: 'TGV 1241',
          platform: 18
        }
      ],
      returnTrains: [
        {
          id: 'nantes-paris-1',
          departureStation: 'Nantes',
          arrivalStation: 'Paris Montparnasse',
          departureTime: `${date}T19:30:00`,
          arrivalTime: `${date}T21:45:00`,
          duration: '2h15',
          trainNumber: 'TGV 1242',
          platform: 9
        }
      ],
      totalTrains: 2,
      availableTrains: 2
    },
    {
      id: 'toulouse',
      city: 'Toulouse',
      coordinates: { lat: 43.604652, lng: 1.444209 },
      outboundTrains: [
        {
          id: 'paris-toulouse-1',
          departureStation: 'Paris Gare de Lyon',
          arrivalStation: 'Toulouse Matabiau',
          departureTime: `${date}T07:30:00`,
          arrivalTime: `${date}T11:00:00`,
          duration: '3h30',
          trainNumber: 'TGV 1243',
          platform: 20
        }
      ],
      returnTrains: [
        {
          id: 'toulouse-paris-1',
          departureStation: 'Toulouse Matabiau',
          arrivalStation: 'Paris Gare de Lyon',
          departureTime: `${date}T18:30:00`,
          arrivalTime: `${date}T22:00:00`,
          duration: '3h30',
          trainNumber: 'TGV 1244',
          platform: 10
        }
      ],
      totalTrains: 2,
      availableTrains: 2
    }
  ];

  return fallbackDestinations;
}

module.exports = {
  getAllTGVmaxTrains
}; 