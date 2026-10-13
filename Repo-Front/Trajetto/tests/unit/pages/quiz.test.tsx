import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import i18n from '@/src/i18n';
import TravelerTest from '@/src/pages/quiz/travelerTest/TravelerTest';
import Quiz from '@/src/pages/quiz/quiz/Quiz';
import QuizResult from '@/src/pages/quiz/quizResult/QuizResult';
import { quizData } from '@/data/quizData';
import { userService } from '@/services';
import { mockRouter, setMockParams } from '../../mocks/expoRouter';
import { networkError } from '../../helpers';

const mockRefreshUser = jest.fn();
const mockAuth = { refreshUser: mockRefreshUser };
jest.mock('@/context/AuthContext', () => ({ useAuth: () => mockAuth }));
jest.mock('@/services', () => ({ userService: { updateTravelerProfile: jest.fn() } }));

const users = userService as unknown as Record<string, jest.Mock>;

const textosDasOpcoes = () => quizData.perguntas
  .flatMap((p) => p.opcoes ?? [])
  .map((op) => i18n.t(`quiz:${op.texto}`));

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
});

describe('convite para o teste de viajante', () => {
  it('no primeiro acesso, pular grava SKIPPED e leva as abas', async () => {
    users.updateTravelerProfile.mockResolvedValue({});
    await render(<TravelerTest />);

    await fireEvent.press(screen.getByText('Deixar para depois'));
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)'));
    expect(users.updateTravelerProfile).toHaveBeenCalledWith('SKIPPED');
    expect(mockRefreshUser).toHaveBeenCalled();

    users.updateTravelerProfile.mockRejectedValue(networkError());
    await fireEvent.press(screen.getByText('Deixar para depois'));
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledTimes(2));

    await fireEvent.press(screen.getByText('Fazer o teste'));
    expect(mockRouter.replace).toHaveBeenLastCalledWith({ pathname: '/QuizScreen', params: undefined });
  });

  it('vindo do perfil, cancelar so volta e o teste guarda a origem', async () => {
    setMockParams({ source: 'profile' });
    await render(<TravelerTest />);

    await fireEvent.press(screen.getByText('Cancelar'));
    expect(mockRouter.back).toHaveBeenCalled();
    await fireEvent.press(screen.getByText('Fazer o teste'));
    expect(mockRouter.replace).toHaveBeenCalledWith({ pathname: '/QuizScreen', params: { source: 'profile' } });
  });
});

describe('perguntas do teste', () => {
  it('responde as 10 perguntas e mostra o perfil calculado', async () => {
    setMockParams({ source: 'profile' });
    await render(<Quiz />);

    for (let i = 1; i <= 10; i++) {
      expect(screen.getByText(`${i} de 10`)).toBeTruthy();
      await fireEvent.press(screen.getByText(i === 10 ? 'Ver resultado' : 'Próxima pergunta'));
      const sim = screen.queryByText('Sim');
      const opcao = textosDasOpcoes().find((texto) => screen.queryByText(texto));
      await fireEvent.press(sim ?? screen.getByText(opcao!));
      await fireEvent.press(screen.getByText(i === 10 ? 'Ver resultado' : 'Próxima pergunta'));
    }

    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: '/QuizResultScreen',
      params: { profile: expect.any(String), source: 'profile' },
    });
  });
});

describe('resultado do teste', () => {
  it('grava o perfil, mostra a descricao e os destinos e leva as abas', async () => {
    setMockParams({ profile: 'CULTURAL' });
    users.updateTravelerProfile.mockResolvedValue({});
    await render(<QuizResult />);

    expect(screen.getByText('EXPLORADOR CULTURAL')).toBeTruthy();
    expect(screen.getByText('Roma')).toBeTruthy();
    await waitFor(() => expect(mockRefreshUser).toHaveBeenCalled());
    expect(users.updateTravelerProfile).toHaveBeenCalledWith('CULTURAL');

    await fireEvent.press(screen.getByText('Começar a explorar'));
    expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
  });

  it('vindo do perfil volta duas telas, e avisa quando nao consegue gravar', async () => {
    setMockParams({ profile: 'SOCIAL', source: 'profile' });
    users.updateTravelerProfile.mockRejectedValue(networkError());
    await render(<QuizResult />);

    await waitFor(() => expect(Alert.alert).toHaveBeenCalled());
    await fireEvent.press(screen.getByText('Voltar ao perfil'));
    expect(mockRouter.dismiss).toHaveBeenCalledWith(2);
  });

  it('perfil desconhecido mostra o aviso', async () => {
    setMockParams({});
    await render(<QuizResult />);

    expect(screen.getByText('Resultado não encontrado.')).toBeTruthy();
    await fireEvent.press(screen.getByText('Voltar'));
  });
});
