// i18n architecture per spec section 42: English default, Hindi + Marathi ready.
// All UI copy should be pulled through t('key') rather than hardcoded, so
// adding a language later means adding a locale file, not touching components.
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import hi from "./locales/hi.json";
import mr from "./locales/mr.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    mr: { translation: mr },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
