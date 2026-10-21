// Cidades atendidas pelo catálogo do backend: é delas que o roteiro pode ser gerado.

import { api } from './api';

export interface City {
  slug: string;
  name: string;
  /** Código ISO de duas letras (IT, FR, BR...). */
  country: string;
  latitude: number;
  longitude: number;
  /** Quantos pontos turísticos o catálogo tem nela. */
  spots: number;
}

async function getCities(): Promise<City[]> {
  const response = await api.get<City[]>('/cities');
  return response.data;
}

export const cityService = { getCities };
