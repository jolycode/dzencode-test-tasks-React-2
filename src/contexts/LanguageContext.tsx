import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (lang: string) => void;
  supportedLanguages: { code: string; name: string; nativeName: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' }
];

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const langFromUrl = pathParts[1];
    
    if (supportedLanguages.some(lang => lang.code === langFromUrl)) {
      if (langFromUrl !== i18n.language) {
        i18n.changeLanguage(langFromUrl);
        setCurrentLanguage(langFromUrl);
      }
    } else {
      const defaultLang = i18n.language || 'en';
      const newPath = `/${defaultLang}${location.pathname}`;
      navigate(newPath, { replace: true });
    }
  }, [location.pathname, i18n, navigate]);

  const changeLanguage = (lang: string) => {
    const pathParts = location.pathname.split('/');
    const currentLangFromUrl = pathParts[1];
    
    let newPath;
    if (supportedLanguages.some(l => l.code === currentLangFromUrl)) {
      pathParts[1] = lang;
      newPath = pathParts.join('/');
    } else {
      newPath = `/${lang}${location.pathname}`;
    }

    i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
    navigate(newPath);
  };

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      changeLanguage,
      supportedLanguages
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};