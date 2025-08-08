import React from 'react';
import { Train } from '../types';
import { MapPin, Clock, Users, X, Calendar, TrendingUp } from 'lucide-react';

interface MapDestinationPopupProps {
  cityName: string;
  trains: Train[];
  onClose?: () => void;
}

const MapDestinationPopup: React.FC<MapDestinationPopupProps> = ({ 
  cityName, 
  trains, 
  onClose 
}) => {
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getAverageOccupancy = () => {
    if (trains.length === 0) return 0;
    return Math.floor(Math.random() * 40) + 20;
  };

  const getMinDuration = () => {
    if (trains.length === 0) return '--';
    const durations = trains.map(t => {
      const durationStr = t.duration.replace('h', '');
      return parseInt(durationStr) || 0;
    }).filter(d => d > 0);
    
    if (durations.length === 0) return '--';
    return Math.min(...durations) + 'h';
  };

  const getAvailableSeats = (train: Train) => {
    return Math.floor(Math.random() * 50) + 5;
  };

  const getSeatsStatus = (seats: number) => {
    if (seats >= 30) return { 
      color: 'text-green-600', 
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      text: 'Disponible' 
    };
    if (seats >= 10) return { 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      text: 'Limité' 
    };
    return { 
      color: 'text-red-600', 
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      text: 'Complet' 
    };
  };

  const getAverageDuration = () => {
    if (trains.length === 0) return '--';
    const durations = trains.map(t => {
      const durationStr = t.duration.replace('h', '');
      return parseInt(durationStr) || 0;
    }).filter(d => d > 0);
    
    if (durations.length === 0) return '--';
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    return Math.round(avg) + 'h';
  };

  const getCityImage = (cityName: string) => {
    // Images par défaut pour certaines villes
    const cityImages: { [key: string]: string } = {
      'Lyon': 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=400&h=200&fit=crop',
      'Marseille': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=200&fit=crop',
      'Toulouse': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop',
      'Bordeaux': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop',
      'Nantes': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop',
      'Strasbourg': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop',
      'Montpellier': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop',
    };
    
    return cityImages[cityName] || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop';
  };

  const getTotalAvailableSeats = () => {
    return trains.reduce((total, train) => total + getAvailableSeats(train), 0);
  };

  return (
    <div className="
      w-96 rounded-[34px] overflow-hidden
      bg-gradient-to-br from-white/5 via-white/2 to-white/5
      backdrop-blur-[40px] border border-white/20
      shadow-[0_20px_80px_rgba(0,0,0,0.15)]
      relative
    ">
      {/* Effet de fond liquid glass amélioré */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-white/2 rounded-[34px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/3 via-transparent to-white/5 rounded-[34px] pointer-events-none" />
      
      {/* Image de la ville en header */}
      <div className="relative h-32 overflow-hidden">
        <img 
          src={getCityImage(cityName)} 
          alt={cityName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="
                w-10 h-10 rounded-2xl
                bg-white/15 backdrop-blur-sm flex items-center justify-center
                border border-white/30 shadow-lg
              ">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-white tracking-tight drop-shadow-lg">
                  {cityName}
                </h3>
                <p className="text-[13px] text-white/90 drop-shadow-md">
                  {trains.length} trajets disponibles
                </p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="
                  w-8 h-8 rounded-xl
                  bg-white/15 hover:bg-white/25 backdrop-blur-sm
                  flex items-center justify-center
                  transition-all duration-200 border border-white/25
                  shadow-lg hover:shadow-xl
                "
              >
                <X className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative p-6">
        {/* Statistiques principales */}
        <div className="mb-6">
          <div className="
            bg-gradient-to-br from-white/15 via-white/10 to-white/5
            backdrop-blur-[20px] rounded-2xl p-4
            border border-white/25 shadow-xl
          ">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-[20px] font-bold text-gray-800">
                  {trains.length}
                </div>
                <div className="text-[11px] text-gray-600">Trajets</div>
              </div>
              <div className="text-center">
                <div className="text-[20px] font-bold text-gray-800">
                  {getMinDuration()}
                </div>
                <div className="text-[11px] text-gray-600">Durée min</div>
              </div>
              <div className="text-center">
                <div className="text-[20px] font-bold text-gray-800">
                  {getTotalAvailableSeats()}
                </div>
                <div className="text-[11px] text-gray-600">Places</div>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des trains */}
        <div className="space-y-3">
          <div className="mb-3">
            <h4 className="text-[13px] font-medium text-gray-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Prochains départs
            </h4>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {trains.slice(0, 4).map((train) => {
              const seats = getAvailableSeats(train);
              const status = getSeatsStatus(seats);
              const isPast = new Date(train.departureTime) <= new Date();
              
              return (
                <div key={train.id} className="
                  p-3 rounded-xl
                  bg-gradient-to-r from-white/20 via-white/15 to-white/10
                  backdrop-blur-[15px] border border-white/30
                  hover:from-white/30 hover:via-white/25 hover:to-white/15
                  transition-all duration-200 shadow-lg
                  ${isPast ? 'opacity-60' : ''}
                ">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <div className="text-[13px] font-medium text-gray-800">
                        {formatTime(train.departureTime)} → {formatTime(train.arrivalTime)}
                      </div>
                    </div>
                    <div className={`
                      px-2 py-1 rounded-lg text-[10px] font-medium
                      ${status.bgColor} ${status.borderColor} ${status.color}
                      shadow-sm
                    `}>
                      {status.text}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-gray-600 font-medium">
                        {train.trainNumber}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {train.duration}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-gray-500" />
                      <span className="text-[11px] text-gray-700 font-medium">
                        {seats} places
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {trains.length > 4 && (
            <div className="
              text-center py-2 text-[12px] text-gray-600
              bg-gradient-to-r from-gray-100/30 via-gray-100/20 to-gray-100/30
              rounded-lg border border-gray-200/30 shadow-sm
            ">
              +{trains.length - 4} autres trajets disponibles
            </div>
          )}
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="grid grid-cols-2 gap-3 text-[11px] text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Durée moy: {getAverageDuration()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>Total: {getTotalAvailableSeats()} places</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapDestinationPopup;
