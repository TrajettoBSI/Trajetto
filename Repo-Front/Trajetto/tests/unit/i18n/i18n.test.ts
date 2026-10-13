import fs from 'fs';
import path from 'path';
import i18n from '@/src/i18n';
import {
  formatCurrency, formatDate, formatDecimal, formatDistance, formatNumber, formatOpeningHours, formatTime,
} from '@/src/i18n/format';
import { COUNTRY_TRANSLATIONS, countryLabel } from '@/src/i18n/countries';
import { categoryLabel, profileLabel } from '@/src/helpers/categoryIcon';
import { countries } from '@/utils/countries';

const LOCALES_DIR = path.join(__dirname, '../../../src/i18n/locales');
const IDIOMAS = ['pt-BR', 'en-US', 'es-ES'];

const chaves = (obj: Record<string, unknown>, prefixo = ''): string[] =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? chaves(v as Record<string, unknown>, `${prefixo}${k}.`)
      : [`${prefixo}${k.replace(/_(one|other|many|zero|few|two)$/, '')}`]);

afterEach(async () => {
  await i18n.changeLanguage('pt-BR');
});

describe('textos estaticos', () => {
  const arquivos = fs.readdirSync(path.join(LOCALES_DIR, 'pt-BR'));

  it.each(arquivos)('%s tem as mesmas chaves nos tres idiomas', (arquivo) => {
    const [base, ...outros] = IDIOMAS.map((idioma) =>
      new Set(chaves(JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, idioma, arquivo), 'utf-8')))));

    outros.forEach((conjunto) => expect([...conjunto].sort()).toEqual([...base].sort()));
  });

  it('a mesma tela muda de lingua ao trocar o idioma', async () => {
    const textos = [];
    for (const idioma of IDIOMAS) {
      await i18n.changeLanguage(idioma);
      textos.push(i18n.t('login:submit'), i18n.t('roteiros:generateFlow.paces.LEVE.title'));
    }
    expect(textos).toEqual(['Entrar', 'Roteiro leve, sem pressa', 'Log in', 'Light, no rush', 'Entrar', 'Itinerario ligero, sin prisa']);
  });
});

describe('formatos de dados', () => {
  it.each([
    ['pt-BR', '10/11/2026', '1.234,5', '4,5', '1,5 km', '850 m'],
    ['en-US', '11/10/2026', '1,234.5', '4.5', '1.5 km', '850 m'],
    ['es-ES', '10/11/2026', '1234,5', '4,5', '1,5 km', '850 m'],
  ])('%s: data, numero, decimal e distancia', (idioma, data, numero, decimal, km, metros) => {
    expect(formatDate('2026-11-10', idioma)).toBe(data);
    expect(formatNumber(1234.5, idioma)).toBe(numero);
    expect(formatDecimal(4.5, 1, idioma)).toBe(decimal);
    expect(formatDistance(1500, idioma)).toBe(km);
    expect(formatDistance(850, idioma)).toBe(metros);
  });

  it('o horario segue o relogio de cada idioma', () => {
    expect(formatTime('21:00:00', 'pt-BR')).toBe('21:00');
    expect(formatTime('21:00:00', 'es-ES')).toBe('21:00');
    expect(formatTime('21:00:00', 'en-US')).toMatch(/09:00\sPM/);
  });

  it('valores monetarios usam simbolo e separadores do idioma', () => {
    expect(formatCurrency(1234.5, 'EUR', 'pt-BR')).toMatch(/€\s1\.234,50/);
    expect(formatCurrency(1234.5, 'EUR', 'en-US')).toBe('€1,234.50');
    expect(formatCurrency(1234.5, 'EUR', 'es-ES')).toMatch(/1234,50\s€/);
    expect(formatCurrency(10, 'BRL', 'pt-BR')).toMatch(/R\$\s10,00/);
  });
});

describe('dados da base no idioma do usuario', () => {
  it('horario de funcionamento do OpenStreetMap', () => {
    const bruto = 'Mo-Fr 09:00-18:00; Mar 30-Sep 30: 08:30-19:15; Dec 25 off';

    expect(formatOpeningHours(bruto, 'pt-BR')).toBe('seg.-sex. 09:00-18:00; 30 de mar.-30 de set.: 08:30-19:15; 25 de dez. Fechado');
    expect(formatOpeningHours(bruto, 'es-ES')).toBe('lun-vie 09:00-18:00; 30 mar-30 sept: 08:30-19:15; 25 dic Cerrado');
    expect(formatOpeningHours(bruto, 'en-US')).toMatch(/^Mon-Fri 09:00\sAM-06:00\sPM; Mar 30-Sep 30: .* Dec 25 Closed$/);
    expect(formatOpeningHours(null)).toBe('');
  });

  it('pais gravado em portugues aparece no idioma do usuario', () => {
    expect(countryLabel('Alemanha', 'pt-BR')).toBe('Alemanha');
    expect(countryLabel('Alemanha', 'en-US')).toBe('Germany');
    expect(countryLabel('Alemanha', 'es-ES')).toBe('Alemania');
    expect(countryLabel('Estados Unidos', 'en-US')).toBe('United States');
    expect(countryLabel('Pais Inventado', 'en-US')).toBe('Pais Inventado');
    expect(countryLabel(null, 'en-US')).toBe('');
  });

  it('todo pais do cadastro tem traducao', () => {
    expect(countries.filter((c) => !COUNTRY_TRANSLATIONS[c])).toEqual([]);
  });

  it('categorias e perfis vindos do banco', async () => {
    await i18n.changeLanguage('en-US');
    expect(categoryLabel('historic_archaeological_site')).toBe('Archaeological site');
    expect(profileLabel('CULTURAL')).toBe(i18n.t('quiz:profiles.CULTURAL.nome'));
    await i18n.changeLanguage('es-ES');
    expect(categoryLabel('ice_cream')).toBe('Heladería');
  });
});
