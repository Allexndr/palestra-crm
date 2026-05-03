/**
 * Normalizes a phone number to digits only, handling +7 and 8 prefixes.
 * @param {string} phone 
 * @returns {string}
 */
export function normalizePhone(phone) {
  if (!phone) return '';
  
  // Strip all non-digits
  let digits = phone.replace(/\D/g, '');
  
  if (!digits) return '';

  // If starts with 8, change to 7
  if (digits.startsWith('8')) {
    digits = '7' + digits.slice(1);
  }
  
  // If starts with 7 but it's like 7705..., ensure it has enough length
  // Standard KZ number is 11 digits (7 7xx xxx xx xx)
  if (digits.length === 10 && !digits.startsWith('7')) {
    digits = '7' + digits;
  }

  return digits;
}
