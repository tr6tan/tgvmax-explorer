import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Corriger les icônes Leaflet par défaut
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
  apiType: 'tgvmax' | 'ouisncf';
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

interface CityData {
  name: string;
  trains: Train[];
  coordinates: [number, number];
  availableTrains: number;
  departedTrains: number;
}

// Coordonnées des villes françaises principales (latitude, longitude)
const cityCoordinates: { [key: string]: [number, number] } = {
  'Paris': [48.8566, 2.3522],
  'Lyon': [45.7578, 4.8320],
  'Marseille': [43.2965, 5.3698],
  'Bordeaux': [44.8378, -0.5792],
  'Nantes': [47.2184, -1.5536],
  'Toulouse': [43.6047, 1.4442],
  'Lille': [50.6292, 3.0573],
  'Strasbourg': [48.5734, 7.7521],
  'Nice': [43.7102, 7.2620],
  'Montpellier': [43.6108, 3.8767],
  'Rennes': [48.1173, -1.6778],
  'Reims': [49.2583, 4.0317],
  'Dijon': [47.3220, 5.0415],
  'Besançon': [47.2376, 6.0241],
  'Angoulême': [45.6489, 0.1562],
  'Biarritz': [43.4832, -1.5586],
  'Hendaye': [43.3603, -1.7826],
  'St Jean de Luz': [43.3887, -1.6623],
  'Avignon': [43.9493, 4.8055],
  'Aix-en-Provence': [43.5297, 5.4474],
  'Cannes': [43.5528, 7.0174],
  'Antibes': [43.5804, 7.1251],
  'Vannes': [47.6582, -2.7608],
  'Lorient': [47.7483, -3.3700],
  'Auray': [47.6708, -2.9817],
  'Vitré': [48.1242, -1.2057],
  'Bayonne': [43.4929, -1.4748],
  'Morlaix': [48.5776, -3.8279],
  'Brest': [48.3904, -4.4861],
  'St Pierre des Corps': [47.3866, 0.7161],
  'St Denis Pres Martel': [44.9361, 1.6211],
  'AIX EN PROVENCE': [43.5297, 5.4474],
  'MARSEILLE': [43.2965, 5.3698],
  'NICE': [43.7102, 7.2620],
  'BORDEAUX': [44.8378, -0.5792],
  'RENNES': [48.1173, -1.6778],
  'VANNES': [47.6582, -2.7608],
  'LORIENT': [47.7483, -3.3700],
  'AURAY': [47.6708, -2.9817],
  'VITRE': [48.1242, -1.2057],
  'BAYONNE': [43.4929, -1.4748],
  'BIARRITZ': [43.4832, -1.5586],
  'HENDAYE': [43.3603, -1.7826],
  'ST JEAN DE LUZ': [43.3887, -1.6623],
  'AVIGNON': [43.9493, 4.8055],
  'CANNES': [43.5528, 7.0174],
  'ANTIBES': [43.5804, 7.1251],
  'MORLAIX': [48.5776, -3.8279],
  'BREST': [48.3904, -4.4861],
  'ANGOULEME': [45.6489, 0.1562]
};

export default function TGVmaxMap({ departureCity, selectedDate, currentTime, apiType }: TGVmaxMapProps) {
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const linesRef = useRef<L.Polyline[]>([]);

  const searchTrains = async () => {
    try {
      setLoading(true);
      setError(null);
      setApiStatus('idle');

      const endpoint = apiType === 'tgvmax' ? '/api/tgvmax/search' : '/api/ouisncf/search';
      console.log(`🔍 Recherche ${apiType} depuis ${departureCity} pour le ${selectedDate}...`);

      const response = await axios.get(`http://localhost:4000${endpoint}`, {
        params: {
          from: departureCity,
          date: selectedDate
        }
      });

      if (response.data.success) {
        setTrains(response.data.trains || []);
        setApiStatus('success');
        console.log(`✅ ${response.data.trains?.length || 0} trajets ${apiType} trouvés`);
      } else {
        setError('Erreur lors de la récupération des données');
        setApiStatus('error');
      }
    } catch (err) {
      console.error(`Erreur ${apiType}:`, err);
      setError(`Impossible de récupérer les données ${apiType}`);
      setApiStatus('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (departureCity && selectedDate) {
      searchTrains();
    }
  }, [departureCity, selectedDate, apiType]);

  // Initialiser la carte Leaflet
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Attendre un peu pour que le DOM soit prêt
    setTimeout(() => {
      if (!mapRef.current) return;

      // Initialiser la carte centrée sur la France
      const map = L.map(mapRef.current).setView([46.603354, 1.888334], 6);

      // Ajouter le fond de carte OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(map);

      mapInstanceRef.current = map;

      // Forcer un refresh de la carte
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);
    }, 100);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Mettre à jour les marqueurs quand les données changent
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Nettoyer les marqueurs et lignes existants
    markersRef.current.forEach(marker => marker.remove());
    linesRef.current.forEach(line => line.remove());
    markersRef.current = [];
    linesRef.current = [];

    const map = mapInstanceRef.current;
    const cityData = groupTrainsByCity();

    // Ajouter le marqueur de la ville de départ
    const departureCoords = cityCoordinates[departureCity] || [48.8566, 2.3522];
    const departureIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #ef4444; color: white; padding: 8px 12px; border-radius: 8px; font-weight: bold; border: 2px solid #dc2626; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">🚉 ${departureCity}</div>`,
      iconSize: [120, 40],
      iconAnchor: [60, 20]
    });

    const departureMarker = L.marker(departureCoords, { icon: departureIcon }).addTo(map);
    markersRef.current.push(departureMarker);

    // Ajouter les marqueurs des destinations
    cityData.forEach(city => {
      const availableTrains = city.trains.filter(train => isTrainAvailable(train.departureTime));
      const departedTrains = city.trains.filter(train => !isTrainAvailable(train.departureTime));
      
      const markerColor = availableTrains.length > 0 ? '#10b981' : '#9ca3af';
      const borderColor = availableTrains.length > 0 ? '#059669' : '#6b7280';
      
      const cityIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="
            background-color: ${markerColor}; 
            color: white; 
            padding: 8px 12px; 
            border-radius: 8px; 
            font-weight: bold; 
            border: 2px solid ${borderColor}; 
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            min-width: 100px;
            text-align: center;
          ">
            <div style="font-size: 14px; margin-bottom: 2px;">${city.name}</div>
            <div style="font-size: 11px; opacity: 0.9;">
              ${availableTrains.length} dispo
              ${departedTrains.length > 0 ? ` • ${departedTrains.length} passé${departedTrains.length > 1 ? 's' : ''}` : ''}
            </div>
          </div>
        `,
        iconSize: [120, 50],
        iconAnchor: [60, 25]
      });

      const marker = L.marker(city.coordinates, { icon: cityIcon }).addTo(map);
      
      // Popup avec les détails des trajets
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px;">${city.name}</h3>
          <div style="margin-bottom: 8px;">
            <span style="color: #059669; font-weight: bold;">${availableTrains.length} trajet${availableTrains.length > 1 ? 's' : ''} disponible${availableTrains.length > 1 ? 's' : ''}</span>
            ${departedTrains.length > 0 ? `<br><span style="color: #6b7280;">${departedTrains.length} trajet${departedTrains.length > 1 ? 's' : ''} passé${departedTrains.length > 1 ? 's' : ''}</span>` : ''}
          </div>
          <div style="font-size: 12px; color: #6b7280;">
            Cliquez pour voir les détails
          </div>
        </div>
      `;
      
      marker.bindPopup(popupContent);
      markersRef.current.push(marker);

      // Ligne de connexion depuis la ville de départ
      const line = L.polyline([departureCoords, city.coordinates], {
        color: availableTrains.length > 0 ? '#3b82f6' : '#9ca3af',
        weight: availableTrains.length > 0 ? 3 : 2,
        opacity: availableTrains.length > 0 ? 0.8 : 0.4,
        dashArray: availableTrains.length > 0 ? undefined : '5,5'
      }).addTo(map);
      
      linesRef.current.push(line);
    });

    // Ajuster la vue pour voir tous les marqueurs
    if (markersRef.current.length > 0) {
      const group = new L.FeatureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.1));
    }

  }, [trains, departureCity]);

  const isTrainAvailable = (departureTime: string) => {
    const trainTime = new Date(departureTime);
    return trainTime > currentTime;
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Grouper les trajets par ville d'arrivée avec données enrichies
  const groupTrainsByCity = (): CityData[] => {
    const cityGroups: { [key: string]: Train[] } = {};
    
    trains.forEach(train => {
      // Extraire le nom de la ville (premier mot avant les parenthèses)
      const cityName = train.arrivalStation.split(' ')[0];
      if (!cityGroups[cityName]) {
        cityGroups[cityName] = [];
      }
      cityGroups[cityName].push(train);
    });

    return Object.entries(cityGroups).map(([cityName, cityTrains]) => {
      const availableTrains = cityTrains.filter(train => isTrainAvailable(train.departureTime));
      const departedTrains = cityTrains.filter(train => !isTrainAvailable(train.departureTime));
      
      // Trouver les coordonnées de la ville
      const coordinates = cityCoordinates[cityName] || cityCoordinates[cityName.toUpperCase()] || [46.603354, 1.888334];
      
      return {
        name: cityName,
        trains: cityTrains,
        coordinates,
        availableTrains: availableTrains.length,
        departedTrains: departedTrains.length
      };
    });
  };

  const cityData = groupTrainsByCity();

  return (
    <div className="space-y-6">
      {/* Status Card macOS-style */}
      <div className={`bg-gradient-to-r ${apiType === 'tgvmax' ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-purple-50 to-purple-100 border-purple-200'} rounded-xl p-6 border`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              {apiType === 'tgvmax' ? 'TGVmax' : 'OUI.sncf'} - Carte de France
            </h2>
            <p className="text-gray-600">
              {departureCity} → {selectedDate} • {cityData.length} destination{cityData.length > 1 ? 's' : ''}
            </p>
          </div>
          
          <button
            onClick={searchTrains}
            disabled={loading}
            className={`px-6 py-3 ${apiType === 'tgvmax' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-purple-500 hover:bg-purple-600'} text-white rounded-lg font-medium shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center space-x-2`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Recherche...</span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>Actualiser</span>
              </>
            )}
          </button>
        </div>

        {/* API Status */}
        {apiStatus === 'success' && (
          <div className="mt-4 flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-700 font-medium">
              {trains.length} trajet{trains.length > 1 ? 's' : ''} disponible{trains.length > 1 ? 's' : ''} • {cityData.length} ville{cityData.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
        {apiStatus === 'error' && (
          <div className="mt-4 flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-red-700 font-medium">Erreur API</span>
          </div>
        )}
      </div>

      {/* Loading State macOS-style */}
      {loading && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
          <div className={`animate-spin rounded-full h-16 w-16 border-4 ${apiType === 'tgvmax' ? 'border-blue-200 border-t-blue-500' : 'border-purple-200 border-t-purple-500'} mx-auto mb-6`}></div>
          <p className="text-gray-600 font-medium text-lg">Recherche des trajets...</p>
        </div>
      )}

      {/* Error State macOS-style */}
      {error && (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-200">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Erreur</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={searchTrains}
            className={`px-8 py-3 ${apiType === 'tgvmax' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-purple-500 hover:bg-purple-600'} text-white rounded-lg font-medium transition-colors`}
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Map View */}
      {!loading && !error && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Carte de France Métropolitaine</h3>
            <p className="text-gray-600">Carte interactive avec les vraies positions géographiques</p>
          </div>

          {/* Map Container */}
          <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
            <div 
              ref={mapRef} 
              style={{ 
                height: '600px', 
                width: '100%',
                zIndex: 1
              }}
            ></div>
            
            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-white rounded-lg p-4 shadow-lg border border-gray-200 z-[1000]">
              <h4 className="font-semibold text-gray-900 mb-2">Légende</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Ville de départ</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Destinations disponibles</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-400 rounded"></div>
                  <span>Destinations passées</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded"></div>
                  <span>Connexions TGV</span>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="absolute top-4 right-4 bg-white rounded-lg p-3 shadow-lg border border-gray-200 z-[1000]">
              <div className="text-sm font-semibold text-gray-900 mb-1">Statistiques</div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Total: {trains.length} trajets</div>
                <div>Villes: {cityData.length}</div>
                <div>Disponibles: {cityData.filter(c => c.availableTrains > 0).length}</div>
              </div>
            </div>
          </div>

          {/* City Details */}
          {trains.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Détails par destination</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cityData.map((city) => (
                  <div key={city.name} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-semibold text-gray-900">{city.name}</h5>
                      <div className="flex space-x-2">
                        {city.availableTrains > 0 && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            {city.availableTrains} dispo
                          </span>
                        )}
                        {city.departedTrains > 0 && (
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                            {city.departedTrains} passé{city.departedTrains > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {city.trains.slice(0, 3).map((train) => (
                        <div key={train.id} className={`text-sm p-2 rounded ${
                          isTrainAvailable(train.departureTime) 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-gray-50 border border-gray-200 opacity-75'
                        }`}>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              {formatTime(train.departureTime)} → {formatTime(train.arrivalTime)}
                            </span>
                            <span className="text-green-600 font-bold">{train.price}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {train.trainNumber} • {train.duration}
                          </div>
                        </div>
                      ))}
                      {city.trains.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{city.trains.length - 3} autre{city.trains.length - 3 > 1 ? 's' : ''} trajet{city.trains.length - 3 > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State macOS-style */}
      {!loading && !error && trains.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🗺️</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Aucun trajet</h3>
          <p className="text-gray-600">
            Aucun trajet disponible pour cette date
          </p>
        </div>
      )}
    </div>
  );
} 