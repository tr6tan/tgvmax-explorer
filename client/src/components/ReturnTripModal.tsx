import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, ArrowLeftRight } from 'lucide-react';
import LiquidGlassDatePicker from './LiquidGlassDatePicker';
import axios from 'axios';
import { Train } from '../types';

interface SelectedTrip {
  train: Train;
  date: string;
  departureCity: string;
  arrivalCity: string;
}

interface ReturnTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTrip: SelectedTrip | null;
  onReturnTripSearch: (returnDate: string) => void;
  onTripSave: (outbound: SelectedTrip, returnDate: string) => void;
}

const ReturnTripModal: React.FC<ReturnTripModalProps> = ({
  isOpen,
  onClose,
  selectedTrip,
  onReturnTripSearch,
  onTripSave
}) => {
  const [returnDate, setReturnDate] = useState('');
  const [isSlideIn, setIsSlideIn] = useState(false);
  const [returnTrains, setReturnTrains] = useState<Train[]>([]);
  const [loadingReturnTrains, setLoadingReturnTrains] = useState(false);
  const [selectedReturnTrain, setSelectedReturnTrain] = useState<Train | null>(null);

  // Calculer la date de retour par défaut (aller + 2 jours)
  useEffect(() => {
    if (selectedTrip && isOpen) {
      const outboundDate = new Date(selectedTrip.date);
      const defaultReturnDate = new Date(outboundDate);
      defaultReturnDate.setDate(defaultReturnDate.getDate() + 2);
      setReturnDate(defaultReturnDate.toISOString().split('T')[0]);
      
      // Animation slide-in
      setTimeout(() => setIsSlideIn(true), 100);
    } else {
      setIsSlideIn(false);
    }
  }, [selectedTrip, isOpen]);

  const getMinReturnDate = () => {
    if (!selectedTrip) return new Date().toISOString().split('T')[0];
    
    // Date minimum = date d'aller
    const outboundDate = new Date(selectedTrip.date);
    return outboundDate.toISOString().split('T')[0];
  };

  const formatTime = (timeString: string) => {
    // Si c'est déjà au format "08:20", le retourner tel quel
    // Sinon, extraire les heures et minutes
    if (timeString.includes('T')) {
      return new Date(timeString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return timeString.substring(0, 5); // "08:20:00" -> "08:20"
  };

  const formatDuration = (duration: string) => {
    if (duration.includes('h')) return duration;
    // Si c'est au format "02:30:00", convertir en "2h30"
    const parts = duration.split(':');
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
  };

  // Recherche automatique quand la date de retour change
  useEffect(() => {
    console.log('🔄 Effect date retour:', { returnDate, selectedTrip: !!selectedTrip, isOpen });
    
    if (returnDate && selectedTrip && isOpen) {
      console.log(`🕐 Recherche programmée dans 500ms pour le ${returnDate}`);
      const timeoutId = setTimeout(async () => {
        console.log(`🚀 Lancement recherche pour le ${returnDate}`);
        
        // Fonction pour rechercher les trajets retour
        const searchReturnTrains = async (date: string) => {
          if (!selectedTrip || !date) return;

          setLoadingReturnTrains(true);
          setReturnTrains([]);
          setSelectedReturnTrain(null);

          try {
            console.log(`🔍 Recherche trajets retour ${selectedTrip.arrivalCity} → ${selectedTrip.departureCity} le ${date}`);
            
            const response = await axios.get(`http://localhost:4000/api/tgvmax/search`, {
              params: {
                from: selectedTrip.arrivalCity,
                date: date
              }
            });

            if (response.data.success && response.data.trains) {
              // Filtrer les trains pour ne garder que ceux qui vont vers la ville de départ
              const filteredTrains = response.data.trains.filter((train: Train) => {
                const normalizedArrival = train.arrivalStation.toUpperCase().replace(/\s+/g, ' ').trim();
                const normalizedDeparture = selectedTrip.departureCity.toUpperCase().replace(/\s+/g, ' ').trim();
                
                console.log(`🔍 Filtrage: "${normalizedArrival}" vs "${normalizedDeparture}"`);
                
                // Correspondances directes
                if (normalizedArrival.includes(normalizedDeparture) || normalizedDeparture.includes(normalizedArrival)) {
                  return true;
                }
                
                // Correspondances par mots clés (ex: PARIS vs PARIS (intramuros))
                const arrivalWords = normalizedArrival.split(' ');
                const departureWords = normalizedDeparture.split(' ');
                
                return arrivalWords.some(word => 
                  word.length > 3 && departureWords.some(dWord => 
                    dWord.length > 3 && (word.includes(dWord) || dWord.includes(word))
                  )
                );
              });

              setReturnTrains(filteredTrains);
              console.log(`✅ ${filteredTrains.length} trajets retour trouvés`);
            } else {
              console.log('❌ Aucun trajet retour trouvé');
              setReturnTrains([]);
            }
          } catch (error) {
            console.error('❌ Erreur recherche trajets retour:', error);
            setReturnTrains([]);
          } finally {
            setLoadingReturnTrains(false);
          }
        };
        
        await searchReturnTrains(returnDate);
      }, 500); // Debounce de 500ms

      return () => {
        console.log('🚫 Timeout annulé pour', returnDate);
        clearTimeout(timeoutId);
      };
    }
  }, [returnDate, selectedTrip, isOpen]);

  if (!isOpen || !selectedTrip) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center" data-testid="return-modal">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={`
          relative w-96 rounded-[34px] p-6
          bg-black/8 backdrop-blur-[40px] border border-white/40
          shadow-[0_12px_64px_rgba(0,0,0,0.15)]
          transform transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
          ${isSlideIn 
            ? 'translate-x-0 opacity-100 scale-100' 
            : 'translate-x-full opacity-0 scale-95'
          }
        `}
      >
        {/* Effet de fond avec gradient bleu pour différencier du modal principal */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-200/20 to-blue-400/10 rounded-[34px] pointer-events-none" />
        
        {/* Header */}
        <div className="relative flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="
                w-8 h-8 rounded-xl
                bg-gray-100/80 hover:bg-gray-200/80
                flex items-center justify-center
                transition-all duration-200
              "
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="text-[17px] font-semibold text-gray-900 tracking-tight flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-blue-600" />
              Trajet de retour
            </h3>
          </div>
        </div>

        {/* Récapitulatif du trajet aller */}
        <div className="relative mb-6 p-4 rounded-2xl bg-green-50/60 border border-green-200/50">
          <h4 className="text-[13px] font-medium text-green-800 mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Trajet aller sélectionné
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-semibold text-gray-900">
                {selectedTrip.departureCity} → {selectedTrip.arrivalCity}
              </span>
              <span className="text-[12px] text-gray-600">
                {new Date(selectedTrip.date).toLocaleDateString('fr-FR', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short'
                })}
              </span>
            </div>
            <div className="flex items-center gap-4 text-[12px] text-gray-600">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(selectedTrip.train.departureTime)} → {formatTime(selectedTrip.train.arrivalTime)}
              </span>
              <span>{selectedTrip.train.trainNumber}</span>
              <span>{formatDuration(selectedTrip.train.duration)}</span>
            </div>
          </div>
        </div>

        {/* Sélecteur de date de retour */}
        <div className="relative mb-6">
          <label className="flex items-center gap-2 text-[13px] font-medium text-gray-700 mb-3">
            <Calendar className="w-4 h-4 text-blue-600" />
            Date de retour souhaitée
          </label>
          <LiquidGlassDatePicker
            value={returnDate}
            onChange={setReturnDate}
            minDate={getMinReturnDate()}
          />
        </div>

        {/* Résultats des trajets retour */}
        <div className="relative mb-6">
          <h4 className="text-[13px] font-medium text-blue-800 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            Trajets retour disponibles
          </h4>

          {loadingReturnTrains && (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="ml-3 text-[12px] text-gray-600">Recherche en cours...</span>
            </div>
          )}

          {!loadingReturnTrains && returnTrains.length === 0 && returnDate && (
            <div className="text-center py-6 text-[12px] text-gray-500">
              Aucun trajet retour TGV Max trouvé pour cette date
            </div>
          )}

          {!loadingReturnTrains && returnTrains.length > 0 && (
            <div className="max-h-40 overflow-y-auto space-y-2">
              {returnTrains.map((train) => {
                const isSelected = selectedReturnTrain?.id === train.id;
                return (
                  <div
                    key={train.id}
                    onClick={() => setSelectedReturnTrain(train)}
                    className={`
                      p-3 rounded-xl cursor-pointer transition-all duration-200
                      ${isSelected 
                        ? 'bg-blue-100 border-2 border-blue-300 shadow-sm' 
                        : 'bg-white/60 border border-gray-200 hover:bg-blue-50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] font-semibold text-gray-900">
                        {train.trainNumber}
                      </span>
                      <span className={`
                        text-[10px] px-2 py-1 rounded-full font-medium
                        ${isSelected ? 'bg-blue-600 text-white' : 'bg-green-100 text-green-700'}
                      `}>
                        {isSelected ? 'Sélectionné' : 'Disponible'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-600">
                      <span>{formatTime(train.departureTime)} → {formatTime(train.arrivalTime)}</span>
                      <span>{formatDuration(train.duration)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="relative space-y-3">
          <button
            onClick={() => {
              if (selectedReturnTrain) {
                onTripSave(selectedTrip, returnDate);
              }
            }}
            disabled={!selectedReturnTrain}
            className={`
              w-full py-3 px-4 rounded-2xl
              text-[14px] font-semibold
              transition-all duration-200
              flex items-center justify-center gap-2
              ${selectedReturnTrain
                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-[0_4px_16px_rgba(34,197,94,0.3)] hover:shadow-[0_6px_20px_rgba(34,197,94,0.4)]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {selectedReturnTrain ? 'Confirmer aller-retour' : 'Sélectionnez un trajet retour'}
          </button>
          
          <button
            onClick={onClose}
            className="
              w-full py-3 px-4 rounded-2xl
              bg-gray-100/80 hover:bg-gray-200/80
              text-gray-700 text-[14px] font-medium
              transition-all duration-200
              flex items-center justify-center gap-2
            "
          >
            Annuler
          </button>
        </div>

        {/* Info note */}
        <div className="relative mt-4 p-3 rounded-xl bg-blue-50/60 border border-blue-200/40">
          <p className="text-[11px] text-blue-700 flex items-start gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-0.5 flex-shrink-0">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 16v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            La recherche de retour utilisera automatiquement l'inverse de votre trajet aller
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReturnTripModal;
