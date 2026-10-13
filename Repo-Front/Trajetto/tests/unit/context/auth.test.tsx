import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import RootLayout from '@/app/_layout';
import { authService, userService } from '@/services';
import { mockRouter, setMockSegments } from '../../mocks/expoRouter';

let sessaoExpirada: (() => Promise<void>) | null = null;

jest.mock('@/services', () => ({
  authService: {
    login: jest.fn(), register: jest.fn(), logout: jest.fn(),
    onSessionExpired: jest.fn((handler: () => Promise<void>) => {
      sessaoExpirada = handler;
      return jest.fn();
    }),
  },
  userService: { getProfile: jest.fn() },
}));

jest.mock('expo-font', () => ({ useFonts: () => [true, null], isLoaded: () => true, loadAsync: jest.fn(() => Promise.resolve()) }));

const auth = authService as unknown as Record<string, jest.Mock>;
const users = userService as unknown as Record<string, jest.Mock>;
const ana = { id: 1, firstName: 'Ana', lastName: 'Souza', email: 'ana@t.com', isAdmin: false, travelerProfile: 'CULTURAL' };

function Painel() {
  const { user, loading, login, register, logout, refreshUser } = useAuth();
  return (
    <>
      <Text>{loading ? 'carregando' : user ? `logado:${user.firstName}` : 'deslogado'}</Text>
      <TouchableOpacity onPress={() => login({ email: 'ana@t.com', password: 'x' })}><Text>entrar</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => register({ firstName: 'Ana' } as never)}><Text>cadastrar</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => refreshUser()}><Text>atualizar</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => logout()}><Text>sair</Text></TouchableOpacity>
    </>
  );
}

describe('contexto de autenticacao', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('entra, atualiza o cadastro, cadastra e sai', async () => {
    auth.login.mockResolvedValue({ token: 'tok', user: ana });
    users.getProfile.mockResolvedValue({ ...ana, firstName: 'Ana Clara' });
    auth.logout.mockRejectedValue(new Error('offline'));
    await render(<AuthProvider><Painel /></AuthProvider>);
    expect(await screen.findByText('deslogado')).toBeTruthy();

    await fireEvent.press(screen.getByText('entrar'));
    expect(await screen.findByText('logado:Ana')).toBeTruthy();
    expect(await AsyncStorage.getItem('token')).toBe('tok');

    await fireEvent.press(screen.getByText('atualizar'));
    expect(await screen.findByText('logado:Ana Clara')).toBeTruthy();

    await fireEvent.press(screen.getByText('cadastrar'));
    expect(auth.register).toHaveBeenCalled();

    await fireEvent.press(screen.getByText('sair'));
    expect(await screen.findByText('deslogado')).toBeTruthy();
    expect(await AsyncStorage.getItem('token')).toBeNull();
  });

  it('recupera a sessao salva e desloga quando a API diz que ela acabou', async () => {
    await AsyncStorage.setItem('token', 'tok');
    await AsyncStorage.setItem('user', JSON.stringify(ana));
    auth.logout.mockResolvedValue(undefined);

    await render(<AuthProvider><Painel /></AuthProvider>);
    expect(await screen.findByText('logado:Ana')).toBeTruthy();

    await sessaoExpirada!();
    expect(await screen.findByText('deslogado')).toBeTruthy();
  });
});

describe('navegacao inicial do app', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  const entrarComo = async (user: object | null, segmento: string) => {
    if (user) {
      await AsyncStorage.setItem('token', 'tok');
      await AsyncStorage.setItem('user', JSON.stringify(user));
    }
    setMockSegments([segmento]);
    await render(<RootLayout />);
  };

  it('sem sessao, manda para o login', async () => {
    await entrarComo(null, '(tabs)');
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/LoginScreen'));
  });

  it('cliente com perfil sai do login direto para as abas', async () => {
    await entrarComo(ana, 'LoginScreen');
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)'));
  });

  it('cliente sem perfil vai para o teste de viajante', async () => {
    await entrarComo({ ...ana, travelerProfile: null }, 'LoginScreen');
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/TravelerTestScreen'));
  });

  it('administrador vai para o painel, inclusive se cair nas abas', async () => {
    await entrarComo({ ...ana, isAdmin: true }, 'LoginScreen');
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/AdminPanelScreen'));

    mockRouter.replace.mockClear();
    await AsyncStorage.clear();
    await entrarComo({ ...ana, isAdmin: true }, '(tabs)');
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/AdminPanelScreen'));
  });
});
