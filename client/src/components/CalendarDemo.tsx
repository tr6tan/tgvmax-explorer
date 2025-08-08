import React, { useState } from 'react';
import IOSCalendar from './IOSCalendar';

const CalendarDemo: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    console.log('Date sélectionnée:', date.toLocaleDateString('fr-FR'));
  };

  return (
    <div className="calendar-demo" style={{ 
      padding: '40px', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '40px'
    }}>
      <h1 style={{ 
        color: 'white', 
        fontSize: '32px', 
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        Calendrier iOS 26
      </h1>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: '20px'
      }}>
        <IOSCalendar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          variant="glass"
        />
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: '20px',
          borderRadius: '16px',
          color: 'white',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
            Date sélectionnée :
          </p>
          <p style={{ 
            margin: '0', 
            fontSize: '24px', 
            fontWeight: '600',
            color: '#34C759'
          }}>
            {selectedDate.toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CalendarDemo;
