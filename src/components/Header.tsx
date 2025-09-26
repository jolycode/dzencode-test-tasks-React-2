import React, { useEffect, useState } from 'react';
import { Search, Menu, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDateTime } from '../hooks/useDateTime';
import { LanguageSwitcher } from './LanguageSwitcher';
import { io } from "socket.io-client";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { t } = useTranslation();
  const { dateTime, formatDate, formatTime, formatDayName } = useDateTime();
  const [activeUsers, setActiveUsers] = useState<number>(0);

  useEffect(() => {
    const socket = io("http://localhost:3001");

    socket.on("activeUsers", (count: number) => {
      setActiveUsers(count);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
        
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-semibold text-green-600">{t('header.inventory')}</h1>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('header.search')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 text-gray-700">
          <Users className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium">{activeUsers}</span>
        </div>

        <LanguageSwitcher />
        
        <div className="text-left">
          <div className="text-lg font-semibold text-gray-900">
            {formatDayName(dateTime)}
          </div>
          <div className="text-sm text-gray-600">
            {formatDate(dateTime)}
          </div>
          <div className="text-sm font-mono text-blue-600">
            {formatTime(dateTime)}
          </div>
        </div>
      </div>
    </header>
  );
};
