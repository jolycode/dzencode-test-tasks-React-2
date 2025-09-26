import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = supportedLanguages.find(lang => lang.code === currentLanguage);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Globe className="h-4 w-4" />
        <span>{currentLang?.nativeName}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px]">
          {supportedLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                changeLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`
                w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors
                ${currentLanguage === lang.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                ${lang.code === supportedLanguages[0].code ? 'rounded-t-lg' : ''}
                ${lang.code === supportedLanguages[supportedLanguages.length - 1].code ? 'rounded-b-lg' : ''}
              `}
            >
              {lang.nativeName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};