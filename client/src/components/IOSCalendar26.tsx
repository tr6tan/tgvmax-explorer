import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface IOSCalendar26Props {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  className?: string;
  showTimePicker?: boolean;
}

const IOSCalendar26: React.FC<IOSCalendar26Props> = ({
  selectedDate = new Date(),
  onDateSelect,
  className = '',
  showTimePicker = false
}) => {
  const [currentDate, setCurrentDate] = useState(selectedDate);
  const [selectedTime, setSelectedTime] = useState('12:00');

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

  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

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
    <div className={`ios-calendar-26 ${className}`}>
      {/* Material Background */}
      <div className="ios-calendar-material">
        {/* Header */}
        <div className="ios-calendar-header">
          {/* Arrows */}
          <div className="ios-calendar-arrows">
            <button 
              className="ios-calendar-arrow"
              onClick={() => navigateMonth('prev')}
              aria-label="Mois précédent"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              className="ios-calendar-arrow"
              onClick={() => navigateMonth('next')}
              aria-label="Mois suivant"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          {/* Month and Year */}
          <div className="ios-calendar-month-year">
            <span className="ios-calendar-month-text">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <ChevronDown size={15} className="ios-calendar-disclosure" />
          </div>
        </div>

        {/* Date Header */}
        <div className="ios-calendar-date-header">
          {dayNames.map(day => (
            <div key={day} className="ios-calendar-day-name">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="ios-calendar-grid">
          {Array.from({ length: Math.ceil(calendarDays.length / 7) }, (_, weekIndex) => (
            <div key={weekIndex} className="ios-calendar-week">
              {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((date, dayIndex) => (
                <div
                  key={dayIndex}
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
                    <>
                      {isSelected(date) && (
                        <div className="ios-calendar-day-ellipse"></div>
                      )}
                      <span className="ios-calendar-day-number">
                        {date.getDate()}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Separator */}
        <div className="ios-calendar-separator"></div>

        {/* Time Picker */}
        {showTimePicker && (
          <div className="ios-calendar-time">
            <div className="ios-calendar-time-title">
              Heure
            </div>
            <div className="ios-calendar-time-content">
              <div className="ios-calendar-time-picker">
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="ios-calendar-time-input"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IOSCalendar26;
