/**
 * Утилиты для валидации дат
 */

/**
 * Проверяет, является ли дата валидной и не меньше 1900 года
 * @param {string|Date} dateString - Дата для проверки
 * @returns {boolean}
 */
export const isValidBirthDate = (dateString) => {
  if (!dateString) return true; // Пустая дата валидна (необязательное поле)
  
  const date = new Date(dateString);
  
  // Проверка на валидность даты (не Invalid Date)
  if (isNaN(date.getTime())) {
    return false;
  }
  
  // Проверка что год не меньше 1900
  const year = date.getFullYear();
  if (year < 1900) {
    return false;
  }
  
  // Проверка что дата не в будущем
  const now = new Date();
  if (date > now) {
    return false;
  }
  
  // Проверка на существование даты (например, 30 февраля не существует)
  const [inputYear, inputMonth, inputDay] = dateString.split('-').map(Number);
  if (inputYear && inputMonth && inputDay) {
    const checkDate = new Date(inputYear, inputMonth - 1, inputDay);
    if (checkDate.getFullYear() !== inputYear || 
        checkDate.getMonth() !== inputMonth - 1 || 
        checkDate.getDate() !== inputDay) {
      return false;
    }
  }
  
  return true;
};

/**
 * Возвращает сообщение об ошибке для даты
 * @param {string|Date} dateString 
 * @returns {string|null}
 */
export const getBirthDateError = (dateString) => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Некорректная дата';
  }
  
  const year = date.getFullYear();
  if (year < 1900) {
    return 'Год должен быть не меньше 1900';
  }
  
  const now = new Date();
  if (date > now) {
    return 'Дата не может быть в будущем';
  }
  
  // Проверка на существование даты
  const [inputYear, inputMonth, inputDay] = dateString.split('-').map(Number);
  if (inputYear && inputMonth && inputDay) {
    const checkDate = new Date(inputYear, inputMonth - 1, inputDay);
    if (checkDate.getFullYear() !== inputYear || 
        checkDate.getMonth() !== inputMonth - 1 || 
        checkDate.getDate() !== inputDay) {
      return 'Такой даты не существует (например, 30 февраля)';
    }
  }
  
  return null;
};

/**
 * Форматирует дату для отображения
 * @param {string|Date} dateString 
 * @returns {string}
 */
export const formatBirthDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  if (year < 1900) return '';
  
  return `${day}.${month}.${year}`;
};

/**
 * Парсит дату из различных форматов
 * @param {string} dateString 
 * @returns {Date|null}
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  
  // Поддержка форматов: DD.MM.YYYY, DD/MM/YYYY, YYYY-MM-DD
  const formats = [
    /^(\d{2})\.(\d{2})\.(\d{4})$/,  // DD.MM.YYYY
    /^(\d{2})\/(\d{2})\/(\d{4})$/,  // DD/MM/YYYY
    /^(\d{4})-(\d{2})-(\d{2})$/,    // YYYY-MM-DD
  ];
  
  for (const format of formats) {
    const match = dateString.match(format);
    if (match) {
      let day, month, year;
      
      if (format.toString().includes('YYYY')) {
        // Формат YYYY-MM-DD
        year = parseInt(match[1], 10);
        month = parseInt(match[2], 10) - 1;
        day = parseInt(match[3], 10);
      } else {
        // Формат DD.MM.YYYY или DD/MM/YYYY
        day = parseInt(match[1], 10);
        month = parseInt(match[2], 10) - 1;
        year = parseInt(match[3], 10);
      }
      
      const date = new Date(year, month, day);
      
      // Проверка на валидность
      if (date.getFullYear() === year && 
          date.getMonth() === month && 
          date.getDate() === day &&
          year >= 1900) {
        return date;
      }
    }
  }
  
  return null;
};
