import React from 'react';
import { Clock, MapPin, Users, Thermometer, Wind } from 'lucide-react';
import { Destination } from '../types';

interface DestinationCardProps {
  destination: Destination;
  index: number;
}

const DestinationCard: React.FC<DestinationCardProps> = ({ destination, index }) => {
  return (
    <div className="destination-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Image de la ville */}
      {destination.image && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={destination.image} 
            alt={destination.city}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-xl font-bold">{destination.city}</h3>
          </div>
        </div>
      )}

      <div className="p-6">
        {/* En-tête avec nom de ville */}
        {!destination.image && (
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900">{destination.city}</h3>
          </div>
        )}

        {/* Horaires des trains */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-medium text-gray-700">Horaires</span>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Aller</span>
              <span className="text-sm font-medium">
                {destination.outbound.departureTime} → {destination.outbound.arrivalTime}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Retour</span>
              <span className="text-sm font-medium">
                {destination.return.departureTime} → {destination.return.arrivalTime}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-600">Séjour sur place</span>
              <span className="text-sm font-bold text-primary-600">
                {destination.stayDuration}
              </span>
            </div>
          </div>
        </div>

        {/* Météo */}
        {destination.weather && (
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Thermometer className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">Météo</span>
            </div>
            <div className="flex items-center justify-between bg-orange-50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <img 
                  src={`https://openweathermap.org/img/wn/${destination.weather.icon}.png`}
                  alt={destination.weather.description}
                  className="w-8 h-8"
                />
                <div>
                  <div className="text-sm font-medium">{destination.weather.description}</div>
                  <div className="text-xs text-gray-500">Ressenti: {destination.weather.feels_like}°C</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-orange-600">
                  {destination.weather.temperature}°C
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Wind className="h-3 w-3" />
                  <span>{destination.weather.wind_speed} km/h</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Données démographiques */}
        {destination.demographics && (
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Démographie</span>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-gray-600">Population</div>
                  <div className="font-medium">
                    {destination.demographics.population.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Densité</div>
                  <div className="font-medium">
                    {destination.demographics.density.toLocaleString()}/km²
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Coordonnées */}
        {destination.coordinates && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            <span>
              {destination.coordinates.lat.toFixed(4)}, {destination.coordinates.lng.toFixed(4)}
            </span>
          </div>
        )}

        {/* Bouton d'action */}
        <div className="mt-4">
          <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors">
            Voir les détails
          </button>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard; 