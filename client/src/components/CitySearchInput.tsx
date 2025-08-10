import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Search } from 'lucide-react';

interface CitySearchInputProps {
  value: string;
  onChange: (city: string) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
  zIndex?: number;
}

const CitySearchInput: React.FC<CitySearchInputProps> = ({
  value,
  onChange,
  suggestions,
  placeholder = "Paris",
  className = '',
  zIndex = 9999
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = suggestions.filter(city =>
        city.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 8)); // Limiter à 8 suggestions
    } else {
      setFilteredSuggestions(suggestions.slice(0, 8)); // Afficher les 8 premières villes par défaut
    }
  }, [searchTerm, suggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    // NE PAS appeler onChange ici - seulement pour la recherche locale
    
    if (!isOpen && newValue.length > 0) {
      setIsOpen(true);
    } else if (newValue.length === 0) {
      setIsOpen(false);
      // Réinitialiser si l'input est vidé
      onChange('');
    }
  };

  const handleSuggestionClick = (city: string) => {
    setSearchTerm(city);
    onChange(city);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    if (searchTerm.length > 0 || suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Petit délai pour permettre le clic sur suggestion
    setTimeout(() => {
      if (searchTerm.length > 0) {
        // Vérifier si le terme saisi correspond exactement à une suggestion
        const exactMatch = suggestions.find(city => 
          city.toLowerCase() === searchTerm.toLowerCase()
        );
        if (exactMatch) {
          onChange(exactMatch);
        } else {
          // Propager quand même la saisie utilisateur
          onChange(searchTerm);
        }
      }
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Vérifier si le terme saisi correspond exactement à une suggestion
      const exactMatch = suggestions.find(city => 
        city.toLowerCase() === searchTerm.toLowerCase()
      );
      if (exactMatch) {
        setSearchTerm(exactMatch);
        onChange(exactMatch);
        setIsOpen(false);
      } else if (filteredSuggestions.length > 0) {
        // Sélectionner la première suggestion
        const firstSuggestion = filteredSuggestions[0];
        setSearchTerm(firstSuggestion);
        onChange(firstSuggestion);
        setIsOpen(false);
      } else if (searchTerm.trim().length > 0) {
        // Propager la saisie telle quelle
        onChange(searchTerm.trim());
        setIsOpen(false);
      }
    }
  };

  return (
    <div className={`relative z-[${zIndex}] ${className}`} ref={dropdownRef}>
      {/* Input de recherche */}
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className="
            w-full pl-12 pr-10 py-3 text-[14px]
            bg-white/60 backdrop-blur-sm border border-white/40
            rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
            placeholder-gray-500 transition-all duration-200
          "
          placeholder={placeholder}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Dropdown des suggestions */}
      {isOpen && filteredSuggestions.length > 0 && (
        <div className="
          absolute top-full left-0 right-0 mt-2 z-[9999]
          bg-white border border-gray-200
          rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)]
          max-h-64 overflow-y-auto
        "
        style={{ zIndex: zIndex + 1 }}
        >
          <div className="p-2">
            {filteredSuggestions.map((city, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(city)}
                className="
                  w-full px-4 py-3 text-left text-sm
                  hover:bg-blue-50 rounded-xl transition-colors duration-200
                  flex items-center gap-3
                "
              >
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700">{city}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message si aucune suggestion */}
      {isOpen && filteredSuggestions.length === 0 && searchTerm.length > 0 && (
        <div className="
          absolute top-full left-0 right-0 mt-2 z-[9999]
          bg-white border border-gray-200
          rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)]
          p-4
        "
        style={{ zIndex: zIndex + 1 }}
        >
          <div className="text-center text-sm text-gray-500">
            Aucune ville trouvée pour "{searchTerm}"
          </div>
        </div>
      )}
    </div>
  );
};

export default CitySearchInput;
