import React from 'react';
import { StyleSheet } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import PasswordStrength from '@/src/components/PasswordStrength/PasswordStrength';
import { lightColors } from '@/src/theme';

const filledBars = () => [0, 1, 2, 3].map((i) => {
  const { backgroundColor } = StyleSheet.flatten(screen.getByTestId(`password-strength-${i}`).props.style);
  return backgroundColor !== lightColors.trackMuted;
});

describe('barra de forca da senha', () => {
  it.each([
    ['', [false, false, false, false]],
    ['1', [true, false, false, false]],
    ['!', [true, false, false, false]],
    ['abcdefgh', [true, false, false, false]],
    ['1!', [true, true, false, false]],
    ['abcdefgh1', [true, true, false, false]],
    ['Abcdefgh1', [true, true, true, false]],
    ['Abcdefgh1!', [true, true, true, true]],
  ])('a senha "%s" pinta os segmentos da esquerda para a direita', async (senha, esperado) => {
    await render(<PasswordStrength password={senha} />);
    expect(filledBars()).toEqual(esperado);
  });
});
