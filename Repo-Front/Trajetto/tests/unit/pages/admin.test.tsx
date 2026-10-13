import React from 'react';
import { Alert, AlertButton } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import i18n from '@/src/i18n';
import AdminPanel from '@/src/pages/admin/panel/AdminPanel';
import UserList from '@/src/pages/admin/userList/UserList';
import UserDetail from '@/src/pages/admin/userDetail/UserDetail';
import AdminProfile from '@/src/pages/admin/profile/AdminProfile/AdminProfile';
import { statsService, userService } from '@/services';
import { mockRouter, setMockParams } from '../../mocks/expoRouter';
import { apiError, networkError } from '../../helpers';

const mockLogout = jest.fn();
const mockAuth = { user: { id: 1, firstName: 'Admin', lastName: 'Geral', email: 'admin@t.com', isAdmin: true }, logout: mockLogout };
jest.mock('@/context/AuthContext', () => ({ useAuth: () => mockAuth }));
jest.mock('@/services', () => ({
  statsService: {
    getFilterOptions: jest.fn(), getOverview: jest.fn(), getCountries: jest.fn(), getTravelerProfiles: jest.fn(),
    getAgeGroups: jest.fn(), getItinerariesPerUser: jest.fn(), getItineraryOverview: jest.fn(),
    getItinerariesPerMonth: jest.fn(), getPlacesByCategory: jest.fn(), getMostVisitedPlaces: jest.fn(),
    getTopRatedPlaces: jest.fn(), getMostCommentedPlaces: jest.fn(),
  },
  userService: { getAll: jest.fn(), remove: jest.fn(), update: jest.fn(), updateRole: jest.fn() },
}));

const stats = statsService as unknown as Record<string, jest.Mock>;
const users = userService as unknown as Record<string, jest.Mock>;

const comDados = () => {
  stats.getFilterOptions.mockResolvedValue({ profiles: ['CULTURAL', 'Sem perfil'], countries: ['Brasil'], categories: ['museum'] });
  stats.getOverview.mockResolvedValue({
    totalUsers: 10, totalAdmins: 1, totalClients: 9, totalItineraries: 5, verifiedUsers: 8, unverifiedUsers: 2, avgAge: 30,
  });
  stats.getCountries.mockResolvedValue([{ country: 'Brasil', count: 6 }, { country: 'Itália', count: 3 }]);
  stats.getTravelerProfiles.mockResolvedValue([{ profile: 'CULTURAL', count: 5 }]);
  stats.getAgeGroups.mockResolvedValue([{ ageGroup: '25-34', count: 4 }]);
  stats.getItinerariesPerUser.mockResolvedValue({
    topClients: [{ userId: 2, name: 'Ana Souza', count: 3 }], clientsWithItinerary: 4, clientsWithoutItinerary: 5,
  });
  stats.getItineraryOverview.mockResolvedValue({ totalItineraries: 5, avgDurationDays: 2.5, avgRating: 4.2, ratedCount: 3, unratedCount: 2 });
  stats.getItinerariesPerMonth.mockResolvedValue([{ month: '2026-03', count: 2 }]);
  stats.getPlacesByCategory.mockResolvedValue([{ category: 'historic_archaeological_site', count: 7 }]);
  stats.getMostVisitedPlaces.mockResolvedValue([{ name: 'Colosseo', count: 4 }]);
  stats.getTopRatedPlaces.mockResolvedValue([{ name: 'Pantheon', xid: 'osm_pantheon', avgRating: 4.8, totalRatings: 6 }]);
  stats.getMostCommentedPlaces.mockResolvedValue([{ name: 'Trevi', xid: 'osm_trevi', commentCount: 5 }]);
};

const tocarNoBotao = (texto: string) => {
  const buttons = (Alert.alert as jest.Mock).mock.calls.at(-1)?.[2] as AlertButton[];
  return buttons.find((b) => b.text === texto)?.onPress?.();
};

beforeEach(async () => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  await AsyncStorage.clear();
});

afterEach(async () => {
  await i18n.changeLanguage('pt-BR');
});

describe('painel admin', () => {
  it('mostra os indicadores de usuarios e de roteiros, com rotulos traduzidos', async () => {
    comDados();
    await render(<AdminPanel />);

    expect((await screen.findAllByText('80% Verificados')).length).toBeGreaterThan(0);
    expect(screen.getByText('EXPLORADOR CULTURAL')).toBeTruthy();
    expect(screen.getByText('30 anos')).toBeTruthy();

    await fireEvent.press(screen.getAllByText('Roteiros').at(-1)!);
    expect(await screen.findByText('Sítio arqueológico')).toBeTruthy();
    expect(screen.getByText('Colosseo')).toBeTruthy();

    await fireEvent.press(screen.getAllByText('Usuários').at(-1)!);
    await fireEvent.press(screen.getByText('Ver lista completa de usuários'));
    expect(mockRouter.push).toHaveBeenCalledWith('/UserListScreen');
  });

  it('filtra os indicadores, guarda o recorte e limpa', async () => {
    comDados();
    await render(<AdminPanel />);
    await screen.findAllByText('80% Verificados');

    await fireEvent.press(screen.getByText('Todo o período'));
    await fireEvent.press(screen.getByText('Ano atual'));
    await fireEvent.press(screen.getAllByText('Todos')[0]);
    await fireEvent.press(screen.getAllByText('Explorador Cultural').at(-1)!);
    await fireEvent.press(screen.getAllByText('Todas')[0]);
    await fireEvent.press(screen.getAllByText('Museu').at(-1)!);

    await waitFor(() => expect(stats.getOverview).toHaveBeenLastCalledWith(expect.objectContaining({ profile: 'CULTURAL', category: 'museum' })));
    expect(JSON.parse((await AsyncStorage.getItem('admin_dashboard_filtro_v1'))!)).toMatchObject({ periodo: 'anoAtual', profile: 'CULTURAL' });

    await fireEvent.press(screen.getByText('Limpar'));
    await waitFor(() => expect(stats.getOverview).toHaveBeenLastCalledWith({ profile: null, country: null, category: null }));
  });

  it('retoma o recorte guardado e mostra o erro com opcao de tentar de novo', async () => {
    await AsyncStorage.setItem('admin_dashboard_filtro_v1', JSON.stringify({ periodo: 'todo', country: 'Brasil' }));
    comDados();
    stats.getFilterOptions.mockRejectedValue(networkError());
    stats.getOverview.mockRejectedValueOnce(networkError());
    await render(<AdminPanel />);

    expect(await screen.findByText(/Não foi possível conectar/)).toBeTruthy();
    expect(stats.getOverview).toHaveBeenCalledWith(expect.objectContaining({ country: 'Brasil' }));

    await fireEvent.press(screen.getByText('Tentar novamente'));
    expect((await screen.findAllByText('80% Verificados')).length).toBeGreaterThan(0);
  });
});

describe('usuarios do sistema', () => {
  const ana = { id: 2, firstName: 'Ana', lastName: 'Souza', email: 'ana@t.com', isAdmin: false, country: 'Brasil', telephone: '41999998888', birthDate: '1998-05-10', travelerProfile: 'CULTURAL' };

  it('lista, abre a edicao e exclui com confirmacao', async () => {
    users.getAll.mockResolvedValue([ana]);
    users.remove.mockRejectedValueOnce(apiError(403, 'ACCESS_DENIED', 'Não pode.')).mockResolvedValue(undefined);
    await render(<UserList />);

    expect(await screen.findByText('Ana Souza')).toBeTruthy();
    await fireEvent.press(screen.getByText('Editar'));
    expect(mockRouter.push).toHaveBeenCalledWith({ pathname: '/UserDetailScreen', params: { user: JSON.stringify(ana) } });

    await fireEvent.press(screen.getByLabelText('Excluir'));
    await tocarNoBotao('Excluir');
    await waitFor(() => expect(Alert.alert).toHaveBeenLastCalledWith('Erro', 'Não pode.', undefined));

    await fireEvent.press(screen.getByLabelText('Excluir'));
    await tocarNoBotao('Excluir');
    await waitFor(() => expect(users.getAll).toHaveBeenCalledTimes(2));
  });

  it('lista vazia avisa que ainda nao ha usuarios', async () => {
    users.getAll.mockResolvedValue([]);
    await render(<UserList />);

    expect(await screen.findByText('Nenhum usuário cadastrado')).toBeTruthy();
  });

  it('edita o cadastro e troca o cargo do usuario', async () => {
    setMockParams({ user: JSON.stringify(ana) });
    users.update.mockRejectedValueOnce(networkError()).mockResolvedValue(ana);
    users.updateRole.mockRejectedValueOnce(networkError()).mockResolvedValue(undefined);
    await render(<UserDetail />);

    await fireEvent.changeText(screen.getByDisplayValue('Ana'), 'Ana Clara');
    await fireEvent.changeText(screen.getByDisplayValue('Souza'), 'Lima');
    await fireEvent.changeText(screen.getByDisplayValue('ana@t.com'), 'anaclara@t.com');
    await fireEvent.changeText(screen.getByDisplayValue('1998-05-10'), '1998-05-11');
    await fireEvent.changeText(screen.getByDisplayValue('41999998888'), '41988887777');
    await fireEvent.press(screen.getByText('Brasil'));
    await fireEvent.press(screen.getByText('Afeganistão'));

    await fireEvent.press(screen.getByText('Salvar alterações'));
    await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('Erro', expect.stringContaining('conectar'), undefined));
    await fireEvent.press(screen.getByText('Salvar alterações'));
    await waitFor(() => expect(users.update).toHaveBeenLastCalledWith(2, {
      firstName: 'Ana Clara', lastName: 'Lima', email: 'anaclara@t.com', birthDate: '1998-05-11', country: 'Afeganistão', telephone: '41988887777',
    }));
    expect(mockRouter.back).toHaveBeenCalled();

    await fireEvent.press(screen.getByText('🛡️ Admin'));
    await waitFor(() => expect(Alert.alert).toHaveBeenLastCalledWith('Erro', expect.any(String), undefined));
    await fireEvent.press(screen.getByText('🛡️ Admin'));
    expect(await screen.findByText('Administrador')).toBeTruthy();
    await fireEvent.press(screen.getByText('👤 Usuário'));
    await waitFor(() => expect(users.updateRole).toHaveBeenLastCalledWith(2, false));
  });
});

describe('perfil do administrador', () => {
  it('troca o idioma e sai da conta', async () => {
    await render(<AdminProfile />);

    expect(screen.getByText('Admin Geral')).toBeTruthy();
    await fireEvent.press(screen.getByText('Notificações'));
    await fireEvent.press(screen.getByText('Idioma'));
    await fireEvent.press(screen.getByText('Español'));
    await waitFor(() => expect(i18n.language).toBe('es-ES'));

    await fireEvent.press(screen.getByText(i18n.t('admin:profile.logout')));
    expect(mockLogout).toHaveBeenCalled();
  });
});
