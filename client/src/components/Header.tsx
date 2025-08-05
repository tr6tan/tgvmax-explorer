import React from 'react';
import { Train, MapPin, Calendar, Clock } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="macos-toolbar">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Train className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🚅 TGVmax Explorer</h1>
              <p className="text-sm text-gray-600">Découvrez la France en train</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#search" className="macos-toolbar-item">
              <MapPin className="h-5 w-5 mr-2" />
              <span>Rechercher</span>
            </a>
            <a href="#map" className="macos-toolbar-item">
              <MapPin className="h-5 w-5 mr-2" />
              <span>Carte</span>
            </a>
            <a href="#about" className="macos-toolbar-item">
              <Clock className="h-5 w-5 mr-2" />
              <span>À propos</span>
            </a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <div className="macos-status macos-status-success">
              <Calendar className="h-4 w-4 mr-1" />
              <span>API SNCF Connectée</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 