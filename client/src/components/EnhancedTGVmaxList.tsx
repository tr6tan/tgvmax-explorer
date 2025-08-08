import React, { useState, useMemo, useCallback } from 'react';
import EnhancedCityCard from './EnhancedCityCard';
import { TGVmaxDestination } from '../types';

interface EnhancedTGVmaxListProps {
  destinations: TGVmaxDestination[];
  currentTime: Date;
  onCityClick?: (cityName: string) => void;
}

const EnhancedTGVmaxList: React.FC<EnhancedTGVmaxListProps> = ({ 
  destinations, 
  currentTime, 
  onCityClick 
}) => {
  const [expandedCities, setExpandedCities] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'available' | 'nextDeparture'>('available');
  const [filterAvailable, setFilterAvailable] = useState(true);

  // Optimisation des calculs avec useMemo
  const processedDestinations = useMemo(() => {
    const processDestination = (destination: TGVmaxDestination) => {
      const isTrainPast = (departureTime: string) => {
        const departureDate = new Date(departureTime);
        return departureDate <= currentTime;
      };

      const availableOutbound = destination.outboundTrains.filter(train => !isTrainPast(train.departureTime));
      const availableReturn = destination.returnTrains.filter(train => !isTrainPast(train.departureTime));
      
      const nextOutbound = availableOutbound[0];
      const nextReturn = availableReturn[0];
      
      const nextDeparture = nextOutbound || nextReturn;
      const nextDepartureTime = nextDeparture ? new Date(nextDeparture.departureTime).getTime() : Infinity;

      return {
        ...destination,
        availableOutbound,
        availableReturn,
        nextOutbound,
        nextReturn,
        nextDepartureTime,
        totalAvailable: availableOutbound.length + availableReturn.length
      };
    };

    let processed = destinations.map(processDestination);

    // Filtrage
    if (filterAvailable) {
      processed = processed.filter(dest => dest.totalAvailable > 0);
    }

    // Tri
    processed.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.city.localeCompare(b.city);
        case 'available':
          return b.totalAvailable - a.totalAvailable;
        case 'nextDeparture':
          return a.nextDepartureTime - b.nextDepartureTime;
        default:
          return 0;
      }
    });

    return processed;
  }, [destinations, currentTime, sortBy, filterAvailable]);

  const toggleExpanded = useCallback((cityName: string) => {
    setExpandedCities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cityName)) {
        newSet.delete(cityName);
      } else {
        newSet.add(cityName);
      }
      return newSet;
    });
  }, []);

  const handleCityClick = useCallback((cityName: string) => {
    onCityClick?.(cityName);
  }, [onCityClick]);

  const stats = useMemo(() => {
    const totalCities = processedDestinations.length;
    const totalAvailable = processedDestinations.reduce((sum, dest) => sum + dest.totalAvailable, 0);
    const citiesWithTrains = processedDestinations.filter(dest => dest.totalAvailable > 0).length;
    
    return { totalCities, totalAvailable, citiesWithTrains };
  }, [processedDestinations]);

  return (
    <div className="enhanced-tgvmax-list">
      {/* Header avec statistiques */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              🚅 Destinations TGVmax
            </h2>
            <p className="text-gray-600">
              {stats.totalCities} villes • {stats.totalAvailable} trajets disponibles
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="filterAvailable"
                checked={filterAvailable}
                onChange={(e) => setFilterAvailable(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="filterAvailable" className="text-sm text-gray-700">
                Trajets disponibles uniquement
              </label>
            </div>
          </div>
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <div className="text-2xl font-bold">{stats.totalCities}</div>
            <div className="text-blue-100">Villes</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
            <div className="text-2xl font-bold">{stats.citiesWithTrains}</div>
            <div className="text-green-100">Avec trajets</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <div className="text-2xl font-bold">{stats.totalAvailable}</div>
            <div className="text-purple-100">Trajets disponibles</div>
          </div>
        </div>

        {/* Contrôles de tri */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm font-medium text-gray-700">Trier par :</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { key: 'available', label: 'Disponibilité', icon: '📊' },
              { key: 'nextDeparture', label: 'Prochain départ', icon: '⏰' },
              { key: 'name', label: 'Nom', icon: '🏙️' }
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setSortBy(key as any)}
                className={`flex items-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  sortBy === key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des destinations */}
      <div className="space-y-6">
        {processedDestinations.length > 0 ? (
          processedDestinations.map((destination) => (
            <EnhancedCityCard
              key={destination.id}
              destination={destination}
              currentTime={currentTime}
              onCityClick={handleCityClick}
              isExpanded={expandedCities.has(destination.city)}
              onToggleExpanded={() => toggleExpanded(destination.city)}
            />
          ))
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🚅</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {filterAvailable ? 'Aucun trajet disponible' : 'Aucune destination trouvée'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {filterAvailable 
                ? 'Aucun trajet disponible pour la date sélectionnée. Essayez une autre date ou vérifiez l\'état de l\'API.'
                : 'Aucune destination trouvée. Vérifiez les paramètres de recherche.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Footer avec informations */}
      {processedDestinations.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            <p>Dernière mise à jour : {currentTime.toLocaleString('fr-FR')}</p>
            <p className="mt-1">
              {expandedCities.size} ville{expandedCities.size > 1 ? 's' : ''} développée{expandedCities.size > 1 ? 's' : ''} sur {processedDestinations.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTGVmaxList;
