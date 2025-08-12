import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Calendar } from 'lucide-react';
import LiquidGlassDatePicker from './LiquidGlassDatePicker';
import CitySearchInput from './CitySearchInput';

interface SearchSettings {
  departureCity: string;
  selectedDate: string;
  destinationCity?: string;
  requireReturnWithin3Days?: boolean;
  returnDays?: number[]; // offsets J=0..3
}

interface SearchSettingsDockProps {
  initialSettings: SearchSettings;
  onSettingsChange: (settings: SearchSettings) => void;
  onClose: () => void;
}

const SearchSettingsDock: React.FC<SearchSettingsDockProps> = ({
  initialSettings,
  onSettingsChange,
  onClose,
}) => {
  const [settings, setSettings] = useState<SearchSettings>(initialSettings);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);

  // Debounce effect pour éviter trop d'appels API
  useEffect(() => {
    console.log(`⏰ SearchSettingsDock - Debounce programmé pour settings:`, settings);
    const handler = setTimeout(() => {
      console.log(`📤 SearchSettingsDock - Envoi vers App.tsx:`, settings);
      onSettingsChange(settings);
    }, 100); // 100ms debounce pour plus de réactivité

    return () => {
      console.log(`🚫 SearchSettingsDock - Debounce annulé`);
      clearTimeout(handler);
    };
  }, [settings, onSettingsChange]);

  const handleChange = useCallback((field: keyof SearchSettings, value: any) => {
    console.log(`🏙️ SearchSettingsDock - Changement ${field}:`, value);
    setSettings(prev => {
      const newSettings = { ...prev, [field]: value };
      console.log(`🏙️ SearchSettingsDock - Nouveaux settings:`, newSettings);
      return newSettings;
    });
  }, []);

  const getMinDate = () => {
    // Permettre la sélection de la date actuelle en retournant une date légèrement antérieure
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  };

  // Fonction pour récupérer les suggestions de villes depuis l'API
  const fetchCitySuggestions = useCallback(async () => {
    // Villes par défaut en cas d'erreur
    const defaultCities = [
      'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux', 
      'Nantes', 'Strasbourg', 'Montpellier', 'Nice', 'Lille',
      'Rennes', 'Reims', 'Saint-Étienne', 'Toulon', 'Le Havre',
      'Grenoble', 'Dijon', 'Angers', 'Villeurbanne', 'Le Mans'
    ];
    
    try {
      console.log('🔄 Récupération des suggestions de villes...');
      const response = await fetch(`/api/all-trains?date=${settings.selectedDate}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Statut de la réponse:', response.status, response.statusText);
      
      // Si la réponse n'est pas OK, utiliser les villes par défaut
      if (!response.ok) {
        console.warn(`⚠️ Erreur HTTP ${response.status}: ${response.statusText}`);
        setCitySuggestions(defaultCities);
        return;
      }
      
      const text = await response.text();
      console.log('📄 Réponse brute de l\'API:', text.substring(0, 200) + '...');
      
      // Vérifier si la réponse est vide
      if (!text || text.trim() === '') {
        console.warn('⚠️ Réponse vide de l\'API');
        setCitySuggestions(defaultCities);
        return;
      }
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('❌ Erreur de parsing JSON:', parseError);
        console.error('📄 Contenu reçu:', text);
        setCitySuggestions(defaultCities);
        return;
      }
      
      if (data && data.success && data.data && Array.isArray(data.data)) {
        // Extraire toutes les villes uniques des destinations
        const cities = data.data
          .map((destination: any) => destination.city)
          .filter((city: any) => city && typeof city === 'string');
        
        const uniqueCities = Array.from(new Set(cities)) as string[];
        
        if (uniqueCities.length > 0) {
          console.log('✅ Villes récupérées:', uniqueCities.length);
          setCitySuggestions(uniqueCities);
        } else {
          console.warn('⚠️ Aucune ville trouvée dans les données');
          setCitySuggestions(defaultCities);
        }
      } else {
        console.warn('⚠️ Format de données invalide:', data);
        setCitySuggestions(defaultCities);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des suggestions de villes:', error);
      setCitySuggestions(defaultCities);
    }
  }, [settings.selectedDate]);

  // Charger les suggestions quand la date change
  useEffect(() => {
    fetchCitySuggestions();
  }, [fetchCitySuggestions]);

  if (isCollapsed) {
    return (
      <div className="absolute top-4 left-4 z-[9998]">
        <button
          onClick={() => setIsCollapsed(false)}
          className="
            w-12 h-12 rounded-2xl
            bg-black/10 backdrop-blur-xl border border-white/20
            hover:bg-black/15 transition-all duration-300
            flex items-center justify-center
            shadow-[0_8px_32px_rgba(0,0,0,0.12)]
          "
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.80518 3.55545L20.6143 8.4198C21.4766 8.68511 21.5746 9.86635 20.7677 10.2698L14.0673 13.6199C13.8738 13.7167 13.7168 13.8736 13.62 14.0672L10.27 20.7671C9.86658 21.5741 8.68555 21.4762 8.42024 20.614L3.55544 4.80486C3.31935 4.03759 4.0379 3.31937 4.80518 3.55545Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-4 left-4 z-[9998]">
      {/* Container principal avec effet glassmorphism sophistiqué */}
      <div className="
        w-80 rounded-[34px] p-6
        bg-black/8 backdrop-blur-[40px] border border-white/40
        shadow-[0_12px_64px_rgba(0,0,0,0.08)]
        relative overflow-hidden
        min-h-[600px]
      ">
        {/* Effet de fond avec gradient subtil */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-[34px] pointer-events-none" />
        
        {/* Header avec titre et bouton de réduction */}
        <div className="relative flex items-center justify-between mb-6">
          <h3 className="text-[17px] font-semibold text-gray-900 tracking-tight">
            Gestion des trajets
          </h3>
          <button
            onClick={() => setIsCollapsed(true)}
            className="
              w-8 h-8 rounded-xl
              bg-gray-100/80 hover:bg-gray-200/80
              flex items-center justify-center
              transition-all duration-200
            "
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.80518 3.55545L20.6143 8.4198C21.4766 8.68511 21.5746 9.86635 20.7677 10.2698L14.0673 13.6199C13.8738 13.7167 13.7168 13.8736 13.62 14.0672L10.27 20.7671C9.86658 21.5741 8.68555 21.4762 8.42024 20.614L3.55544 4.80486C3.31935 4.03759 4.0379 3.31937 4.80518 3.55545Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Contenu de la modale - Réorganisé : Date → Départ → Destination */}
        <div className="relative space-y-5">
          {/* 1. Date de voyage (en premier) */}
          <div>
            <label className="flex items-center gap-2 text-[13px] font-medium text-gray-700 mb-3">
              <Calendar className="w-4 h-4" />
              Date de voyage
            </label>
            <LiquidGlassDatePicker
              value={settings.selectedDate}
              onChange={(date) => handleChange('selectedDate', date)}
              minDate={getMinDate()}
            />
          </div>

          {/* 2. Ville de départ */}
          <div>
            <label className="flex items-center gap-2 text-[13px] font-medium text-gray-700 mb-3">
              <MapPin className="w-4 h-4" />
              Ville de départ
            </label>
            <CitySearchInput
              value={settings.departureCity}
              onChange={(city) => handleChange('departureCity', city)}
              suggestions={citySuggestions}
              placeholder="Paris"
              zIndex={10000}
            />
          </div>

          {/* 3. Ville d'arrivée (optionnel) */}
          <div>
            <label className="flex items-center gap-2 text-[13px] font-medium text-gray-700 mb-3">
              <MapPin className="w-4 h-4 rotate-180" />
              Ville d'arrivée
              <span className="text-[11px] text-gray-500">(optionnel)</span>
            </label>
            <div className="relative">
              <CitySearchInput
                value={settings.destinationCity || ''}
                onChange={(city) => handleChange('destinationCity', city)}
                suggestions={citySuggestions}
                placeholder="Rechercher une destination..."
                zIndex={10001}
              />
              {settings.destinationCity && (
                <button
                  onClick={() => handleChange('destinationCity', '')}
                  className="
                    absolute right-3 top-1/2 -translate-y-1/2
                    w-5 h-5 rounded-full
                    bg-gray-200/80 hover:bg-gray-300/80
                    flex items-center justify-center
                    transition-all duration-200
                  "
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* 4. Filtre retour sous 3 jours */}
          <div className="mt-2">
            <label className="flex items-center gap-3 text-[13px] font-medium text-gray-700 mb-2">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={!!settings.requireReturnWithin3Days}
                onChange={(e) => handleChange('requireReturnWithin3Days', e.target.checked)}
              />
              Uniquement les destinations avec un retour sous 3 jours
            </label>
            <p className="text-[11px] text-gray-500 ml-7 -mt-1">
              Filtre les villes où un trajet retour vers la ville de départ est disponible dans les 3 jours suivant la date choisie.
            </p>
            {settings.requireReturnWithin3Days && (
              <div className="ml-7 mt-2 flex flex-wrap gap-2">
                {([0,1,2,3] as number[]).map((d) => {
                  const active = (settings.returnDays || [0,1,2,3]).includes(d);
                  const label = d === 0 ? 'J' : `J+${d}`;
                  return (
                    <button
                      key={d}
                      onClick={() => {
                        setSettings(prev => {
                          const current = new Set(prev.returnDays && prev.returnDays.length ? prev.returnDays : [0,1,2,3]);
                          if (current.has(d)) current.delete(d); else current.add(d);
                          // éviter set vide: si tout désélectionné, remettre J par défaut
                          const next = Array.from(current);
                          const safeNext = next.length ? next.sort((a,b)=>a-b) : [0];
                          return { ...prev, returnDays: safeNext };
                        });
                      }}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
                        active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Info automatique */}
          <div className="mt-6 p-3 rounded-xl bg-blue-50/80 border border-blue-200/50">
            <p className="text-[12px] text-blue-700 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              La recherche se met à jour automatiquement
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchSettingsDock;


