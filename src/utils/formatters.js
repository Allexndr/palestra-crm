/**
 * Formats a phone number string to a consistent "7 777 000 00 00" style
 * @param {string} value - The input value (raw or partially formatted)
 * @returns {string} - The formatted phone number
 */
export const formatPhone = (value) => {
  if (!value) return '';
  
  // Strip all non-digits
  const digits = value.replace(/\D/g, '');
  
  if (digits.length === 0) return '';
  
  const firstDigit = digits[0];
  const cleanDigits = (firstDigit === '8' || (firstDigit === '7' && digits.length > 10)) 
    ? '7' + digits.slice(1) 
    : (digits.length <= 10 && firstDigit !== '7' ? '7' + digits : digits);
  
  let result = '+';
  
  // Format: +7 (777) 000 00 00
  if (cleanDigits.length > 0) {
    result += cleanDigits.substring(0, 1); // +7
  }
  if (cleanDigits.length > 1) {
    result += ' (' + cleanDigits.substring(1, 4); // +7 (777
  }
  if (cleanDigits.length > 4) {
    result += ') ' + cleanDigits.substring(4, 7); // +7 (777) 000
  }
  if (cleanDigits.length > 7) {
    result += ' ' + cleanDigits.substring(7, 9); // +7 (777) 000 00
  }
  if (cleanDigits.length > 9) {
    result += ' ' + cleanDigits.substring(9, 11); // +7 (777) 000 00 00
  }
  
  return result;
};

/**
 * Strips formatting from a phone number for database storage
 * @param {string} value 
 * @returns {string}
 */
export const stripPhone = (value) => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};

/**
 * Formats a number with thousands separators (e.g., 10 000)
 * @param {string|number} value 
 * @returns {string}
 */
export const formatCurrency = (value) => {
  if (value == null || value === '') return '';
  
  // Strip all non-digits
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';
  
  // Format with spaces as thousands separators
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

/**
 * Converts formatted currency string back to number
 * @param {string} value 
 * @returns {number}
 */
export const stripCurrency = (value) => {
  if (!value) return 0;
  const digits = String(value).replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
};
