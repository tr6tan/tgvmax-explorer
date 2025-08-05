import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Clock } from 'lucide-react';
import { SearchParams, Station } from '../types';
import MacOSButton from './MacOSButton';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  loading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, loading }) => {
  const [departureStation, setDepartureStation] = useState('');
  const [date, setDate] = useState('');
  const [minDuration, setMinDuration] = useState(2);
  const [stations, setStations] = useState<Station[]>([]);
  const [suggestions, setSuggestions] = useState<Station[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    // Charger les gares au montage
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const response = await fetch('/api/stations');
      const data = await response.json();
      if (data.success) {
        setStations(data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des gares:', error);
    }
  };

  const handleStationChange = (value: string) => {
    setDepartureStation(value);
    
    if (value.length > 2) {
      const filtered = stations.filter(station =>
        station.name.toLowerCase().includes(value.toLowerCase()) ||
        station.city.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleStationSelect = (station: Station) => {
    setDepartureStation(station.name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!departureStation || !date) {
      return;
    }

    onSearch({
      departureStation,
      date,
      minDuration
    });
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Gare de départ */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🚉 Gare de départ
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={departureStation}
                onChange={(e) => handleStationChange(e.target.value)}
                placeholder="Ex: Paris Gare de Lyon"
                className="macos-input w-full pl-10 pr-4 py-3"
                required
              />
            </div>
            
            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                {suggestions.map((station) => (
                  <button
                    key={station.code}
                    type="button"
                    onClick={() => handleStationSelect(station)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  >
                    <div className="font-medium">{station.name}</div>
                    <div className="text-sm text-gray-500">{station.city}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📅 Date de voyage
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={getMinDate()}
                className="macos-input w-full pl-10 pr-4 py-3"
                required
              />
            </div>
          </div>

          {/* Durée minimale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ⏱️ Durée minimale sur place
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={minDuration}
                onChange={(e) => setMinDuration(Number(e.target.value))}
                className="macos-input w-full pl-10 pr-4 py-3"
              >
                <option value={1}>1 heure</option>
                <option value={2}>2 heures</option>
                <option value={3}>3 heures</option>
                <option value={4}>4 heures</option>
                <option value={6}>6 heures</option>
                <option value={8}>8 heures</option>
              </select>
            </div>
          </div>

          {/* Bouton de recherche */}
          <div className="flex items-end">
            <MacOSButton
              type="submit"
              variant="primary"
              size="large"
              disabled={loading || !departureStation || !date}
              className="w-full"
            >
              {loading ? (
                <>
                  <div className="loading-spinner w-5 h-5"></div>
                  <span>Recherche...</span>
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  <span>Rechercher</span>
                </>
              )}
            </MacOSButton>
          </div>
        </div>
      </form>

      {/* Informations */}
      <div className="macos-glass-secondary mt-6 p-4 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-medium">ℹ️</span>
            </div>
          </div>
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-1">Comment ça marche ?</p>
            <p>
              Indiquez votre gare de départ, la date de voyage et la durée minimale souhaitée sur place. 
              L'application vous proposera toutes les destinations accessibles en aller-retour sur la journée avec TGVmax.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchForm; 