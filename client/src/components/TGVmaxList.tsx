import React from 'react';
import MacOSCard from './MacOSCard';
import MacOSBadge from './MacOSBadge';
import { TGVmaxDestination, Train } from '../types';

interface TGVmaxListProps {
  destinations: TGVmaxDestination[];
  currentTime: Date;
}

const TGVmaxList: React.FC<TGVmaxListProps> = ({ destinations, currentTime }) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isTrainPast = (departureTime: string) => {
    const departureDate = new Date(departureTime);
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;
    
    const departureHour = departureDate.getHours();
    const departureMinute = departureDate.getMinutes();
    const departureTimeMinutes = departureHour * 60 + departureMinute;
    
    return departureTimeMinutes < currentTimeMinutes;
  };

  const getTrainStatus = (train: Train) => {
    const past = isTrainPast(train.departureTime);
    return {
      isPast: past,
      status: past ? '⏰ Passé' : '✅ Disponible',
      statusClass: past ? 'past-train' : 'future-train'
    };
  };

  return (
    <div className="tgvmax-list">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          📋 Liste de tous les trajets TGVmax
        </h2>
        <p className="text-gray-600">
          {destinations.length} destinations avec trajets disponibles
        </p>
      </div>

      {destinations.map((destination) => (
        <MacOSCard key={destination.id} variant="glass" className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                🏙️ {destination.city}
              </h3>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>📍 {destination.coordinates?.lat.toFixed(4)}, {destination.coordinates?.lng.toFixed(4)}</span>
                <span>🚅 {destination.totalTrains} trains</span>
                <span>✅ {destination.availableTrains} disponibles</span>
              </div>
            </div>
            <div className="flex gap-2">
              <MacOSBadge variant="count" size="medium">
                {destination.outboundTrains.length}
              </MacOSBadge>
              <MacOSBadge variant="text" size="medium">
                {destination.returnTrains.length}
              </MacOSBadge>
            </div>
          </div>

          {/* Trains Aller */}
          {destination.outboundTrains.length > 0 && (
            <div className="mb-4">
              <h4 className="text-lg font-medium text-blue-600 mb-3">
                🔵 Trains Aller (Paris → {destination.city})
              </h4>
              <div className="grid gap-3">
                {destination.outboundTrains.map((train) => {
                  const status = getTrainStatus(train);
                  return (
                    <div 
                      key={train.id} 
                      className={`p-4 rounded-lg border ${
                        status.isPast 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium">{train.trainNumber}</span>
                            <span className={`text-sm px-2 py-1 rounded ${status.statusClass}`}>
                              {status.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Départ:</span>
                              <div className="font-medium">{formatTime(train.departureTime)}</div>
                              <div className="text-xs text-gray-400">{train.departureStation}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Arrivée:</span>
                              <div className="font-medium">{formatTime(train.arrivalTime)}</div>
                              <div className="text-xs text-gray-400">{train.arrivalStation}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Durée:</span>
                              <div className="font-medium">{train.duration}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Voie:</span>
                              <div className="font-medium">{train.platform || 'N/A'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Trains Retour */}
          {destination.returnTrains.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-green-600 mb-3">
                🟢 Trains Retour ({destination.city} → Paris)
              </h4>
              <div className="grid gap-3">
                {destination.returnTrains.map((train) => {
                  const status = getTrainStatus(train);
                  return (
                    <div 
                      key={train.id} 
                      className={`p-4 rounded-lg border ${
                        status.isPast 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-green-50 border-green-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium">{train.trainNumber}</span>
                            <span className={`text-sm px-2 py-1 rounded ${status.statusClass}`}>
                              {status.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Départ:</span>
                              <div className="font-medium">{formatTime(train.departureTime)}</div>
                              <div className="text-xs text-gray-400">{train.departureStation}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Arrivée:</span>
                              <div className="font-medium">{formatTime(train.arrivalTime)}</div>
                              <div className="text-xs text-gray-400">{train.arrivalStation}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Durée:</span>
                              <div className="font-medium">{train.duration}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Voie:</span>
                              <div className="font-medium">{train.platform || 'N/A'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </MacOSCard>
      ))}

      {destinations.length === 0 && (
        <MacOSCard variant="glass-secondary" className="text-center py-12">
          <div className="text-gray-500">
            <div className="text-6xl mb-4">🚅</div>
            <h3 className="text-xl font-semibold mb-2">Aucun trajet trouvé</h3>
            <p>Vérifiez la date sélectionnée ou l'état de l'API</p>
          </div>
        </MacOSCard>
      )}
    </div>
  );
};

export default TGVmaxList; 