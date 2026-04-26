const en = {
  addHabit: "Add habit",
  habitNamePlaceholder: "e.g. no smoking",
  add: "Add",
  cancel: "Cancel",
  cleanDay: "Clean day",
  relapse: "Relapse",
  currentStreak: "Current streak",
  bestStreak: "Best streak",
  totalRelapses: "Total relapses",
  noHabits: "Nothing tracked yet",
  addFirst: "Track something worth fighting",
  stats: "Statistics",
  back: "Back",
  deleteHabit: "Delete habit",
  noHistory: "No data yet",
  day: (n: number) => `${n} ${n === 1 ? "day" : "days"}`,
};

export default en;
export type Translations = typeof en;
