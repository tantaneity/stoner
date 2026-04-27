export type Language = "en" | "uk" | "ru";
export type Theme = "dark" | "dim" | "light";

export interface HistoryEntry {
  timestamp: string;
  type: "clean" | "relapse";
}

export interface Habit {
  id: string;
  name: string;
  createdAt: string;
  currentStreak: number;
  bestStreak: number;
  totalRelapses: number;
  lastRelapseAt: string | null;
  streakStartDate: string | null;
  history: HistoryEntry[];
}

export interface AppData {
  habits: Habit[];
  language: Language;
  theme: Theme;
}

export interface ChartPoint {
  label: string;
  streak: number;
  isRelapse: boolean;
}
