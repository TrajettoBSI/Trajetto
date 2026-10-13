import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/services/api';

type RequestHandler = { fulfilled: (config: { headers: Record<string, string> }) => Promise<{ headers: Record<string, string> }> };

describe('cliente HTTP', () => {
  const interceptor = () =>
    (api.interceptors.request as unknown as { handlers: RequestHandler[] }).handlers[0];

  it('envia o token salvo no cabecalho Authorization', async () => {
    await AsyncStorage.setItem('token', 'meu-token');

    const config = await interceptor().fulfilled({ headers: {} });

    expect(config.headers.Authorization).toBe('Bearer meu-token');
  });

  it('sem token salvo, nao envia o cabecalho', async () => {
    await AsyncStorage.removeItem('token');

    const config = await interceptor().fulfilled({ headers: {} });

    expect(config.headers.Authorization).toBeUndefined();
  });

  it('tem tempo limite para nao deixar a tela carregando para sempre', () => {
    expect(api.defaults.timeout).toBe(15000);
  });
});
