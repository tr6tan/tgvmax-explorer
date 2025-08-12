import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import OptimizedLoadingSpinner from './components/OptimizedLoadingSpinner';
import { useTGVmaxData } from './hooks/useOptimizedDataFetching';
import './styles/macos-design-system.css';
import { MapStats } from './types';

// Lazy-loaded heavy components
const TGVmaxMap = lazy(() => import('./components/TGVmaxMap'));
const SearchSettingsDock = lazy(() => import('./components/SearchSettingsDock'));
const ReturnTripModal = lazy(() => import('./components/ReturnTripModal'));

interface SearchSettings {
  departureCity: string;
  selectedDate: string;
  destinationCity?: string;
  requireReturnWithin3Days?: boolean;
  returnDays?: number[];
}

function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSettingsDock, setShowSettingsDock] = useState(true);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedOutboundTrip, setSelectedOutboundTrip] = useState<any>(null);
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
      requireReturnWithin3Days: false,
      returnDays: [0,1,2,3],
    };
  });
  const [mapStats, setMapStats] = useState<MapStats>({
    trainsCount: 0,
    destinationsCount: 0,
    lastUpdated: '',
  });
  // const [mapLoading, setMapLoading] = useState(false);

  // Utilisation du hook optimisé pour les données TGVmax
  const { 
    data: trains, 
    loading: dataLoading, 
    error: dataError, 
    refetch: refetchData, 
    progress 
  } = useTGVmaxData(
    searchSettings.selectedDate,
    searchSettings.departureCity,
    { 
      requireReturnWithin3Days: !!searchSettings.requireReturnWithin3Days,
      returnDays: searchSettings.returnDays
    }
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Log des changements de settings
  useEffect(() => {
    console.log(`📝 SearchSettings updated:`, {
      date: searchSettings.selectedDate,
      departureCity: searchSettings.departureCity,
      destinationCity: searchSettings.destinationCity
    });
  }, [searchSettings]);

  // Log des données récupérées
  useEffect(() => {
    if (trains && trains.length > 0) {
      console.log(`✅ ${trains.length} trains récupérés pour le ${searchSettings.selectedDate} depuis ${searchSettings.departureCity}`);
      console.log('Trains disponibles:', trains.slice(0, 3)); // Log que les 3 premiers pour pas spam
    } else if (!dataLoading && !dataError) {
      console.warn(`⚠️ Aucun train trouvé pour le ${searchSettings.selectedDate} depuis ${searchSettings.departureCity}`);
    }
  }, [trains, dataLoading, dataError, searchSettings.selectedDate, searchSettings.departureCity]);

  // Log spécifique pour les changements de date
  useEffect(() => {
    console.log(`📅 Date changée: ${searchSettings.selectedDate} - Déclenchement de la recherche de trains`);
  }, [searchSettings.selectedDate]);

  // Supprimer le useEffect qui cause la boucle infinie
  // Le hook useTGVmaxData gère déjà automatiquement les changements de date

  const handleSettingsChange = useCallback((newSettings: SearchSettings) => {
    console.log(`🔄 Changement de paramètres:`, {
      ancienneDate: searchSettings.selectedDate,
      nouvelleDate: newSettings.selectedDate,
      ancienneVille: searchSettings.departureCity,
      nouvelleVille: newSettings.departureCity,
      changeDetected: {
        date: searchSettings.selectedDate !== newSettings.selectedDate,
        ville: searchSettings.departureCity !== newSettings.departureCity
      }
    });
    setSearchSettings(newSettings);
  }, [searchSettings]);

  const handleMapStats = useCallback((stats: MapStats) => {
    setMapStats(stats);
  }, []);

  // const handleMapLoadingChange = useCallback((loading: boolean) => {
  //   setMapLoading(loading);
  // }, []);

  const handleTripSelection = useCallback((trip: any) => {
    console.log('🚅 Trajet sélectionné dans App:', trip);
    setSelectedOutboundTrip(trip);
    setIsReturnModalOpen(true);
  }, []);

  const handleReturnTripSearch = useCallback((returnDate: string) => {
    console.log('🔍 Recherche retour pour le:', returnDate);
    // TODO: Implémenter la recherche de retour
    setIsReturnModalOpen(false);
  }, []);

  const handleTripSave = useCallback((outbound: any, returnDate: string) => {
    console.log('✅ Trajet aller + retour sauvegardé:', { outbound, returnDate });
    // TODO: Implémenter la sauvegarde
    setIsReturnModalOpen(false);
  }, []);

  // Calcul pour la barre de chargement des trains affichés sur la carte
  const totalTrainsCount = Array.isArray(trains) ? trains.length : 0;
  const displayedTrainsCount = mapStats.trainsCount || 0;
  const displayedRatio = totalTrainsCount > 0 ? Math.min(100, Math.round((displayedTrainsCount / totalTrainsCount) * 100)) : 0;
  const returnFilterActive = !!searchSettings.requireReturnWithin3Days;

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
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <OptimizedLoadingSpinner size="large" variant="progress" text="Chargement de la carte..." />
              </div>
            }
          >
            <TGVmaxMap
              searchSettings={searchSettings}
              currentTime={currentTime}
              apiType="tgvmax"
              trains={trains}
              onStats={handleMapStats}
                                  // onLoadingChange={handleMapLoadingChange}
              onTripSelection={handleTripSelection}
              hideHeader={true}
            />
          </Suspense>

          {/* Search Settings Dock */}
          {showSettingsDock && (
            <Suspense fallback={null}>
              <SearchSettingsDock
                initialSettings={searchSettings}
                onSettingsChange={handleSettingsChange}
                onClose={() => setShowSettingsDock(false)}
              />
            </Suspense>
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
              <span>{totalTrainsCount} trains</span>
              {returnFilterActive && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    retour ≤ 3j
                  </span>
                </>
              )}
              {/* Barre de chargement des trains affichés sur la carte */}
              {totalTrainsCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden border border-gray-200/60">
                    <div
                      className={`h-full ${dataLoading ? 'bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse' : 'bg-blue-600'}`}
                      style={{ width: `${displayedRatio}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-gray-500 whitespace-nowrap">{displayedTrainsCount}/{totalTrainsCount}</span>
                </div>
              )}
              {dataLoading && (
                <span className="text-blue-600 text-xs sm:text-sm">🔄 Actualisation...</span>
              )}
            </div>
          </div>
        </div>


      </div>

      {/* Modal de retour au niveau racine */}
      <Suspense fallback={null}>
        <ReturnTripModal
          isOpen={isReturnModalOpen}
          onClose={() => setIsReturnModalOpen(false)}
          selectedTrip={selectedOutboundTrip}
          onReturnTripSearch={handleReturnTripSearch}
          onTripSave={handleTripSave}
        />
      </Suspense>
    </div>
  );
}

export default App; 