import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Correction des icônes Leaflet par défaut
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface TGVmaxMapProps {
  departureCity: string;
  selectedDate: string;
  currentTime: Date;
  apiType: 'tgvmax' | 'ouisncf' | 'sncf-official';
}

interface Train {
  id: string;
  departureStation: string;
  arrivalStation: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  trainNumber: string;
  platform: number;
  price: string;
}

interface CityInfo {
  name: string;
  coordinates: [number, number];
}

// Cache pour les coordonnées des villes
const cityCache: { [key: string]: CityInfo } = {};

// Clé API Google Maps
const GOOGLE_MAPS_API_KEY = 'AIzaSyB2JUQt8zn_2vnLr4C-87SWpfR0nufKY_Y';

// Fonction pour nettoyer et normaliser les noms de villes
const normalizeCityName = (cityName: string): string => {
  if (!cityName) return 'Inconnue';
  
  // Nettoyer le nom de la ville
  let normalized = cityName
    .replace(/\(.*?\)/g, '') // Enlever les parenthèses
    .replace(/TGV$/i, '') // Enlever TGV à la fin
    .replace(/ST\s+/gi, 'SAINT ') // Normaliser ST
    .replace(/\s+/g, ' ') // Normaliser les espaces
    .trim();
  
  return normalized;
};

// Fonction pour récupérer les coordonnées via Google Maps API
const getCityCoordinates = async (cityName: string): Promise<CityInfo | null> => {
  const cleanCityName = normalizeCityName(cityName);
  
  // Vérifier le cache
  if (cityCache[cleanCityName]) {
    return cityCache[cleanCityName];
  }

  try {
    // Utiliser l'API Google Maps Geocoding
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
      params: {
        address: `${cleanCityName}, France`,
        key: GOOGLE_MAPS_API_KEY,
        language: 'fr'
      }
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      const cityInfo: CityInfo = {
        name: cleanCityName,
        coordinates: [location.lat, location.lng]
      };

      // Mettre en cache
      cityCache[cleanCityName] = cityInfo;
      console.log(`✅ Coordonnées trouvées pour ${cleanCityName}: [${cityInfo.coordinates[0]}, ${cityInfo.coordinates[1]}]`);
      
      return cityInfo;
    }
  } catch (error) {
    console.error(`❌ Erreur pour récupérer les coordonnées de ${cleanCityName}:`, error);
  }

  return null;
};

export default function TGVmaxMap({ departureCity, selectedDate, currentTime, apiType }: TGVmaxMapProps) {
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const linesRef = useRef<L.Polyline[]>([]);

  // 1. Initialisation de la carte centrée sur la France
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    
    // Centrer sur la France avec un zoom approprié
    const map = L.map(mapRef.current).setView([46.603354, 1.888334], 6);
    
    // Style carte moderne avec glassmorphisme
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map);
    
    mapInstanceRef.current = map;
    
    // Forcer le refresh de la carte
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Chargement des trajets
  const fetchTrains = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let endpoint;
      if (apiType === 'tgvmax') {
        endpoint = '/api/tgvmax/search';
      } else if (apiType === 'ouisncf') {
        endpoint = '/api/ouisncf/search';
      } else {
        endpoint = '/api/sncf-official/journeys';
      }
      
      const response = await axios.get(`http://localhost:4000${endpoint}`, {
        params: { from: departureCity, date: selectedDate }
      });
      
      if (response.data.success) {
        setTrains(response.data.trains || []);
        console.log(`✅ ${response.data.trains?.length || 0} trajets chargés`);
      } else {
        setError('Erreur lors du chargement des trajets');
      }
    } catch (err) {
      console.error('Erreur API:', err);
      setError('Erreur lors du chargement des trajets');
    } finally {
      setLoading(false);
    }
  }, [departureCity, selectedDate, apiType]);

  useEffect(() => {
    if (departureCity && selectedDate) {
      fetchTrains();
    }
  }, [departureCity, selectedDate, apiType, fetchTrains]);

  // 3. Affichage des marqueurs et lignes avec glassmorphisme
  useEffect(() => {
    if (!mapInstanceRef.current || trains.length === 0) return;
    
    console.log(`🗺️ Affichage de ${trains.length} trajets sur la carte`);
    
    // Nettoyage des anciens marqueurs et lignes
    markersRef.current.forEach(marker => marker.remove());
    linesRef.current.forEach(line => line.remove());
    markersRef.current = [];
    linesRef.current = [];

    const map = mapInstanceRef.current;
    const departureCoords = cityCache[departureCity.toUpperCase()]?.coordinates || [48.8566, 2.3522];

    // Marqueur de départ avec glassmorphisme
    const departureIcon = L.divIcon({
      className: 'custom-div-icon',
                html: `
            <div style="
              background: linear-gradient(135deg, rgba(66, 133, 244, 0.9), rgba(66, 133, 244, 0.7));
              backdrop-filter: blur(10px);
              -webkit-backdrop-filter: blur(10px);
              color: white; 
              padding: 8px; 
              border-radius: 50%; 
              font-weight: 600; 
              border: 1px solid rgba(255, 255, 255, 0.3);
              box-shadow: 0 8px 32px rgba(66, 133, 244, 0.3);
              font-size: 16px;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              backdrop-filter: blur(10px);
              transform: translateZ(0);
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              🚉
            </div>
          `,
              iconSize: [32, 32],
        iconAnchor: [16, 16]
    });

    const departureMarker = L.marker(departureCoords, { icon: departureIcon }).addTo(map);
    markersRef.current.push(departureMarker);

    // Grouper les trajets par ville d'arrivée
    const cityGroups: { [key: string]: any[] } = {};
    trains.forEach(train => {
      const cityName = train.arrivalStation || 'Inconnue';
      if (!cityGroups[cityName]) {
        cityGroups[cityName] = [];
      }
      cityGroups[cityName].push(train);
    });

    // Marqueurs pour chaque ville de destination avec glassmorphisme
    const processCities = async () => {
      for (const [cityName, cityTrains] of Object.entries(cityGroups)) {
        console.log(`🏙️ Traitement de la ville: ${cityName} (${cityTrains.length} trajets)`);
        
        // Récupérer les coordonnées via Google Maps API
        const cityInfo = await getCityCoordinates(cityName);
        
        if (cityInfo) {
          // Marqueur de destination avec glassmorphisme
          const destinationIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `
              <div style="
                background: linear-gradient(135deg, rgba(52, 168, 83, 0.9), rgba(52, 168, 83, 0.7));
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                color: white; 
                padding: 6px; 
                border-radius: 50%; 
                font-weight: 600; 
                border: 1px solid rgba(255, 255, 255, 0.3);
                box-shadow: 0 6px 24px rgba(52, 168, 83, 0.3);
                font-size: 14px;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                transform: translateZ(0);
                transition: all 0.3s ease;
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                🏙️
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          const destinationMarker = L.marker(cityInfo.coordinates, { icon: destinationIcon }).addTo(map);
          
          // Popup glassmorphisme ultra-moderne
          const popupContent = `
            <div style="
              min-width: 280px; 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85));
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              border-radius: 16px;
              border: 1px solid rgba(255, 255, 255, 0.3);
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
              padding: 20px;
              transform: translateZ(0);
            ">
              <div style="
                background: linear-gradient(135deg, #34a853, #2d8f47);
                color: white;
                padding: 12px 16px;
                border-radius: 12px;
                margin-bottom: 16px;
                box-shadow: 0 4px 12px rgba(52, 168, 83, 0.3);
              ">
                <h3 style="margin: 0; font-size: 16px; font-weight: 700; letter-spacing: -0.5px;">${cityName}</h3>
                <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">
                  ${cityTrains.length} trajet${cityTrains.length > 1 ? 's' : ''} disponible${cityTrains.length > 1 ? 's' : ''}
                </p>
              </div>
              
              <div style="max-height: 160px; overflow-y: auto;">
                ${cityTrains.slice(0, 4).map(train => `
                  <div style="
                    background: linear-gradient(135deg, rgba(248, 249, 250, 0.8), rgba(248, 249, 250, 0.6));
                    backdrop-filter: blur(10px);
                    padding: 8px 12px; 
                    margin: 4px 0; 
                    border-radius: 8px; 
                    font-size: 11px; 
                    border-left: 3px solid #34a853;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                    transition: all 0.2s ease;
                  ">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <div>
                        <span style="font-weight: 600; color: #1a1a1a;">
                          ${new Date(train.departureTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span style="margin: 0 8px; color: #666;">→</span>
                        <span style="font-weight: 600; color: #1a1a1a;">
                          ${new Date(train.arrivalTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span style="
                        background: linear-gradient(135deg, #34a853, #2d8f47);
                        color: white;
                        padding: 2px 8px;
                        border-radius: 12px;
                        font-size: 10px;
                        font-weight: 600;
                      ">${train.price}</span>
                    </div>
                    <div style="margin-top: 4px; color: #666; font-size: 10px;">
                      ${train.trainNumber} • ${train.duration}
                    </div>
                  </div>
                `).join('')}
                ${cityTrains.length > 4 ? `
                  <div style="
                    text-align: center; 
                    color: #666; 
                    font-size: 10px; 
                    padding: 8px;
                    background: linear-gradient(135deg, rgba(248, 249, 250, 0.5), rgba(248, 249, 250, 0.3));
                    border-radius: 8px;
                    margin-top: 8px;
                  ">
                    +${cityTrains.length - 4} autre${cityTrains.length - 4 > 1 ? 's' : ''} trajet${cityTrains.length - 4 > 1 ? 's' : ''}
                  </div>
                ` : ''}
              </div>
            </div>
          `;
          
          destinationMarker.bindPopup(popupContent);
          markersRef.current.push(destinationMarker);

          // Ligne de connexion avec effet glassmorphisme
          const line = L.polyline([departureCoords, cityInfo.coordinates], {
            color: '#4285f4',
            weight: 3,
            opacity: 0.7,
            dashArray: '10, 5',
            className: 'connection-line'
          }).addTo(map);
          
          linesRef.current.push(line);
        }
      }

      // Ajuster la vue pour voir tous les marqueurs
      if (markersRef.current.length > 1) {
        const group = new L.FeatureGroup(markersRef.current);
        map.fitBounds(group.getBounds().pad(0.1));
      }
    };

    processCities();

  }, [trains, departureCity, apiType]);

  return (
    <div className="space-y-6">
      {/* Header glassmorphisme */}
      <div className="
        bg-gradient-to-r from-blue-50/80 to-purple-50/80 
        backdrop-blur-xl border border-white/30 
        rounded-2xl p-6 shadow-2xl
      ">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🗺️ Carte Interactive TGVmax
            </h2>
            <p className="text-gray-600">
              {departureCity} → {selectedDate} • {trains.length} trajet{trains.length > 1 ? 's' : ''} trouvé{trains.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="
            bg-gradient-to-br from-blue-500 to-purple-600 
            text-white p-4 rounded-xl shadow-lg
          ">
            <div className="text-2xl">🚅</div>
          </div>
        </div>

        {/* Stats glassmorphisme */}
        <div className="grid grid-cols-3 gap-4">
          <div className="
            bg-white/60 backdrop-blur-sm border border-white/30 
            rounded-xl p-4 text-center
          ">
            <div className="text-2xl font-bold text-blue-600">{trains.length}</div>
            <div className="text-xs text-gray-600">Trajets</div>
          </div>
          <div className="
            bg-white/60 backdrop-blur-sm border border-white/30 
            rounded-xl p-4 text-center
          ">
                      <div className="text-2xl font-bold text-green-600">
            {trains.length > 0 ? new Set(trains.map(t => t.arrivalStation)).size : 0}
          </div>
            <div className="text-xs text-gray-600">Destinations</div>
          </div>
          <div className="
            bg-white/60 backdrop-blur-sm border border-white/30 
            rounded-xl p-4 text-center
          ">
            <div className="text-2xl font-bold text-purple-600">0€</div>
            <div className="text-xs text-gray-600">Prix moyen</div>
          </div>
        </div>
      </div>

      {/* Loading State glassmorphisme */}
      {loading && (
        <div className="
          bg-white/80 backdrop-blur-xl border border-white/30 
          rounded-2xl p-8 text-center shadow-2xl
        ">
          <div className="
            w-16 h-16 border-4 border-blue-200 border-t-blue-500 
            rounded-full animate-spin mx-auto mb-4
          "></div>
          <p className="text-gray-600 font-medium">Chargement des trajets...</p>
        </div>
      )}
      
      {/* Error State glassmorphisme */}
      {error && (
        <div className="
          bg-red-50/80 backdrop-blur-xl border border-red-200/30 
          rounded-2xl p-6 shadow-2xl
        ">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {/* Carte avec glassmorphisme */}
      <div className="
        bg-white/80 backdrop-blur-xl border border-white/30 
        rounded-2xl p-6 shadow-2xl
      ">
        <div 
          ref={mapRef} 
          style={{ 
            height: '600px', 
            width: '100%', 
            borderRadius: '16px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
          }} 
        />
        
        {/* Légende glassmorphisme */}
        {trains.length > 0 && (
          <div className="
            mt-6 bg-white/60 backdrop-blur-sm border border-white/30 
            rounded-xl p-4 text-center
          ">
            <div className="flex items-center justify-center space-x-6 text-sm">
                          <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">🚉</div>
              <span className="text-gray-700">Départ</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">🏙️</div>
              <span className="text-gray-700">Destinations</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-0.5 bg-blue-500 border-dashed"></div>
              <span className="text-gray-700">Connexions</span>
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 