import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";

// Import locales matching the 12 supported languages
import "dayjs/locale/de";
import "dayjs/locale/en";
import "dayjs/locale/es";
import "dayjs/locale/fr";
import "dayjs/locale/hi";
import "dayjs/locale/it";
import "dayjs/locale/ko";
import "dayjs/locale/nb"; // Norwegian Bokmal - dayjs uses 'nb' not 'no'
import "dayjs/locale/pt";
import "dayjs/locale/ru";
import "dayjs/locale/tl-ph"; // Tagalog/Filipino
import "dayjs/locale/zh";

// Extend dayjs with plugins
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

// Mapping from app language codes to dayjs locale codes
export const DAYJS_LOCALE_MAP: Record<string, string> = {
  de: "de",
  en: "en",
  es: "es",
  fr: "fr",
  hi: "hi",
  it: "it",
  ko: "ko",
  no: "nb", // Norwegian uses 'nb' in dayjs
  pt: "pt",
  ru: "ru",
  tl: "tl-ph", // Tagalog/Filipino
  zh: "zh"
};

// Function to set dayjs locale based on i18next language
export const setDayjsLocale = (language: string) => {
  const dayjsLocale = DAYJS_LOCALE_MAP[language] || "en";
  dayjs.locale(dayjsLocale);
};

export default dayjs;
