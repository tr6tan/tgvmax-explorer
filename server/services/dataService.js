const axios = require('axios');
const cheerio = require('cheerio');

// Configuration des APIs
const INSEE_API_KEY = process.env.INSEE_API_KEY;
const INSEE_BASE_URL = process.env.INSEE_BASE_URL || 'https://api.insee.fr';

// Cache pour les données démographiques
const demographicCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures

// Données des villes avec coordonnées et informations de base
const cityData = {
  'Lyon': {
    coordinates: { lat: 45.7578, lng: 4.8320 },
    demographics: { population: 513275, area: 47.87, density: 10728 },
    description: 'Capitale de la gastronomie française, Lyon est une ville historique au confluent du Rhône et de la Saône.',
    image: 'https://images.unsplash.com/photo-1565967511849-76a82a4f5b8f?w=800'
  },
  'Marseille': {
    coordinates: { lat: 43.2965, lng: 5.3698 },
    demographics: { population: 861635, area: 240.62, density: 3581 },
    description: 'Plus ancienne ville de France, Marseille est un port méditerranéen vibrant avec une culture unique.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
  },
  'Bordeaux': {
    coordinates: { lat: 44.8378, lng: -0.5792 },
    demographics: { population: 254436, area: 49.36, density: 5154 },
    description: 'Capitale du vin, Bordeaux est une ville élégante classée au patrimoine mondial de l\'UNESCO.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
  },
  'Strasbourg': {
    coordinates: { lat: 48.5734, lng: 7.7521 },
    demographics: { population: 280966, area: 78.26, density: 3590 },
    description: 'Capitale européenne, Strasbourg allie tradition alsacienne et modernité européenne.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
  },
  'Nantes': {
    coordinates: { lat: 47.2184, lng: -1.5536 },
    demographics: { population: 314138, area: 65.19, density: 4819 },
    description: 'Ville créative et dynamique, Nantes est connue pour son art urbain et son histoire maritime.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
  },
  'Paris': {
    coordinates: { lat: 48.8566, lng: 2.3522 },
    demographics: { population: 2161000, area: 105.4, density: 20484 },
    description: 'Capitale de la France, Paris est la ville de l\'amour, de l\'art et de la culture.',
    image: 'https://images.unsplash.com/photo-1502602898534-47d9c0b4d0b5?w=800'
  }
};

async function getCityInfo(cityName) {
  const normalizedName = normalizeCityName(cityName);
  const cityInfo = cityData[normalizedName];
  
  if (!cityInfo) {
    return null;
  }

  // Enrichir avec les données INSEE si disponible
  if (INSEE_API_KEY) {
    try {
      const demographics = await getDemographicDataFromINSEE(normalizedName);
      if (demographics) {
        cityInfo.demographics = demographics;
      }
    } catch (error) {
      console.log(`Erreur lors de la récupération des données INSEE pour ${normalizedName}:`, error.message);
    }
  }

  return {
    name: normalizedName,
    coordinates: cityInfo.coordinates,
    demographics: cityInfo.demographics,
    description: cityInfo.description,
    image: cityInfo.image
  };
}

async function getDemographicData(cityName) {
  const normalizedName = normalizeCityName(cityName);
  
  // Vérifier le cache
  const cacheKey = `demographics_${normalizedName}`;
  const cached = demographicCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // Essayer l'API INSEE d'abord
  if (INSEE_API_KEY) {
    try {
      const data = await getDemographicDataFromINSEE(normalizedName);
      if (data) {
        // Mettre en cache
        demographicCache.set(cacheKey, {
          data: data,
          timestamp: Date.now()
        });
        return data;
      }
    } catch (error) {
      console.log(`Erreur lors de la récupération des données INSEE pour ${normalizedName}:`, error.message);
    }
  }

  // Fallback vers les données locales
  const cityInfo = cityData[normalizedName];
  if (cityInfo && cityInfo.demographics) {
    return cityInfo.demographics;
  }

  // Données par défaut
  return {
    population: 100000 + Math.floor(Math.random() * 500000),
    area: 50 + Math.floor(Math.random() * 100),
    density: 1000 + Math.floor(Math.random() * 5000)
  };
}

async function getDemographicDataFromINSEE(cityName) {
  if (!INSEE_API_KEY) {
    return null;
  }

  try {
    // Codes des communes principales
    const cityCodes = {
      'Lyon': '69123',
      'Marseille': '13055',
      'Bordeaux': '33063',
      'Strasbourg': '67482',
      'Nantes': '44109',
      'Paris': '75056'
    };

    const cityCode = cityCodes[cityName];
    if (!cityCode) {
      return null;
    }

    // Récupérer les données démographiques via l'API INSEE
    const response = await axios.get(`${INSEE_BASE_URL}/series/BDCOM/COM/${cityCode}`, {
      headers: {
        'Authorization': `Bearer ${INSEE_API_KEY}`,
        'Accept': 'application/json'
      },
      params: {
        serie: 'POP', // Population
        annee: new Date().getFullYear() - 1 // Dernières données disponibles
      }
    });

    if (response.data && response.data.length > 0) {
      const population = response.data[0].valeur;
      
      // Pour l'aire et la densité, on utilise les données locales car l'API INSEE ne les fournit pas directement
      const cityInfo = cityData[cityName];
      const area = cityInfo ? cityInfo.demographics.area : 50;
      const density = Math.round(population / area);
      
      return {
        population: population,
        area: area,
        density: density
      };
    }

    return null;
  } catch (error) {
    console.error(`Erreur lors de la récupération des données INSEE pour ${cityName}:`, error.message);
    return null;
  }
}

async function getCityImage(cityName) {
  const normalizedName = normalizeCityName(cityName);
  const cityInfo = cityData[normalizedName];
  
  if (cityInfo && cityInfo.image) {
    return cityInfo.image;
  }

  // Fallback vers une recherche d'image générique
  try {
    // Utiliser Unsplash pour des images de qualité
    const response = await axios.get(`https://api.unsplash.com/search/photos`, {
      params: {
        query: `${cityName} France`,
        per_page: 1,
        orientation: 'landscape'
      },
      headers: {
        'Authorization': 'Client-ID YOUR_UNSPLASH_ACCESS_KEY' // À configurer
      }
    });

    if (response.data.results && response.data.results.length > 0) {
      return response.data.results[0].urls.regular;
    }
  } catch (error) {
    console.log('Erreur lors de la récupération d\'image:', error.message);
  }

  // Image par défaut
  return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800';
}

function normalizeCityName(cityName) {
  const cityMap = {
    'lyon': 'Lyon',
    'marseille': 'Marseille',
    'bordeaux': 'Bordeaux',
    'strasbourg': 'Strasbourg',
    'nantes': 'Nantes',
    'paris': 'Paris'
  };

  const normalized = cityName.toLowerCase().trim();
  return cityMap[normalized] || cityName;
}

async function getGlobalStats() {
  const cities = Object.keys(cityData);
  let totalPopulation = 0;
  let totalArea = 0;

  for (const city of cities) {
    const demographics = await getDemographicData(city);
    if (demographics) {
      totalPopulation += demographics.population;
      totalArea += demographics.area;
    }
  }

  return {
    totalCities: cities.length,
    totalPopulation: totalPopulation,
    totalArea: totalArea,
    averageDensity: Math.round(totalPopulation / totalArea)
  };
}

module.exports = { 
  getCityInfo, 
  getDemographicData, 
  getCityImage, 
  normalizeCityName, 
  getGlobalStats 
}; 