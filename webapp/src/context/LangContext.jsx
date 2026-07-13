import { createContext, useContext, useEffect, useState } from 'react';
import { UI_STRINGS } from './strings';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('site_lang') || 'en');

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = () => {
    setLang((prev) => {
      const next = prev === 'en' ? 'es' : 'en';
      localStorage.setItem('site_lang', next);
      return next;
    });
  };

  return (
    <LangContext.Provider value={{ lang, toggleLang, t: UI_STRINGS[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within a LangProvider');
  return ctx;
}
