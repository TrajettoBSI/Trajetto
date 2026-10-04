import { useState } from 'react';
import {
  Overview, CountryStats, ProfileStats, AgeGroupStats,
  ItinerariesPerUserPanel, ItineraryOverview, MonthStats, CategoryStats,
  TopRatedPlace, MostCommentedPlace, MostVisitedPlace,
} from '@/services';
import { useAuth } from '@/context/AuthContext';
import { FILTRO_VAZIO, paraConsulta } from '../../dashboard/dashboardFilter';
import { useDashboard } from '../../dashboard/hooks/useDashboard';

const SEM_RECORTE = paraConsulta(FILTRO_VAZIO);

export type AdminTab = 'usuarios' | 'roteiros';

export type AdminPanelData = {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
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
  refreshing: boolean;
  error: string;
  verifiedPct: number;
  userFirstName: string | undefined;
  load: () => Promise<void>;
  onRefresh: () => void;
};

export function useAdminPanel(): AdminPanelData {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('usuarios');
  const {
    overview, countries, profiles, ageGroups, perClient,
    itinerary, perMonth, categories, visited, topRated, commented,
    loading, refreshing, error, verifiedPct,
    load, onRefresh,
  } = useDashboard(SEM_RECORTE, true);

  return {
    activeTab,
    setActiveTab,
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
    refreshing,
    error,
    verifiedPct,
    userFirstName: user?.firstName,
    load,
    onRefresh,
  };
}
