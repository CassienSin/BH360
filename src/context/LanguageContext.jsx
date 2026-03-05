/**
 * LanguageContext
 *
 * Reads the active language from:
 *   1. user.localization?.language  (personal preference, stored in Redux)
 *   2. Global settings language     (admin-set, from Firestore via TanStack Query)
 *   3. Fallback → 'English'
 *
 * Provides useT() hook returning a t(key) translation function.
 */

import { createContext, useContext, useMemo } from 'react';
import { useAppSelector } from '../store/hooks';
import { useGeneralSettings } from '../hooks/useSettings';
import { translations, DEFAULT_LANGUAGE } from '../locales/translations';

const LanguageContext = createContext({ t: (key) => key, language: DEFAULT_LANGUAGE });

export const LanguageProvider = ({ children }) => {
  const { user } = useAppSelector((s) => s.auth);
  const { data: globalSettings } = useGeneralSettings();

  const language = useMemo(() => {
    // Personal preference wins
    const personal = user?.localization?.language;
    if (personal && translations[personal]) return personal;

    // Fall back to global settings
    const global = globalSettings?.language;
    if (global && translations[global]) return global;

    return DEFAULT_LANGUAGE;
  }, [user?.localization?.language, globalSettings?.language]);

  const t = useMemo(() => {
    const dict = translations[language] ?? translations[DEFAULT_LANGUAGE];
    return (key) => dict[key] ?? translations[DEFAULT_LANGUAGE][key] ?? key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ t, language }}>
      {children}
    </LanguageContext.Provider>
  );
};

/** Returns { t, language } — use t(key) to get a translated string */
export const useT = () => useContext(LanguageContext);
