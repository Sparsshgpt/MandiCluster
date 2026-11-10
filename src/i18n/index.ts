import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { LANGUAGES, BUNDLED_LOCALES } from './translations';

const resources: Record<string, { translation: any }> = {
  en: { translation: BUNDLED_LOCALES.en },
  hi: { translation: BUNDLED_LOCALES.hi },
  pa: { translation: BUNDLED_LOCALES.pa },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi', 'pa'],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'mandicluster_lang',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('mandicluster_lang', lng);
});

export { LANGUAGES };
export default i18n;
