import React from 'react';

interface MapTopFiltersProps {
  filter: 'all' | 'available' | 'departed';
  timeFilter: 'all' | 'morning' | 'afternoon' | 'evening';
  onFilterChange: (filter: 'all' | 'available' | 'departed') => void;
  onTimeFilterChange: (timeFilter: 'all' | 'morning' | 'afternoon' | 'evening') => void;
}

const MapTopFilters: React.FC<MapTopFiltersProps> = ({ 
  filter, 
  timeFilter, 
  onFilterChange, 
  onTimeFilterChange 
}) => {
  return (
    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-[2000]">
      <div className="flex flex-col gap-2">
        {/* Status filter */}
        <div className="flex bg-white/70 backdrop-blur-md border border-white/20 rounded-xl p-1">
          {[
            { key: 'all', label: 'Tous' },
            { key: 'available', label: 'Disponibles' },
            { key: 'departed', label: 'Passés' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onFilterChange(key as any)}
              className={`px-4 py-2 text-[13px] rounded-lg transition-colors ${
                filter === key 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Time filter */}
        <div className="flex bg-white/70 backdrop-blur-md border border-white/20 rounded-xl p-1">
          {[
            { key: 'all', label: 'Tous' },
            { key: 'morning', label: 'Matin' },
            { key: 'afternoon', label: 'AM' },
            { key: 'evening', label: 'Soir' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onTimeFilterChange(key as any)}
              className={`px-3 py-2 text-[12px] rounded-lg transition-colors ${
                timeFilter === key 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapTopFilters;
