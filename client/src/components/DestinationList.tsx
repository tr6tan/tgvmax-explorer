import React from 'react';
import { Destination } from '../types';
import DestinationCard from './DestinationCard';

interface DestinationListProps {
  destinations: Destination[];
}

const DestinationList: React.FC<DestinationListProps> = ({ destinations }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Liste des destinations
        </h3>
        <p className="text-sm text-gray-600">
          Toutes les destinations accessibles avec TGVmax
        </p>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination, index) => (
            <DestinationCard 
              key={destination.id} 
              destination={destination}
              index={index}
            />
          ))}
        </div>
        
        {destinations.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-lg mb-2">
              Aucune destination trouvée
            </div>
            <p className="text-gray-500">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DestinationList; 