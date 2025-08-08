import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface LiquidGlassDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  className?: string;
}

const LiquidGlassDatePicker: React.FC<LiquidGlassDatePickerProps> = ({
  value,
  onChange,
  minDate,
  className = ''
}) => {
     const [isOpen, setIsOpen] = useState(false);
   const [currentDate, setCurrentDate] = useState(() => {
     if (value) {
       const date = new Date(value + 'T00:00:00'); // Forcer l'heure locale
       return date;
     }
     return new Date();
   });
   const [selectedDate, setSelectedDate] = useState(() => {
     if (value) {
       const date = new Date(value + 'T00:00:00'); // Forcer l'heure locale
       return date;
     }
     return new Date();
   });
   const [openDirection, setOpenDirection] = useState<'up' | 'down'>('down');
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

  // Mettre à jour les dates internes quand la valeur externe change
  useEffect(() => {
    if (value) {
      const date = new Date(value + 'T00:00:00'); // Forcer l'heure locale
      setSelectedDate(date);
      setCurrentDate(date);
    }
  }, [value]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const days = [];
    const totalDays = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    
    // Ajouter les jours vides du mois précédent
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Ajouter les jours du mois
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }
    
    return days;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Formater la date en YYYY-MM-DD sans décalage UTC
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    onChange(formattedDate);
    setIsOpen(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate.toDateString() === date.toDateString();
  };

  const isDisabled = (date: Date) => {
    if (minDate) {
      const minDateObj = new Date(minDate);
      const today = new Date();
      
      // Permettre toujours la sélection de la date actuelle
      if (date.toDateString() === today.toDateString()) {
        return false;
      }
      
      // Désactiver seulement les dates antérieures à minDate
      return date < minDateObj;
    }
    return false;
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const calendarDays = generateCalendarDays();

     return (
     <div className={`relative z-[3000] ${className}`} ref={dropdownRef}>
      {/* Bouton de déclenchement */}
             <button
         onClick={() => {
           if (!isOpen) {
             // Calculer l'espace disponible en bas
             const rect = dropdownRef.current?.getBoundingClientRect();
             const windowHeight = window.innerHeight;
             const spaceBelow = windowHeight - (rect?.bottom || 0);
             const spaceAbove = rect?.top || 0;
             
             // Si pas assez d'espace en bas (moins de 300px) et plus d'espace en haut, ouvrir vers le haut
             if (spaceBelow < 300 && spaceAbove > 300) {
               setOpenDirection('up');
             } else {
               setOpenDirection('down');
             }
           }
           setIsOpen(!isOpen);
         }}
         className="
           w-full pl-12 pr-4 py-3 text-[14px]
           liquid-glass-calendar
           flex items-center justify-between
           relative z-[3000]
         "
       >
        <div className="flex items-center">
          <div className="
            w-6 h-6 rounded-lg
            bg-white/40 backdrop-blur-[10px] border border-white/60
            flex items-center justify-center mr-3
            transition-all duration-300 ease-out
            hover:bg-white/60 hover:border-white/80
            shadow-[0_1px_4px_rgba(0,0,0,0.02)]
          ">
            <Calendar className="w-3 h-3 text-gray-500" />
          </div>
          <span className={value ? 'text-gray-900' : 'text-gray-500'}>
            {value ? (
              <span className="flex items-center gap-2">
                {formatDate(new Date(value))}
                {isToday(new Date(value)) && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    Aujourd'hui
                  </span>
                )}
              </span>
            ) : 'Sélectionner une date'}
          </span>
        </div>
      </button>

             {/* Dropdown du calendrier */}
       {isOpen && (
         <div className={`
           absolute z-[3000] left-0
           ${openDirection === 'down' ? 'top-full mt-2' : 'bottom-full mb-2'}
           w-64 rounded-2xl p-3
           bg-white/80 backdrop-blur-[20px] border border-white/60
           shadow-[0_8px_32px_rgba(0,0,0,0.12)]
           transition-all duration-300 ease-out
           max-h-80 overflow-y-auto
         `}>
                     {/* Header du calendrier */}
           <div className="flex items-center justify-between mb-2">
             <button
               onClick={() => navigateMonth('prev')}
               className="
                 w-6 h-6 rounded-lg
                 bg-white/60 backdrop-blur-sm border border-white/40
                 flex items-center justify-center
                 hover:bg-white/80 transition-all duration-200
               "
             >
               <ChevronLeft className="w-3 h-3 text-gray-600" />
             </button>
             
             <h3 className="text-xs font-semibold text-gray-900">
               {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
             </h3>
             
             <button
               onClick={() => navigateMonth('next')}
               className="
                 w-6 h-6 rounded-lg
                 bg-white/60 backdrop-blur-sm border border-white/40
                 flex items-center justify-center
                 hover:bg-white/80 transition-all duration-200
               "
             >
               <ChevronRight className="w-3 h-3 text-gray-600" />
             </button>
           </div>

                     {/* Jours de la semaine */}
           <div className="grid grid-cols-7 gap-1 mb-1">
             {dayNames.map(day => (
               <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                 {day}
               </div>
             ))}
           </div>

           {/* Grille du calendrier */}
           <div className="grid grid-cols-7 gap-1">
             {calendarDays.map((date, index) => (
               <button
                 key={index}
                 onClick={() => date && !isDisabled(date) && handleDateSelect(date)}
                 disabled={!date || isDisabled(date)}
                 className={`
                   w-7 h-7 rounded-lg text-xs font-medium
                   transition-all duration-200 ease-out
                   ${!date ? 'invisible' : ''}
                   ${date && isDisabled(date) ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-blue-50'}
                   ${date && isToday(date) ? 'bg-blue-200 text-blue-800 font-semibold ring-2 ring-blue-300' : ''}
                   ${date && isSelected(date) ? 'bg-blue-600 text-white shadow-lg' : ''}
                   ${date && !isToday(date) && !isSelected(date) && !isDisabled(date) ? 'text-gray-700' : ''}
                 `}
               >
                 {date?.getDate()}
               </button>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default LiquidGlassDatePicker;
