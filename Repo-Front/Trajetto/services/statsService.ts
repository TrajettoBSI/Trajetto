import { api } from './api';

// ─── Recorte do painel ─────────────────────────────────────────────────────

/**
 * Os quatro critérios do painel gerencial, no formato que o backend espera.
 *
 * As datas são ISO (`2026-01-31`) e todo campo é opcional: ausente significa
 * "sem recorte por este critério". Perfil e categoria viajam pelo mesmo
 * rótulo que os gráficos exibem - inclusive "Sem perfil" e "Outros", que são
 * escolhas legítimas e não existem gravados em coluna nenhuma.
 *
 * Quem monta este objeto a partir do que o usuário escolheu na tela é
 * `src/pages/admin/dashboard/dashboardFilter.ts`.
 */
export interface StatsFilter {
  from?: string | null;
  to?: string | null;
  profile?: string | null;
  country?: string | null;
  category?: string | null;
}

/** As opções que cada seletor do painel oferece, lidas da base pelo backend. */
export interface FilterOptions {
  profiles: string[];
  countries: string[];
  categories: string[];
}

/**
 * Traduz o recorte para parâmetros de consulta, deixando de fora o que não
 * foi escolhido.
 *
 * Critério vazio precisa sumir da URL, e não virar `?country=`: string vazia
 * chegaria ao backend como um recorte por país igual a "", e o painel
 * voltaria zerado justo quando o usuário acabou de limpar o seletor.
 */
function comoParametros(filter?: StatsFilter): Record<string, string> {
  if (!filter) return {};

  return Object.entries(filter).reduce<Record<string, string>>((params, [chave, valor]) => {
    if (valor) params[chave] = valor;
    return params;
  }, {});
}

// ─── Interfaces de usuários ────────────────────────────────────────────────
export interface Overview {
  totalUsers: number;
  totalAdmins: number;
  totalClients: number;
  totalItineraries: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  avgAge: number | null;
}

export interface CountryStats   { country: string; count: number; }
export interface ProfileStats   { profile: string; count: number; }
export interface AgeGroupStats  { group: string; count: number; }

/** Uma linha do ranking de clientes que mais criaram roteiros. */
export interface ClientItineraryCount { user: string; email: string; count: number; }

/**
 * Bloco "roteiros por cliente". O endpoint devolvia a lista de todos os
 * clientes e a tela cortava as dez primeiras e contava quantas vinham com
 * zero; agora o ranking chega recortado e as duas contagens chegam prontas.
 */
export interface ItinerariesPerUserPanel {
  topClients: ClientItineraryCount[];
  clientsWithItinerary: number;
  clientsWithoutItinerary: number;
}

// ─── Interfaces de roteiros ────────────────────────────────────────────────
export interface ItineraryOverview {
  totalItineraries: number;
  avgDurationDays: number | null;
  avgRating: number | null;
  ratedCount: number;
  unratedCount: number;
}

export interface MonthStats        { month: string; count: number; }
export interface CategoryStats     { category: string; count: number; }
export interface TopRatedPlace     { name: string; xid: string; avgRating: number; totalRatings: number; }
export interface MostCommentedPlace{ name: string; xid: string; commentCount: number; }
export interface MostVisitedPlace  { name: string; count: number; }

// ─── Service ───────────────────────────────────────────────────────────────
//
// Todos os indicadores aceitam o mesmo recorte, e é o backend que o aplica
// dentro da consulta agregada. A tela nunca pede o painel inteiro para depois
// filtrar na memória: isso traria pela rede exatamente as linhas que o filtro
// manda descartar.
export const statsService = {
  // Filtros
  getFilterOptions:      () => api.get<FilterOptions>('/stats/filter-options').then(r => r.data),

  // Usuários
  getOverview:           (f?: StatsFilter) => api.get<Overview>('/stats/overview', { params: comoParametros(f) }).then(r => r.data),
  getCountries:          (f?: StatsFilter) => api.get<CountryStats[]>('/stats/countries', { params: comoParametros(f) }).then(r => r.data),
  getTravelerProfiles:   (f?: StatsFilter) => api.get<ProfileStats[]>('/stats/traveler-profiles', { params: comoParametros(f) }).then(r => r.data),
  getItinerariesPerUser: (f?: StatsFilter) => api.get<ItinerariesPerUserPanel>('/stats/itineraries-per-user', { params: comoParametros(f) }).then(r => r.data),
  getAgeGroups:          (f?: StatsFilter) => api.get<AgeGroupStats[]>('/stats/age-groups', { params: comoParametros(f) }).then(r => r.data),

  // Roteiros
  getItineraryOverview:    (f?: StatsFilter) => api.get<ItineraryOverview>('/stats/itinerary-overview', { params: comoParametros(f) }).then(r => r.data),
  getItinerariesPerMonth:  (f?: StatsFilter) => api.get<MonthStats[]>('/stats/itineraries-per-month', { params: comoParametros(f) }).then(r => r.data),
  getPlacesByCategory:     (f?: StatsFilter) => api.get<CategoryStats[]>('/stats/places-by-category', { params: comoParametros(f) }).then(r => r.data),
  getTopRatedPlaces:       (f?: StatsFilter) => api.get<TopRatedPlace[]>('/stats/top-rated-places', { params: comoParametros(f) }).then(r => r.data),
  getMostCommentedPlaces:  (f?: StatsFilter) => api.get<MostCommentedPlace[]>('/stats/most-commented-places', { params: comoParametros(f) }).then(r => r.data),
  getMostVisitedPlaces:    (f?: StatsFilter) => api.get<MostVisitedPlace[]>('/stats/most-visited-places', { params: comoParametros(f) }).then(r => r.data),
};
