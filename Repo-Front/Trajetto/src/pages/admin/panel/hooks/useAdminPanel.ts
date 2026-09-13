import { useState } from 'react';
import {
  FilterOptions,
  Overview, CountryStats, ProfileStats, AgeGroupStats,
  ItinerariesPerUserPanel, ItineraryOverview, MonthStats, CategoryStats,
  TopRatedPlace, MostCommentedPlace, MostVisitedPlace,
} from '@/services';
import { useAuth } from '@/context/AuthContext';
import { DashboardFilter } from '../../dashboard/dashboardFilter';
import { useDashboard } from '../../dashboard/hooks/useDashboard';
import { useDashboardFilter } from '../../dashboard/hooks/useDashboardFilter';

export type AdminTab = 'usuarios' | 'roteiros';

export type AdminPanelData = {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  filtro: DashboardFilter;
  opcoes: FilterOptions;
  ativos: number;
  alterarFiltro: (mudanca: Partial<DashboardFilter>) => void;
  limparFiltro: () => void;
  overview: Overview | null;
  countries: CountryStats[];
  profiles: ProfileStats[];
  ageGroups: AgeGroupStats[];
  perClient: ItinerariesPerUserPanel | null;
  itinOv: ItineraryOverview | null;
  perMonth: MonthStats[];
  categories: CategoryStats[];
  topRated: TopRatedPlace[];
  mostComment: MostCommentedPlace[];
  mostVisited: MostVisitedPlace[];
  loading: boolean;
  updating: boolean;
  refreshing: boolean;
  error: string;
  verifiedPct: number;
  userFirstName: string | undefined;
  logout: () => Promise<void>;
  load: () => Promise<void>;
  onRefresh: () => void;
};

export function useAdminPanel(): AdminPanelData {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('usuarios');
  const { filtro, consulta, opcoes, ativos, pronto, alterar, limpar } = useDashboardFilter();
  const {
    overview, countries, profiles, ageGroups, perClient,
    itinerary, perMonth, categories, visited, topRated, commented,
    loading, updating, refreshing, error, verifiedPct,
    load, onRefresh,
  } = useDashboard(consulta, pronto);

  return {
    activeTab,
    setActiveTab,
    filtro,
    opcoes,
    ativos,
    alterarFiltro: alterar,
    limparFiltro: limpar,
    overview,
    countries,
    profiles,
    ageGroups,
    perClient,
    itinOv: itinerary,
    perMonth,
    categories,
    topRated,
    mostComment: commented,
    mostVisited: visited,
    loading,
    updating,
    refreshing,
    error,
    verifiedPct,
    userFirstName: user?.firstName,
    logout,
    load,
    onRefresh,
  };
}
