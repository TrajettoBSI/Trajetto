import i18n from './index';

// Le sempre o idioma ATIVO no momento da chamada (nao um valor capturado no import),
// senao a formatacao fica presa no idioma que estava ativo quando o modulo carregou.
const activeLocale = () => i18n.language || 'pt-BR';

/**
 * Nome do lugar no idioma ativo: o catalogo traz o nome em pt, en e es (dos rotulos do
 * Wikidata); sem traducao, fica o nome original.
 */
export function placeName(
  place: { name: string; names?: Record<string, string> | null },
  locale = activeLocale(),
): string {
  return place.names?.[locale.slice(0, 2)] || place.name;
}

/** Data no formato do locale ativo. `date` em ISO (YYYY-MM-DD) ou objeto Date. */
export function formatDate(date: string | Date, locale = activeLocale()): string {
  const d = typeof date === 'string' ? new Date(`${date}T00:00:00`) : date;
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
}

export function formatWeekday(date: string, locale = activeLocale()): string {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(d);
}

export function formatWeekdayDayMonth(date: string, locale = activeLocale()): string {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(locale, { weekday: 'short', day: '2-digit', month: '2-digit' }).format(d);
}

/** Dia e mes (25/10) no formato do locale ativo. */
export function formatDayMonth(date: string, locale = activeLocale()): string {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit' }).format(d);
}

/** Nome do roteiro: o dado pelo usuario ou, sem ele, "Roteiro Paris, dia 25/10". */
export function itineraryTitle(itinerary: { name?: string | null; city?: string | null; startDate: string }): string {
  if (itinerary.name) return itinerary.name;
  const date = formatDayMonth(itinerary.startDate);
  if (!itinerary.city) return i18n.t('roteiros:itineraryName.noCity', { date });
  const city = i18n.t(`roteiros:cities.${itinerary.city}`, { defaultValue: itinerary.city });
  return i18n.t('roteiros:itineraryName.generic', { city, date });
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

/** Numero com casas decimais fixas no formato do locale ativo (ex: 4,5 em pt-BR, 4.5 em en-US). */
export function formatDecimal(value: number, fractionDigits = 1, locale = activeLocale()): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/** Distancia em metros ou quilometros, com o separador decimal do locale ativo. */
export function formatDistance(meters: number, locale = activeLocale()): string {
  if (meters < 1000) return `${formatNumber(Math.round(meters), locale)} m`;
  return `${formatDecimal(meters / 1000, 1, locale)} km`;
}

const OSM_WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const OSM_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Horario de funcionamento no padrao do OpenStreetMap ("Mo-Fr 09:00-18:00; Dec 25 off"),
 * com dias, meses, horas e "off" no idioma ativo.
 */
export function formatOpeningHours(raw: string | null | undefined, locale = activeLocale()): string {
  if (!raw) return '';
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  const dayMonth = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
  const month = new Intl.DateTimeFormat(locale, { month: 'short' });
  const months = OSM_MONTHS.join('|');
  const days = OSM_WEEKDAYS.join('|');

  return raw
    .replace(new RegExp(String.raw`\b(${months})\s+(\d{1,2})\b`, 'g'), (_, m: string, d: string) =>
      dayMonth.format(new Date(2024, OSM_MONTHS.indexOf(m), Number(d))))
    .replace(new RegExp(String.raw`\b(${months})\b`, 'g'), (m: string) => month.format(new Date(2024, OSM_MONTHS.indexOf(m), 1)))
    .replace(new RegExp(String.raw`\b(${days})\b`, 'g'), (d: string) =>
      weekday.format(new Date(2024, 0, 1 + OSM_WEEKDAYS.indexOf(d))))
    .replace(/\b(\d{1,2}:\d{2})\b/g, (t: string) => formatTime(t, locale))
    .replace(/\boff\b/gi, i18n.t('spotDetail:closed', { lng: locale }));
}
