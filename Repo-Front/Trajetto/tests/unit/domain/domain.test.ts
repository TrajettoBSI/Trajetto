import { addDays, groupByDay, placeDate, resolveDay, toIsoDate } from '@/src/domain/itinerary/itineraryDays';
import { freePeriod } from '@/src/domain/itinerary/freePeriod';
import { mealSlots, MEALS } from '@/src/domain/itinerary/mealSlots';
import { selectAlternatives } from '@/src/domain/alternatives/selectAlternatives';
import { applyAnswerScore } from '@/src/domain/quiz/applyAnswerScore';
import { calcularPerfil, quizData, shuffle } from '@/data/quizData';
import { Place } from '@/services';

const parada = (orderIndex: number, estimatedVisitTime: string, visitDate?: string) =>
  ({ orderIndex, estimatedVisitTime, visitDate, name: `P${orderIndex}`, latitude: 0, longitude: 0 });

describe('dias do roteiro', () => {
  it('converte e soma datas sem depender de fuso', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('usa a data de inicio quando a parada nao tem dia proprio', () => {
    expect(placeDate('2026-11-10', parada(0, '09:00'))).toBe('2026-11-10');
    expect(placeDate('2026-11-10', parada(0, '09:00', '2026-11-11'))).toBe('2026-11-11');
  });

  it('agrupa por dia em ordem e inclui dias sem paradas ate o fim', () => {
    const dias = groupByDay('2026-11-10', [parada(2, '09:00', '2026-11-11'), parada(0, '09:00'), parada(1, '10:30')], '2026-11-12');

    expect(dias.map((d) => [d.date, d.number, d.places.length])).toEqual([
      ['2026-11-10', 1, 2], ['2026-11-11', 2, 1], ['2026-11-12', 3, 0],
    ]);
    expect(dias[0].places.map((p) => p.orderIndex)).toEqual([0, 1]);
  });

  it('escolhe o dia: o selecionado, senao hoje, senao o primeiro ou o ultimo', () => {
    const datas = ['2026-11-10', '2026-11-11'];
    expect(resolveDay([], null, '2026-11-10')).toBeNull();
    expect(resolveDay(datas, '2026-11-11', '2026-11-10')).toBe('2026-11-11');
    expect(resolveDay(datas, null, '2026-11-11')).toBe('2026-11-11');
    expect(resolveDay(datas, null, '2026-11-01')).toBe('2026-11-10');
    expect(resolveDay(datas, null, '2026-12-01')).toBe('2026-11-11');
  });
});

describe('periodo livre do dia', () => {
  it('identifica manha livre e tarde livre', () => {
    expect(freePeriod([])).toBeNull();
    expect(freePeriod([parada(0, '14:00'), parada(1, '21:00')])).toEqual({ period: 'morning', insertAt: 0 });
    expect(freePeriod([parada(0, '09:00'), parada(1, '12:00'), parada(2, '21:00')])).toEqual({ period: 'afternoon', insertAt: 2 });
    expect(freePeriod([parada(0, '09:00'), parada(1, '14:00')])).toBeNull();
  });
});

describe('refeicoes do dia', () => {
  it('encaixa cafe, almoco e jantar pelo horario das paradas', () => {
    const dia = [parada(0, '09:00:00'), parada(1, '12:00:00'), parada(2, '14:00:00'), parada(3, '17:00:00'), parada(4, '21:00:00')];
    const slots = mealSlots(dia);

    expect(slots.map((s) => [s.meal.id, s.insertAt, s.anchor.orderIndex])).toEqual([
      ['breakfast', 0, 0], ['lunch', 2, 1], ['dinner', 4, 3],
    ]);
    expect(mealSlots([])).toEqual([]);
    expect(MEALS.map((m) => m.category)).toEqual(['cafe', 'restaurant', 'restaurant']);
  });
});

describe('alternativas para trocar uma parada', () => {
  const lugar = (name: string, category: string) => ({ name, category } as Place);

  it('prefere 2 da mesma categoria e 1 diferente, sem repetir paradas do roteiro', () => {
    const candidatos = [lugar('A', 'museum'), lugar('B', 'museum'), lugar('C', 'museum'), lugar('D', 'park'), lugar('Atual', 'museum')];
    const escolhidos = selectAlternatives(candidatos, { name: 'Atual', category: 'museum' }, new Set(['C']));

    expect(escolhidos).toHaveLength(3);
    expect(escolhidos.filter((p) => p.category === 'museum')).toHaveLength(2);
    expect(escolhidos.map((p) => p.name)).not.toContain('C');
    expect(escolhidos.map((p) => p.name)).not.toContain('Atual');
  });

  it('sem nada disponivel devolve lista vazia', () => {
    expect(selectAlternatives([lugar('Atual', 'museum')], { name: 'Atual', category: 'museum' }, new Set())).toEqual([]);
  });
});

describe('quiz do perfil de viajante', () => {
  it('soma a pontuacao de perguntas sim/nao e de multipla escolha', () => {
    const simNao = quizData.perguntas.find((p) => p.tipo === 'sim_nao')!;
    const multipla = quizData.perguntas.find((p) => p.tipo === 'multipla_escolha')!;

    const depoisSim = applyAnswerScore(simNao, 'sim', {});
    expect(Object.values(depoisSim).reduce((a, b) => a + b, 0)).toBeGreaterThan(0);

    const letra = multipla.opcoes![0].letra;
    const depoisMultipla = applyAnswerScore(multipla, letra, depoisSim);
    expect(depoisMultipla).not.toBe(depoisSim);
    expect(applyAnswerScore(multipla, 'Z', { SOCIAL: 1 })).toEqual({ SOCIAL: 1 });
  });

  it('o perfil final e o de maior pontuacao, e o embaralhamento preserva os itens', () => {
    expect(calcularPerfil({ SOCIAL: 2, CULTURAL: 5, LUXO: 1 })).toBe('CULTURAL');
    expect(shuffle([1, 2, 3, 4]).sort()).toEqual([1, 2, 3, 4]);
  });
});
