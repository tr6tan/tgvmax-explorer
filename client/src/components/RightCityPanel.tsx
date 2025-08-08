import React, { useState } from 'react';

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

interface RightCityPanelProps {
  cityName: string;
  trains: Train[];
  isOpen: boolean;
  onClose: () => void;
}

const RightCityPanel: React.FC<RightCityPanelProps> = ({ cityName, trains, isOpen, onClose }) => {
  const [filter, setFilter] = useState<'all' | 'available' | 'departed'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

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

  const filteredTrains = trains.filter(train => {
    // Toujours exclure les trains qui sont déjà partis
    if (!isTrainAvailable(train.departureTime)) {
      return false;
    }
    
    const available = filter === 'all' || 
      (filter === 'available' && isTrainAvailable(train.departureTime)) ||
      (filter === 'departed' && !isTrainAvailable(train.departureTime));
    
    const timeMatch = timeFilter === 'all' || getTimeOfDay(train.departureTime) === timeFilter;
    
    return available && timeMatch;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-[320px] bg-white/70 backdrop-blur-md border-l border-white/20 z-[2000]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        <h2 className="text-[16px] font-semibold text-gray-900">{cityName}</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 space-y-3">
        {/* Status filter */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'Tous' },
            { key: 'available', label: 'Disponibles' },
            { key: 'departed', label: 'Passés' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`flex-1 py-2 px-3 text-[13px] rounded-md transition-colors ${
                filter === key 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Time filter */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'Tous' },
            { key: 'morning', label: 'Matin' },
            { key: 'afternoon', label: 'AM' },
            { key: 'evening', label: 'Soir' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTimeFilter(key as any)}
              className={`flex-1 py-2 px-2 text-[12px] rounded-md transition-colors ${
                timeFilter === key 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Trains list */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {filteredTrains.length > 0 ? (
            filteredTrains.map((train) => (
                             <div
                 key={train.id}
                 className={`p-3 rounded-xl border transition-colors ${
                   isTrainAvailable(train.departureTime)
                     ? 'bg-white/50 border-blue-200'
                     : 'bg-red-50/50 border-red-200 opacity-75'
                 }`}
               >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-[15px] font-medium text-gray-900">
                      {formatTime(train.departureTime)}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="text-[15px] font-medium text-gray-900">
                      {formatTime(train.arrivalTime)}
                    </span>
                  </div>
                  <span className="text-[12px] text-gray-500">{train.trainNumber}</span>
                </div>
                
                <div className="flex items-center justify-between text-[13px] text-gray-600">
                  <span>{train.duration}</span>
                  <span>Voie {train.platform || '--'}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-[14px]">Aucun trajet trouvé</div>
              <div className="text-[12px] mt-1">Essayez de modifier les filtres</div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/20">
        <div className="text-[12px] text-gray-500 text-center">
          {filteredTrains.length} trajet{filteredTrains.length > 1 ? 's' : ''} trouvé{filteredTrains.length > 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};

export default RightCityPanel;
