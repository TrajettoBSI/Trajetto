import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  statsService, Overview, CountryStats, ProfileStats, AgeGroupStats,
  ItinerariesPerUserPanel, ItineraryOverview, MonthStats, CategoryStats,
  StatsFilter, TopRatedPlace, MostCommentedPlace, MostVisitedPlace,
} from '@/services';
import { getErrorMessage } from '@/utils/apiError';

export type DashboardData = {
  overview: Overview | null;
  countries: CountryStats[];
  profiles: ProfileStats[];
  ageGroups: AgeGroupStats[];
  perClient: ItinerariesPerUserPanel | null;
  itinerary: ItineraryOverview | null;
  perMonth: MonthStats[];
  categories: CategoryStats[];
  visited: MostVisitedPlace[];
  topRated: TopRatedPlace[];
  commented: MostCommentedPlace[];
  loading: boolean;
  updating: boolean;
  refreshing: boolean;
  error: string;
  verifiedPct: number;
  load: () => Promise<void>;
  onRefresh: () => void;
};

/**
 * Busca os indicadores do painel gerencial já recortados pelo filtro.
 *
 * O recorte vai para o servidor em cada chamada e é aplicado dentro da
 * consulta agregada - a tela nunca pede o painel inteiro para depois filtrar
 * o que chegou.
 *
 * @param recorte o filtro escolhido, já no formato do backend
 * @param pronto  falso enquanto o recorte guardado ainda está sendo lido; a
 *                busca espera por ele para não pedir o painel duas vezes
 */
export function useDashboard(recorte: StatsFilter, pronto: boolean): DashboardData {
  const { t } = useTranslation('admin');
  const [overview, setOverview] = useState<Overview | null>(null);
  const [countries, setCountries] = useState<CountryStats[]>([]);
  const [profiles, setProfiles] = useState<ProfileStats[]>([]);
  const [ageGroups, setAgeGroups] = useState<AgeGroupStats[]>([]);
  const [perClient, setPerClient] = useState<ItinerariesPerUserPanel | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryOverview | null>(null);
  const [perMonth, setPerMonth] = useState<MonthStats[]>([]);
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [visited, setVisited] = useState<MostVisitedPlace[]>([]);
  const [topRated, setTopRated] = useState<TopRatedPlace[]>([]);
  const [commented, setCommented] = useState<MostCommentedPlace[]>([]);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  /**
   * Numera as buscas para que só a última mande na tela. Mudar dois seletores
   * seguidos dispara duas buscas, e a primeira pode voltar depois da segunda -
   * sem isso, o painel exibiria o recorte anterior por cima do atual.
   */
  const buscaAtual = useRef(0);
  const jaCarregouUmaVez = useRef(false);

  const load = useCallback(async () => {
    const busca = ++buscaAtual.current;

    try {
      const [ov, co, pr, ag, cli, itin, mes, cat, vis, top, com] = await Promise.all([
        statsService.getOverview(recorte),
        statsService.getCountries(recorte),
        statsService.getTravelerProfiles(recorte),
        statsService.getAgeGroups(recorte),
        statsService.getItinerariesPerUser(recorte),
        statsService.getItineraryOverview(recorte),
        statsService.getItinerariesPerMonth(recorte),
        statsService.getPlacesByCategory(recorte),
        statsService.getMostVisitedPlaces(recorte),
        statsService.getTopRatedPlaces(recorte),
        statsService.getMostCommentedPlaces(recorte),
      ]);
      if (busca !== buscaAtual.current) return;

      setOverview(ov);
      setCountries(co);
      setProfiles(pr);
      setAgeGroups(ag);
      setPerClient(cli);
      setItinerary(itin);
      setPerMonth(mes);
      setCategories(cat);
      setVisited(vis);
      setTopRated(top);
      setCommented(com);
      setError('');
    } catch (e) {
      if (busca !== buscaAtual.current) return;
      setError(getErrorMessage(e, t('dashboard.loadError')));
    } finally {
      if (busca === buscaAtual.current) {
        jaCarregouUmaVez.current = true;
        setLoading(false);
        setUpdating(false);
        setRefreshing(false);
      }
    }
  }, [recorte, t]);

  /**
   * Só a primeira busca toma a tela inteira. Trocar um filtro depois disso
   * mantém o painel e os seletores no lugar, com um aviso discreto de que os
   * números estão sendo refeitos.
   */
  useEffect(() => {
    if (!pronto) return;
    if (jaCarregouUmaVez.current) setUpdating(true);
    load();
  }, [pronto, load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const verifiedPct = overview && overview.totalUsers > 0
    ? Math.round((overview.verifiedUsers / overview.totalUsers) * 100) : 0;

  return {
    overview, countries, profiles, ageGroups,
    perClient, itinerary, perMonth,
    categories, visited, topRated, commented,
    loading, updating, refreshing, error, verifiedPct,
    load, onRefresh,
  };
}
