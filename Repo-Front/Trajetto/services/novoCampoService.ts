// Opções do dropdown do cadastro (tabela novo_campo do backend).

import { NovoCampo } from '../types/user';
import { api } from './api';

export const novoCampoService = {
  /** Lista as opções cadastradas no banco. */
  getAll: async (): Promise<NovoCampo[]> => {
    const response = await api.get<NovoCampo[]>('/novo-campo');
    return response.data;
  },
};
