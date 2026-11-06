import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { useItinerarioScroll } from '@/src/pages/tabs/itinerario/hooks/useItinerarioScroll';
import { Places } from '@/hooks/itineraryStore';

jest.mock('expo-router', () => ({
  useFocusEffect: (effect: () => void | (() => void)) => {
    const { useEffect } = jest.requireActual('react');
    useEffect(effect, [effect]);
  },
}));

jest.mock('@/app/utils/isPlacePast', () => ({ isPlacePast: () => false }));

const place = (orderIndex: number, visitDate: string) =>
  ({ orderIndex, visitDate, estimatedVisitTime: '09:00:00' }) as unknown as Places;

const render = async (places: Places[]) => {
  const hook = await renderHook((props: { places: Places[] }) => useItinerarioScroll(props.places, '2026-11-10'), {
    initialProps: { places },
  });
  const scrollTo = jest.fn();
  (hook.result.current.scrollRef as React.RefObject<unknown>).current = { scrollTo };
  return { ...hook, scrollTo };
};

const layout = async (hook: Awaited<ReturnType<typeof render>>, places: Places[]) => {
  await act(async () => places.forEach((p, i) => hook.result.current.registerCardOffset(p.orderIndex, 200 + i * 300)));
};

describe('useItinerarioScroll', () => {
  beforeEach(() => {
    jest.spyOn(global, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => jest.restoreAllMocks());

  const dia1 = [place(0, '2026-11-10'), place(1, '2026-11-10')];

  it('rola ate a proxima parada ao abrir a tela', async () => {
    const hook = await render(dia1);
    await layout(hook, dia1);
    expect(hook.scrollTo).toHaveBeenCalledTimes(1);
  });

  it('nao volta a rolar quando a ordem das paradas do dia muda', async () => {
    const hook = await render(dia1);
    await layout(hook, dia1);
    hook.scrollTo.mockClear();

    const reordenado = [place(1, '2026-11-10'), place(0, '2026-11-10')];
    await hook.rerender({ places: reordenado });
    await layout(hook, reordenado);

    expect(hook.scrollTo).not.toHaveBeenCalled();
  });

  it('rola de novo ao trocar de dia', async () => {
    const hook = await render(dia1);
    await layout(hook, dia1);
    hook.scrollTo.mockClear();

    const dia2 = [place(2, '2026-11-11'), place(3, '2026-11-11')];
    await hook.rerender({ places: dia2 });
    await layout(hook, dia2);

    expect(hook.scrollTo).toHaveBeenCalledTimes(1);
  });
});
