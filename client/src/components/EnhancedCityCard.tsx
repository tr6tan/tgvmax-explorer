import React, { useMemo, useState, useCallback } from 'react';
import { Clock, MapPin, Train, Users, TrendingUp, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';
import { TGVmaxDestination, Train as TrainType } from '../types';

interface EnhancedCityCardProps {
  destination: TGVmaxDestination;
  currentTime: Date;
  onCityClick?: (cityName: string) => void;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

const EnhancedCityCard: React.FC<EnhancedCityCardProps> = ({ 
  destination, 
  currentTime, 
  onCityClick,
  isExpanded = false,
  onToggleExpanded 
}) => {
  const [activeTab, setActiveTab] = useState<'outbound' | 'return'>('outbound');

  // Optimisation des calculs avec useMemo
  const processedData = useMemo(() => {
    const isTrainPast = (departureTime: string) => {
      const departureDate = new Date(departureTime);
      return departureDate <= currentTime;
    };

    const sortTrainsByTime = (trains: TrainType[]) => {
      return [...trains].sort((a, b) => {
        const timeA = new Date(a.departureTime).getTime();
        const timeB = new Date(b.departureTime).getTime();
        return timeA - timeB;
      });
    };

    const outboundTrains = sortTrainsByTime(destination.outboundTrains);
    const returnTrains = sortTrainsByTime(destination.returnTrains);

    const availableOutbound = outboundTrains.filter(train => !isTrainPast(train.departureTime));
    const availableReturn = returnTrains.filter(train => !isTrainPast(train.departureTime));

    const nextOutbound = availableOutbound[0];
    const nextReturn = availableReturn[0];

    return {
      outboundTrains,
      returnTrains,
      availableOutbound,
      availableReturn,
      nextOutbound,
      nextReturn,
      totalAvailable: availableOutbound.length + availableReturn.length
    };
  }, [destination, currentTime]);

  const formatTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, []);

  const getTimeUntilDeparture = useCallback((departureTime: string) => {
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
  }, []);

  const getTrainStatus = useCallback((train: TrainType) => {
    const isPast = new Date(train.departureTime) <= currentTime;
    const timeUntil = getTimeUntilDeparture(train.departureTime);
    
    return {
      isPast,
      status: isPast ? 'Passé' : timeUntil,
      statusClass: isPast 
        ? 'bg-red-100 text-red-700 border-red-200' 
        : 'bg-green-100 text-green-700 border-green-200',
      urgency: isPast ? 0 : new Date(train.departureTime).getTime() - currentTime.getTime()
    };
  }, [currentTime, getTimeUntilDeparture]);

  const handleCityClick = useCallback(() => {
    onCityClick?.(destination.city);
  }, [destination.city, onCityClick]);

  return (
    <div className="enhanced-city-card bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header avec informations principales */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              <h3 className="text-xl font-bold text-gray-900">{destination.city}</h3>
              {destination.coordinates && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span>{destination.coordinates.lat.toFixed(3)}, {destination.coordinates.lng.toFixed(3)}</span>
                </div>
              )}
            </div>
            
            {/* Statistiques rapides */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{processedData.totalAvailable}</div>
                <div className="text-gray-500">Disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{processedData.availableOutbound.length}</div>
                <div className="text-gray-500">Aller</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{processedData.availableReturn.length}</div>
                <div className="text-gray-500">Retour</div>
              </div>
            </div>
          </div>
          
          <button
            onClick={onToggleExpanded}
            className="ml-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg 
              className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Prochains départs */}
        <div className="grid grid-cols-2 gap-4">
          {processedData.nextOutbound && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <ArrowRight className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Prochain aller</span>
              </div>
              <div className="text-lg font-bold text-blue-900">
                {formatTime(processedData.nextOutbound.departureTime)}
              </div>
              <div className="text-xs text-blue-600">
                {getTimeUntilDeparture(processedData.nextOutbound.departureTime)}
              </div>
            </div>
          )}
          
          {processedData.nextReturn && (
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <ArrowLeft className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Prochain retour</span>
              </div>
              <div className="text-lg font-bold text-purple-900">
                {formatTime(processedData.nextReturn.departureTime)}
              </div>
              <div className="text-xs text-purple-600">
                {getTimeUntilDeparture(processedData.nextReturn.departureTime)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contenu détaillé (si étendu) */}
      {isExpanded && (
        <div className="p-6">
          {/* Onglets */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setActiveTab('outbound')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'outbound'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Aller ({processedData.outboundTrains.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('return')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'return'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Retour ({processedData.returnTrains.length})
              </div>
            </button>
          </div>

          {/* Liste des trains */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {(activeTab === 'outbound' ? processedData.outboundTrains : processedData.returnTrains).map((train) => {
              const status = getTrainStatus(train);
              return (
                <div
                  key={train.id}
                  className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                    status.isPast
                      ? 'bg-red-50/50 border-red-200/50 opacity-75'
                      : activeTab === 'outbound'
                        ? 'bg-blue-50 border-blue-200 hover:border-blue-300'
                        : 'bg-purple-50 border-purple-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Train className={`w-5 h-5 ${
                        status.isPast ? 'text-red-500' : activeTab === 'outbound' ? 'text-blue-500' : 'text-purple-500'
                      }`} />
                      <span className="font-semibold text-gray-900">{train.trainNumber}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${status.statusClass}`}>
                        {status.status}
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
                      <div className="font-semibold">{formatTime(train.departureTime)}</div>
                      <div className="text-xs text-gray-400">{train.departureStation}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500 mb-1">Durée</div>
                      <div className="font-semibold">{train.duration}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">Arrivée</div>
                      <div className="font-semibold">{formatTime(train.arrivalTime)}</div>
                      <div className="text-xs text-gray-400">{train.arrivalStation}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bouton d'action */}
          <div className="mt-6">
            <button
              onClick={handleCityClick}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Voir sur la carte
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedCityCard;
