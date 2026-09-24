import React, { createContext, useContext, useState } from 'react';
import en from '../i18n/en.json';
import ta from '../i18n/ta.json';
import hi from '../i18n/hi.json';

type Language = 'en' | 'ta' | 'hi';

const translations: Record<Language, any> = { en, ta, hi };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('farmdirect_lang') as Language) || 'en';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('farmdirect_lang', lang);
  };

  const t = (path: string): string => {
    const keys = path.split('.');
    let current: any = translations[language] || translations.en;
    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback to English
        let fallback: any = translations.en;
        for (const k of keys) {
          if (fallback && fallback[k] !== undefined) {
            fallback = fallback[k];
          } else {
            return path;
          }
        }
        return typeof fallback === 'string' ? fallback : path;
      }
    }
    return typeof current === 'string' ? current : path;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

