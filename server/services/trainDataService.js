const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const DATA_FILE = path.join(__dirname, '../data/trains.json');

// Configuration de l'API SNCF TGVmax
const SNCF_TGVMAX_API_URL = 'https://data.sncf.com/api/explore/v2.1/catalog/datasets/tgvmax/records';

// Cache pour éviter trop d'appels API
const trainCache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 heure

async function getTrainData() {
  try {
    // Vérifier le cache
    const cacheKey = 'tgvmax_data';
    const cached = trainCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Utilisation des données TGVmax en cache');
      return cached.data;
    }

    console.log('Récupération des données TGVmax depuis l\'API SNCF...');
    
    // Appel à l'API SNCF TGVmax avec paramètres corrigés
    const response = await axios.get(SNCF_TGVMAX_API_URL, {
      params: {
        limit: 100, // Limite réduite pour éviter les erreurs
        where: "od_happy_card='OUI'" // Filtrer seulement les trains TGVmax
      },
      timeout: 15000
    });

    if (response.data && response.data.results) {
      const trains = response.data.results.map(record => ({
        id: `${record.train_no}_${record.date}_${record.origine_iata}`,
        date: record.date,
        trainNo: record.train_no,
        departure: record.origine,
        arrival: record.destination,
        departureTime: record.heure_depart,
        arrivalTime: record.heure_arrivee,
        isTGVmax: record.od_happy_card === 'OUI',
        entity: record.entity,
        axe: record.axe,
        origineIata: record.origine_iata,
        destinationIata: record.destination_iata
      }));

      // Sauvegarder en cache
      trainCache.set(cacheKey, {
        data: trains,
        timestamp: Date.now()
      });

      // Sauvegarder localement
      await fs.ensureDir(path.dirname(DATA_FILE));
      await fs.writeJson(DATA_FILE, trains, { spaces: 2 });

      console.log(`✅ ${trains.length} trains TGVmax récupérés depuis l'API SNCF`);
      return trains;
    } else {
      throw new Error('Format de réponse API invalide');
    }

  } catch (error) {
    console.error('Erreur lors de la récupération des données TGVmax:', error.message);
    
    // Fallback vers les données locales
    try {
      if (await fs.pathExists(DATA_FILE)) {
        const localData = await fs.readJson(DATA_FILE);
        console.log('Utilisation des données locales en fallback');
        return localData;
      }
    } catch (localError) {
      console.error('Erreur lecture données locales:', localError.message);
    }

    // Fallback vers les données mockées
    console.log('Utilisation des données mockées en fallback');
    return getMockTrainData();
  }
}

async function updateTrainData() {
  try {
    console.log('Mise à jour des données TGVmax...');
    const trains = await getTrainData();
    
    // Sauvegarder les nouvelles données
    await fs.ensureDir(path.dirname(DATA_FILE));
    await fs.writeJson(DATA_FILE, trains, { spaces: 2 });
    
    console.log(`✅ Données TGVmax mises à jour: ${trains.length} trains`);
    return trains;
  } catch (error) {
    console.error('Erreur lors de la mise à jour des données TGVmax:', error);
    throw error;
  }
}

// Fonction pour récupérer les trains pour une date spécifique
async function getTrainsForDate(date) {
  const allTrains = await getTrainData();
  return allTrains.filter(train => train.date === date);
}

// Fonction pour récupérer les trains depuis une gare
async function getTrainsFromStation(stationName, date) {
  const trainsForDate = await getTrainsForDate(date);
  return trainsForDate.filter(train => 
    train.departure.toLowerCase().includes(stationName.toLowerCase()) ||
    train.origineIata.toLowerCase().includes(stationName.toLowerCase())
  );
}

// Fonction pour vérifier si un train est éligible TGVmax
function isTGVmaxEligible(train) {
  return train.isTGVmax === true;
}

// Données mockées pour le développement (fallback)
function getMockTrainData() {
  return [
    {
      id: '1',
      date: '2025-08-07',
      trainNo: '1234',
      departure: 'MONTPELLIER SAINT ROCH',
      arrival: 'NIMES CENTRE',
      departureTime: '14:51',
      arrivalTime: '15:16',
      isTGVmax: true,
      entity: 'JCSUDNORD',
      axe: 'NORD',
      origineIata: 'FRMPL',
      destinationIata: 'FRFNI'
    },
    {
      id: '2',
      date: '2025-08-07',
      trainNo: '5678',
      departure: 'PARIS GARE DE LYON',
      arrival: 'LYON PART-DIEU',
      departureTime: '08:00',
      arrivalTime: '09:30',
      isTGVmax: true,
      entity: 'JCSUDNORD',
      axe: 'NORD',
      origineIata: 'FRPGL',
      destinationIata: 'FRLPD'
    },
    {
      id: '3',
      date: '2025-08-07',
      trainNo: '9012',
      departure: 'PARIS GARE DE LYON',
      arrival: 'MARSEILLE SAINT-CHARLES',
      departureTime: '07:30',
      arrivalTime: '10:45',
      isTGVmax: true,
      entity: 'JCSUDNORD',
      axe: 'NORD',
      origineIata: 'FRPGL',
      destinationIata: 'FRMSC'
    },
    {
      id: '4',
      date: '2025-08-07',
      trainNo: '3456',
      departure: 'NIMES CENTRE',
      arrival: 'MONTPELLIER SAINT ROCH',
      departureTime: '18:30',
      arrivalTime: '18:55',
      isTGVmax: true,
      entity: 'JCSUDNORD',
      axe: 'NORD',
      origineIata: 'FRFNI',
      destinationIata: 'FRMPL'
    }
  ];
}

module.exports = {
  getTrainData,
  updateTrainData,
  getTrainsForDate,
  getTrainsFromStation,
  isTGVmaxEligible
}; 