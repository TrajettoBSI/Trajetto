import { StatsFilter } from '@/services';

/**
 * O recorte do painel gerencial: o que o usuário escolhe na tela e como isso
 * vira uma consulta ao backend.
 *
 * O arquivo é de propósito só funções puras e constantes - sem React, sem
 * armazenamento, sem rede. Quem guarda a escolha entre sessões é
 * `hooks/useDashboardFilter`, quem a exibe é o `FilterPanel`, e quem a aplica
 * é o banco.
 */

// ─── Período ───────────────────────────────────────────────────────────────

/**
 * Os períodos que o painel oferece.
 *
 * São faixas prontas, e não duas datas soltas, por dois motivos: escolher um
 * intervalo em dois seletores de data no celular é trabalhoso, e uma faixa
 * pronta continua fazendo sentido na sessão seguinte - "últimos 30 dias"
 * guardado hoje é outro intervalo amanhã, enquanto duas datas fixas
 * envelheceriam junto com a escolha.
 *
 * Há opções para a frente porque a data que o painel recorta é a data de
 * início da viagem, não a do cadastro: roteiro planejado para o mês que vem
 * já está na base hoje.
 */
export type PeriodoId =
  | 'todo'
  | 'ultimos30'
  | 'ultimos90'
  | 'ultimos12meses'
  | 'anoAtual'
  | 'proximos90';

export const PERIODOS: PeriodoId[] = [
  'todo',
  'ultimos30',
  'ultimos90',
  'ultimos12meses',
  'anoAtual',
  'proximos90',
];

/** Data no formato que o backend espera (`2026-01-31`), no fuso do aparelho. */
function iso(data: Date): string {
  const mes = `${data.getMonth() + 1}`.padStart(2, '0');
  const dia = `${data.getDate()}`.padStart(2, '0');
  return `${data.getFullYear()}-${mes}-${dia}`;
}

function somandoDias(base: Date, dias: number): Date {
  const data = new Date(base);
  data.setDate(data.getDate() + dias);
  return data;
}

function somandoMeses(base: Date, meses: number): Date {
  const data = new Date(base);
  data.setMonth(data.getMonth() + meses);
  return data;
}

/**
 * O intervalo de datas de um período, sempre com as duas pontas inclusive.
 *
 * `hoje` é parâmetro para a função continuar sendo pura - o valor padrão é a
 * data do aparelho.
 *
 * "Ano atual" vai de janeiro a dezembro, e não até hoje: viagem marcada para
 * dezembro é deste ano tanto quanto a de janeiro.
 */
export function intervaloDoPeriodo(
  periodo: PeriodoId,
  hoje: Date = new Date(),
): { from?: string; to?: string } {
  switch (periodo) {
    case 'ultimos30':
      return { from: iso(somandoDias(hoje, -29)), to: iso(hoje) };
    case 'ultimos90':
      return { from: iso(somandoDias(hoje, -89)), to: iso(hoje) };
    case 'ultimos12meses':
      return { from: iso(somandoDias(somandoMeses(hoje, -12), 1)), to: iso(hoje) };
    case 'anoAtual':
      return { from: `${hoje.getFullYear()}-01-01`, to: `${hoje.getFullYear()}-12-31` };
    case 'proximos90':
      return { from: iso(hoje), to: iso(somandoDias(hoje, 89)) };
    case 'todo':
    default:
      return {};
  }
}

// ─── O recorte escolhido ───────────────────────────────────────────────────

/**
 * A escolha do usuário, do jeito que fica guardada.
 *
 * O período é guardado pelo identificador da faixa, e não pelas datas que ele
 * produz: é o que faz "últimos 30 dias" continuar querendo dizer os últimos
 * 30 dias quando o painel for aberto de novo, semanas depois.
 */
export type DashboardFilter = {
  periodo: PeriodoId;
  profile: string | null;
  country: string | null;
  category: string | null;
};

export const FILTRO_VAZIO: DashboardFilter = {
  periodo: 'todo',
  profile: null,
  country: null,
  category: null,
};

/** Quantos critérios estão em uso, para o painel avisar que está recortado. */
export function contarCriteriosAtivos(filtro: DashboardFilter): number {
  return [
    filtro.periodo !== 'todo',
    filtro.profile !== null,
    filtro.country !== null,
    filtro.category !== null,
  ].filter(Boolean).length;
}

/** Traduz a escolha da tela para o recorte que o backend entende. */
export function paraConsulta(filtro: DashboardFilter, hoje: Date = new Date()): StatsFilter {
  return {
    ...intervaloDoPeriodo(filtro.periodo, hoje),
    profile: filtro.profile,
    country: filtro.country,
    category: filtro.category,
  };
}

/**
 * Lê de volta um recorte guardado em sessão anterior, descartando o que não
 * reconhece.
 *
 * O que está no armazenamento foi gravado por outra versão do aplicativo e
 * pode ter qualquer forma - um período que deixou de existir, um campo que
 * mudou de tipo. Nesses casos o critério volta ao padrão em vez de subir
 * torto até a consulta.
 */
export function saneado(guardado: unknown): DashboardFilter {
  if (typeof guardado !== 'object' || guardado === null) return FILTRO_VAZIO;

  const bruto = guardado as Partial<Record<keyof DashboardFilter, unknown>>;
  const texto = (valor: unknown) =>
    typeof valor === 'string' && valor.trim() !== '' ? valor : null;

  return {
    periodo: PERIODOS.includes(bruto.periodo as PeriodoId)
      ? (bruto.periodo as PeriodoId)
      : FILTRO_VAZIO.periodo,
    profile: texto(bruto.profile),
    country: texto(bruto.country),
    category: texto(bruto.category),
  };
}
