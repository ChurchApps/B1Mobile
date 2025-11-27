import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import en from "./locales/en.json";
import es from "./locales/es.json";

const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? "en";
const supportedLanguage = ["en", "es"].includes(deviceLanguage) ? deviceLanguage : "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es }
  },
  lng: supportedLanguage,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  react: { useSuspense: false }
});

export default i18n;
