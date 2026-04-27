import { createContext, useContext } from "react";
import type { Language, Theme } from "../types";
import type { Translations } from "./en";
import en from "./en";
import uk from "./uk";
import ru from "./ru";

export const translations: Record<Language, Translations> = { en, uk, ru };

export interface AppContextValue {
  lang: Language;
  t: Translations;
  setLang: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const LangContext = createContext<AppContextValue>({
  lang: "en",
  t: en,
  setLang: () => {},
  theme: "dark",
  setTheme: () => {},
});

export function useLang(): AppContextValue {
  return useContext(LangContext);
}
