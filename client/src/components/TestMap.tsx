import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Corriger les icônes Leaflet par défaut
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default function TestMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    console.log('🧪 Test Map - Initialisation...');
    console.log('mapRef.current:', mapRef.current);
    console.log('mapInstanceRef.current:', mapInstanceRef.current);

    if (!mapRef.current || mapInstanceRef.current) {
      console.log('❌ mapRef.current est null ou carte déjà initialisée');
      return;
    }

    try {
      console.log('✅ Création de la carte de test...');
      const map = L.map(mapRef.current).setView([48.8566, 2.3522], 10);
      console.log('✅ Carte créée:', map);
      
      mapInstanceRef.current = map;

      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      console.log('✅ Tile layer ajoutée:', tileLayer);

      // Ajouter un marqueur de test
      const marker = L.marker([48.8566, 2.3522]).addTo(map);
      marker.bindPopup('Paris - Test réussi !');
      console.log('✅ Marqueur de test ajouté:', marker);

      // Forcer un refresh
      setTimeout(() => {
        if (mapInstanceRef.current) {
          console.log('🔄 Invalidation de la taille...');
          mapInstanceRef.current.invalidateSize();
          console.log('✅ Taille invalidée');
        }
      }, 100);

    } catch (error) {
      console.error('❌ Erreur dans TestMap:', error);
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        console.log('🧹 Nettoyage de la carte de test...');
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Test Carte Leaflet</h2>
      <div 
        ref={mapRef} 
        style={{ 
          height: '400px', 
          width: '100%',
          border: '2px solid #ccc',
          borderRadius: '8px'
        }}
      />
      <p className="mt-4 text-gray-600">Si vous voyez une carte avec Paris, Leaflet fonctionne !</p>
    </div>
  );
} 