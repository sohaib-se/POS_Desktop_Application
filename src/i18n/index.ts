import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "../locales/en";
import { de } from "../locales/de";

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
];

export const getSavedLanguage = (): string => {
  try {
    const raw = localStorage.getItem("settings.language");
    if (!raw) return "en";
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "string" && (parsed === "en" || parsed === "de")) {
        return parsed;
      }
    } catch {
      if (raw === "en" || raw === "de") return raw;
    }
  } catch {
    return "en";
  }
  return "en";
};

const initialLang = getSavedLanguage();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    de: { translation: de },
  },
  lng: initialLang,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

export const setAppLanguage = (code: string) => {
  if (code !== "en" && code !== "de") return;
  i18n.changeLanguage(code);
  document.documentElement.lang = code;
};

// Ensure document has initial lang
if (typeof document !== "undefined") {
  document.documentElement.lang = initialLang;
}

// Keep in sync if settings are updated elsewhere
if (typeof window !== "undefined") {
  window.addEventListener("settings-updated", (e: Event) => {
    const customEvent = e as CustomEvent<{ key?: string; value: unknown }>;
    if (customEvent.detail?.key === "settings.language" && typeof customEvent.detail.value === "string") {
      const newLang = customEvent.detail.value;
      if (newLang !== i18n.language && (newLang === "en" || newLang === "de")) {
        setAppLanguage(newLang);
      }
    }
  });
}

export default i18n;
