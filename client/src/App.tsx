import React, { useState, useEffect, useCallback } from 'react';
import TGVmaxMap from './components/TGVmaxMap';
import SearchSettingsDock from './components/SearchSettingsDock';
import StatsOverlay from './components/StatsOverlay';
import OptimizedLoadingSpinner from './components/OptimizedLoadingSpinner';
import { useTGVmaxData } from './hooks/useOptimizedDataFetching';
import './styles/macos-design-system.css';
import { MapStats } from './types';

interface SearchSettings {
  departureCity: string;
  selectedDate: string;
}

function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSettingsDock, setShowSettingsDock] = useState(true);
  const [searchSettings, setSearchSettings] = useState<SearchSettings>(() => {
    // Définir la date par défaut à aujourd'hui
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    
    return {
      departureCity: 'Paris',
      selectedDate: todayString,
    };
  });
  const [mapStats, setMapStats] = useState<MapStats>({
    trainsCount: 0,
    destinationsCount: 0,
    lastUpdated: '',
  });
  const [mapLoading, setMapLoading] = useState(false);

  // Utilisation du hook optimisé pour les données TGVmax
  const { 
    data: trains, 
    loading: dataLoading, 
    error: dataError, 
    refetch: refetchData, 
    progress 
  } = useTGVmaxData(searchSettings.selectedDate);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Log des données récupérées
  useEffect(() => {
    if (trains && trains.length > 0) {
      console.log(`✅ ${trains.length} trains récupérés pour le ${searchSettings.selectedDate}`);
      console.log('Trains disponibles:', trains);
    } else if (!dataLoading && !dataError) {
      console.warn(`⚠️ Aucun train trouvé pour le ${searchSettings.selectedDate}`);
    }
  }, [trains, dataLoading, dataError, searchSettings.selectedDate]);

  const handleSettingsChange = useCallback((newSettings: SearchSettings) => {
    console.log(`🔄 Changement de paramètres: date=${newSettings.selectedDate}, ville=${newSettings.departureCity}`);
    setSearchSettings(newSettings);
  }, []);

  const handleMapStats = useCallback((stats: MapStats) => {
    setMapStats(stats);
  }, []);

  const handleMapLoadingChange = useCallback((loading: boolean) => {
    setMapLoading(loading);
  }, []);

  // Affichage de l'état de chargement des données - seulement au premier chargement
  if (dataLoading && !trains) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <OptimizedLoadingSpinner 
            size="large" 
            variant="progress" 
            progress={progress}
            showProgress={true}
            text="Chargement des données TGVmax..."
          />
          <div className="mt-4 text-gray-600">
            Récupération des données pour le {new Date(searchSettings.selectedDate).toLocaleDateString('fr-FR')}
          </div>
        </div>
      </div>
    );
  }

  // Affichage des erreurs de données
  if (dataError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur de récupération des données</h2>
          <p className="text-gray-600 mb-6">{dataError.message}</p>
          <button
            onClick={refetchData}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Affichage si aucune donnée - seulement si pas de trains et pas en cours de chargement
  if (!trains || trains.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Aucune donnée disponible</h2>
          <p className="text-gray-600 mb-6">
            Aucun trajet TGVmax n'a été trouvé pour le {new Date(searchSettings.selectedDate).toLocaleDateString('fr-FR')}
          </p>
          <div className="space-y-4">
            <button
              onClick={refetchData}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Réessayer
            </button>
            <div className="text-sm text-gray-500">
              Vérifiez que la date sélectionnée est correcte
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* macOS-style Window */}
      <div className="max-w-full mx-auto bg-white h-full shadow-2xl relative flex flex-col">
        {/* macOS Title Bar */}
        <div className="bg-gray-100 border-b border-gray-200 px-6 py-3 flex items-center justify-between z-[1000] flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="text-sm text-gray-600 font-medium">TGV-max-app</div>
          <div className="w-20"></div>
        </div>

        {/* Main content area */}
        <div className="flex-1 relative" style={{ height: 'calc(100vh - 120px)' }}>
          {/* Full-screen Map */}
          <TGVmaxMap
            searchSettings={searchSettings}
            currentTime={currentTime}
            apiType="tgvmax"
            onStats={handleMapStats}
            onLoadingChange={handleMapLoadingChange}
            hideHeader={true}
          />

          {/* Search Settings Dock */}
          {showSettingsDock && (
            <SearchSettingsDock
              initialSettings={searchSettings}
              onSettingsChange={handleSettingsChange}
              onClose={() => setShowSettingsDock(false)}
            />
          )}




        </div>

        {/* Footer macOS-style */}
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 sm:px-8 sm:py-6 z-[1000] flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-600 space-y-2 sm:space-y-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <span>🚅 TGVmax Explorer</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-xs sm:text-sm">MAJ: {mapStats.lastUpdated ? new Date(mapStats.lastUpdated).toLocaleTimeString('fr-FR') : '--'}</span>
              <span className="hidden sm:inline">•</span>
              <span>{trains.length} trains</span>
              {dataLoading && trains && trains.length > 0 && (
                <span className="text-blue-600 text-xs sm:text-sm">🔄 Actualisation...</span>
              )}
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}

export default App; 