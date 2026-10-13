import React from 'react';
import { act, render } from '@testing-library/react-native';
import AnimatedDashedPolyline from '@/src/pages/tabs/mapa/components/AnimatedDashedPolyline/AnimatedDashedPolyline';

describe('linha tracejada animada do trajeto', () => {
  it('avanca o tracejado com o tempo e para ao sair da tela', async () => {
    jest.useFakeTimers();
    const limpar = jest.spyOn(global, 'clearInterval');
    const { unmount } = await render(
      <AnimatedDashedPolyline coordinates={[{ latitude: 0, longitude: 0 }, { latitude: 1, longitude: 1 }]} color="#000" zIndex={1} />,
    );

    await act(async () => { jest.advanceTimersByTime(100); });
    await unmount();
    expect(limpar).toHaveBeenCalled();
    jest.useRealTimers();
  });
});
