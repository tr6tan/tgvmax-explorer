import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { Train, MapStats } from '../types';
import { API_ENDPOINTS } from '../config/api';
// import MapDestinationPopup from './MapDestinationPopup';
// import StatsOverlay from './StatsOverlay';
// import SearchSettingsDock from './SearchSettingsDock';
// import ReturnTripModal from './ReturnTripModal';

// Import Leaflet
import L from 'leaflet';

const RightCityPanel = lazy(() => import('./RightCityPanel'));

interface MapStyle {
  id: string;
  name: string;
  url: string;
  attribution: string;
}

const MAP_STYLES: MapStyle[] = [
  {
    id: 'osm',
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors'
  },
  {
    id: 'cartodb-light',
    name: 'CartoDB Clair',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap contributors, © CartoDB'
  },
  {
    id: 'cartodb-dark',
    name: 'CartoDB Sombre',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap contributors, © CartoDB'
  },
  {
    id: 'cartodb-voyager',
    name: 'CartoDB Voyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap contributors, © CartoDB'
  },
  {
    id: 'stamen-toner',
    name: 'Stamen Toner',
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png',
    attribution: 'Map tiles by Stamen Design, CC BY 3.0 — Map data © OpenStreetMap contributors'
  },
  {
    id: 'stamen-watercolor',
    name: 'Stamen Watercolor',
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg',
    attribution: 'Map tiles by Stamen Design, CC BY 3.0 — Map data © OpenStreetMap contributors'
  }
];

interface SearchSettings {
  departureCity: string;
  selectedDate: string;
  destinationCity?: string;
}

interface SelectedTrip {
  train: Train;
  date: string;
  departureCity: string;
  arrivalCity: string;
}

interface TGVmaxMapProps {
  searchSettings: SearchSettings;
  currentTime: Date;
  apiType: 'tgvmax' | 'ouisncf' | 'sncf-official';
  trains?: Train[]; // Données de trains venant d'App.tsx
  onStats?: (stats: MapStats) => void;
  onLoadingChange?: (loading: boolean) => void;
  onTripSelection?: (trip: SelectedTrip) => void;
  hideHeader?: boolean;
}

interface CityInfo {
  name: string;
  coordinates: [number, number];
}

// Cache pour les coordonnées des villes
const cityCache: { [key: string]: CityInfo } = {
  // Coordonnées par défaut pour les villes principales
  'PARIS': { name: 'Paris', coordinates: [48.8566, 2.3522] },
  'PARIS (intramuros)': { name: 'Paris', coordinates: [48.8566, 2.3522] },
  'LYON': { name: 'Lyon', coordinates: [45.7578, 4.8320] },
  'MARSEILLE': { name: 'Marseille', coordinates: [43.2965, 5.3698] },
  'BORDEAUX': { name: 'Bordeaux', coordinates: [44.8378, -0.5792] },
  'NANTES': { name: 'Nantes', coordinates: [47.2184, -1.5536] },
  'TOULOUSE': { name: 'Toulouse', coordinates: [43.6047, 1.4442] },
  'LILLE': { name: 'Lille', coordinates: [50.6292, 3.0573] },
  'STRASBOURG': { name: 'Strasbourg', coordinates: [48.5734, 7.7521] },
  'NICE': { name: 'Nice', coordinates: [43.7102, 7.2620] },
  'RENNES': { name: 'Rennes', coordinates: [48.1173, -1.6778] },
  'DIJON': { name: 'Dijon', coordinates: [47.3220, 5.0415] },
  'LAVAL': { name: 'Laval', coordinates: [48.0737, -0.7694] },
  'BRUXELLES': { name: 'Bruxelles', coordinates: [50.8503, 4.3517] },
  'BRUXELLES MIDI': { name: 'Bruxelles', coordinates: [50.8503, 4.3517] },
  'BIARRITZ': { name: 'Biarritz', coordinates: [43.4831, -1.5596] },
  'DAX': { name: 'Dax', coordinates: [43.7077, -1.0539] },
  'ST JEAN DE LUZ CIBOURE': { name: 'Saint-Jean-de-Luz', coordinates: [43.3891, -1.6624] },
  'FRASNE': { name: 'Frasne', coordinates: [46.8569, 6.1634] },
  'DOLE VILLE': { name: 'Dole', coordinates: [47.0924, 5.4897] },
  'DIJON VILLE': { name: 'Dijon', coordinates: [47.3220, 5.0415] },
  'TGV HAUTE PICARDIE': { name: 'TGV Haute-Picardie', coordinates: [49.8728, 2.8351] },
  'MARNE LA VALLEE CHESSY': { name: 'Marne-la-Vallée', coordinates: [48.8721, 2.7833] },
  
  // Nouvelles villes ajoutées pour réduire les appels API
  'ANGERS ST LAUD': { name: 'Angers', coordinates: [47.4784, -0.5632] },
  'AVIGNON TGV': { name: 'Avignon', coordinates: [43.9493, 4.7861] },
  'BELFORT MONTBELIARD TGV': { name: 'Belfort', coordinates: [47.6400, 6.8628] },
  'BESANCON FRANCHE COMTE TGV': { name: 'Besançon', coordinates: [47.3078, 5.8114] },
  'CREPY EN VALOIS': { name: 'Crépy-en-Valois', coordinates: [49.2345, 2.8890] },
  'GARE DE LYON PART DIEU': { name: 'Lyon Part-Dieu', coordinates: [45.7603, 4.8606] },
  'LA ROCHELLE VILLE': { name: 'La Rochelle', coordinates: [46.1603, -1.1511] },
  'LE CREUSOT MONTCEAU TGV': { name: 'Le Creusot', coordinates: [46.7969, 4.4161] },
  'LORRAINE TGV': { name: 'Lorraine', coordinates: [49.0364, 6.2689] },
  'POITIERS': { name: 'Poitiers', coordinates: [46.5802, 0.3404] },
  'REIMS': { name: 'Reims', coordinates: [49.2583, 4.0317] },
  'SAINT PIERRE DES CORPS': { name: 'Tours', coordinates: [47.3889, 0.7075] },
  'VALENCE TGV': { name: 'Valence', coordinates: [44.9336, 4.7859] },
  'VENDOME VILLIERS SUR LOIR TGV': { name: 'Vendôme', coordinates: [47.7856, 1.0194] },
};

// Clé API Google Maps
const GOOGLE_MAPS_API_KEY = 'AIzaSyB2JUQt8zn_2vnLr4C-87SWpfR0nufKY_Y';

// Fonction pour nettoyer et normaliser les noms de villes
const normalizeCityName = (cityName: string): string => {
  if (!cityName) return 'Inconnue';
  
  let normalized = cityName
    .toUpperCase()
    .replace(/\(.*?\)/g, '') // Supprimer le contenu entre parenthèses
    .replace(/TGV$/i, '') // Supprimer "TGV" à la fin
    .replace(/ST\s+/gi, 'SAINT ') // Remplacer "ST" par "SAINT"
    .replace(/\s+/g, ' ') // Normaliser les espaces
    .replace(/-/g, ' ') // Remplacer les tirets par des espaces
    .replace(/\s+/g, ' ') // Normaliser à nouveau les espaces
    .trim();
  
  return normalized;
};

// Fonction pour récupérer les coordonnées via Google Places API
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getCityCoordinates = async (cityName: string): Promise<CityInfo | null> => {
  const cleanCityName = normalizeCityName(cityName);
  
  // Vérifier d'abord le cache
  if (cityCache[cleanCityName]) {
    return cityCache[cleanCityName];
  }

  // Vérifier les coordonnées par défaut
  const defaultCoords = cityCache[cityName.toUpperCase()];
  if (defaultCoords) {
    console.log(`✅ Coordonnées par défaut trouvées pour ${cityName}: [${defaultCoords.coordinates[0]}, ${defaultCoords.coordinates[1]}]`);
    return defaultCoords;
  }

  // Si pas trouvé, utiliser l'API Google Places
  try {
    console.log(`🔍 Recherche des coordonnées pour ${cityName} via Google Places API...`);
    
    // D'abord, chercher le place_id avec l'API Places Search
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(cityName + ', France')}&inputtype=textquery&fields=place_id&key=${GOOGLE_MAPS_API_KEY}`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (searchData.candidates && searchData.candidates.length > 0) {
      const placeId = searchData.candidates[0].place_id;
      console.log(`✅ Place ID trouvé pour ${cityName}: ${placeId}`);
      
      // Maintenant, récupérer les détails avec l'API Places Details
      const detailsUrl = `https://places.googleapis.com/v1/places/${placeId}?fields=id,displayName,location&key=${GOOGLE_MAPS_API_KEY}`;
      
      const detailsResponse = await fetch(detailsUrl, {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': 'id,displayName,location'
        }
      });
      
      const detailsData = await detailsResponse.json();
      
      if (detailsData.location) {
        const coordinates: [number, number] = [
          detailsData.location.latitude,
          detailsData.location.longitude
        ];
        
        const cityInfo: CityInfo = {
          name: detailsData.displayName?.text || cityName,
          coordinates
        };
        
        // Mettre en cache
        cityCache[cleanCityName] = cityInfo;
        console.log(`✅ Coordonnées récupérées pour ${cityName}: [${coordinates[0]}, ${coordinates[1]}]`);
        
        return cityInfo;
      }
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la récupération des coordonnées pour ${cityName}:`, error);
  }

  // Si aucune coordonnée trouvée, utiliser des coordonnées par défaut pour la France
  console.log(`⚠️ Aucune coordonnée trouvée pour ${cityName}, utilisation de coordonnées par défaut`);
  const defaultInfo: CityInfo = {
    name: cleanCityName,
    coordinates: [46.603354, 1.888334] // Centre de la France
  };
  
  cityCache[cleanCityName] = defaultInfo;
  return defaultInfo;
};

// Fonction pour filtrer les trains selon les paramètres
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const filterTrains = (trains: Train[], settings: SearchSettings): Train[] => {
  console.log('🔍 Structure du premier train:', trains[0]);
  
  return trains.filter(train => {
    console.log('🔍 Traitement du train:', train);
    
    // Filtre par statut (disponible/départ)
    const trainTime = new Date(train.departureTime);
    const now = new Date();
    
    console.log('🔍 Heure du train:', trainTime, 'vs maintenant:', now);
    
    // Toujours exclure les trains qui sont déjà partis
    if (trainTime <= now) {
      console.log('❌ Train filtré: déjà parti');
      return false;
    }

    console.log('✅ Train accepté');
    return true;
  });
};

export default function TGVmaxMap({ searchSettings, currentTime, apiType, trains: propsTrains, onStats, onLoadingChange, onTripSelection, hideHeader = false }: TGVmaxMapProps) {
  const [allTrains, setAllTrains] = useState<Train[]>([]);
  const [filteredTrains, setFilteredTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // États pour la sélection de style de carte
  const [currentMapStyle, setCurrentMapStyle] = useState('osm');
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [currentTileLayer, setCurrentTileLayer] = useState<L.TileLayer | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const linesRef = useRef<L.Polyline[]>([]);
  
  // États pour les filtres et le panneau
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedCityTrains, setSelectedCityTrains] = useState<Train[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);



  // Debug: Log des props reçues
  console.log('🗺️ TGVmaxMap props:', { searchSettings, apiType, hideHeader });



  // Fonction pour gérer le clic sur un trajet (ouverture modal retour)
  const handleTripClick = useCallback((train: Train, cityName: string) => {
    const trip: SelectedTrip = {
      train,
      date: searchSettings.selectedDate,
      departureCity: searchSettings.departureCity,
      arrivalCity: cityName
    };
    
    console.log('🚅 Trajet sélectionné dans TGVmaxMap:', trip);
    
    if (onTripSelection) {
      onTripSelection(trip);
    } else {
      console.warn('⚠️ onTripSelection non défini');
    }
  }, [searchSettings, onTripSelection]);



  // Fonction pour changer le style de carte
  const changeMapStyle = useCallback((styleId: string) => {
    if (!mapInstanceRef.current || !currentTileLayer) return;
    
    const newStyle = MAP_STYLES.find(s => s.id === styleId);
    if (!newStyle) return;
    
    const map = mapInstanceRef.current;
    
    // Supprimer l'ancien layer
    map.removeLayer(currentTileLayer);
    
    // Ajouter le nouveau layer
    const newTileLayer = L.tileLayer(newStyle.url, {
      attribution: newStyle.attribution
    }).addTo(map);
    
    // Mettre à jour les états
    setCurrentTileLayer(newTileLayer);
    setCurrentMapStyle(styleId);
    setShowStyleSelector(false);
    
    // S'assurer que le nouveau layer est en arrière-plan
    newTileLayer.bringToBack();
    
    // Remettre les marqueurs et lignes au premier plan
    markersRef.current.forEach(marker => {
      if (map.hasLayer(marker)) {
        // Les marqueurs sont automatiquement au premier plan
      }
    });
    
    linesRef.current.forEach(line => {
      if (map.hasLayer(line)) {
        line.bringToFront();
      }
    });
    
    console.log(`✅ Style changé vers: ${newStyle.name}`);
  }, [currentTileLayer]);

  // 1. Initialisation de la carte centrée sur la France
  useEffect(() => {
    console.log('🗺️ Initialisation de la carte...');
    console.log('🗺️ mapRef.current:', mapRef.current);
    console.log('🗺️ mapInstanceRef.current:', mapInstanceRef.current);
    
    if (!mapRef.current) {
      console.log('❌ mapRef.current est null');
      return;
    }
    
    if (mapInstanceRef.current) {
      console.log('❌ Carte déjà initialisée');
      return;
    }
    
    console.log('🗺️ Création de la carte Leaflet...');
    
    // Ajouter le style personnalisé pour les popups Leaflet
    const style = document.createElement('style');
    style.textContent = `
      .leaflet-popup-content-wrapper {
        background: transparent !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        border: none !important;
      }
      .leaflet-popup-content {
        margin: 0 !important;
        background: transparent !important;
        border-radius: 0 !important;
      }
      .leaflet-popup-tip {
        background: transparent !important;
        box-shadow: none !important;
        border: none !important;
      }
      .leaflet-popup-close-button {
        display: none !important;
      }
      .leaflet-popup {
        background: transparent !important;
      }
    `;
    document.head.appendChild(style);
    
    try {
      const map = L.map(mapRef.current, { 
        zoomControl: true,
        center: [46.603354, 1.888334],
        zoom: 6
      });
      
      console.log('🗺️ Ajout de la couche de tuiles...');
      const initialStyle = MAP_STYLES.find(s => s.id === currentMapStyle) || MAP_STYLES[0];
      const tileLayer = L.tileLayer(initialStyle.url, {
        attribution: initialStyle.attribution,
        maxZoom: 18
      }).addTo(map);
      
      // Sauvegarder la référence du tileLayer
      setCurrentTileLayer(tileLayer);
      
      mapInstanceRef.current = map;
      console.log('✅ Carte initialisée avec succès');
      
      // Forcer le refresh de la carte après un délai
      setTimeout(() => {
        if (mapInstanceRef.current) {
          console.log('🗺️ Refresh de la carte...');
          mapInstanceRef.current.invalidateSize();
        }
      }, 300);
      
      // Second refresh pour s'assurer que la carte s'affiche
      setTimeout(() => {
        if (mapInstanceRef.current) {
          console.log('🗺️ Second refresh de la carte...');
          mapInstanceRef.current.invalidateSize();
        }
      }, 1000);
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de la carte:', error);
    }

    return () => {
      console.log('🗺️ Nettoyage de la carte...');
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [currentMapStyle]);



  // 3. Filtrage optimisé des trains avec memoization
  const filteredTrainsOptimized = useCallback(() => {
    console.log('🚀 Filtrage optimisé des trains...');
    console.log('🔍 allTrains:', allTrains.length);
    console.log('🔍 searchSettings:', searchSettings);
    
    if (!allTrains || allTrains.length === 0) {
      return [];
    }
    
    return allTrains; // Pour l'instant, retourner tous les trains (vous pouvez ajouter la logique de filtrage ici)
  }, [allTrains, searchSettings]);

  useEffect(() => {
    setFilteredTrains(filteredTrainsOptimized());
  }, [filteredTrainsOptimized]);

  // useEffect original commenté pour éviter la duplication
  /*useEffect(() => {
    console.log('🔍 Filtrage des trains...');
    console.log('🔍 allTrains:', allTrains.length);
    console.log('🔍 searchSettings:', searchSettings);
    
    // Temporairement désactiver le filtrage pour debug
    // const filtered = filterTrains(allTrains, searchSettings);
    const filtered = allTrains; // Utiliser tous les trains pour debug
    setFilteredTrains(filtered);
    console.log(`🔍 ${filtered.length} trajets filtrés sur ${allTrains.length} total (filtrage désactivé)`);
  }, [allTrains, searchSettings]);*/

  // Fonction pour vérifier si un train part bien de la ville sélectionnée
  const isTrainFromSelectedCity = useCallback((train: Train, selectedCity: string): boolean => {
    const normalizedSelectedCity = normalizeCityName(selectedCity);
    const normalizedDepartureStation = normalizeCityName(train.departureStation);
    
    console.log(`🔍 Vérification: "${normalizedDepartureStation}" vs "${normalizedSelectedCity}"`);
    
    // Mapping exact des villes vers leurs variantes de gares
    const cityToStationVariants: { [key: string]: string[] } = {
      'LYON': ['LYON', 'LYON PART DIEU', 'LYON PERRACHE', 'LYON (INTRAMUROS)'],
      'PARIS': ['PARIS', 'PARIS GARE DE LYON', 'PARIS MONTPARNASSE', 'PARIS NORD', 'PARIS EST', 'PARIS (INTRAMUROS)', 'GARE DE LYON'],
      'MARSEILLE': ['MARSEILLE', 'MARSEILLE ST CHARLES', 'MARSEILLE SAINT CHARLES'],
      'BORDEAUX': ['BORDEAUX', 'BORDEAUX ST JEAN', 'BORDEAUX SAINT JEAN'],
      'TOULOUSE': ['TOULOUSE', 'TOULOUSE MATABIAU'],
      'LILLE': ['LILLE', 'LILLE EUROPE', 'LILLE FLANDRES', 'LILLE (INTRAMUROS)'],
      'NANTES': ['NANTES', 'NANTES GARE'],
      'STRASBOURG': ['STRASBOURG', 'STRASBOURG VILLE'],
      'NICE': ['NICE', 'NICE VILLE'],
      'MONTPELLIER': ['MONTPELLIER', 'MONTPELLIER ST ROCH', 'MONTPELLIER SAINT ROCH'],
      'RENNES': ['RENNES', 'RENNES GARE'],
      'DIJON': ['DIJON', 'DIJON VILLE'],
      'REIMS': ['REIMS', 'REIMS CENTRE']
    };
    
    // Récupérer les variantes pour la ville sélectionnée
    const allowedStations = cityToStationVariants[normalizedSelectedCity] || [normalizedSelectedCity];
    
    // Vérifier si la gare de départ correspond exactement à une des variantes autorisées
    const isMatch = allowedStations.some(station => {
      const exactMatch = normalizedDepartureStation === station;
      const containsMatch = normalizedDepartureStation.includes(station) && station.length > 3; // Éviter les correspondances trop courtes
      
      console.log(`  - "${station}": exactMatch=${exactMatch}, containsMatch=${containsMatch}`);
      return exactMatch || containsMatch;
    });
    
    console.log(`  → Résultat: ${isMatch ? '✅ ACCEPTÉ' : '❌ REJETÉ'}`);
    return isMatch;
  }, []);

  // 4. Utiliser les trains venant d'App.tsx et filtrer côté client
  useEffect(() => {
    console.log('🚂 Mise à jour des trains depuis App.tsx...');
    console.log('🚂 propsTrains:', propsTrains?.length || 0);
    console.log('🚂 searchSettings.departureCity:', searchSettings.departureCity);
    console.log('🚂 searchSettings.selectedDate:', searchSettings.selectedDate);
    
    if (propsTrains && propsTrains.length > 0) {
      console.log(`✅ ${propsTrains.length} trains reçus depuis App.tsx`);
      
      // Log des dates des trains reçus pour debug
      const trainDates = Array.from(new Set(propsTrains.map(train => new Date(train.departureTime).toISOString().split('T')[0])));
      console.log(`📅 Dates des trains reçus:`, trainDates);
      console.log(`🎯 Date recherchée: ${searchSettings.selectedDate}`);
      
      // Filtrer pour ne garder que les trains partant de la ville sélectionnée ET de la date sélectionnée
      const filteredByDeparture = propsTrains.filter(train => {
        // Vérifier d'abord la ville de départ
        const isFromCity = isTrainFromSelectedCity(train, searchSettings.departureCity);
        
        // Vérifier ensuite la date
        const trainDate = new Date(train.departureTime).toISOString().split('T')[0];
        const isCorrectDate = trainDate === searchSettings.selectedDate;
        
        if (!isFromCity) {
          console.log(`🚫 Train filtré (ville): ${train.departureStation} ne correspond pas à ${searchSettings.departureCity}`);
        } else if (!isCorrectDate) {
          console.log(`🚫 Train filtré (date): ${train.departureStation} → ${train.arrivalStation} (${train.trainNumber}) - Date: ${trainDate} vs ${searchSettings.selectedDate}`);
        } else {
          console.log(`✅ Train accepté: ${train.departureStation} → ${train.arrivalStation} (${train.trainNumber}) - Date: ${trainDate}`);
        }
        
        return isFromCity && isCorrectDate;
      });
      
      console.log(`🔍 ${filteredByDeparture.length} trains restants après filtrage par ville de départ`);
      
      setAllTrains(filteredByDeparture);
      setLoading(false);
      if (onLoadingChange) onLoadingChange(false);
      setError(null);
    } else if (propsTrains && propsTrains.length === 0) {
      console.log('⚠️ Aucun train reçu depuis App.tsx');
      setAllTrains([]);
      setLoading(false);
      if (onLoadingChange) onLoadingChange(false);
    }
  }, [propsTrains, searchSettings.departureCity, searchSettings.selectedDate, onLoadingChange, isTrainFromSelectedCity]);

  // 5. Mettre à jour filteredTrains quand allTrains change
  useEffect(() => {
    console.log('🔄 Mise à jour de filteredTrains...');
    console.log('🔄 allTrains:', allTrains.length);
    
    // Pour l'instant, utiliser tous les trains (le filtrage par ville de départ est déjà fait)
    setFilteredTrains(allTrains);
    console.log(`✅ ${allTrains.length} trains disponibles après filtrage`);
  }, [allTrains]);

  // 6. Remonter les statistiques vers le parent
  useEffect(() => {
    if (!onStats) return;
    const destinationsCount = filteredTrains.length > 0 ? new Set(filteredTrains.map(t => t.arrivalStation)).size : 0;
    onStats({
      trainsCount: filteredTrains.length,
      destinationsCount,
      lastUpdated: new Date().toISOString(),
    });
  }, [filteredTrains, onStats]);

  // 6. Recentrer la carte sur la ville de départ quand elle change
  useEffect(() => {
    if (mapInstanceRef.current && searchSettings.departureCity) {
      const getDepartureCoordinates = (cityName: string): [number, number] => {
        const normalizedCity = cityName.toUpperCase();
        const cityCoordinates: { [key: string]: [number, number] } = {
          'PARIS': [48.8566, 2.3522],
          'PARIS (intramuros)': [48.8566, 2.3522],
          'LYON': [45.7578, 4.8320],
          'LYON (intramuros)': [45.7578, 4.8320],
          'MARSEILLE': [43.2965, 5.3698],
          'BORDEAUX': [44.8378, -0.5792],
          'NANTES': [47.2184, -1.5536],
          'TOULOUSE': [43.6047, 1.4442],
          'LILLE': [50.6292, 3.0573],
          'STRASBOURG': [48.5734, 7.7521],
          'NICE': [43.7102, 7.2620],
          'RENNES': [48.1173, -1.6778],
          'DIJON': [47.3220, 5.0415],
          'LAVAL': [48.0737, -0.7694],
          'BRUXELLES': [50.8503, 4.3517],
          'BRUXELLES MIDI': [50.8503, 4.3517],
          'BIARRITZ': [43.4831, -1.5596],
          'DAX': [43.7077, -1.0539],
          'ST JEAN DE LUZ CIBOURE': [43.3891, -1.6624],
          'FRASNE': [46.8569, 6.1634],
          'DOLE VILLE': [47.0924, 5.4897],
          'DIJON VILLE': [47.3220, 5.0415],
          'TGV HAUTE PICARDIE': [49.8728, 2.8351],
          'MARNE LA VALLEE CHESSY': [48.8721, 2.7833],
        };
        return cityCoordinates[normalizedCity] || [48.8566, 2.3522];
      };
      
      const newCoords = getDepartureCoordinates(searchSettings.departureCity);
      console.log('🗺️ Recentrage de la carte sur', searchSettings.departureCity, ':', newCoords);
      mapInstanceRef.current.setView(newCoords, 8);
    }
  }, [searchSettings.departureCity]);

  // 7. Forcer le rafraîchissement de la carte quand la date change
  useEffect(() => {
    if (mapInstanceRef.current && searchSettings.selectedDate) {
      console.log('🗺️ Rafraîchissement de la carte pour la nouvelle date:', searchSettings.selectedDate);
      // Forcer le rafraîchissement de la carte
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);
    }
  }, [searchSettings.selectedDate]);

  // 8. Affichage optimisé des marqueurs et lignes avec batch rendering
  useEffect(() => {
    console.log('🚀 Affichage optimisé des marqueurs...');
    console.log('🗺️ mapInstanceRef.current:', mapInstanceRef.current);
    console.log('🗺️ filteredTrains.length:', filteredTrains.length);
    console.log('🗺️ Date sélectionnée:', searchSettings.selectedDate);
    
    if (!mapInstanceRef.current) {
      console.log('❌ Carte non initialisée');
      return;
    }
    
    // Vérifier que la carte est complètement initialisée
    if (!mapInstanceRef.current.getPane) {
      console.log('❌ Carte pas encore prête, attente...');
      return;
    }
    
    if (filteredTrains.length === 0) {
      console.log('❌ Aucun train à afficher');
      return;
    }
    
    console.log(`🗺️ Affichage de ${filteredTrains.length} trajets filtrés sur la carte`);
    
    // Nettoyage des anciens marqueurs et lignes
    markersRef.current.forEach(marker => {
      if (marker && mapInstanceRef.current) {
        try {
          mapInstanceRef.current.removeLayer(marker);
        } catch (error) {
          console.log('⚠️ Erreur lors du nettoyage du marqueur:', error);
        }
      }
    });
    linesRef.current.forEach(line => {
      if (line && mapInstanceRef.current) {
        try {
          mapInstanceRef.current.removeLayer(line);
        } catch (error) {
          console.log('⚠️ Erreur lors du nettoyage de la ligne:', error);
        }
      }
    });
    markersRef.current = [];
    linesRef.current = [];

    const map = mapInstanceRef.current;
    
    // Coordonnées de départ - utiliser la ville sélectionnée
    const getDepartureCoordinates = (cityName: string): [number, number] => {
      const normalizedCity = normalizeCityName(cityName);
      
      // Coordonnées prédéfinies pour les villes principales
      const cityCoordinates: { [key: string]: [number, number] } = {
        'PARIS': [48.8566, 2.3522],
        'PARIS INTRAMUROS': [48.8566, 2.3522],
        'LYON': [45.7578, 4.8320],
        'LYON INTRAMUROS': [45.7578, 4.8320],
        'MARSEILLE': [43.2965, 5.3698],
        'BORDEAUX': [44.8378, -0.5792],
        'NANTES': [47.2184, -1.5536],
        'TOULOUSE': [43.6047, 1.4442],
        'LILLE': [50.6292, 3.0573],
        'STRASBOURG': [48.5734, 7.7521],
        'NICE': [43.7102, 7.2620],
        'RENNES': [48.1173, -1.6778],
        'DIJON': [47.3220, 5.0415],
        'LAVAL': [48.0737, -0.7694],
        'BRUXELLES': [50.8503, 4.3517],
        'BRUXELLES MIDI': [50.8503, 4.3517],
        'BIARRITZ': [43.4831, -1.5596],
        'DAX': [43.7077, -1.0539],
        'SAINT JEAN DE LUZ CIBOURE': [43.3891, -1.6624],
        'FRASNE': [46.8569, 6.1634],
        'DOLE VILLE': [47.0924, 5.4897],
        'DIJON VILLE': [47.3220, 5.0415],
        'TGV HAUTE PICARDIE': [49.8728, 2.8351],
        'MARNE LA VALLEE CHESSY': [48.8721, 2.7833],
        'POITIERS': [46.5802, 0.3404],
        'LIMOGES': [45.8336, 1.2611],
        'BRIVE LA GAILLARDE': [45.1589, 1.5333],
        'TULLE': [45.2673, 1.7684],
        'PERIGUEUX': [45.1911, 0.7189],
        'BERGERAC': [44.8511, 0.4819],
        'AGEN': [44.2014, 0.6292],
        'MONTPELLIER': [43.6108, 3.8767],
        'MONTPELLIER SUD DE FRANCE': [43.6108, 3.8767],
        'NIMES': [43.8367, 4.3601],
        'NIMES PONT DU GARD': [43.8367, 4.3601],
        'AVIGNON': [43.9493, 4.8055],
        'AVIGNON TGV': [43.9493, 4.8055],
        'AIX EN PROVENCE': [43.5297, 5.4474],
        'CANNES': [43.5528, 7.0174],
        'ANTIBES': [43.5804, 7.1251],
        'GRASSE': [43.6588, 6.9244],
        'SAINT PIERRE DES CORPS': [47.3900, 0.6892],
        'VALENCIENNES': [50.3591, 3.5240],
        'MONTBARD': [47.6228, 4.3370],
        'NIORT': [46.3237, -0.4588],
        'SURGERES': [46.1089, -0.7519],
        'VENDOME VILLIERS SUR LOIR': [47.7936, 1.0653],
        'TOURS': [47.2184, 0.7055],
        'ANGERS': [47.4784, -0.5632],
        'LE MANS': [48.0061, 0.1996],
        // Nouvelles villes avec noms complexes
        'LA ROCHELLE VILLE': [46.1591, -1.1520],
        'CHAMBERY CHALLES LES EAUX': [45.5646, 5.9262],
        'LE CROISIC': [47.2919, -2.5138],
        'LA BAULE ESCOUBLAC': [47.2861, -2.3920],
        'GUINGAMP': [48.5634, -3.1508],
        'MORLAIX': [48.5774, -3.8292],
        'BETHUNE': [50.5294, 2.6404],
        'BREST': [48.3904, -4.4861],
        'LANDERNEAU': [48.4489, -4.2475],
        'ANNECY': [45.8992, 6.1294],
        'LE CREUSOT MONTCEAU MONTCHANIN': [46.8061, 4.4163],
        'ST MAIXENT (DEUX SEVRES)': [46.3237, -0.4588],
        'MULHOUSE': [47.7508, 7.3359],
        'MULHOUSE VILLE': [47.7508, 7.3359],
        'BELFORT': [47.6381, 6.8638],
        'BELFORT MONTBELIARD TGV': [47.6381, 6.8638],
        'BESANCON': [47.2378, 6.0241],
        'BESANCON VIOTTE': [47.2378, 6.0241],
        'CHALON SUR SAONE': [46.7798, 4.8538],
        'MACON': [46.3078, 4.8308],
        'VILLEURBANNE': [45.7640, 4.8357],
        'ST ETIENNE': [45.4397, 4.3872],
        'CLERMONT FERRAND': [45.7772, 3.0870],
        'VICHY': [46.1271, 3.4260],
        'MOULINS': [46.5647, 3.3324],
        'NEVERS': [46.9896, 3.1597],
        'COSNE SUR LOIRE': [47.4111, 2.9281],
        'AUXERRE': [47.7982, 3.5738],
        'SENS': [48.1974, 3.2820],
        'LAROCHE MIGENNES': [47.8731, 3.4980],
        'TROYES': [48.2973, 4.0744],
        'REIMS': [49.2583, 4.0317],
        'EPERNAY': [49.0434, 3.9590],
        'CHALONS EN CHAMPAGNE': [48.9562, 4.3634],
        'CHAMPAGNE ARDENNE TGV': [48.9562, 4.3634],
        'VITRY LE FRANCOIS': [48.7246, 4.5846],
        'BAR LE DUC': [48.7727, 5.1610],
        'NANCY': [48.6921, 6.1844],
        'METZ': [49.1193, 6.1757],
        'THIONVILLE': [49.3578, 6.1694],
        'LUXEMBOURG': [49.6116, 6.1319],
        'DOUAI': [50.3704, 3.0790],
        'ARRAS': [50.2930, 2.7789],
        'AMIENS': [49.8941, 2.2958],
        'BEAUVAIS': [49.4294, 2.0810],
        'COMPIEGNE': [49.4179, 2.8231],
        'CREIL': [49.2578, 2.4789],
        'PONTOISE': [49.0496, 2.0990],
        'PARIS NORD': [48.8805, 2.3553],
        'PARIS EST': [48.8768, 2.3592],
        'PARIS LYON': [48.8444, 2.3736],
        'PARIS AUSTERLITZ': [48.8419, 2.3644],
        'PARIS MONTPARNASSE': [48.8404, 2.3225],
        'PARIS SAINT LAZARE': [48.8759, 2.3245],
        'AIX LES BAINS LE REVARD': [45.6889, 5.9153],
      };
      
      console.log('🔍 Recherche coordonnées pour:', cityName, '→ Normalisé:', normalizedCity);
      const coords = cityCoordinates[normalizedCity];
      if (coords) {
        console.log('✅ Coordonnées trouvées:', coords);
      } else {
        console.log('❌ Coordonnées non trouvées, utilisation de Paris par défaut');
      }
      
      return coords || [48.8566, 2.3522]; // Paris par défaut si ville non trouvée
    };
    
    const departureCoords = getDepartureCoordinates(searchSettings.departureCity);
    console.log('🗺️ Coordonnées de départ pour', searchSettings.departureCity, ':', departureCoords);

    // Marqueur de départ - point bleu avec icône train personnalisée
    const departureIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 50%;
          border: 3px solid rgba(59, 130, 246, 0.3);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          z-index: 1000;
          cursor: pointer;
          transition: all 0.2s ease;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.99 15.0008H1C0.734784 15.0008 0.48043 15.1062 0.292893 15.2937C0.105357 15.4812 0 15.7356 0 16.0008C0 16.266 0.105357 16.5204 0.292893 16.7079C0.48043 16.8955 0.734784 17.0008 1 17.0008H19.99C20.618 17.0019 21.2375 16.8551 21.7982 16.5723C22.359 16.2896 22.8452 15.8787 23.2177 15.373C23.5901 14.8674 23.8383 14.2811 23.9421 13.6618C24.0458 13.0424 24.0023 12.4073 23.815 11.8078C22.9307 8.95869 21.1556 6.46842 18.7508 4.70313C16.3459 2.93784 13.4382 1.99065 10.455 2.00081H1C0.734784 2.00081 0.48043 2.10617 0.292893 2.29371C0.105357 2.48124 0 2.7356 0 3.00081C0 3.26603 0.105357 3.52038 0.292893 3.70792C0.48043 3.89546 0.734784 4.00081 1 4.00081H4V7.00081H1C0.734784 7.00081 0.48043 7.10617 0.292893 7.29371C0.105357 7.48124 0 7.7356 0 8.00081C0 8.26603 0.105357 8.52038 0.292893 8.70792C0.48043 8.89546 0.734784 9.00081 1 9.00081H20.213C20.9545 10.0393 21.5263 11.1889 21.907 12.4068C22.0014 12.7049 22.0234 13.0212 21.9712 13.3296C21.9191 13.6379 21.7942 13.9293 21.607 14.1798C21.4217 14.4349 21.1785 14.6423 20.8973 14.785C20.6162 14.9277 20.3053 15.0017 19.99 15.0008ZM9 7.00081H6V4.00081H9V7.00081ZM11 7.00081V4.02281C13.7373 4.13719 16.3523 5.18854 18.407 7.00081H11Z" fill="white"/>
            <path d="M23 20.0006H1C0.734784 20.0006 0.48043 20.106 0.292893 20.2935C0.105357 20.481 0 20.7354 0 21.0006C0 21.2658 0.105357 21.5202 0.292893 21.7077C0.48043 21.8953 0.734784 22.0006 1 22.0006H23C23.2652 22.0006 23.5196 21.8953 23.7071 21.7077C23.8946 21.5202 24 21.2658 24 21.0006C24 20.7354 23.8946 20.481 23.7071 20.2935C23.5196 20.106 23.2652 20.0006 23 20.0006Z" fill="white"/>
          </svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    try {
      const departureMarker = L.marker(departureCoords, { icon: departureIcon }).addTo(map);
      markersRef.current.push(departureMarker);
      console.log('✅ Marqueur de départ ajouté');
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout du marqueur de départ:', error);
    }

    // Grouper les trajets par ville d'arrivée
    const cityGroups: { [key: string]: any[] } = {};
    filteredTrains.forEach(train => {
      const cityName = train.arrivalStation || 'Inconnue';
      if (!cityGroups[cityName]) {
        cityGroups[cityName] = [];
      }
      cityGroups[cityName].push(train);
    });

    console.log('🏙️ Villes de destination:', Object.keys(cityGroups));
    console.log('🏙️ Détail des groupes:', cityGroups);

    // Marqueurs pour chaque ville de destination - points verts avec icône personnalisée
    const processCities = async () => {
      for (const [cityName, cityTrains] of Object.entries(cityGroups)) {
        console.log(`🏙️ Traitement de la ville: ${cityName} (${cityTrains.length} trajets)`);
        
        // Variable pour stocker les coordonnées de la ville
        let cityCoords: [number, number] | null = null;
        
        // Coordonnées prédéfinies pour les villes principales
        const cityCoordinates: { [key: string]: [number, number] } = {
          'LAVAL': [48.0737, -0.7694],
          'DIJON VILLE': [47.3220, 5.0415],
          'DOLE VILLE': [47.0924, 5.4897],
          'FRASNE': [46.8569, 6.1634],
          'BRUXELLES MIDI': [50.8503, 4.3517],
          'TGV HAUTE PICARDIE': [49.8728, 2.8351],
          'MARNE LA VALLEE CHESSY': [48.8721, 2.7833],
          'BIARRITZ': [43.4831, -1.5596],
          'DAX': [43.7077, -1.0539],
          'ST JEAN DE LUZ CIBOURE': [43.3891, -1.6624],
          'LYON (intramuros)': [45.7578, 4.8320],
          'RENNES': [48.1173, -1.6778],
          'ST PIERRE DES CORPS': [47.3900, 0.6892],
          'VALENCIENNES': [50.3591, 3.5240],
          'MONTBARD': [47.6228, 4.3370],
          'NIORT': [46.3237, -0.4588],
          'SURGERES': [46.1089, -0.7519],
          'VENDOME VILLIERS SUR LOIR': [47.7936, 1.0653],
          'TOURS': [47.2184, 0.7055],
          'ANGERS': [47.4784, -0.5632],
          'LE MANS': [48.0061, 0.1996],
          'NANTES': [47.2184, -1.5536],
          'BORDEAUX': [44.8378, -0.5792],
          'POITIERS': [46.5802, 0.3404],
          'LIMOGES': [45.8336, 1.2611],
          'BRIVE LA GAILLARDE': [45.1589, 1.5333],
          'TULLE': [45.2673, 1.7684],
          'PERIGUEUX': [45.1911, 0.7189],
          'BERGERAC': [44.8511, 0.4819],
          'AGEN': [44.2014, 0.6292],
          'TOULOUSE': [43.6047, 1.4442],
          'MONTPELLIER': [43.6108, 3.8767],
          'MONTPELLIER SUD DE FRANCE': [43.6108, 3.8767],
          'NIMES': [43.8367, 4.3601],
          'NIMES PONT DU GARD': [43.8367, 4.3601],
          'AVIGNON': [43.9493, 4.8055],
          'AVIGNON TGV': [43.9493, 4.8055],
          'AIX EN PROVENCE': [43.5297, 5.4474],
          'MARSEILLE': [43.2965, 5.3698],
          'NICE': [43.7102, 7.2620],
          'CANNES': [43.5528, 7.0174],
          'ANTIBES': [43.5804, 7.1251],
          'GRASSE': [43.6588, 6.9244],
          'STRASBOURG': [48.5734, 7.7521],
          'MULHOUSE': [47.7508, 7.3359],
          'MULHOUSE VILLE': [47.7508, 7.3359],
          'BELFORT': [47.6381, 6.8638],
          'BELFORT MONTBELIARD TGV': [47.6381, 6.8638],
          'BESANCON': [47.2378, 6.0241],
          'BESANCON VIOTTE': [47.2378, 6.0241],
          'DIJON': [47.3220, 5.0415],
          'CHALON SUR SAONE': [46.7798, 4.8538],
          'MACON': [46.3078, 4.8308],
          'VILLEURBANNE': [45.7640, 4.8357],
          'ST ETIENNE': [45.4397, 4.3872],
          'CLERMONT FERRAND': [45.7772, 3.0870],
          'VICHY': [46.1271, 3.4260],
          'MOULINS': [46.5647, 3.3324],
          'NEVERS': [46.9896, 3.1597],
          'COSNE SUR LOIRE': [47.4111, 2.9281],
          'AUXERRE': [47.7982, 3.5738],
          'SENS': [48.1974, 3.2820],
          'LAROCHE MIGENNES': [47.8731, 3.4980],
          'TROYES': [48.2973, 4.0744],
          'REIMS': [49.2583, 4.0317],
          'EPERNAY': [49.0434, 3.9590],
          'CHALONS EN CHAMPAGNE': [48.9562, 4.3634],
          'CHAMPAGNE ARDENNE TGV': [48.9562, 4.3634],
          'VITRY LE FRANCOIS': [48.7246, 4.5846],
          'BAR LE DUC': [48.7727, 5.1610],
          'NANCY': [48.6921, 6.1844],
          'METZ': [49.1193, 6.1757],
          'THIONVILLE': [49.3578, 6.1694],
          'LUXEMBOURG': [49.6116, 6.1319],
          'BRUXELLES': [50.8503, 4.3517],
          'LILLE': [50.6292, 3.0573],
          'DOUAI': [50.3704, 3.0790],
          'ARRAS': [50.2930, 2.7789],
          'AMIENS': [49.8941, 2.2958],
          'BEAUVAIS': [49.4294, 2.0810],
          'COMPIEGNE': [49.4179, 2.8231],
          'CREIL': [49.2578, 2.4789],
          'PONTOISE': [49.0496, 2.0990],
          'PARIS NORD': [48.8805, 2.3553],
          'PARIS EST': [48.8768, 2.3592],
          'PARIS LYON': [48.8444, 2.3736],
          'PARIS AUSTERLITZ': [48.8419, 2.3644],
          'PARIS MONTPARNASSE': [48.8404, 2.3225],
          'PARIS SAINT LAZARE': [48.8759, 2.3245],
          // Nouvelles coordonnées ajoutées
          'LA ROCHELLE VILLE': [46.1591, -1.1520],
          'CHAMBERY CHALLES LES EAUX': [45.5646, 5.9262],
          'LE CROISIC': [47.2919, -2.5138],
          'LA BAULE ESCOUBLAC': [47.2861, -2.3920],
          'GUINGAMP': [48.5634, -3.1508],
          'MORLAIX': [48.5774, -3.8292],
          'BETHUNE': [50.5294, 2.6404],
          'BREST': [48.3904, -4.4861],
          'LANDERNEAU': [48.4489, -4.2475],
          'ANNECY': [45.8992, 6.1294],
          'LE CREUSOT MONTCEAU MONTCHANIN': [46.8061, 4.4163],
        };
        
        // Vérifier d'abord dans la base locale
        if (cityCoordinates[cityName]) {
          cityCoords = cityCoordinates[cityName];
          console.log(`✅ Coordonnées locales trouvées pour ${cityName}:`, cityCoords);
        } else {
          // Si pas dans la base locale, utiliser notre proxy serveur pour l'API Google Places
          console.log(`🔍 Recherche des coordonnées pour ${cityName} via notre proxy serveur...`);
          
          try {
            const response = await fetch(`${API_ENDPOINTS.GOOGLE_PLACES_SEARCH}?cityName=${encodeURIComponent(cityName)}`);
            const data = await response.json();
            
            if (data.success && data.coordinates) {
              cityCoords = [
                data.coordinates.latitude,
                data.coordinates.longitude
              ];
              
              console.log(`✅ Coordonnées API trouvées pour ${cityName}: [${cityCoords[0]}, ${cityCoords[1]}]`);
              console.log(`📍 Nom affiché: ${data.cityName}`);
            } else {
              console.log(`❌ Aucune coordonnée trouvée pour ${cityName}: ${data.error || 'Erreur inconnue'}`);
            }
          } catch (error) {
            console.error(`❌ Erreur lors de la récupération des coordonnées pour ${cityName}:`, error);
          }
        }
        
        // Créer le marqueur seulement si les coordonnées sont trouvées
        if (cityCoords) {
          // Vérifier si tous les trajets sont passés
          const allTrainsPast = cityTrains.every(train => new Date(train.departureTime) <= new Date());
          const someTrainsPast = cityTrains.some(train => new Date(train.departureTime) <= new Date());
          
          // Marqueur de destination - point liquid glass avec couleur conditionnelle
          const destinationIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div style="
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.3s ease;
              z-index: 9999;
              position: relative;
              background: transparent;
            ">
              <div style="
                width: 16px;
                height: 16px;
                background: ${allTrainsPast 
                  ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.9) 100%)' 
                  : someTrainsPast 
                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.95) 0%, rgba(217, 119, 6, 0.9) 100%)'
                    : 'linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.9) 100%)'};
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                border: 2px solid rgba(255, 255, 255, 0.9);
                border-radius: 50%;
                box-shadow: 
                  0 4px 12px ${allTrainsPast 
                    ? 'rgba(239, 68, 68, 0.4)' 
                    : someTrainsPast 
                      ? 'rgba(245, 158, 11, 0.4)'
                      : 'rgba(16, 185, 129, 0.4)'},
                  0 2px 4px rgba(0, 0, 0, 0.15),
                  inset 0 1px 2px rgba(255, 255, 255, 0.6);
                position: relative;
                z-index: 10000;
              ">
                <div style="
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  width: 6px;
                  height: 6px;
                  background: rgba(255, 255, 255, 1);
                  border-radius: 50%;
                  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                  z-index: 10001;
                "></div>
              </div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const destinationMarker = L.marker(cityCoords, { icon: destinationIcon }).addTo(map);
        
        // Popup avec style glassmorphism sophistiqué et image de ville
        const getCityImage = async (cityName: string) => {
          // Images par défaut pour certaines villes
          const cityImages: { [key: string]: string } = {
            'Lyon': 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=400&h=200&fit=crop',
            'Marseille': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=200&fit=crop',
            'Toulouse': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop',
            'Bordeaux': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop',
            'Nantes': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop',
            'Strasbourg': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop',
            'Montpellier': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop',
          };
          
          // Essayer de récupérer une image via Google Places API
          try {
            const response = await fetch(`/api/places/search?query=${encodeURIComponent(cityName + ' France')}`);
            if (response.ok) {
              const data = await response.json();
              if (data.photoUrl) {
                return data.photoUrl;
              }
            }
          } catch (error) {
            console.log('Impossible de récupérer l\'image via API, utilisation de l\'image par défaut');
          }
          
          return cityImages[cityName] || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop';
        };

        await getCityImage(cityName);

        const popupHtml = `
          <div style="
            width: 380px;
            border-radius: 20px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1) 100%);
            backdrop-filter: blur(40px);
            -webkit-backdrop-filter: blur(40px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 20px 80px rgba(0, 0, 0, 0.2);
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            position: relative;
            overflow: hidden;
          ">
            <!-- Effet de fond liquid glass -->
            <div style="
              position: absolute;
              inset: 0;
              background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.02) 100%);
              border-radius: 20px;
              pointer-events: none;
            "></div>
            
            <!-- Header avec nom de ville -->
            <div style="
              position: relative;
              padding: 20px 20px 16px 20px;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            ">
              <div style="
                display: flex;
                align-items: center;
                justify-content: space-between;
              ">
                <div style="display: flex; align-items: center; gap: 12px;">
                                      <div>
                      <h3 style="
                        margin: 0;
                        font-size: 18px;
                        font-weight: 700;
                        color: #1f2937;
                      ">${cityName}</h3>
                      <div style="
                        margin: 4px 0 0 0;
                        font-size: 14px;
                        font-weight: 600;
                        color: #3b82f6;
                        background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
                        padding: 4px 8px;
                        border-radius: 6px;
                        border: 1px solid rgba(59, 130, 246, 0.2);
                        display: inline-block;
                      ">${normalizeCityName(cityTrains[0]?.departureStation || searchSettings.departureCity)} → ${cityName}</div>
                      <div style="
                        margin: 4px 0 0 0;
                        font-size: 12px;
                        color: #6b7280;
                        font-weight: 500;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                      ">
                        <span>📅 ${new Date(searchSettings.selectedDate).toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                        <span>•</span>
                        <span>${cityTrains.length} trajets disponibles</span>
                      </div>
                    </div>
                </div>

              </div>
            </div>

            <!-- Liste des trajets -->
            <div style="
              padding: 16px 20px 20px 20px;
              max-height: 300px;
              overflow-y: auto;
            ">
              ${cityTrains
                .sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime())
                .map(train => {
                console.log(`🚂 Génération popup pour train:`, { id: train.id, trainNumber: train.trainNumber, cityName });
                const isPast = new Date(train.departureTime) <= new Date();
                
                return `
                  <div style="
                    padding: 14px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.85) 100%);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    margin-bottom: 10px;
                    transition: all 0.3s ease;
                    opacity: ${isPast ? '0.6' : '1'};
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
                  "
                  onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.2)'; this.style.background='linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)'"
                  onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.15)'; this.style.background='linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.85) 100%)'">
                    <div style="
                      display: flex;
                      align-items: center;
                      justify-content: space-between;
                      margin-bottom: 8px;
                    ">
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <div>
                          <div style="
                            font-size: 14px;
                            font-weight: 700;
                            color: #000000;
                            margin-bottom: 3px;
                          ">${new Date(train.departureTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} → ${new Date(train.arrivalTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                          <div style="
                            font-size: 12px;
                            color: #1f2937;
                            font-weight: 600;
                          ">${train.trainNumber}</div>
                        </div>
                      </div>
                      <div style="
                        padding: 4px 8px;
                        border-radius: 8px;
                        font-size: 10px;
                        font-weight: 700;
                        background: ${isPast ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'};
                        border: 1px solid ${isPast ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'};
                        color: ${isPast ? '#dc2626' : '#059669'};
                        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                      ">${isPast ? 'Départé' : 'Disponible'}</div>
                    </div>
                    
                    <div style="
                      display: flex;
                      align-items: center;
                      justify-content: space-between;
                      margin-top: 8px;
                      padding-top: 8px;
                      border-top: 1px solid rgba(0, 0, 0, 0.1);
                    ">
                      <div style="display: flex; align-items: center; gap: 8px;">
                                               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style="color: #059669;">
                         <circle cx="12" cy="12" r="10"/>
                         <polyline points="12,6 12,12 16,14"/>
                       </svg>
                        <span style="
                          font-size: 12px;
                          color: #059669;
                          font-weight: 600;
                        ">${train.duration}</span>
                      </div>
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <div style="
                          font-size: 11px;
                          color: #6b7280;
                          font-weight: 600;
                          background: rgba(0, 0, 0, 0.05);
                          padding: 2px 6px;
                          border-radius: 4px;
                        ">
                          ${train.platform ? `Voie ${train.platform}` : ''}
                        </div>
                        <div style="
                          font-size: 11px;
                          color: #dc2626;
                          font-weight: 600;
                          background: rgba(220, 38, 38, 0.1);
                          padding: 2px 6px;
                          border-radius: 4px;
                          border: 1px solid rgba(220, 38, 38, 0.2);
                        ">
                          ${Math.floor(Math.random() * 50) + 5} places
                        </div>
                      </div>
                    </div>
                    
                    <!-- Bouton pour trajet de retour -->
                    ${!isPast ? `
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0, 0, 0, 0.08);">
                      <button
                        onclick="console.log('🔧 Bouton cliqué:', { trainId: '${train.id}', cityName: '${cityName}', windowFunction: !!window.selectTripForReturn }); window.selectTripForReturn && window.selectTripForReturn('${train.id}', '${cityName}')"
                        style="
                          width: 100%;
                          padding: 8px 12px;
                          background: linear-gradient(135deg, #3b82f6, #2563eb);
                          color: white;
                          border: none;
                          border-radius: 8px;
                          font-size: 12px;
                          font-weight: 600;
                          cursor: pointer;
                          transition: all 0.2s ease;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          gap: 6px;
                          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
                        "
                        onmouseover="this.style.background='linear-gradient(135deg, #2563eb, #1d4ed8)'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(59, 130, 246, 0.4)'"
                        onmouseout="this.style.background='linear-gradient(135deg, #3b82f6, #2563eb)'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(59, 130, 246, 0.3)'"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 11H1l6-6v4h8a4 4 0 0 1 0 8h-8v4l-6-6Z"/>
                          <path d="M22 12h-3"/>
                        </svg>
                        Planifier le retour
                      </button>
                    </div>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
        
        destinationMarker.bindPopup(popupHtml);
        markersRef.current.push(destinationMarker);

        // Ligne de connexion - trait fin avec dash subtil et couleur conditionnelle
        const allTrainsPastForLine = cityTrains.every(train => new Date(train.departureTime) <= new Date());
        const someTrainsPastForLine = cityTrains.some(train => new Date(train.departureTime) <= new Date());
        
        const lineColor = allTrainsPastForLine ? '#dc2626' : someTrainsPastForLine ? '#f59e0b' : '#3b82f6';
        const lineOpacity = allTrainsPastForLine ? 0.5 : someTrainsPastForLine ? 0.6 : 0.7;
        
        const line = L.polyline([departureCoords, cityCoords], {
          color: lineColor,
          weight: cityTrains.length > 3 ? 3 : 2,
          opacity: lineOpacity,
          dashArray: '5, 5',
          className: 'connection-line'
        }).addTo(map);
        
        linesRef.current.push(line);
        console.log(`✅ Marqueur et ligne ajoutés pour ${cityName}`);
      } else {
        console.log(`❌ Ville non située: ${cityName} - pas de marqueur créé`);
      }
      }

      // Ajuster la vue pour voir tous les marqueurs
      if (markersRef.current.length > 1) {
        const group = new L.FeatureGroup(markersRef.current);
        map.fitBounds(group.getBounds().pad(0.1));
        console.log('✅ Vue ajustée pour tous les marqueurs');
      }
    };

    processCities();

  }, [filteredTrains, searchSettings.departureCity, searchSettings.selectedDate, apiType]);

  // Exposer la fonction pour ouvrir le panneau
  useEffect(() => {
    (window as any).openCityPanel = (cityName: string) => {
      const cityTrains = filteredTrains.filter(t => t.arrivalStation === cityName);
      setSelectedCity(cityName);
      setSelectedCityTrains(cityTrains);
      setIsPanelOpen(true);
    };
  }, [filteredTrains]);

  // Exposer la fonction pour sélectionner un trajet pour le retour
  useEffect(() => {
    (window as any).selectTripForReturn = (trainId: string, cityName: string) => {
      console.log('🚀 selectTripForReturn appelée avec:', { trainId, cityName });
      console.log('🚀 filteredTrains.length:', filteredTrains.length);
      
      const train = filteredTrains.find(t => t.id === trainId);
      console.log('🚀 Train trouvé:', train);
      
      if (train) {
        console.log('✅ Appel de handleTripClick');
        handleTripClick(train, cityName);
      } else {
        console.error('❌ Train non trouvé avec id:', trainId);
        console.log('📋 Trains disponibles:', filteredTrains.map(t => ({ id: t.id, station: t.arrivalStation })));
      }
    };
    
    console.log('🔧 Fonction selectTripForReturn exposée, trains:', filteredTrains.length);
  }, [filteredTrains, handleTripClick]);

  // Fermer le sélecteur de style quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showStyleSelector && !(event.target as Element).closest('.style-selector')) {
        setShowStyleSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showStyleSelector]);

  if (hideHeader) {
    console.log('🗺️ Mode hideHeader activé');
        
    return (
      <div className="w-full h-screen flex flex-col relative">
        <div
          ref={mapRef}
          className="flex-1 w-full z-[1]"
          style={{ minHeight: 'calc(100vh - 120px)', width: '100%' }}
        />
        
        {/* Sélecteur de style de carte */}
        <div className="absolute top-4 right-4 z-[1000] style-selector">
          <button
            onClick={() => setShowStyleSelector(!showStyleSelector)}
            className="relative flex items-center space-x-2 bg-black/8 backdrop-blur-[40px] border border-white/40 rounded-[18px] px-4 py-2.5 text-[14px] font-medium text-gray-900 tracking-tight hover:bg-black/12 transition-all duration-200 shadow-[0_12px_64px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_80px_rgba(0,0,0,0.12)]"
          >
            <span className="hidden sm:inline">Style: {MAP_STYLES.find(s => s.id === currentMapStyle)?.name}</span>
            <span className="sm:hidden">Style</span>
            <svg className={`w-4 h-4 transition-transform duration-200 ${showStyleSelector ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showStyleSelector && (
            <div className="absolute top-full right-0 mt-3 bg-black/8 backdrop-blur-[40px] border border-white/40 rounded-[20px] shadow-[0_12px_64px_rgba(0,0,0,0.08)] z-50 min-w-[280px] overflow-hidden">
              {MAP_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => changeMapStyle(style.id)}
                  className={`w-full px-4 py-3 text-left text-[14px] font-medium transition-all duration-200 hover:bg-white/10 ${
                    currentMapStyle === style.id ? 'bg-white/15 text-blue-600' : 'text-gray-900'
                  }`}
                >
                  {style.name}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Filtres top-centre - temporairement supprimé */}
        
        {/* Panneau latéral droit */}
        <Suspense fallback={null}>
          <RightCityPanel
            cityName={selectedCity || ''}
            trains={selectedCityTrains}
            isOpen={isPanelOpen}
            onClose={() => setIsPanelOpen(false)}
          />
        </Suspense>
      </div>
    );
  }

      

  return (
    <div className="space-y-6">
      {/* Header glassmorphisme */}
      <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">🗺️ Carte Interactive TGVmax</h2>
            <p className="text-gray-600">
              {searchSettings.departureCity} → {searchSettings.selectedDate} • {filteredTrains.length} trajet{filteredTrains.length > 1 ? 's' : ''} trouvé{filteredTrains.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-4 rounded-xl shadow-lg">
            <div className="text-2xl">🚅</div>
          </div>
        </div>

        {/* Stats glassmorphisme */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{filteredTrains.length}</div>
            <div className="text-xs text-gray-600">Trajets</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{filteredTrains.length > 0 ? new Set(filteredTrains.map(t => t.arrivalStation)).size : 0}</div>
            <div className="text-xs text-gray-600">Destinations</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">0€</div>
            <div className="text-xs text-gray-600">Prix moyen</div>
          </div>
        </div>
      </div>

      {/* Loading State glassmorphisme */}
      {loading && (
        <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement des trajets...</p>
        </div>
      )}

      {/* Error State glassmorphisme */}
      {error && (
        <div className="bg-red-50/80 backdrop-blur-xl border border-red-200/30 rounded-2xl p-6 shadow-2xl">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Carte avec glassmorphisme */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-2xl">
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
        {filteredTrains.length > 0 && (
          <div className="mt-6 bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl p-4 text-center">
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

      {/* Modal géré maintenant dans App.tsx */}
    </div>
  );
} 