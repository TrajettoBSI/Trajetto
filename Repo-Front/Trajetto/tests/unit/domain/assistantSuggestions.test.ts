import { assistantSuggestions, LONG_DAY_KM } from '@/src/domain/itinerary/assistantSuggestions';
import { Itinerary, Places } from '@/hooks/itineraryStore';

const parada = (category: string, extra: Partial<Places> = {}): Places => ({
  name: category, address: '', latitude: 0, longitude: 0, estimatedVisitTime: '09:00:00', orderIndex: 0, category, fee: 'no', ...extra,
});

const roteiro = (places: Places[], extra: Partial<Itinerary> = {}): Itinerary => ({
  id: 1, active: true, startDate: '2099-11-10', endDate: '2099-11-11', places, ...extra,
});

const keys = (itinerary: Itinerary, day: Places[] = [], rainy = false) =>
  assistantSuggestions(itinerary, day, rainy).map((s) => s.key);

describe('assistantSuggestions', () => {
  it('avisa da chuva so quando o dia tem parada ao ar livre', () => {
    const parque = parada('park');
    expect(keys(roteiro([parque]), [parque], true)).toContain('rain');
    expect(keys(roteiro([parque]), [parque], false)).not.toContain('rain');
    const museu = parada('museum');
    expect(keys(roteiro([museu]), [museu], true)).not.toContain('rain');
  });

  it('sugere encurtar o dia puxado, com os km, e para depois de pedir', () => {
    const dia = [parada('museum', { distanceFromPreviousKm: LONG_DAY_KM }), parada('park', { distanceFromPreviousKm: 1.4 })];
    expect(assistantSuggestions(roteiro(dia), dia, false)[0]).toEqual({ key: 'longDay', km: 9 });

    const pedido = roteiro(dia, { preferences: { moreCategories: [], lessCategories: [], avoidPaid: false, pace: '', mustInclude: [], exclude: [], walking: 'MENOS' } });
    expect(keys(pedido, dia)).not.toContain('longDay');
    expect(keys(roteiro(dia), [parada('museum', { distanceFromPreviousKm: 2 })])).not.toContain('longDay');
  });

  it('aponta a categoria que domina o roteiro, com a contagem, mas nao "atracoes"', () => {
    const lugares = [parada('museum'), parada('museum'), parada('museum'), parada('park'), parada('attraction')];
    expect(assistantSuggestions(roteiro(lugares), [], false)).toContainEqual(
      { key: 'dominant', count: 3, total: 5, category: 'museum' },
    );
    expect(keys(roteiro([parada('attraction'), parada('attraction'), parada('attraction')]))).not.toContain('dominant');
    expect(keys(roteiro([parada('museum'), parada('museum'), parada('park'), parada('park'), parada('zoo'), parada('bar')]))).not.toContain('dominant');
  });

  it('nao sugere reduzir o que o viajante acabou de pedir', () => {
    const lugares = [parada('museum'), parada('museum'), parada('museum')];
    const pedido = roteiro(lugares, { preferences: { moreCategories: ['museum'], lessCategories: [], avoidPaid: false, pace: '', mustInclude: [], exclude: [] } });
    expect(keys(pedido)).not.toContain('dominant');
  });

  it('oferece so gratuitos quando ha pagos e o caminho de volta depois de pedir', () => {
    const pagos = [parada('park', { fee: 'yes' }), parada('zoo', { fee: 'yes' }), parada('bar', { fee: 'yes' })];
    expect(assistantSuggestions(roteiro(pagos), [], false)).toContainEqual({ key: 'paid', count: 3 });
    expect(keys(roteiro(pagos.slice(0, 2)))).not.toContain('paid');

    const gratis = roteiro(pagos, { preferences: { moreCategories: [], lessCategories: [], avoidPaid: true, pace: '', mustInclude: [], exclude: [] } });
    expect(keys(gratis)).toContain('allowPaid');
    expect(keys(gratis)).not.toContain('paid');
  });

  it('completa com o que falta na viagem, sem repetir pedidos, e limita a quatro', () => {
    const vazio = keys(roteiro([parada('attraction')]));
    expect(vazio).toEqual(['calmer', 'nature', 'nightlife', 'history']);
    expect(keys(roteiro([parada('attraction')], { pace: 'LEVE' }))).not.toContain('calmer');

    const pediu = roteiro([parada('attraction')], { preferences: { moreCategories: ['bar', 'park'], lessCategories: [], avoidPaid: false, pace: '', mustInclude: [], exclude: [] } });
    expect(keys(pediu)).not.toContain('nature');
    expect(keys(pediu)).not.toContain('nightlife');

    const dia = [parada('park', { distanceFromPreviousKm: 20, fee: 'yes' }), parada('park', { fee: 'yes' }), parada('park', { fee: 'yes' })];
    expect(assistantSuggestions(roteiro(dia), dia, true)).toHaveLength(4);
  });

  it('um roteiro com igreja e sem nada pesado pode sugerir menos igrejas', () => {
    const lugares = [parada('historic_church'), parada('park'), parada('bar')];
    expect(keys(roteiro(lugares, { pace: 'LEVE' }))).toContain('lessChurches');
  });
});
