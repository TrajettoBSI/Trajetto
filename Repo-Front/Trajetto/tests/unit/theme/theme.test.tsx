import React from 'react';
import { Text, TouchableOpacity, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import {
  AppColors, darkColors, highContrastColors, lightColors, resolveScheme, ThemeProvider, useColors, useTheme,
} from '@/src/theme';
import Perfil from '@/src/pages/profile/Perfil/Perfil';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({ __esModule: true, default: jest.fn(() => 'light') }));
const mockAuth = { user: { id: 1, firstName: 'Ana', lastName: 'Souza', email: 'a@t.com', isAdmin: false }, logout: jest.fn() };
jest.mock('@/context/AuthContext', () => ({ useAuth: () => mockAuth }));

const canal = (c: number) => {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const luminancia = (hex: string) => {
  const n = hex.replace('#', '');
  const full = n.length === 3 ? n.split('').map((c) => c + c).join('') : n;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
};
const contraste = (a: string, b: string) => {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

const pares = (c: AppColors): [string, string, string][] => [
  ['texto sobre fundo', c.text, c.background],
  ['texto sobre cartao', c.text, c.white],
  ['titulo sobre cartao', c.gray900, c.white],
  ['texto sobre o azul da marca', c.onPrimary, c.primary],
  ['texto secundario sobre cartao', c.textMuted, c.white],
  ['erro sobre cartao', c.errorText, c.white],
];

describe('paletas de cores', () => {
  it.each([
    ['claro', lightColors, 4.5],
    ['escuro', darkColors, 4.5],
    ['alto contraste', highContrastColors, 7],
  ])('tema %s tem contraste minimo nos pares principais', (_nome, paleta, minimo) => {
    pares(paleta).forEach(([par, frente, fundo]) => {
      expect({ par, contraste: Math.round(contraste(frente, fundo) * 10) / 10 }).toEqual({ par, contraste: expect.any(Number) });
      expect(contraste(frente, fundo)).toBeGreaterThanOrEqual(minimo);
    });
  });

  it('as tres paletas definem as mesmas cores', () => {
    expect(Object.keys(darkColors).sort()).toEqual(Object.keys(lightColors).sort());
    expect(Object.keys(highContrastColors).sort()).toEqual(Object.keys(lightColors).sort());
  });

  it('a preferencia "sistema" segue o modo do aparelho', () => {
    expect(resolveScheme('system', 'dark')).toBe('dark');
    expect(resolveScheme('system', 'light')).toBe('light');
    expect(resolveScheme('system', null)).toBe('light');
    expect(resolveScheme('highContrast', 'dark')).toBe('highContrast');
  });
});

function Amostra() {
  const colors = useColors();
  const { preference, scheme, setPreference } = useTheme();
  return (
    <>
      <Text>{`${preference}|${scheme}|${colors.background}`}</Text>
      <TouchableOpacity onPress={() => setPreference('highContrast')}><Text>contraste</Text></TouchableOpacity>
    </>
  );
}

describe('tema escolhido pelo usuario', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    (useColorScheme as jest.Mock).mockReturnValue('light');
  });

  it('sem escolha salva, segue o aparelho', async () => {
    (useColorScheme as jest.Mock).mockReturnValue('dark');
    await render(<ThemeProvider><Amostra /></ThemeProvider>);

    expect(screen.getByText(`system|dark|${darkColors.background}`)).toBeTruthy();
  });

  it('guarda a escolha e a recupera ao abrir o app de novo', async () => {
    const { unmount } = await render(<ThemeProvider><Amostra /></ThemeProvider>);
    await fireEvent.press(screen.getByText('contraste'));
    expect(screen.getByText(`highContrast|highContrast|${highContrastColors.background}`)).toBeTruthy();
    expect(await AsyncStorage.getItem('app_theme')).toBe('highContrast');
    await unmount();

    await render(<ThemeProvider><Amostra /></ThemeProvider>);
    expect(await screen.findByText(`highContrast|highContrast|${highContrastColors.background}`)).toBeTruthy();
  });

  it('ignora um valor salvo invalido', async () => {
    await AsyncStorage.setItem('app_theme', 'roxo');
    await render(<ThemeProvider><Amostra /></ThemeProvider>);

    await waitFor(() => expect(screen.getByText(`system|light|${lightColors.background}`)).toBeTruthy());
  });

  it('o menu do perfil troca o tema do app', async () => {
    await render(<ThemeProvider><Perfil /><Amostra /></ThemeProvider>);

    expect(screen.getByText('Padrão do sistema')).toBeTruthy();
    await fireEvent.press(screen.getByText('Tema'));
    await fireEvent.press(screen.getByText('Escuro'));

    expect(await screen.findByText(`dark|dark|${darkColors.background}`)).toBeTruthy();
    expect(await AsyncStorage.getItem('app_theme')).toBe('dark');
  });
});
