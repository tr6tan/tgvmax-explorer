import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface TGVmaxSearchProps {
  departureCity: string;
  selectedDate: string;
  currentTime: Date;
}

interface Train {
  id: string;
  departureStation: string;
  arrivalStation: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  trainNumber: string;
  platform: number;
  price: string;
}

export default function TGVmaxSearch({ departureCity, selectedDate, currentTime }: TGVmaxSearchProps) {
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const searchTrains = async () => {
    try {
      setLoading(true);
      setError(null);
      setApiStatus('idle');

      console.log(`🔍 Recherche TGVmax depuis ${departureCity} pour le ${selectedDate}...`);

      const response = await axios.get(`http://localhost:4000/api/tgvmax/search`, {
        params: {
          from: departureCity,
          date: selectedDate
        }
      });

      if (response.data.success) {
        setTrains(response.data.trains || []);
        setApiStatus('success');
        console.log(`✅ ${response.data.trains?.length || 0} trajets TGVmax trouvés`);
      } else {
        setError('Erreur lors de la récupération des données');
        setApiStatus('error');
      }
    } catch (err) {
      console.error('Erreur TGVmax:', err);
      setError('Impossible de récupérer les données TGVmax');
      setApiStatus('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (departureCity && selectedDate) {
      searchTrains();
    }
  }, [departureCity, selectedDate]);

  const isTrainAvailable = (departureTime: string) => {
    const trainTime = new Date(departureTime);
    return trainTime > currentTime;
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Status Card macOS-style */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">TGVmax API</h2>
            <p className="text-gray-600">
              {departureCity} → {selectedDate}
            </p>
          </div>
          
          <button
            onClick={searchTrains}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium shadow-lg transition-all duration-200 hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Recherche...</span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>Actualiser</span>
              </>
            )}
          </button>
        </div>

        {/* API Status */}
        {apiStatus === 'success' && (
          <div className="mt-4 flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-700 font-medium">
              {trains.length} trajet{trains.length > 1 ? 's' : ''} disponible{trains.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
        {apiStatus === 'error' && (
          <div className="mt-4 flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-red-700 font-medium">Erreur API</span>
          </div>
        )}
      </div>

      {/* Loading State macOS-style */}
      {loading && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-500 mx-auto mb-6"></div>
          <p className="text-gray-600 font-medium text-lg">Recherche des trajets...</p>
        </div>
      )}

      {/* Error State macOS-style */}
      {error && (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-200">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Erreur</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={searchTrains}
            className="px-8 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Empty State macOS-style */}
      {!loading && !error && trains.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🚅</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Aucun trajet</h3>
          <p className="text-gray-600">
            Aucun trajet TGVmax disponible pour cette date
          </p>
        </div>
      )}

      {/* Trains List macOS-style */}
      {!loading && !error && trains.length > 0 && (
        <div className="space-y-4">
          {trains.map((train, index) => (
            <div 
              key={train.id} 
              className={`bg-white rounded-xl p-6 shadow-sm border transition-all duration-200 hover:shadow-md ${
                isTrainAvailable(train.departureTime) 
                  ? 'border-blue-200 hover:border-blue-300' 
                  : 'border-gray-200 opacity-75'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                {/* Train Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-4 h-4 rounded-full ${
                      isTrainAvailable(train.departureTime) ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatTime(train.departureTime)}
                      </span>
                      <span className="text-gray-400 text-xl">→</span>
                      <span className="text-2xl font-bold text-gray-900">
                        {formatTime(train.arrivalTime)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-base text-gray-700">
                      <span className="font-semibold">{train.departureStation}</span>
                      <span className="mx-3">→</span>
                      <span className="font-semibold">{train.arrivalStation}</span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="font-medium">{train.trainNumber}</span>
                      <span>•</span>
                      <span>Durée: {train.duration}</span>
                      <span>•</span>
                      <span>Voie {train.platform}</span>
                    </div>
                  </div>
                </div>
                
                {/* Price */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {train.price}
                  </div>
                  <div className={`text-sm font-medium ${
                    isTrainAvailable(train.departureTime) ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {isTrainAvailable(train.departureTime) ? 'Disponible' : 'Départé'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 