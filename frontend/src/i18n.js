import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationAR from "./locales/ar/translation.json";

const savedLang = localStorage.getItem("language") || "en";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: translationAR },
      en: { translation: {} }, 
    },
    lng: savedLang, 
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;
