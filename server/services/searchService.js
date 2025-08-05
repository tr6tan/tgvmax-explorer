const axios = require('axios');
const { getTrainData } = require('./trainDataService');
const { getWeatherForecast } = require('./weatherService');
const { getCityInfo } = require('./dataService');

async function searchDestinations(departureStation, date, minDuration = 2) {
  try {
    console.log(`Recherche de destinations depuis ${departureStation} pour le ${date} (durée min: ${minDuration}h)`);
    
    // Récupérer les trains disponibles
    const allTrains = await getTrainData();
    const trainsForDate = allTrains.filter(train => train.date === date);
    
    // Filtrer les trains depuis la gare de départ
    const outboundTrains = trainsForDate.filter(train => 
      (train.departure.toLowerCase().includes(departureStation.toLowerCase()) ||
       train.origineIata.toLowerCase().includes(departureStation.toLowerCase())) &&
      train.isTGVmax
    );

    console.log(`Trouvé ${outboundTrains.length} trains TGVmax depuis ${departureStation}`);

    const destinations = [];

    // Pour chaque train aller, chercher un train retour possible
    for (const outboundTrain of outboundTrains) {
      const destinationCity = extractCityName(outboundTrain.arrival);
      
      // Chercher les trains retour vers la gare de départ
      const returnTrains = trainsForDate.filter(train => 
        (train.departure.toLowerCase().includes(destinationCity.toLowerCase()) ||
         train.origineIata.toLowerCase().includes(destinationCity.toLowerCase())) &&
        train.isTGVmax &&
        train.id !== outboundTrain.id
      );

      // Vérifier si un retour est possible avec la durée minimale
      for (const returnTrain of returnTrains) {
        if (isReturnPossible(outboundTrain, returnTrain, minDuration)) {
          const destinationInfo = await buildDestinationInfo(outboundTrain, returnTrain, date);
          destinations.push(destinationInfo);
          break; // Un seul retour par destination
        }
      }
    }

    console.log(`✅ ${destinations.length} destinations trouvées`);
    return destinations;

  } catch (error) {
    console.error('Erreur lors de la recherche des destinations:', error);
    throw error;
  }
}

function isReturnPossible(outboundTrain, returnTrain, minDuration) {
  const outboundArrival = new Date(`2024-01-15T${outboundTrain.arrivalTime}:00`);
  const returnDeparture = new Date(`2024-01-15T${returnTrain.departureTime}:00`);
  
  const stayDurationHours = (returnDeparture - outboundArrival) / (1000 * 60 * 60);
  
  return stayDurationHours >= minDuration;
}

async function buildDestinationInfo(outboundTrain, returnTrain, date) {
  const cityName = extractCityName(outboundTrain.arrival);
  
  // Récupérer les informations de la ville
  const cityInfo = await getCityInfo(cityName);
  const weather = await getWeatherForecast(cityName, date);
  
  const stayDuration = calculateStayDuration(outboundTrain.arrivalTime, returnTrain.departureTime);
  
  return {
    id: `${outboundTrain.id}_${returnTrain.id}`,
    city: cityName,
    coordinates: cityInfo?.coordinates || null,
    outbound: {
      departureTime: outboundTrain.departureTime,
      arrivalTime: outboundTrain.arrivalTime,
      duration: calculateDuration(outboundTrain.departureTime, outboundTrain.arrivalTime),
      trainNo: outboundTrain.trainNo
    },
    return: {
      departureTime: returnTrain.departureTime,
      arrivalTime: returnTrain.arrivalTime,
      duration: calculateDuration(returnTrain.departureTime, returnTrain.arrivalTime),
      trainNo: returnTrain.trainNo
    },
    stayDuration: stayDuration,
    weather: weather,
    demographics: cityInfo?.demographics || null,
    image: cityInfo?.image || null,
    entity: outboundTrain.entity,
    axe: outboundTrain.axe
  };
}

function extractCityName(stationName) {
  // Extraire le nom de la ville depuis le nom de la gare
  const cityMappings = {
    'LYON PART-DIEU': 'Lyon',
    'MARSEILLE SAINT-CHARLES': 'Marseille',
    'BORDEAUX SAINT-JEAN': 'Bordeaux',
    'NANTES': 'Nantes',
    'STRASBOURG': 'Strasbourg',
    'LILLE': 'Lille',
    'TOULOUSE': 'Toulouse',
    'NICE': 'Nice',
    'MONTPELLIER': 'Montpellier',
    'RENNES': 'Rennes',
    'DIJON': 'Dijon',
    'CLERMONT-FERRAND': 'Clermont-Ferrand',
    'GRENOBLE': 'Grenoble',
    'ANGERS': 'Angers',
    'LE MANS': 'Le Mans',
    'TOURS': 'Tours',
    'POITIERS': 'Poitiers',
    'LIMOGES': 'Limoges',
    'PERPIGNAN': 'Perpignan',
    'BIARRITZ': 'Biarritz'
  };

  // Chercher une correspondance exacte
  for (const [station, city] of Object.entries(cityMappings)) {
    if (stationName.toUpperCase().includes(station)) {
      return city;
    }
  }

  // Si pas de correspondance, extraire le premier mot
  const words = stationName.split(' ');
  return words[0];
}

function calculateDuration(departureTime, arrivalTime) {
  const departure = new Date(`2024-01-15T${departureTime}:00`);
  const arrival = new Date(`2024-01-15T${arrivalTime}:00`);
  
  const diffMs = arrival - departure;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h${minutes.toString().padStart(2, '0')}`;
}

function calculateStayDuration(arrivalTime, departureTime) {
  const arrival = new Date(`2024-01-15T${arrivalTime}:00`);
  const departure = new Date(`2024-01-15T${departureTime}:00`);
  
  const diffMs = departure - arrival;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h${minutes.toString().padStart(2, '0')}`;
}

module.exports = { searchDestinations }; 