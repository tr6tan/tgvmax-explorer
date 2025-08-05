import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TGVmaxSearch from './components/TGVmaxSearch';
import OUISncfSearch from './components/OUISncfSearch';
import TGVmaxMap from './components/TGVmaxMap';
import './styles/macos-design-system.css';

function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'tgvmax' | 'ouisncf'>('tgvmax');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [departureCity, setDepartureCity] = useState('Paris');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* macOS-style Window */}
      <div className="max-w-4xl mx-auto bg-white min-h-screen shadow-2xl">
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">TGVmax Explorer</h1>
              <p className="text-gray-600">Recherche de trajets à 0€ avec TGVmax</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">🚅</span>
            </div>
          </div>
          
          {/* Configuration Cards macOS-style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ville de départ */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Ville de départ
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
            
            {/* Date de voyage */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Date de voyage
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>
        </div>
        
        {/* Navigation des onglets API macOS-style */}
        <div className="bg-white px-8 py-6 border-b border-gray-100">
          <div className="bg-gray-100 rounded-xl p-2 flex">
            <button
              onClick={() => setActiveTab('tgvmax')}
              className={`flex-1 py-4 px-6 rounded-lg font-semibold text-sm transition-all duration-200 ${
                activeTab === 'tgvmax'
                  ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              TGVmax API
            </button>
            <button
              onClick={() => setActiveTab('ouisncf')}
              className={`flex-1 py-4 px-6 rounded-lg font-semibold text-sm transition-all duration-200 ${
                activeTab === 'ouisncf'
                  ? 'bg-white text-purple-600 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              OUI.sncf API
            </button>
          </div>
        </div>

        {/* Navigation Vue Liste/Carte */}
        <div className="bg-white px-8 py-4 border-b border-gray-100">
          <div className="bg-gray-50 rounded-lg p-2 flex w-fit">
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
        </div>
        
        {/* Contenu principal */}
        <main className="px-8 pb-8">
          {viewMode === 'list' ? (
            // Mode Liste
            activeTab === 'tgvmax' ? (
              <TGVmaxSearch 
                departureCity={departureCity}
                selectedDate={selectedDate}
                currentTime={currentTime}
              />
            ) : (
              <OUISncfSearch 
                departureCity={departureCity}
                selectedDate={selectedDate}
                currentTime={currentTime}
              />
            )
          ) : (
            // Mode Carte
            <TGVmaxMap 
              departureCity={departureCity}
              selectedDate={selectedDate}
              currentTime={currentTime}
              apiType={activeTab}
            />
          )}
        </main>

        {/* Footer macOS-style */}
        <div className="bg-gray-50 border-t border-gray-200 px-8 py-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 font-medium">
              TGVmax Explorer • Trajets à 0€ • Design macOS
            </p>
            <p className="text-xs text-gray-500 mt-2">
              API TGVmax • API OUI.sncf • Mise à jour automatique
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 