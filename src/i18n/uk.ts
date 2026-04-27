import type { Translations } from "./en";

const uk: Translations = {
  addHabit: "Додати звичку",
  habitNamePlaceholder: "напр. не курити",
  add: "Додати",
  cancel: "Скасувати",
  cleanDay: "Чистий день",
  relapse: "Зрив",
  currentStreak: "Поточна серія",
  bestStreak: "Найкраща серія",
  totalRelapses: "Всього зривів",
  noHabits: "Ще нічого не відстежується",
  addFirst: "Відстежуй те, з чим борешся",
  stats: "Статистика",
  back: "Назад",
  deleteHabit: "Видалити звичку",
  noHistory: "Даних ще немає",
  settings: "Налаштування",
  language: "Мова",
  theme: "Тема",
  themeDark: "Темна",
  themeDim: "Приглушена",
  themeLight: "Світла",
  loggedToday: "Записано сьогодні",
  setStreakStart: "Встановити дату початку",
  streakSince: "з",
  clearDate: "скинути",
  chooseStartDate: "Коли ти почав?",
  relapseNoteTitle: "Зафіксувати зрив",
  relapseNotePlaceholder: "Що трапилось? (необов'язково)",
  skip: "Пропустити",
  activity: "Активність",
  relapseNotes: "Нотатки",
  exportData: "Експорт даних",
  exportJson: "Експорт JSON",
  exportCsv: "Експорт CSV",
  exportDone: "Збережено в Завантаження",
  notifications: "Сповіщення",
  notifyUnlogged: "Нагадати якщо не записано сьогодні",
  addImage: "Додати зображення",
  changeImage: "Змінити",
  privacyStonePhrase: "твої звички залишаються тут.\nміж тобою і мною.\n(я камінь. я мовчу.)",
  privacyDesc: "Все зберігається локально на твоєму пристрої. Жодних серверів, жодного відстеження. У налаштуваннях можна встановити PIN для додаткового захисту.",
  privacyLater: "Зрозуміло",
  privacySetup: "Налаштувати",
  day: (n: number) => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return `${n} день`;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} дні`;
    return `${n} днів`;
  },
};

export default uk;
