import type { Translations } from "./en";

const ru: Translations = {
  addHabit: "Добавить привычку",
  habitNamePlaceholder: "напр. не курить",
  add: "Добавить",
  cancel: "Отмена",
  cleanDay: "Чистый день",
  relapse: "Срыв",
  currentStreak: "Текущая серия",
  bestStreak: "Лучшая серия",
  totalRelapses: "Всего срывов",
  noHabits: "Ничего не отслеживается",
  addFirst: "Отслеживай то, с чем борешься",
  stats: "Статистика",
  back: "Назад",
  deleteHabit: "Удалить привычку",
  noHistory: "Данных пока нет",
  settings: "Настройки",
  language: "Язык",
  theme: "Тема",
  themeDark: "Тёмная",
  themeDim: "Приглушённая",
  themeLight: "Светлая",
  loggedToday: "Записано сегодня",
  setStreakStart: "Установить дату начала",
  streakSince: "с",
  clearDate: "сбросить",
  chooseStartDate: "Когда начал?",
  relapseNoteTitle: "Зафиксировать срыв",
  relapseNotePlaceholder: "Что произошло? (необязательно)",
  skip: "Пропустить",
  activity: "Активность",
  relapseNotes: "Заметки",
  day: (n: number) => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return `${n} день`;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} дня`;
    return `${n} дней`;
  },
};

export default ru;
