/** Формат суммы в тенге (без полагания на глиф U+20B8 — на части шрифтов выглядит как «T»). */
export function formatKzt(amount) {
  const n = Math.round(Number(amount) || 0);
  return `${n.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} тенге`;
}
