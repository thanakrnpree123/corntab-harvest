
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import thTranslations from './locales/th.json';
import zhTranslations from './locales/zh.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      th: {
        translation: thTranslations
      },
      zh: {
        translation: zhTranslations
      }
    },
    fallbackLng: 'en',
    lng: 'en', // Set default language to English
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
