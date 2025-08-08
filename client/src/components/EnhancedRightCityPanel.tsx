import React, { useState, useMemo, useCallback } from 'react';
import { X, Clock, Train, MapPin, TrendingUp, Calendar, ArrowRight, ArrowLeft, Filter } from 'lucide-react';

interface Train {
  id: string;
  departureStation: string;
  arrivalStation: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  trainNumber: string;
  platform?: string;
}

interface EnhancedRightCityPanelProps {
  cityName: string;
  trains: Train[];
  isOpen: boolean;
  onClose: () => void;
  cityCoordinates?: { lat: number; lng: number };
}

const EnhancedRightCityPanel: React.FC<EnhancedRightCityPanelProps> = ({ 
  cityName, 
  trains, 
  isOpen, 
  onClose,
  cityCoordinates 
}) => {
  const [filter, setFilter] = useState<'all' | 'available' | 'departed'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [sortBy, setSortBy] = useState<'time' | 'duration'>('time');
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');

  // Optimisation des calculs avec useMemo
  const processedData = useMemo(() => {
    const isTrainAvailable = (departureTime: string) => {
      const trainTime = new Date(departureTime);
      return trainTime > new Date();
    };

    const getTimeOfDay = (timeString: string) => {
      const hour = new Date(timeString).getHours();
      if (hour < 12) return 'morning';
      if (hour < 18) return 'afternoon';
      return 'evening';
    };

    const formatTime = (timeString: string) => {
      return new Date(timeString).toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    };

    const getTimeUntilDeparture = (departureTime: string) => {
      const departure = new Date(departureTime);
      const now = new Date();
      const diffMs = departure.getTime() - now.getTime();
      
      if (diffMs <= 0) return 'Départé';
      
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (diffHours > 0) {
        return `Dans ${diffHours}h${diffMinutes > 0 ? ` ${diffMinutes}min` : ''}`;
      }
      return `Dans ${diffMinutes}min`;
    };

    // Filtrer et traiter les trains
    let filteredTrains = trains.filter(train => {
      const available = filter === 'all' || 
        (filter === 'available' && isTrainAvailable(train.departureTime)) ||
        (filter === 'departed' && !isTrainAvailable(train.departureTime));
      
      const timeMatch = timeFilter === 'all' || getTimeOfDay(train.departureTime) === timeFilter;
      
      return available && timeMatch;
    });

    // Trier les trains
    filteredTrains.sort((a, b) => {
      if (sortBy === 'time') {
        return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
      } else {
        // Trier par durée (extraire les minutes)
        const durationA = parseInt(a.duration.replace('h', '').replace('min', ''));
        const durationB = parseInt(b.duration.replace('h', '').replace('min', ''));
        return durationA - durationB;
      }
    });

    // Calculer les statistiques
    const availableTrains = filteredTrains.filter(train => isTrainAvailable(train.departureTime));
    const nextTrain = availableTrains[0];
    const stats = {
      total: filteredTrains.length,
      available: availableTrains.length,
      departed: filteredTrains.length - availableTrains.length,
      nextDeparture: nextTrain ? formatTime(nextTrain.departureTime) : null,
      timeUntilNext: nextTrain ? getTimeUntilDeparture(nextTrain.departureTime) : null
    };

    return {
      trains: filteredTrains,
      stats,
      formatTime,
      getTimeUntilDeparture,
      isTrainAvailable
    };
  }, [trains, filter, timeFilter, sortBy]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-[400px] bg-white/90 backdrop-blur-md border-l border-white/20 z-[2000] shadow-2xl">
      {/* Header amélioré */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <h2 className="text-xl font-bold">{cityName}</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{processedData.stats.total}</div>
            <div className="text-blue-100 text-sm">Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{processedData.stats.available}</div>
            <div className="text-green-100 text-sm">Disponibles</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{processedData.stats.departed}</div>
            <div className="text-red-100 text-sm">Passés</div>
          </div>
        </div>

        {/* Prochain départ */}
        {processedData.stats.nextDeparture && (
          <div className="mt-4 bg-white/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Prochain départ</span>
            </div>
            <div className="text-lg font-bold">{processedData.stats.nextDeparture}</div>
            <div className="text-sm text-blue-100">{processedData.stats.timeUntilNext}</div>
          </div>
        )}
      </div>

      {/* Contrôles de filtrage */}
      <div className="p-4 border-b border-gray-200">
        <div className="space-y-3">
          {/* Filtres de statut */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { key: 'all', label: 'Tous', count: processedData.stats.total },
              { key: 'available', label: 'Disponibles', count: processedData.stats.available },
              { key: 'departed', label: 'Passés', count: processedData.stats.departed }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  filter === key 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          {/* Filtres de temps */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { key: 'all', label: 'Tous' },
              { key: 'morning', label: 'Matin (6h-12h)' },
              { key: 'afternoon', label: 'AM (12h-18h)' },
              { key: 'evening', label: 'Soir (18h-24h)' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTimeFilter(key as any)}
                className={`flex-1 py-2 px-2 text-xs rounded-md transition-colors ${
                  timeFilter === key 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Contrôles de tri et vue */}
          <div className="flex gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1 flex-1">
              <button
                onClick={() => setSortBy('time')}
                className={`flex-1 py-2 px-3 text-xs rounded-md transition-colors ${
                  sortBy === 'time' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600'
                }`}
              >
                ⏰ Par heure
              </button>
              <button
                onClick={() => setSortBy('duration')}
                className={`flex-1 py-2 px-3 text-xs rounded-md transition-colors ${
                  sortBy === 'duration' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600'
                }`}
              >
                ⏱️ Par durée
              </button>
            </div>
            
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`py-2 px-3 text-xs rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600'
                }`}
              >
                📋 Liste
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`py-2 px-3 text-xs rounded-md transition-colors ${
                  viewMode === 'timeline' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600'
                }`}
              >
                📊 Timeline
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des trains */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {processedData.trains.length > 0 ? (
            processedData.trains.map((train) => {
              const isAvailable = processedData.isTrainAvailable(train.departureTime);
              const timeUntil = processedData.getTimeUntilDeparture(train.departureTime);
              
              return (
                <div
                  key={train.id}
                  className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                    isAvailable
                      ? 'bg-white/80 border-blue-200 hover:border-blue-300'
                      : 'bg-red-50/50 border-red-200 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Train className={`w-5 h-5 ${
                        isAvailable ? 'text-blue-500' : 'text-red-500'
                      }`} />
                      <span className="font-semibold text-gray-900">{train.trainNumber}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isAvailable 
                          ? 'bg-green-100 text-green-700 border-green-200' 
                          : 'bg-red-100 text-red-700 border-red-200'
                      }`}>
                        {isAvailable ? timeUntil : 'Passé'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Voie</div>
                      <div className="font-medium">{train.platform || '--'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500 mb-1">Départ</div>
                      <div className="font-semibold">{processedData.formatTime(train.departureTime)}</div>
                      <div className="text-xs text-gray-400">{train.departureStation}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500 mb-1">Durée</div>
                      <div className="font-semibold">{train.duration}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">Arrivée</div>
                      <div className="font-semibold">{processedData.formatTime(train.arrivalTime)}</div>
                      <div className="text-xs text-gray-400">{train.arrivalStation}</div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🚅</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun trajet trouvé</h3>
              <p className="text-gray-600 text-sm">Essayez de modifier les filtres</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer avec informations */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-center text-sm text-gray-500">
          <p>{processedData.trains.length} trajet{processedData.trains.length > 1 ? 's' : ''} trouvé{processedData.trains.length > 1 ? 's' : ''}</p>
          {cityCoordinates && (
            <p className="mt-1 text-xs">
              📍 {cityCoordinates.lat.toFixed(4)}, {cityCoordinates.lng.toFixed(4)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedRightCityPanel;
