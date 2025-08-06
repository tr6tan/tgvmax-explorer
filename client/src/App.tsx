import React, { useState, useEffect } from 'react';
import TGVmaxSearch from './components/TGVmaxSearch';
import TGVmaxMap from './components/TGVmaxMap';
import './styles/macos-design-system.css';

function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [departureCity, setDepartureCity] = useState('Paris');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Mettre à jour l'heure toutes les minutes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const cities = [
    'Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Nantes', 'Toulouse', 
    'Lille', 'Strasbourg', 'Nice', 'Montpellier', 'Rennes', 'Reims'
  ];

  const quickDates = [
    { label: "Aujourd'hui", value: new Date().toISOString().split('T')[0] },
    { label: "Demain", value: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    { label: "Ce weekend", value: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    { label: "Semaine prochaine", value: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* macOS-style Window */}
      <div className="max-w-6xl mx-auto bg-white min-h-screen shadow-2xl">
        {/* macOS Title Bar */}
        <div className="bg-gray-100 border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-sm text-gray-600 ml-4">TGVmax Explorer</span>
          </div>
          <div className="text-sm text-gray-500">
            {currentTime.toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>

        {/* Header macOS-style */}
        <div className="bg-white px-8 py-8 border-b border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">TGVmax Explorer</h1>
              <p className="text-gray-600 text-lg">Recherche intelligente de trajets à 0€</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">🚅</span>
            </div>
          </div>
          
          {/* Configuration Cards macOS-style */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ville de départ */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                🚉 Ville de départ
              </label>
              <select
                value={departureCity}
                onChange={(e) => setDepartureCity(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            
            {/* Date de voyage avec actions rapides */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                📅 Date de voyage
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
              />
              
              {/* Actions rapides */}
              <div className="mt-3 flex flex-wrap gap-2">
                {quickDates.map((date) => (
                  <button
                    key={date.label}
                    onClick={() => setSelectedDate(date.value)}
                    className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                      selectedDate === date.value
                        ? 'bg-purple-500 text-white'
                        : 'bg-white text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    {date.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Statistiques rapides */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                📊 Statistiques
              </label>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Trajets trouvés:</span>
                  <span className="font-semibold text-green-600">--</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Places disponibles:</span>
                  <span className="font-semibold text-green-600">--</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Prix moyen:</span>
                  <span className="font-semibold text-green-600">0€</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Vue Liste/Carte avec actions */}
        <div className="bg-white px-8 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="bg-gray-50 rounded-lg p-2 flex">
              <button
                onClick={() => setViewMode('list')}
                className={`px-6 py-3 rounded-md font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <span>📋</span>
                <span>Liste</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-6 py-3 rounded-md font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                  viewMode === 'map'
                    ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <span>🗺️</span>
                <span>Carte</span>
              </button>
            </div>

            {/* Actions rapides */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                ⚡ Actions rapides
              </button>
              
              {showQuickActions && (
                <div className="absolute right-8 top-20 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-10">
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-md">
                      🔄 Actualiser les données
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-md">
                      ⭐ Marquer comme favori
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-md">
                      📱 Partager
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Contenu principal */}
        <main className="px-8 pb-8">
          {viewMode === 'list' ? (
            // Mode Liste
            <TGVmaxSearch 
              departureCity={departureCity}
              selectedDate={selectedDate}
              currentTime={currentTime}
            />
          ) : (
            // Mode Carte
            <TGVmaxMap 
              departureCity={departureCity}
              selectedDate={selectedDate}
              currentTime={currentTime}
              apiType="tgvmax"
            />
          )}
        </main>

        {/* Footer macOS-style */}
        <div className="bg-gray-50 border-t border-gray-200 px-8 py-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 font-medium">
              TGVmax Explorer • Trajets à 0€ • Design macOS • UX Moderne
            </p>
            <p className="text-xs text-gray-500 mt-2">
              API TGVmax • Recherche intelligente • Actions rapides • Mise à jour automatique
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 