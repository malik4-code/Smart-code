import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { Language, Direction } from "../types";

interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const [language, setLang] = useState<Language>(
    (localStorage.getItem("crm-language") as Language) || "en"
  );

  const isRTL = language === "ar";
  const direction: Direction = isRTL ? "rtl" : "ltr";

  useEffect(() => {
    const html = document.documentElement;
    html.dir = direction;
    html.lang = language;
    if (isRTL) {
      html.style.fontFamily = "'Cairo', 'Inter', sans-serif";
    } else {
      html.style.fontFamily = "'Inter', 'Cairo', sans-serif";
    }
  }, [language, direction, isRTL]);

  function setLanguage(lang: Language) {
    setLang(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem("crm-language", lang);
  }

  function toggleLanguage() {
    setLanguage(language === "en" ? "ar" : "en");
  }

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, toggleLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
