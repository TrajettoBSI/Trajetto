import React from 'react';
import { Alert, AlertButton } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import Register from '@/src/pages/common/register/Register';
import VerifyEmail from '@/src/pages/common/verifyEmail/VerifyEmail';
import ForgotPassword from '@/src/pages/common/forgotPassword/ForgotPassword';
import ResetPassword from '@/src/pages/common/resetPassword/ResetPassword';
import { authService } from '@/services';
import { mockRouter, setMockParams } from '../../mocks/expoRouter';
import { apiError } from '../../helpers';

const mockRegister = jest.fn();
jest.mock('@/context/AuthContext', () => ({ useAuth: () => ({ register: mockRegister }) }));
jest.mock('@/services', () => ({
  authService: { verifyEmail: jest.fn(), requestPasswordCode: jest.fn(), resetPassword: jest.fn() },
}));

const auth = authService as unknown as Record<string, jest.Mock>;

const tocarOkDoAlerta = () => {
  const buttons = (Alert.alert as jest.Mock).mock.calls.at(-1)?.[2] as AlertButton[] | undefined;
  buttons?.find((b) => b.text === 'OK')?.onPress?.();
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
});

describe('cadastro', () => {
  const preencher = async (senha = 'Abcdef1!', confirmacao = 'Abcdef1!') => {
    await fireEvent.changeText(screen.getByPlaceholderText('Ex: João'), 'Ana2');
    await fireEvent.changeText(screen.getByPlaceholderText('Ex: Silva'), 'Souza');
    await fireEvent.changeText(screen.getByPlaceholderText('DD/MM/AAAA'), '10051998');
    await fireEvent.changeText(screen.getByPlaceholderText('(00) 00000-0000'), '41999998888');
    await fireEvent.changeText(screen.getByPlaceholderText('seuemail@exemplo.com'), 'ana@trajetto.com');
    await fireEvent.press(screen.getByText('Selecione seu país'));
    await fireEvent.press(screen.getByText('Afeganistão'));
    await fireEvent.changeText(screen.getByPlaceholderText('Mínimo 8 caracteres'), senha);
    await fireEvent.changeText(screen.getByPlaceholderText('Confirme sua senha'), confirmacao);
  };

  it('mostra os erros de cada campo e nao envia', async () => {
    await render(<Register />);
    await fireEvent.press(screen.getByText('Criar Conta'));

    expect(screen.getAllByText(/obrigat/i).length).toBeGreaterThan(0);
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('recusa senhas diferentes', async () => {
    await render(<Register />);
    await preencher('Abcdef1!', 'Outra1!x');
    await fireEvent.press(screen.getByText('Criar Conta'));

    expect(screen.getByText('As senhas não coincidem')).toBeTruthy();
  });

  it('cria a conta com os dados formatados e leva para a verificacao', async () => {
    mockRegister.mockResolvedValue(undefined);
    await render(<Register />);
    await preencher();
    await fireEvent.press(screen.getByText('Criar Conta'));

    await waitFor(() => expect(mockRegister).toHaveBeenCalledWith({
      firstName: 'Ana', lastName: 'Souza', email: 'ana@trajetto.com', password: 'Abcdef1!',
      birthDate: '1998-05-10', country: 'Afeganistão', telephone: '(41) 99999-8888',
    }));
    expect(mockRouter.push).toHaveBeenCalledWith({ pathname: '/VerifyEmailScreen', params: { email: 'ana@trajetto.com' } });
  });

  it('mostra os erros que a API devolve por campo', async () => {
    mockRegister.mockRejectedValue(apiError(400, 'VALIDATION_ERROR', 'x', [{ field: 'email', message: 'E-mail já cadastrado' }]));
    await render(<Register />);
    await preencher();
    await fireEvent.press(screen.getByText('Criar Conta'));

    expect((await screen.findAllByText('E-mail já cadastrado')).length).toBeGreaterThan(0);
  });

  it('leva para o login e volta', async () => {
    await render(<Register />);
    await fireEvent.press(screen.getAllByText('Entrar')[0]);
    expect(mockRouter.push).toHaveBeenCalledWith('/LoginScreen');
  });
});

describe('verificacao de e-mail', () => {
  beforeEach(() => setMockParams({ email: 'ana@trajetto.com' }));

  it('pede os 6 digitos antes de enviar', async () => {
    await render(<VerifyEmail />);
    await fireEvent.press(screen.getByText('Confirmar'));

    expect(screen.getByText('Digite os 6 dígitos do código.')).toBeTruthy();
    expect(auth.verifyEmail).not.toHaveBeenCalled();
  });

  it('confirma sozinho ao digitar o sexto digito e volta ao login', async () => {
    auth.verifyEmail.mockResolvedValue(undefined);
    await render(<VerifyEmail />);
    await fireEvent.changeText(screen.getByDisplayValue(''), '123456');

    await waitFor(() => expect(auth.verifyEmail).toHaveBeenCalledWith('ana@trajetto.com', '123456'));
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/LoginScreen'));
  });

  it('mostra o erro de codigo invalido', async () => {
    auth.verifyEmail.mockRejectedValue(apiError(400, 'INVALID_PARAMETER', 'Código de verificação inválido.'));
    await render(<VerifyEmail />);
    await fireEvent.changeText(screen.getByDisplayValue(''), '999999');

    expect(await screen.findByText('Código de verificação inválido.')).toBeTruthy();
  });
});

describe('esqueci a senha', () => {
  it('valida o e-mail, envia o codigo e leva para a redefinicao', async () => {
    auth.requestPasswordCode.mockResolvedValue(undefined);
    await render(<ForgotPassword />);

    await fireEvent.press(screen.getByText('Enviar código'));
    expect(auth.requestPasswordCode).not.toHaveBeenCalled();

    await fireEvent.changeText(screen.getByPlaceholderText('seu@email.com'), 'Ana@Trajetto.com');
    await fireEvent.press(screen.getByText('Enviar código'));
    await waitFor(() => expect(Alert.alert).toHaveBeenCalled());
    tocarOkDoAlerta();

    expect(mockRouter.push).toHaveBeenCalledWith({ pathname: '/ResetPasswordScreen', params: { email: 'ana@trajetto.com' } });
  });

  it('mostra o erro quando o e-mail nao tem conta', async () => {
    auth.requestPasswordCode.mockRejectedValue(apiError(404, 'RESOURCE_NOT_FOUND', 'Nenhuma conta encontrada.'));
    await render(<ForgotPassword />);
    await fireEvent.changeText(screen.getByPlaceholderText('seu@email.com'), 'ana@trajetto.com');
    await fireEvent.press(screen.getByText('Enviar código'));

    expect(await screen.findByText('Nenhuma conta encontrada.')).toBeTruthy();
    await fireEvent.press(screen.getByText('Voltar ao Login'));
    expect(mockRouter.back).toHaveBeenCalled();
  });
});

describe('redefinicao de senha', () => {
  beforeEach(() => setMockParams({ email: 'ana@trajetto.com' }));

  it('valida codigo e senha antes de enviar', async () => {
    await render(<ResetPassword />);
    await fireEvent.press(screen.getAllByText('Redefinir senha').at(-1)!);
    expect(screen.getByText('O código é obrigatório.')).toBeTruthy();

    await fireEvent.changeText(screen.getByPlaceholderText('000000'), '12a3');
    await fireEvent.press(screen.getAllByText('Redefinir senha').at(-1)!);
    expect(screen.getByText('O código deve ter exatamente 6 dígitos.')).toBeTruthy();
    expect(auth.resetPassword).not.toHaveBeenCalled();
  });

  it('redefine a senha e volta ao login', async () => {
    auth.resetPassword.mockResolvedValue(undefined);
    await render(<ResetPassword />);
    await fireEvent.changeText(screen.getByPlaceholderText('000000'), '123456');
    await fireEvent.changeText(screen.getByPlaceholderText('••••••••'), 'Nova1234!');
    await fireEvent.press(screen.getAllByText('Redefinir senha').at(-1)!);

    await waitFor(() => expect(auth.resetPassword).toHaveBeenCalledWith({ email: 'ana@trajetto.com', code: '123456', newPassword: 'Nova1234!' }));
    tocarOkDoAlerta();
    expect(mockRouter.replace).toHaveBeenCalledWith('/LoginScreen');
  });

  it('mostra o erro de codigo vencido', async () => {
    auth.resetPassword.mockRejectedValue(apiError(422, 'BUSINESS_RULE_VIOLATION', 'Este código expirou.'));
    await render(<ResetPassword />);
    await fireEvent.changeText(screen.getByPlaceholderText('seu@email.com'), 'ana@trajetto.com');
    await fireEvent.changeText(screen.getByPlaceholderText('000000'), '123456');
    await fireEvent.changeText(screen.getByPlaceholderText('••••••••'), 'Nova1234!');
    await fireEvent.press(screen.getAllByText('Redefinir senha').at(-1)!);

    expect(await screen.findByText('Este código expirou.')).toBeTruthy();
    await fireEvent.press(screen.getByText('Voltar'));
    expect(mockRouter.back).toHaveBeenCalled();
  });
});
