const SPORT_MAP = {
  boxing: 'Бокс',
  mma: 'ММА',
  judo: 'Дзюдо',
  karate: 'Каратэ',
  kickboxing: 'Кикбоксинг',
  grappling: 'Грэпплинг',
  thai: 'Тайский бокс',
  'jiu-jitsu': 'Джиу-джитсу',
  schedule: 'Расписание',
};

/**
 * Подпись дисциплины для таблиц (англ. ключи из форм / старые данные).
 */
export function scheduleTypeLabel(type) {
  if (type == null || type === '') return '—';
  const t = String(type).trim();
  const key = t.toLowerCase();
  if (SPORT_MAP[key]) return SPORT_MAP[key];
  if (/[а-яёА-ЯЁ]/.test(t)) return t;
  if (t.length <= 1) return t || '—';
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function coachLine(item) {
  const raw = item?.coachName || item?.coach;
  const s = raw != null ? String(raw).trim() : '';
  return s || 'Не указан';
}

/** Первый символ для аватарки (кириллица / латиница). */
export function firstGrapheme(s) {
  const t = s != null ? String(s).trim() : '';
  if (!t) return '?';
  return [...t][0] || '?';
}
