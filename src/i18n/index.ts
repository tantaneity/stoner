import { createContext, useContext } from "react";
import type { Language } from "../types";
import type { Translations } from "./en";
import en from "./en";
import uk from "./uk";
import ru from "./ru";

export const translations: Record<Language, Translations> = { en, uk, ru };

export interface LangContextValue {
  lang: Language;
  t: Translations;
  setLang: (lang: Language) => void;
}

export const LangContext = createContext<LangContextValue>({
  lang: "en",
  t: en,
  setLang: () => {},
});

export function useLang(): LangContextValue {
  return useContext(LangContext);
}
