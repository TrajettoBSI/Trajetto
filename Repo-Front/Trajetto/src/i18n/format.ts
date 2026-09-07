import i18n from './index';

// Le sempre o idioma ATIVO no momento da chamada (nao um valor capturado no import),
// senao a formatacao fica presa no idioma que estava ativo quando o modulo carregou.
const activeLocale = () => i18n.language || 'pt-BR';

/** Data no formato do locale ativo. `date` em ISO (YYYY-MM-DD) ou objeto Date. */
export function formatDate(date: string | Date, locale = activeLocale()): string {
  const d = typeof date === 'string' ? new Date(`${date}T00:00:00`) : date;
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
}

/** Intervalo "inicio → fim" com os dois lados no formato do locale ativo. */
export function formatDateRange(start: string, end: string, locale = activeLocale()): string {
  return `${formatDate(start, locale)} → ${formatDate(end, locale)}`;
}

/** Horario HH:mm no formato do locale ativo (24h ou 12h conforme o idioma). `time` em "HH:mm" ou "HH:mm:ss". */
export function formatTime(time: string, locale = activeLocale()): string {
  if (!time) return '';
  const [h, m] = time.split(':');
  const d = new Date();
  d.setHours(Number(h), Number(m ?? 0), 0, 0);
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(d);
}

/** Numero com separador de milhar/decimal do locale ativo. */
export function formatNumber(value: number, locale = activeLocale()): string {
  return new Intl.NumberFormat(locale).format(value);
}

/** Percentual (0-100) com o simbolo e separador do locale ativo. */
export function formatPercent(value: number, locale = activeLocale()): string {
  return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }).format(value / 100);
}

/**
 * Valor monetario. `amount` e o valor decimal (ex: 45.9), nao centavos — os services
 * hoje nao retornam moeda em centavos; se passarem a retornar, divida por 100 antes de chamar.
 */
export function formatCurrency(amount: number, currency: string, locale = activeLocale()): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}
