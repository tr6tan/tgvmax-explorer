import React, { useState, useEffect } from 'react';
import MacOSCard from './MacOSCard';

interface IOSCalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  className?: string;
  variant?: 'default' | 'glass' | 'compact';
}

const IOSCalendar: React.FC<IOSCalendarProps> = ({
  selectedDate = new Date(),
  onDateSelect,
  className = '',
  variant = 'default'
}) => {
  const [currentDate, setCurrentDate] = useState(selectedDate);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const generateCalendarDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentDate);
    const firstDay = firstDayOfMonth(currentDate);
    
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

  const handleDateClick = (date: Date) => {
    setCurrentDate(date);
    onDateSelect?.(date);
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

  const calendarDays = generateCalendarDays();

  return (
    <MacOSCard 
      variant={variant === 'glass' ? 'glass' : 'default'}
      className={`ios-calendar ${className}`}
    >
      {/* Header */}
      <div className="ios-calendar-header">
        <button 
          className="ios-calendar-nav-btn"
          onClick={() => navigateMonth('prev')}
          aria-label="Mois précédent"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <div className="ios-calendar-title">
          <h3 className="ios-calendar-month">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
        </div>
        
        <button 
          className="ios-calendar-nav-btn"
          onClick={() => navigateMonth('next')}
          aria-label="Mois suivant"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Days of Week */}
      <div className="ios-calendar-days-header">
        {dayNames.map(day => (
          <div key={day} className="ios-calendar-day-name">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="ios-calendar-grid">
        {calendarDays.map((date, index) => (
          <div
            key={index}
            className={`ios-calendar-day ${
              !date ? 'ios-calendar-day-empty' : ''
            } ${
              date && isToday(date) ? 'ios-calendar-day-today' : ''
            } ${
              date && isSelected(date) ? 'ios-calendar-day-selected' : ''
            }`}
            onClick={() => date && handleDateClick(date)}
          >
            {date && (
              <span className="ios-calendar-day-number">
                {date.getDate()}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="ios-calendar-actions">
        <button 
          className="ios-calendar-action-btn"
          onClick={() => handleDateClick(new Date())}
        >
          Aujourd'hui
        </button>
      </div>
    </MacOSCard>
  );
};

export default IOSCalendar;
