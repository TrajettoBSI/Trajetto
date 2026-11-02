// Previsao do tempo dos dias do roteiro (Open-Meteo, via backend). So os proximos 16 dias tem previsao.

import { api } from './api';

export interface DayWeather {
  date: string;
  /** Codigo WMO do tempo do dia (0 ceu limpo, 61 chuva, 95 trovoada...). */
  weatherCode: number;
  maxTemperature: number;
  minTemperature: number;
  precipitationProbability: number;
  rainy: boolean;
}

async function getForecast(latitude: number, longitude: number, startDate: string, endDate: string): Promise<DayWeather[]> {
  const response = await api.get<DayWeather[]>('/weather', { params: { latitude, longitude, startDate, endDate } });
  return response.data;
}

export const weatherService = { getForecast };
