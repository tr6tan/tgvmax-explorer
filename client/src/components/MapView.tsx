import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Destination } from '../types';

interface MapViewProps {
  destinations: Destination[];
}

const MapView: React.FC<MapViewProps> = ({ destinations }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialiser la carte
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([46.603354, 1.888334], 6);
      
      // Ajouter la couche de tuiles OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    // Nettoyer les marqueurs existants
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Ajouter les nouveaux marqueurs
    destinations.forEach((destination, index) => {
      if (destination.coordinates) {
        const marker = L.marker([destination.coordinates.lat, destination.coordinates.lng])
          .addTo(mapInstanceRef.current!)
          .bindPopup(createPopupContent(destination, index));

        markersRef.current.push(marker);
      }
    });

    // Ajuster la vue si des destinations sont présentes
    if (destinations.length > 0 && destinations.some(d => d.coordinates)) {
      const coordinates = destinations
        .filter(d => d.coordinates)
        .map(d => [d.coordinates!.lat, d.coordinates!.lng]);

      if (coordinates.length > 0) {
        const bounds = L.latLngBounds(coordinates as [number, number][]);
        mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
      }
    }

    return () => {
      // Nettoyer les marqueurs lors du démontage
      markersRef.current.forEach(marker => marker.remove());
    };
  }, [destinations]);

  const createPopupContent = (destination: Destination, index: number) => {
    const div = document.createElement('div');
    div.className = 'p-2';
    div.innerHTML = `
      <div class="text-center">
        <h3 class="font-bold text-lg mb-2">${destination.city}</h3>
        <div class="text-sm text-gray-600 mb-2">
          <div>Aller: ${destination.outbound.departureTime} → ${destination.outbound.arrivalTime}</div>
          <div>Retour: ${destination.return.departureTime} → ${destination.return.arrivalTime}</div>
          <div class="font-medium mt-1">Séjour: ${destination.stayDuration}</div>
        </div>
        ${destination.weather ? `
          <div class="flex items-center justify-center space-x-2">
            <img src="https://openweathermap.org/img/wn/${destination.weather.icon}.png" alt="${destination.weather.description}" class="w-8 h-8" />
            <span class="text-sm">${destination.weather.temperature}°C</span>
          </div>
        ` : ''}
        <button 
          onclick="window.showDestinationDetails(${index})"
          class="mt-2 bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700 transition-colors"
        >
          Voir détails
        </button>
      </div>
    `;
    return div;
  };

  // Exposer la fonction pour les popups
  useEffect(() => {
    (window as any).showDestinationDetails = (index: number) => {
      const destination = destinations[index];
      if (destination) {
        // Ici on pourrait ouvrir une modal avec les détails
        console.log('Détails de la destination:', destination);
      }
    };
  }, [destinations]);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Carte des destinations
        </h3>
        <p className="text-sm text-gray-600">
          Cliquez sur les marqueurs pour voir les détails des trajets
        </p>
      </div>
      
      <div className="relative">
        <div 
          ref={mapRef} 
          className="h-96 w-full"
          style={{ minHeight: '400px' }}
        />
        
        {/* Légende */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 text-sm">
          <div className="font-medium mb-2">Légende</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-primary-600 rounded-full"></div>
              <span>Destination TGVmax</span>
            </div>
            <div className="text-xs text-gray-500">
              {destinations.length} destination{destinations.length > 1 ? 's' : ''} trouvée{destinations.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView; 