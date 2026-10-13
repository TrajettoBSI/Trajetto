import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import i18n from '@/src/i18n';
import Profile from '@/src/pages/common/profile/Profile';
import Perfil from '@/src/pages/profile/Perfil/Perfil';
import { userService } from '@/services';
import { mockRouter } from '../../mocks/expoRouter';
import { apiError, networkError } from '../../helpers';

const mockLogout = jest.fn();
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, firstName: 'Ana', lastName: 'Souza', email: 'ana@t.com', travelerProfile: 'CULTURAL', isAdmin: false },
    logout: mockLogout,
  }),
}));
jest.mock('@/services', () => ({ userService: { getProfile: jest.fn(), updateProfile: jest.fn() } }));

const users = userService as unknown as Record<string, jest.Mock>;
const cadastro = {
  id: 1, firstName: 'Ana', lastName: 'Souza', email: 'ana@t.com', birthDate: '1998-05-10',
  country: 'Brasil', telephone: '(41) 99999-8888', isAdmin: false, travelerProfile: 'CULTURAL',
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
});

afterEach(async () => {
  await i18n.changeLanguage('pt-BR');
});

describe('configuracoes do perfil', () => {
  it('carrega o cadastro no formulario e salva as alteracoes', async () => {
    users.getProfile.mockResolvedValue(cadastro);
    users.updateProfile.mockResolvedValue(cadastro);
    await render(<Profile />);

    expect(await screen.findByDisplayValue('10/05/1998')).toBeTruthy();
    await fireEvent.changeText(screen.getByDisplayValue('Ana'), 'Ana Clara');
    await fireEvent.press(screen.getByText('Salvar alterações'));

    await waitFor(() => expect(users.updateProfile).toHaveBeenCalledWith({
      firstName: 'Ana Clara', lastName: 'Souza', email: 'ana@t.com', birthDate: '1998-05-10',
      country: 'Brasil', telephone: '(41) 99999-8888',
    }));
    expect(Alert.alert).toHaveBeenCalledWith('Sucesso', 'Perfil atualizado!', undefined);
  });

  it('valida antes de salvar e mostra o erro da API', async () => {
    users.getProfile.mockResolvedValue(cadastro);
    users.updateProfile.mockRejectedValue(apiError(409, 'RESOURCE_CONFLICT', 'E-mail em uso.'));
    await render(<Profile />);
    await screen.findByDisplayValue('ana@t.com');

    await fireEvent.changeText(screen.getByDisplayValue('ana@t.com'), 'invalido');
    await fireEvent.press(screen.getByText('Salvar alterações'));
    expect(users.updateProfile).not.toHaveBeenCalled();

    await fireEvent.changeText(screen.getByDisplayValue('invalido'), 'outro@t.com');
    await fireEvent.changeText(screen.getByDisplayValue('10/05/1998'), '11051998');
    await fireEvent.changeText(screen.getByDisplayValue('(41) 99999-8888'), '41988887777');
    await fireEvent.changeText(screen.getByDisplayValue('Souza'), 'Lima');
    await fireEvent.press(screen.getByText('Brasil'));
    await fireEvent.press(screen.getByText('Afeganistão'));
    await fireEvent.press(screen.getByText('Salvar alterações'));

    expect(await screen.findByText('E-mail em uso.')).toBeTruthy();
  });

  it('mostra o erro quando o cadastro nao carrega', async () => {
    users.getProfile.mockRejectedValue(networkError());
    await render(<Profile />);

    expect(await screen.findByText(/Não foi possível conectar ao servidor/)).toBeTruthy();
  });
});

describe('menu do perfil', () => {
  it('mostra quem esta logado e navega pelos itens', async () => {
    await render(<Perfil />);

    expect(screen.getByText('Ana Souza')).toBeTruthy();
    await fireEvent.press(screen.getByText('Configurações'));
    await fireEvent.press(screen.getByText('Meus favoritos'));
    await fireEvent.press(screen.getByText('Refazer o teste de viajante'));
    await fireEvent.press(screen.getByText('Explorar destinos'));
    expect(screen.queryByText('Notificações')).toBeNull();

    expect(mockRouter.push.mock.calls.map((c) => c[0])).toEqual([
      '/ProfileScreen', '/FavoritesScreen', '/TravelerTestScreen?source=profile', '/ExploreScreen',
    ]);
  });

  it('troca o idioma do app e sai da conta', async () => {
    await render(<Perfil />);

    await fireEvent.press(screen.getByText('Idioma'));
    await fireEvent.press(screen.getByText('English'));
    await waitFor(() => expect(i18n.language).toBe('en-US'));

    expect(screen.getByText('Settings')).toBeTruthy();

    await fireEvent.press(screen.getByText(i18n.t('profile:menu.logout')));
    expect(mockLogout).toHaveBeenCalled();
  });
});
