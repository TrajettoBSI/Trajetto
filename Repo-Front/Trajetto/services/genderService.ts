// Opções de gênero exibidas no dropdown do cadastro (tabela genders do backend).

import { Gender } from '../types/user';
import { api } from './api';

export const genderService = {
  /** Lista as opções de gênero cadastradas no banco. */
  getAll: async (): Promise<Gender[]> => {
    const response = await api.get<Gender[]>('/genders');
    return response.data;
  },
};
