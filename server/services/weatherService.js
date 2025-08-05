const axios = require('axios');

// Configuration des APIs météo
const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const WEATHER_BASE_URL = process.env.OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5';

// Cache pour éviter trop d'appels API
const weatherCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

async function getWeatherForecast(city, date) {
  const cacheKey = `${city}_${date}`;
  const cached = weatherCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  if (!WEATHER_API_KEY) {
    console.log('Clé API OpenWeatherMap non configurée, utilisation des données mockées');
    return getMockWeatherData(city, date);
  }

  try {
    console.log(`Récupération des prévisions météo pour ${city} le ${date}`);
    
    // Obtenir les coordonnées de la ville
    const coordinates = await getCityCoordinates(city);
    if (!coordinates) {
      console.log(`Coordonnées non trouvées pour ${city}, utilisation des données mockées`);
      return getMockWeatherData(city, date);
    }

    // Récupérer les prévisions sur 5 jours
    const response = await axios.get(`${WEATHER_BASE_URL}/forecast`, {
      params: {
        lat: coordinates.lat,
        lon: coordinates.lng,
        appid: WEATHER_API_KEY,
        units: 'metric',
        lang: 'fr'
      }
    });

    // Trouver la prévision pour la date demandée
    const targetDate = new Date(date);
    const forecast = response.data.list.find(item => {
      const itemDate = new Date(item.dt * 1000);
      return itemDate.toDateString() === targetDate.toDateString();
    });

    if (forecast) {
      const weatherData = {
        temperature: Math.round(forecast.main.temp),
        feels_like: Math.round(forecast.main.feels_like),
        humidity: forecast.main.humidity,
        description: forecast.weather[0].description,
        icon: forecast.weather[0].icon,
        wind_speed: Math.round(forecast.wind.speed * 3.6), // Conversion m/s vers km/h
        precipitation: forecast.rain ? forecast.rain['3h'] : 0
      };

      // Mettre en cache
      weatherCache.set(cacheKey, {
        data: weatherData,
        timestamp: Date.now()
      });

      return weatherData;
    } else {
      console.log(`Aucune prévision trouvée pour ${city} le ${date}`);
      return getMockWeatherData(city, date);
    }

  } catch (error) {
    console.error('Erreur lors de la récupération des prévisions météo:', error.message);
    return getMockWeatherData(city, date);
  }
}

async function getCurrentWeather(city) {
  if (!WEATHER_API_KEY) {
    console.log('Clé API OpenWeatherMap non configurée, utilisation des données mockées');
    return getMockCurrentWeather(city);
  }

  try {
    console.log(`Récupération de la météo actuelle pour ${city}`);
    
    const coordinates = await getCityCoordinates(city);
    if (!coordinates) {
      return getMockCurrentWeather(city);
    }

    const response = await axios.get(`${WEATHER_BASE_URL}/weather`, {
      params: {
        lat: coordinates.lat,
        lon: coordinates.lng,
        appid: WEATHER_API_KEY,
        units: 'metric',
        lang: 'fr'
      }
    });

    const weather = response.data;
    return {
      temperature: Math.round(weather.main.temp),
      feels_like: Math.round(weather.main.feels_like),
      humidity: weather.main.humidity,
      description: weather.weather[0].description,
      icon: weather.weather[0].icon,
      wind_speed: Math.round(weather.wind.speed * 3.6),
      precipitation: weather.rain ? weather.rain['1h'] : 0
    };

  } catch (error) {
    console.error('Erreur lors de la récupération de la météo actuelle:', error.message);
    return getMockCurrentWeather(city);
  }
}

async function getCityCoordinates(city) {
  if (!WEATHER_API_KEY) {
    return null;
  }

  try {
    const response = await axios.get(`${WEATHER_BASE_URL}/weather`, {
      params: {
        q: `${city},FR`,
        appid: WEATHER_API_KEY,
        units: 'metric'
      }
    });

    return {
      lat: response.data.coord.lat,
      lng: response.data.coord.lon
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération des coordonnées pour ${city}:`, error.message);
    return null;
  }
}

function getMockWeatherData(city, date) {
  const temperatures = {
    'Lyon': 18,
    'Marseille': 22,
    'Bordeaux': 20,
    'Strasbourg': 16,
    'Nantes': 19,
    'Paris': 17
  };

  const descriptions = [
    'Ensoleillé',
    'Nuageux',
    'Pluvieux',
    'Orageux',
    'Brouillard'
  ];

  const icons = [
    '01d', '02d', '03d', '04d', '09d', '10d', '11d', '13d', '50d'
  ];

  return {
    temperature: temperatures[city] || 18,
    feels_like: (temperatures[city] || 18) + Math.floor(Math.random() * 3) - 1,
    humidity: 60 + Math.floor(Math.random() * 30),
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    icon: icons[Math.floor(Math.random() * icons.length)],
    wind_speed: 10 + Math.floor(Math.random() * 20),
    precipitation: Math.floor(Math.random() * 5)
  };
}

function getMockCurrentWeather(city) {
  return getMockWeatherData(city, new Date().toISOString().split('T')[0]);
}

module.exports = { 
  getWeatherForecast, 
  getCurrentWeather,
  getCityCoordinates 
}; 