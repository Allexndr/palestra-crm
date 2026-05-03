export const LEAGUE_TEMPLATES = {
  martial_arts: {
    name: 'Боевые искусства',
    metrics: [
      { id: 'strength', label: 'Сила', color: '#F87171' },
      { id: 'speed', label: 'Скорость', color: '#FBBF24' },
      { id: 'reaction', label: 'Реакция', color: '#34D399' },
      { id: 'endurance', label: 'Выносливость', color: '#60A5FA' },
      { id: 'technique', label: 'Техника', color: '#818CF8' },
      { id: 'discipline', label: 'Дисциплина', color: '#6366F1' }
    ]
  },
  rpg: {
    name: 'RPG Прогресс',
    metrics: [
      { id: 'points', label: 'Опыт', color: '#60A5FA' },
      { id: 'level', label: 'Уровень', color: '#A78BFA' },
      { id: 'intellect', label: 'Интеллект', color: '#34D399' },
      { id: 'charisma', label: 'Харизма', color: '#FBBF24' },
      { id: 'agility', label: 'Ловкость', color: '#F87171' },
      { id: 'quests', label: 'Квесты', color: '#F97316' }
    ]
  },
  tournament: {
    name: 'Турнирная таблица',
    metrics: [
      { id: 'wins', label: 'Победы', color: '#34D399' },
      { id: 'losses', label: 'Поражения', color: '#F87171' },
      { id: 'draws', label: 'Ничьи', color: '#94A3B8' },
      { id: 'points', label: 'Очки', color: '#FBBF24' }
    ]
  },
  attendance: {
    name: 'Посещаемость и Дисциплина',
    metrics: [
      { id: 'attendance', label: 'Посещаемость', color: '#60A5FA' },
      { id: 'discipline', label: 'Дисциплина', color: '#6366F1' },
      { id: 'activity', label: 'Активность', color: '#F97316' },
      { id: 'results', label: 'Результат', color: '#34D399' }
    ]
  }
};
