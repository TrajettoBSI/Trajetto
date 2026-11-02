import { act, renderHook } from '@testing-library/react-native';
import { REVEAL_STEP_MS, useRouteReveal } from '@/src/pages/tabs/mapa/hooks/useRouteReveal';

describe('rota desenhada no mapa', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('mostra um trecho de cada vez e recomeca quando a rota muda', async () => {
    const rota = ['a', 'b', 'c'];
    const { result, rerender } = await renderHook(({ trechos }: { trechos: string[] }) => useRouteReveal(trechos), { initialProps: { trechos: rota } });

    expect(result.current).toEqual([]);
    await act(async () => { jest.advanceTimersByTime(REVEAL_STEP_MS); });
    expect(result.current).toEqual(['a']);
    await act(async () => { jest.advanceTimersByTime(REVEAL_STEP_MS * 5); });
    expect(result.current).toEqual(rota);

    await rerender({ trechos: ['x', 'y'] });
    expect(result.current).toEqual([]);
    await act(async () => { jest.advanceTimersByTime(REVEAL_STEP_MS * 2); });
    expect(result.current).toEqual(['x', 'y']);
  });
});
