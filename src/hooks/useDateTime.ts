import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useDateTime = () => {
  const [dateTime, setDateTime] = useState(new Date());
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDayName = (date: Date) => {
    const dayNames = [
      'header.sunday',
      'header.monday', 
      'header.tuesday',
      'header.wednesday',
      'header.thursday',
      'header.friday',
      'header.saturday'
    ];
    
    return t(dayNames[date.getDay()]);
  };

  return {
    dateTime,
    formatDate,
    formatTime,
    formatDayName
  };
};