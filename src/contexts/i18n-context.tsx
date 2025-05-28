
'use client';

import type { ReactNode } from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';

// Define available languages and their corresponding JSON files
const translationsModules: Record<string, () => Promise<any>> = {
  en: () => import('@/locales/en.json').then((module) => module.default),
  fr: () => import('@/locales/fr.json').then((module) => module.default),
};

export type Language = keyof typeof translationsModules;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  translationsLoaded: boolean;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

export function I18nProvider({ children, defaultLanguage = 'en' }: I18nProviderProps) {
  const [language, setCurrentLanguage] = useState<Language>(defaultLanguage);
  const [loadedTranslations, setLoadedTranslations] = useState<Record<string, string>>({});
  const [translationsLoaded, setTranslationsLoaded] = useState(false);

  const loadTranslations = useCallback(async (lang: Language) => {
    try {
      setTranslationsLoaded(false);
      const module = await translationsModules[lang]();
      setLoadedTranslations(module);
      setTranslationsLoaded(true);
    } catch (error) {
      console.error(`Failed to load translations for ${lang}:`, error);
      if (lang !== 'en') { // Fallback to English if loading selected language fails
        try {
          const fallbackModule = await translationsModules['en']();
          setLoadedTranslations(fallbackModule);
        } catch (fallbackError) {
          console.error(`Failed to load fallback English translations:`, fallbackError);
        }
      }
      setTranslationsLoaded(true); // Mark as loaded even if it's a fallback or failed
    }
  }, []);

  useEffect(() => {
    const storedLang = localStorage.getItem('latexify-language') as Language | null;
    const navigatorLang = navigator.language.split('-')[0] as Language;
    let initialLang = defaultLanguage;

    if (storedLang && translationsModules[storedLang]) {
      initialLang = storedLang;
    } else if (translationsModules[navigatorLang]) {
      initialLang = navigatorLang;
    }
    
    setCurrentLanguage(initialLang);
    loadTranslations(initialLang);
    document.documentElement.lang = initialLang;
  }, [defaultLanguage, loadTranslations]);

  const setLanguage = (lang: Language) => {
    if (translationsModules[lang]) {
      setCurrentLanguage(lang);
      localStorage.setItem('latexify-language', lang);
      loadTranslations(lang);
      document.documentElement.lang = lang;
    } else {
      console.warn(`Language "${lang}" is not supported.`);
    }
  };

  const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
    if (!translationsLoaded && !loadedTranslations[key]) return key; // Return key if not loaded and not in (potentially partially) loaded map
    
    let translation = loadedTranslations[key] || key;
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        translation = translation.replace(new RegExp(`{{${placeholder}}}`, 'g'), String(value));
      });
    }
    return translation;
  }, [loadedTranslations, translationsLoaded]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, translationsLoaded }}>
      {children}
    </I18nContext.Provider>
  );
}
