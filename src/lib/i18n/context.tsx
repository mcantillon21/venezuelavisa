"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { dictionaries, type Dictionary, type Locale } from "./dictionaries";

type Ctx = {
  locale: Locale;
  t: Dictionary;
  setLocale: (l: Locale) => void;
  toggle: () => void;
};

const LocaleContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "vv-locale";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved === "es" || saved === "en") setLocaleState(saved);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
    document.documentElement.lang = l;
  }, []);

  const toggle = useCallback(
    () => setLocale(locale === "es" ? "en" : "es"),
    [locale, setLocale],
  );

  return (
    <LocaleContext.Provider value={{ locale, t: dictionaries[locale], setLocale, toggle }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useI18n must be used within LocaleProvider");
  return ctx;
}
