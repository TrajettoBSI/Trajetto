// Os campos de texto (texto/opcoes[].texto/nome/descricao/destinos_sugeridos) guardam
// CHAVES de traducao do namespace i18n 'quiz' (src/i18n/locales/*/quiz.json), nao o texto
// literal — quem exibe resolve via t(chave). Pontuacao e ids de perfil (AVENTUREIRO etc.)
// nao mudam com o idioma, servem so pra calcular o resultado.

export interface OpcaoResposta {
  letra: string;
  texto: string;
  pontuacao: Record<string, number>;
}

export interface Pergunta {
  id: number;
  texto: string;
  tipo: 'sim_nao' | 'multipla_escolha';
  pontuacao?: Record<string, Record<string, number>>;
  opcoes?: OpcaoResposta[];
}

export interface Perfil {
  nome: string;
  emoji: string;
  descricao: string;
  destinos_sugeridos: string[];
}

export interface QuizData {
  perguntas: Pergunta[];
  perfis: Record<string, Perfil>;
}

export const quizData: QuizData = {
  perguntas: [
    {
      id: 1,
      texto: 'questions.1',
      tipo: 'sim_nao',
      pontuacao: {
        sim: { SOCIAL: 2, AVENTUREIRO: 1 },
        nao: { SOLITARIO: 2, NATUREZA: 1 },
        nao_sei: { RELAXAMENTO: 1, AVENTUREIRO: 1 }
      }
    },
    {
      id: 2,
      texto: 'questions.2',
      tipo: 'sim_nao',
      pontuacao: {
        sim: { CULTURAL: 3 },
        nao: { AVENTUREIRO: 1, LUXO: 1 },
        nao_sei: { CULTURAL: 1, MOCHILEIRO: 1 }
      }
    },
    {
      id: 3,
      texto: 'questions.3',
      tipo: 'sim_nao',
      pontuacao: {
        sim: { AVENTUREIRO: 3, NATUREZA: 2 },
        nao: { LUXO: 2, CULTURAL: 1 },
        nao_sei: { NATUREZA: 1, RELAXAMENTO: 1 }
      }
    },
    {
      id: 4,
      texto: 'questions.4',
      tipo: 'multipla_escolha',
      opcoes: [
        { letra: 'A', texto: 'questions.4_options.A', pontuacao: { RELAXAMENTO: 3 } },
        { letra: 'B', texto: 'questions.4_options.B', pontuacao: { NATUREZA: 3 } },
        { letra: 'C', texto: 'questions.4_options.C', pontuacao: { CULTURAL: 3 } },
        { letra: 'D', texto: 'questions.4_options.D', pontuacao: { SOCIAL: 3 } }
      ]
    },
    {
      id: 5,
      texto: 'questions.5',
      tipo: 'sim_nao',
      pontuacao: {
        sim: { CULTURAL: 1, LUXO: 2 },
        nao: { AVENTUREIRO: 2, SOCIAL: 1 },
        nao_sei: { CULTURAL: 1, RELAXAMENTO: 1 }
      }
    },
    {
      id: 6,
      texto: 'questions.6',
      tipo: 'sim_nao',
      pontuacao: {
        sim: { LUXO: 3 },
        nao: { AVENTUREIRO: 1, MOCHILEIRO: 2 },
        nao_sei: { RELAXAMENTO: 1, CULTURAL: 1 }
      }
    },
    {
      id: 7,
      texto: 'questions.7',
      tipo: 'multipla_escolha',
      opcoes: [
        { letra: 'A', texto: 'questions.7_options.A', pontuacao: { CULTURAL: 2, MOCHILEIRO: 1 } },
        { letra: 'B', texto: 'questions.7_options.B', pontuacao: { LUXO: 2 } },
        { letra: 'C', texto: 'questions.7_options.C', pontuacao: { MOCHILEIRO: 3 } },
        { letra: 'D', texto: 'questions.7_options.D', pontuacao: { AVENTUREIRO: 3 } }
      ]
    },
    {
      id: 8,
      texto: 'questions.8',
      tipo: 'sim_nao',
      pontuacao: {
        sim: { CULTURAL: 2, AVENTUREIRO: 1, MOCHILEIRO: 1 },
        nao: { LUXO: 1, RELAXAMENTO: 1 },
        nao_sei: { CULTURAL: 1, RELAXAMENTO: 1 }
      }
    },
    {
      id: 9,
      texto: 'questions.9',
      tipo: 'sim_nao',
      pontuacao: {
        sim: { SOLITARIO: 3, MOCHILEIRO: 1 },
        nao: { SOCIAL: 2, RELAXAMENTO: 1 },
        nao_sei: { MOCHILEIRO: 1, AVENTUREIRO: 1 }
      }
    },
    {
      id: 10,
      texto: 'questions.10',
      tipo: 'multipla_escolha',
      opcoes: [
        { letra: 'A', texto: 'questions.10_options.A', pontuacao: { AVENTUREIRO: 3 } },
        { letra: 'B', texto: 'questions.10_options.B', pontuacao: { CULTURAL: 3 } },
        { letra: 'C', texto: 'questions.10_options.C', pontuacao: { RELAXAMENTO: 3 } },
        { letra: 'D', texto: 'questions.10_options.D', pontuacao: { SOCIAL: 3 } }
      ]
    },
    {
      id: 11,
      texto: 'questions.11',
      tipo: 'sim_nao',
      pontuacao: {
        sim: { AVENTUREIRO: 2, MOCHILEIRO: 2 },
        nao: { LUXO: 1, CULTURAL: 1 },
        nao_sei: { RELAXAMENTO: 1, MOCHILEIRO: 1 }
      }
    },
    {
      id: 12,
      texto: 'questions.12',
      tipo: 'sim_nao',
      pontuacao: {
        sim: { NATUREZA: 3, AVENTUREIRO: 1 },
        nao: { LUXO: 1, SOCIAL: 1 },
        nao_sei: { NATUREZA: 1, RELAXAMENTO: 1 }
      }
    },
    {
      id: 13,
      texto: 'questions.13',
      tipo: 'multipla_escolha',
      opcoes: [
        { letra: 'A', texto: 'questions.13_options.A', pontuacao: { RELAXAMENTO: 3, LUXO: 1 } },
        { letra: 'B', texto: 'questions.13_options.B', pontuacao: { CULTURAL: 2, MOCHILEIRO: 2 } },
        { letra: 'C', texto: 'questions.13_options.C', pontuacao: { NATUREZA: 2, AVENTUREIRO: 2 } },
        { letra: 'D', texto: 'questions.13_options.D', pontuacao: { SOCIAL: 3 } }
      ]
    },
    {
      id: 14,
      texto: 'questions.14',
      tipo: 'sim_nao',
      pontuacao: {
        sim: { SOCIAL: 3, AVENTUREIRO: 1 },
        nao: { SOLITARIO: 1, CULTURAL: 1 },
        nao_sei: { SOCIAL: 1, CULTURAL: 1 }
      }
    },
    {
      id: 15,
      texto: 'questions.15',
      tipo: 'multipla_escolha',
      opcoes: [
        { letra: 'A', texto: 'questions.15_options.A', pontuacao: { MOCHILEIRO: 3 } },
        { letra: 'B', texto: 'questions.15_options.B', pontuacao: { CULTURAL: 1, RELAXAMENTO: 1 } },
        { letra: 'C', texto: 'questions.15_options.C', pontuacao: { LUXO: 3 } },
        { letra: 'D', texto: 'questions.15_options.D', pontuacao: { AVENTUREIRO: 2, NATUREZA: 1 } }
      ]
    },
    {
      id: 16,
      texto: 'questions.16',
      tipo: 'multipla_escolha',
      opcoes: [
        { letra: 'A', texto: 'questions.16_options.A', pontuacao: { NATUREZA: 2, AVENTUREIRO: 1 } },
        { letra: 'B', texto: 'questions.16_options.B', pontuacao: { CULTURAL: 2 } },
        { letra: 'C', texto: 'questions.16_options.C', pontuacao: { SOCIAL: 3 } },
        { letra: 'D', texto: 'questions.16_options.D', pontuacao: { RELAXAMENTO: 2, LUXO: 2 } }
      ]
    },
    {
      id: 17,
      texto: 'questions.17',
      tipo: 'sim_nao',
      pontuacao: {
        sim: { AVENTUREIRO: 2, CULTURAL: 1 },
        nao: { RELAXAMENTO: 2, SOLITARIO: 1 },
        nao_sei: { RELAXAMENTO: 1, CULTURAL: 1 }
      }
    },
    {
      id: 18,
      texto: 'questions.18',
      tipo: 'multipla_escolha',
      opcoes: [
        { letra: 'A', texto: 'questions.18_options.A', pontuacao: { NATUREZA: 3, AVENTUREIRO: 1 } },
        { letra: 'B', texto: 'questions.18_options.B', pontuacao: { CULTURAL: 3 } },
        { letra: 'C', texto: 'questions.18_options.C', pontuacao: { RELAXAMENTO: 2, LUXO: 2 } },
        { letra: 'D', texto: 'questions.18_options.D', pontuacao: { MOCHILEIRO: 3 } }
      ]
    },
    {
      id: 19,
      texto: 'questions.19',
      tipo: 'sim_nao',
      pontuacao: {
        sim: { CULTURAL: 3 },
        nao: { AVENTUREIRO: 1, RELAXAMENTO: 1 },
        nao_sei: { CULTURAL: 1, MOCHILEIRO: 1 }
      }
    },
    {
      id: 20,
      texto: 'questions.20',
      tipo: 'multipla_escolha',
      opcoes: [
        { letra: 'A', texto: 'questions.20_options.A', pontuacao: { SOCIAL: 3, MOCHILEIRO: 1 } },
        { letra: 'B', texto: 'questions.20_options.B', pontuacao: { CULTURAL: 2, LUXO: 1 } },
        { letra: 'C', texto: 'questions.20_options.C', pontuacao: { SOLITARIO: 3, NATUREZA: 1 } },
        { letra: 'D', texto: 'questions.20_options.D', pontuacao: { RELAXAMENTO: 3 } }
      ]
    }
  ],
  perfis: {
    AVENTUREIRO: { nome: 'profiles.AVENTUREIRO.nome', emoji: '🧗', descricao: 'profiles.AVENTUREIRO.descricao', destinos_sugeridos: ['profiles.AVENTUREIRO.destinos.0', 'profiles.AVENTUREIRO.destinos.1', 'profiles.AVENTUREIRO.destinos.2', 'profiles.AVENTUREIRO.destinos.3'] },
    CULTURAL: { nome: 'profiles.CULTURAL.nome', emoji: '🏛️', descricao: 'profiles.CULTURAL.descricao', destinos_sugeridos: ['profiles.CULTURAL.destinos.0', 'profiles.CULTURAL.destinos.1', 'profiles.CULTURAL.destinos.2', 'profiles.CULTURAL.destinos.3'] },
    NATUREZA: { nome: 'profiles.NATUREZA.nome', emoji: '🌿', descricao: 'profiles.NATUREZA.descricao', destinos_sugeridos: ['profiles.NATUREZA.destinos.0', 'profiles.NATUREZA.destinos.1', 'profiles.NATUREZA.destinos.2', 'profiles.NATUREZA.destinos.3'] },
    LUXO: { nome: 'profiles.LUXO.nome', emoji: '✨', descricao: 'profiles.LUXO.descricao', destinos_sugeridos: ['profiles.LUXO.destinos.0', 'profiles.LUXO.destinos.1', 'profiles.LUXO.destinos.2', 'profiles.LUXO.destinos.3'] },
    MOCHILEIRO: { nome: 'profiles.MOCHILEIRO.nome', emoji: '🎒', descricao: 'profiles.MOCHILEIRO.descricao', destinos_sugeridos: ['profiles.MOCHILEIRO.destinos.0', 'profiles.MOCHILEIRO.destinos.1', 'profiles.MOCHILEIRO.destinos.2', 'profiles.MOCHILEIRO.destinos.3'] },
    RELAXAMENTO: { nome: 'profiles.RELAXAMENTO.nome', emoji: '🌅', descricao: 'profiles.RELAXAMENTO.descricao', destinos_sugeridos: ['profiles.RELAXAMENTO.destinos.0', 'profiles.RELAXAMENTO.destinos.1', 'profiles.RELAXAMENTO.destinos.2', 'profiles.RELAXAMENTO.destinos.3'] },
    SOCIAL: { nome: 'profiles.SOCIAL.nome', emoji: '🥂', descricao: 'profiles.SOCIAL.descricao', destinos_sugeridos: ['profiles.SOCIAL.destinos.0', 'profiles.SOCIAL.destinos.1', 'profiles.SOCIAL.destinos.2', 'profiles.SOCIAL.destinos.3'] },
    SOLITARIO: { nome: 'profiles.SOLITARIO.nome', emoji: '🧘', descricao: 'profiles.SOLITARIO.descricao', destinos_sugeridos: ['profiles.SOLITARIO.destinos.0', 'profiles.SOLITARIO.destinos.1', 'profiles.SOLITARIO.destinos.2', 'profiles.SOLITARIO.destinos.3'] }
  }
};

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function calcularPerfil(scores: Record<string, number>): string {
  return Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
}
