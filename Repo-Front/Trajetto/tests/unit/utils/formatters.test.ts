import i18n from '@/src/i18n';
import {
  bearing, countActiveFilters, formatCarTime, formatDistance, formatWalkTime, haversineMeters,
  interpolateAlongPath, resolveTodayHours,
} from '@/src/pages/tabs/mapa/mapaFormat';
import * as spot from '@/src/pages/spot/detail/spotFormat';
import { categoryIcon, categoryLabel, formatCategoryLabel, profileLabel } from '@/src/helpers/categoryIcon';
import {
  formatCurrency, formatDate, formatDateRange, formatNumber, formatPercent, formatTime, formatWeekday, formatWeekdayDayMonth,
} from '@/src/i18n/format';
import { getApiError, getErrorCode, getErrorMessage, getErrorStatus, getFieldErrors, getTraceId, isSessionError } from '@/utils/apiError';
import { isEmpty, resolveFeedbackStatus } from '@/src/components/feedback/feedbackStatus';
import { contarCriteriosAtivos, FILTRO_VAZIO, intervaloDoPeriodo, paraConsulta, saneado } from '@/src/pages/admin/dashboard/dashboardFilter';
import { isPlacePast } from '@/app/utils/isPlacePast';
import { isSupportedLanguage } from '@/src/i18n/languages';
import { apiError, networkError, rawResponseError } from '../../helpers';

describe('distancias e tempos do mapa', () => {
  it('calcula distancia, formata e estima a pe e de carro', () => {
    const m = haversineMeters(41.8902, 12.4922, 41.8986, 12.4769);
    expect(m).toBeGreaterThan(1000);
    expect(m).toBeLessThan(2000);
    expect(formatDistance(850.4)).toBe('850 m');
    expect(formatDistance(1500)).toBe('1,5 km');
    expect(formatWalkTime(800)).toBe('10 min');
    expect(formatWalkTime(80 * 90)).toBe('1h 30min');
    expect(formatWalkTime(80 * 60 * 30)).toBe('1d 6h');
    expect(formatCarTime(100)).toBe('< 1 min');
    expect(formatCarTime(5000)).toBe('10 min');
    expect(formatCarTime(500 * 75)).toBe('1h 15min');
    expect(spot.formatDistance(500)).toBe('500 m');
    expect(spot.formatDistance(2500)).toBe('2,5 km');
    expect(spot.formatWalk(800)).toBe('10 min');
    expect(spot.formatWalk(80 * 75)).toBe('1h 15min');
    expect(spot.formatCar(100)).toBe('< 1 min');
    expect(spot.formatCar(5000)).toBe('10 min');
    expect(spot.formatCar(500 * 70)).toBe('1h 10min');
    expect(spot.haversineMeters(0, 0, 0, 0)).toBe(0);
  });

  it('interpola ao longo do trajeto e calcula a direcao', () => {
    const a = { latitude: 0, longitude: 0 };
    const b = { latitude: 0, longitude: 2 };
    expect(interpolateAlongPath([], 0.5)).toEqual({ latitude: 0, longitude: 0 });
    expect(interpolateAlongPath([a], 0.5)).toEqual(a);
    expect(interpolateAlongPath([a, b], 0.5)).toEqual({ latitude: 0, longitude: 1 });
    expect(Math.round(bearing(a, b))).toBe(90);
  });

  it('conta os filtros ativos do mapa', () => {
    expect(countActiveFilters({})).toBe(0);
    expect(countActiveFilters({ category: 'museum', fee: 'no', hasHours: true, profile: 'SOCIAL', maxDistance: 500 })).toBe(5);
  });
});

describe('horario de funcionamento', () => {
  const quarta10h = new Date(2026, 9, 14, 10, 0);

  it('le o horario do dia no mapa: aberto, antes de abrir, fechado e desconhecido', () => {
    const horario = 'Jan 01-Dec 31: 09:00-18:00';
    expect(resolveTodayHours(null)).toEqual({ kind: 'unknown' });
    expect(resolveTodayHours(horario, quarta10h)).toEqual({ kind: 'open', closesAt: '18:00' });
    expect(resolveTodayHours(horario, new Date(2026, 9, 14, 8, 0))).toEqual({ kind: 'beforeOpening', opensAt: '09:00' });
    expect(resolveTodayHours(horario, new Date(2026, 9, 14, 19, 0))).toEqual({ kind: 'closed' });
    expect(resolveTodayHours('Oct 14 off; Jan 01-Dec 31: 09:00-18:00', quarta10h)).toEqual({ kind: 'closed' });
    expect(resolveTodayHours('Nov 01-Feb 28: 09:00-18:00', new Date(2026, 0, 10, 10))).toEqual({ kind: 'open', closesAt: '18:00' });
    expect(resolveTodayHours('Mo-Fr 09:00-18:00', quarta10h)).toEqual({ kind: 'unknown' });
  });

  it('monta a tabela do detalhe do local e diz se esta aberto agora', () => {
    const entradas = spot.parseOpeningHours('Oct 01-Oct 31: 09:00-18:00; Dec 25 off; Mo-Fr', quarta10h);

    expect(entradas).toEqual([
      { period: 'Oct 01-Oct 31', hours: '09:00-18:00', closed: false, isToday: true },
      { period: 'Dec 25', hours: '', closed: true, isToday: false },
      { period: 'Mo-Fr', hours: '', closed: false, isToday: false },
    ]);
    expect(spot.isOpenNow(entradas, quarta10h)).toBe(true);
    expect(spot.isOpenNow(entradas, new Date(2026, 9, 14, 20, 0))).toBe(false);
    expect(spot.isOpenNow(spot.parseOpeningHours('Oct 14 off', quarta10h), quarta10h)).toBe(false);
    expect(spot.isOpenNow([], quarta10h)).toBeNull();
    expect(spot.parseOpeningHours('')).toEqual([]);
  });
});

describe('categorias e perfis', () => {
  it('escolhe o icone pela categoria', () => {
    const casos: [string, string][] = [
      ['museum', '🏛️'], ['historic_monument', '🗿'], ['historic_castle', '🏰'], ['palace', '🏯'],
      ['historic_church', '⛪'], ['historic_temple', '🛐'], ['garden', '🌷'], ['park', '🌳'],
      ['square', '🏙️'], ['fountain', '⛲'], ['historic_aqueduct', '🌉'], ['historic_ruins', '🏚️'],
      ['artwork', '🎨'], ['theatre', '🎭'], ['tower', '🗼'], ['viewpoint', '🌄'], ['beach', '🏖️'],
      ['zoo', '🦁'], ['aquarium', '🐠'], ['amusement', '🎡'], ['stadium', '🏟️'], ['marketplace', '🛍️'],
      ['hotel', '🏨'], ['restaurant', '🍽️'], ['pub', '🍸'], ['cafe', '☕'], ['attraction', '✨'], ['', '📍'],
    ];
    casos.forEach(([categoria, icone]) => expect(categoryIcon(categoria)).toBe(icone));
  });

  it('traduz categoria e perfil, com rotulo legivel para o que nao tem traducao', () => {
    expect(categoryLabel('historic_archaeological_site')).toBe('Sítio arqueológico');
    expect(categoryLabel('nova_categoria')).toBe('Nova Categoria');
    expect(categoryLabel('Outros')).toBe('Outros');
    expect(categoryLabel(null)).toBe('');
    expect(profileLabel('CULTURAL')).toBe('Explorador Cultural');
    expect(profileLabel('Sem perfil')).toBe('Sem perfil');
    expect(profileLabel(undefined)).toBe('');
    expect(formatCategoryLabel('ice_cream')).toBe('Ice Cream');
  });
});

describe('formatacao pelo idioma do app', () => {
  it('formata datas, horas, numeros e moeda em pt-BR', () => {
    expect(formatDate('2026-11-10')).toBe('10/11/2026');
    expect(formatDate('data-invalida')).toBe('');
    expect(formatDateRange('2026-11-10', '2026-11-12')).toBe('10/11/2026 → 12/11/2026');
    expect(formatTime('09:30:00')).toBe('09:30');
    expect(formatTime('')).toBe('');
    expect(formatWeekday('2026-11-10')).toBe('terça-feira');
    expect(formatWeekday('x')).toBe('');
    expect(formatWeekdayDayMonth('2026-11-10')).toContain('10/11');
    expect(formatWeekdayDayMonth('x')).toBe('');
    expect(formatNumber(1234.5)).toBe('1.234,5');
    expect(formatPercent(75)).toBe('75%');
    expect(formatCurrency(10, 'BRL')).toContain('10,00');
    expect(isSupportedLanguage('en-US')).toBe(true);
    expect(isSupportedLanguage('fr-FR')).toBe(false);
  });
});

describe('contrato de erro da API', () => {
  it('le codigo, status, mensagem, trace e campos', () => {
    const erro = apiError(400, 'VALIDATION_ERROR', 'Campos invalidos', [
      { field: 'email', message: 'E-mail invalido' },
      { field: 'email', message: 'Repetido' },
      { field: 'password', message: 'Senha curta' },
    ]);

    expect(getApiError(erro)?.code).toBe('VALIDATION_ERROR');
    expect(getErrorCode(erro)).toBe('VALIDATION_ERROR');
    expect(getErrorStatus(erro)).toBe(400);
    expect(getTraceId(erro)).toBe('t');
    expect(getErrorMessage(erro)).toBe('E-mail invalido\nRepetido\nSenha curta');
    expect(getFieldErrors(erro)).toEqual({ email: 'E-mail invalido', password: 'Senha curta' });
    expect(getErrorMessage(apiError(409, 'RESOURCE_CONFLICT', 'Ja existe'))).toBe('Ja existe');
  });

  it('trata falta de rede, texto puro e erros que nao sao da API', () => {
    expect(getErrorMessage(networkError())).toBe(i18n.t('common:networkError'));
    expect(getErrorMessage(rawResponseError(500, 'Servidor caiu'))).toBe('Servidor caiu');
    expect(getErrorMessage(new Error('qualquer'), 'padrao')).toBe('padrao');
    expect(getErrorStatus(new Error('x'))).toBeNull();
    expect(getFieldErrors(new Error('x'))).toEqual({});
  });

  it('reconhece quando a sessao deixou de valer', () => {
    expect(isSessionError(apiError(401, 'SESSION_EXPIRED', 'Expirou'))).toBe(true);
    expect(isSessionError(apiError(401, 'INVALID_CREDENTIALS', 'Senha errada'))).toBe(false);
    expect(isSessionError(rawResponseError(401, ''))).toBe(true);
  });
});

describe('estado das telas e filtros do painel', () => {
  it('decide entre carregando, erro, vazio e conteudo', () => {
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty([])).toBe(true);
    expect(isEmpty({})).toBe(true);
    expect(isEmpty(0)).toBe(false);
    expect(resolveFeedbackStatus({ loading: true, error: null, data: null })).toBe('loading');
    expect(resolveFeedbackStatus({ loading: false, error: 'x', data: null })).toBe('error');
    expect(resolveFeedbackStatus({ loading: false, error: null, data: [] })).toBe('empty');
    expect(resolveFeedbackStatus({ loading: true, error: null, data: [1] })).toBe('content');
  });

  it('transforma o periodo do painel em datas e valida o recorte salvo', () => {
    const hoje = new Date(2026, 9, 13);
    expect(intervaloDoPeriodo('todo', hoje)).toEqual({});
    expect(intervaloDoPeriodo('ultimos30', hoje)).toEqual({ from: '2026-09-14', to: '2026-10-13' });
    expect(intervaloDoPeriodo('ultimos90', hoje)).toEqual({ from: '2026-07-16', to: '2026-10-13' });
    expect(intervaloDoPeriodo('ultimos12meses', hoje)).toEqual({ from: '2025-10-14', to: '2026-10-13' });
    expect(intervaloDoPeriodo('anoAtual', hoje)).toEqual({ from: '2026-01-01', to: '2026-12-31' });
    expect(intervaloDoPeriodo('proximos90', hoje)).toEqual({ from: '2026-10-13', to: '2027-01-10' });

    const filtro = { periodo: 'anoAtual' as const, profile: 'SOCIAL', country: null, category: 'museum' };
    expect(contarCriteriosAtivos(filtro)).toBe(3);
    expect(paraConsulta(filtro, hoje)).toEqual({ from: '2026-01-01', to: '2026-12-31', profile: 'SOCIAL', country: null, category: 'museum' });
    expect(saneado(null)).toEqual(FILTRO_VAZIO);
    expect(saneado({ periodo: 'inexistente', profile: ' ', country: 'Brasil', category: 3 })).toEqual({ ...FILTRO_VAZIO, country: 'Brasil' });
  });

  it('marca como passada a parada cujo horario ja foi', () => {
    expect(isPlacePast('2000-01-01', '09:00')).toBe(true);
    expect(isPlacePast('2999-01-01', '09:00')).toBe(false);
  });
});
