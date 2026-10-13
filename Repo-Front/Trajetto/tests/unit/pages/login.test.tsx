import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import Login from '@/src/pages/common/login/Login';
import { mockRouter } from '../../mocks/expoRouter';
import { apiError } from '../../helpers';

const mockLogin = jest.fn();
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

describe('Tela de login', () => {
  beforeEach(() => mockLogin.mockReset());

  it('valida os campos antes de chamar o login', async () => {
    await render(<Login />);

    await fireEvent.press(screen.getByText('Entrar'));

    expect(await screen.findByText('Senha é obrigatória')).toBeTruthy();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('entra com e-mail e senha validos', async () => {
    mockLogin.mockResolvedValue(undefined);
    await render(<Login />);

    await fireEvent.changeText(screen.getByPlaceholderText('seu@email.com'), 'ana@trajetto.com');
    await fireEvent.changeText(screen.getByPlaceholderText('••••••••'), 'senha-segura');
    await fireEvent.press(screen.getByText('Entrar'));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith({ email: 'ana@trajetto.com', password: 'senha-segura' }));
  });

  it('mostra a mensagem da API quando o login falha', async () => {
    mockLogin.mockRejectedValue(apiError(422, 'BUSINESS_RULE_VIOLATION', 'Conta não verificada.'));
    await render(<Login />);

    await fireEvent.changeText(screen.getByPlaceholderText('seu@email.com'), 'ana@trajetto.com');
    await fireEvent.changeText(screen.getByPlaceholderText('••••••••'), 'senha-segura');
    await fireEvent.press(screen.getByText('Entrar'));

    expect(await screen.findByText('Conta não verificada.')).toBeTruthy();
  });

  it('leva para cadastro e recuperacao de senha', async () => {
    await render(<Login />);

    await fireEvent.press(screen.getByText('Cadastre-se'));
    await fireEvent.press(screen.getByText('Esqueceu sua senha?'));

    expect(mockRouter.push).toHaveBeenCalledWith('/RegisterScreen');
    expect(mockRouter.push).toHaveBeenCalledWith('/ForgotPasswordScreen');
  });
});
