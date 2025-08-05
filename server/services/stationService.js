const axios = require('axios');

// Données des gares principales françaises
const stationData = [
  {
    code: 'PARIS GARE DE LYON',
    name: 'Paris Gare de Lyon',
    city: 'Paris',
    coordinates: { lat: 48.8444, lng: 2.3733 },
    region: 'Île-de-France'
  },
  {
    code: 'PARIS MONTPARNASSE',
    name: 'Paris Montparnasse',
    city: 'Paris',
    coordinates: { lat: 48.8404, lng: 2.3215 },
    region: 'Île-de-France'
  },
  {
    code: 'PARIS AUSTERLITZ',
    name: 'Paris Austerlitz',
    city: 'Paris',
    coordinates: { lat: 48.8419, lng: 2.3654 },
    region: 'Île-de-France'
  },
  {
    code: 'PARIS GARE DU NORD',
    name: 'Paris Gare du Nord',
    city: 'Paris',
    coordinates: { lat: 48.8809, lng: 2.3553 },
    region: 'Île-de-France'
  },
  {
    code: 'PARIS SAINT-LAZARE',
    name: 'Paris Saint-Lazare',
    city: 'Paris',
    coordinates: { lat: 48.8758, lng: 2.3266 },
    region: 'Île-de-France'
  },
  {
    code: 'LYON PART-DIEU',
    name: 'Lyon Part-Dieu',
    city: 'Lyon',
    coordinates: { lat: 45.7600, lng: 4.8600 },
    region: 'Auvergne-Rhône-Alpes'
  },
  {
    code: 'LYON PERRACHE',
    name: 'Lyon Perrache',
    city: 'Lyon',
    coordinates: { lat: 45.7500, lng: 4.8300 },
    region: 'Auvergne-Rhône-Alpes'
  },
  {
    code: 'MARSEILLE SAINT-CHARLES',
    name: 'Marseille Saint-Charles',
    city: 'Marseille',
    coordinates: { lat: 43.3027, lng: 5.3804 },
    region: 'Provence-Alpes-Côte d\'Azur'
  },
  {
    code: 'BORDEAUX SAINT-JEAN',
    name: 'Bordeaux Saint-Jean',
    city: 'Bordeaux',
    coordinates: { lat: 44.8256, lng: -0.5564 },
    region: 'Nouvelle-Aquitaine'
  },
  {
    code: 'LILLE EUROPE',
    name: 'Lille Europe',
    city: 'Lille',
    coordinates: { lat: 50.6394, lng: 3.0753 },
    region: 'Hauts-de-France'
  },
  {
    code: 'STRASBOURG',
    name: 'Strasbourg',
    city: 'Strasbourg',
    coordinates: { lat: 48.5846, lng: 7.7507 },
    region: 'Grand Est'
  },
  {
    code: 'NICE VILLE',
    name: 'Nice Ville',
    city: 'Nice',
    coordinates: { lat: 43.7102, lng: 7.2620 },
    region: 'Provence-Alpes-Côte d\'Azur'
  },
  {
    code: 'PERPIGNAN',
    name: 'Perpignan',
    city: 'Perpignan',
    coordinates: { lat: 42.6887, lng: 2.8954 },
    region: 'Occitanie'
  },
  {
    code: 'TOULOUSE MATABIAU',
    name: 'Toulouse Matabiau',
    city: 'Toulouse',
    coordinates: { lat: 43.6111, lng: 1.4567 },
    region: 'Occitanie'
  },
  {
    code: 'NANTES',
    name: 'Nantes',
    city: 'Nantes',
    coordinates: { lat: 47.2184, lng: -1.5536 },
    region: 'Pays de la Loire'
  }
];

// Récupérer toutes les gares
async function getAllStations() {
  try {
    return stationData;
  } catch (error) {
    console.error('Erreur lors de la récupération des gares:', error);
    throw error;
  }
}

// Récupérer les informations d'une gare spécifique
async function getStationInfo(stationCode) {
  try {
    const station = stationData.find(s => 
      s.code.toLowerCase() === stationCode.toLowerCase()
    );
    
    return station || null;
  } catch (error) {
    console.error('Erreur lors de la récupération des informations de la gare:', error);
    throw error;
  }
}

// Rechercher des gares par nom
async function searchStations(query) {
  try {
    const normalizedQuery = query.toLowerCase();
    
    return stationData.filter(station => 
      station.name.toLowerCase().includes(normalizedQuery) ||
      station.city.toLowerCase().includes(normalizedQuery) ||
      station.code.toLowerCase().includes(normalizedQuery)
    );
  } catch (error) {
    console.error('Erreur lors de la recherche de gares:', error);
    throw error;
  }
}

// Récupérer les gares d'une ville
async function getStationsByCity(cityName) {
  try {
    const normalizedCityName = cityName.toLowerCase();
    
    return stationData.filter(station => 
      station.city.toLowerCase() === normalizedCityName
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des gares par ville:', error);
    throw error;
  }
}

// Récupérer les gares d'une région
async function getStationsByRegion(regionName) {
  try {
    const normalizedRegionName = regionName.toLowerCase();
    
    return stationData.filter(station => 
      station.region.toLowerCase().includes(normalizedRegionName)
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des gares par région:', error);
    throw error;
  }
}

module.exports = {
  getAllStations,
  getStationInfo,
  searchStations,
  getStationsByCity,
  getStationsByRegion
}; 