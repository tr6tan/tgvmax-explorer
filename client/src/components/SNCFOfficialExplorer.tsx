import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';
import axios from 'axios';

interface SNCFOfficialExplorerProps {
  departureCity: string;
  selectedDate: string;
  currentTime: Date;
}

interface Journey {
  id: string;
  departureStation: string;
  arrivalStation: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  trainNumber: string;
  platform: string;
  price: string;
  source: string;
  sections?: number;
  transfers?: number;
}

interface Departure {
  id: string;
  station: string;
  departureTime: string;
  arrivalTime: string;
  line: string;
  direction: string;
  trainNumber: string;
  platform: string;
  price: string;
  source: string;
}

export default function SNCFOfficialExplorer({ departureCity, selectedDate, currentTime }: SNCFOfficialExplorerProps) {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'journeys' | 'departures'>('journeys');

  const fetchJourneys = async () => {
    setLoading(true);
    setError(null);
    try {
              const response = await axios.get(API_ENDPOINTS.SNCF_OFFICIAL_JOURNEYS, {
        params: {
          from: departureCity,
          to: 'Lyon',
          date: selectedDate,
          time: '080000'
        }
      });

      if (response.data.success) {
        setJourneys(response.data.journeys || []);
        console.log(`✅ ${response.data.journeys?.length || 0} itinéraires trouvés`);
      } else {
        setError('Erreur lors de la récupération des itinéraires');
      }
    } catch (err) {
      console.error('Erreur API SNCF officielle:', err);
      setError('Erreur lors de la récupération des itinéraires');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartures = async () => {
    setLoading(true);
    setError(null);
    try {
              const response = await axios.get(API_ENDPOINTS.SNCF_OFFICIAL_DEPARTURES, {
        params: {
          station: 'Montparnasse',
          date: selectedDate,
          time: '080000'
        }
      });

      if (response.data.success) {
        setDepartures(response.data.departures || []);
        console.log(`✅ ${response.data.departures?.length || 0} départs trouvés`);
      } else {
        setError('Erreur lors de la récupération des départs');
      }
    } catch (err) {
      console.error('Erreur API SNCF officielle:', err);
      setError('Erreur lors de la récupération des départs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (departureCity && selectedDate) {
      if (activeTab === 'journeys') {
        fetchJourneys();
      } else {
        fetchDepartures();
      }
    }
  }, [departureCity, selectedDate, activeTab]);

  return (
    <div className="space-y-6">
      {/* Navigation des onglets */}
      <div className="bg-gray-100 rounded-xl p-2 flex">
        <button
          onClick={() => setActiveTab('journeys')}
          className={`flex-1 py-4 px-6 rounded-lg font-semibold text-sm transition-all duration-200 ${
            activeTab === 'journeys'
              ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🚄 Itinéraires
        </button>
        <button
          onClick={() => setActiveTab('departures')}
          className={`flex-1 py-4 px-6 rounded-lg font-semibold text-sm transition-all duration-200 ${
            activeTab === 'departures'
              ? 'bg-white text-purple-600 shadow-sm border border-gray-200'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🚉 Départs
        </button>
      </div>

      {/* Contenu */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            API SNCF Officielle
          </h2>
          <p className="text-gray-600">
            {activeTab === 'journeys' 
              ? `Itinéraires ${departureCity} → Lyon le ${selectedDate}`
              : `Départs depuis Montparnasse le ${selectedDate}`
            }
          </p>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
            <p className="text-gray-600 mt-4">Chargement des données SNCF...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {activeTab === 'journeys' && (
          <div className="space-y-4">
            {journeys.length > 0 ? (
              journeys.map((journey) => (
                <div key={journey.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {journey.departureStation} → {journey.arrivalStation}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {journey.trainNumber} • {journey.duration}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                        {journey.price}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Départ:</span>
                      <p className="font-medium">{new Date(journey.departureTime).toLocaleTimeString('fr-FR')}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Arrivée:</span>
                      <p className="font-medium">{new Date(journey.arrivalTime).toLocaleTimeString('fr-FR')}</p>
                    </div>
                  </div>
                  
                  {journey.sections && journey.transfers !== undefined && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        {journey.sections} section{journey.sections > 1 ? 's' : ''} • {journey.transfers} correspondance{journey.transfers > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucun itinéraire trouvé
              </div>
            )}
          </div>
        )}

        {activeTab === 'departures' && (
          <div className="space-y-4">
            {departures.length > 0 ? (
              departures.map((departure) => (
                <div key={departure.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {departure.line}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Direction: {departure.direction}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                        {departure.trainNumber}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Départ:</span>
                      <p className="font-medium">{departure.departureTime}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Voie:</span>
                      <p className="font-medium">{departure.platform}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucun départ trouvé
              </div>
            )}
          </div>
        )}
      </div>

      {/* Informations API */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ API SNCF Officielle</h3>
        <p className="text-blue-700 text-sm">
          Cette section utilise l'API officielle SNCF avec authentification. 
          Les données sont en temps réel et incluent tous les modes de transport SNCF.
        </p>
      </div>
    </div>
  );
} 