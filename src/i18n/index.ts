import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import { setDayjsLocale } from "../helpers/dayjsConfig";
import de from "./locales/de.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import hi from "./locales/hi.json";
import it from "./locales/it.json";
import ko from "./locales/ko.json";
import no from "./locales/no.json";
import pt from "./locales/pt.json";
import ru from "./locales/ru.json";
import tl from "./locales/tl.json";
import zh from "./locales/zh.json";

const supportedLanguages = [
  "de", "en", "es", "fr", "hi", "it", "ko", "no", "pt", "ru", "tl", "zh"
];
const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? "en";
const supportedLanguage = supportedLanguages.includes(deviceLanguage) ? deviceLanguage : "en";

i18n.use(initReactI18next).init({
  resources: {
    de: { translation: de },
    en: { translation: en },
    es: { translation: es },
    fr: { translation: fr },
    hi: { translation: hi },
    it: { translation: it },
    ko: { translation: ko },
    no: { translation: no },
    pt: { translation: pt },
    ru: { translation: ru },
    tl: { translation: tl },
    zh: { translation: zh }
  },
  lng: supportedLanguage,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  react: { useSuspense: false }
});

// Sync dayjs locale with i18next language
i18n.on("languageChanged", (lng) => {
  setDayjsLocale(lng);
});

// Set initial dayjs locale
setDayjsLocale(supportedLanguage);

export default i18n;
