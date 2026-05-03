import React, { createContext, useContext, useState, useEffect } from 'react';
import { ru } from '../locales/ru';
import { kk } from '../locales/kk';

const translations = { ru, kk };

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('palestra_lang') || 'ru');
  
  const t = (key) => {
    const keys = key.split('.');
    let result = translations[lang];
    for (const k of keys) {
      result = result?.[k];
    }
    return result || key;
  };

  const toggleLanguage = () => {
    const newLang = lang === 'ru' ? 'kk' : 'ru';
    setLang(newLang);
    localStorage.setItem('palestra_lang', newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
