import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FilterOptions, StatsFilter, statsService } from '@/services';
import {
  DashboardFilter, FILTRO_VAZIO, contarCriteriosAtivos, paraConsulta, saneado,
} from '../dashboardFilter';

/**
 * Onde a escolha do gerente fica guardada. A versão faz parte da chave: se o
 * formato do recorte mudar um dia, a chave nova nasce vazia em vez de tentar
 * ler o formato antigo.
 */
const CHAVE = 'admin_dashboard_filtro_v1';

const SEM_OPCOES: FilterOptions = { profiles: [], countries: [], categories: [] };

export type DashboardFilterState = {
  /** O recorte escolhido, do jeito que a tela o exibe. */
  filtro: DashboardFilter;
  /** O mesmo recorte traduzido para o que o backend espera. */
  consulta: StatsFilter;
  /** As opções de cada seletor, lidas da base. */
  opcoes: FilterOptions;
  /** Quantos critérios estão em uso. */
  ativos: number;
  /**
   * Falso até o recorte guardado ter sido lido. O painel espera por isso
   * antes de buscar os indicadores - carregar antes significaria pedir o
   * painel inteiro e logo em seguida pedir de novo, recortado.
   */
  pronto: boolean;
  alterar: (mudanca: Partial<DashboardFilter>) => void;
  limpar: () => void;
};

/**
 * Guarda o recorte do painel gerencial e o mantém entre sessões.
 *
 * A escolha é gravada no armazenamento do aparelho a cada mudança, e relida
 * na abertura seguinte: o gerente que sempre olha o painel por um país não
 * precisa reconstruir o filtro toda vez. O que é gravado é a escolha, não o
 * resultado dela - "últimos 30 dias" volta valendo os 30 dias de quando o
 * painel for reaberto.
 *
 * Falha de leitura ou gravação não derruba a tela: o recorte volta ao padrão,
 * que é o painel completo.
 */
export function useDashboardFilter(): DashboardFilterState {
  const [filtro, setFiltro] = useState<DashboardFilter>(FILTRO_VAZIO);
  const [opcoes, setOpcoes] = useState<FilterOptions>(SEM_OPCOES);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    let ativo = true;

    (async () => {
      try {
        const guardado = await AsyncStorage.getItem(CHAVE);
        if (ativo && guardado) setFiltro(saneado(JSON.parse(guardado)));
      } catch {
        setFiltro(FILTRO_VAZIO);
      } finally {
        if (ativo) setPronto(true);
      }
    })();

    return () => { ativo = false; };
  }, []);

  /**
   * As opções não dependem do recorte: são sempre as da base inteira, para o
   * seletor não esconder justamente as escolhas que desfariam o filtro atual.
   */
  useEffect(() => {
    let ativo = true;

    statsService.getFilterOptions()
      .then((lidas) => { if (ativo) setOpcoes(lidas); })
      .catch(() => { if (ativo) setOpcoes(SEM_OPCOES); });

    return () => { ativo = false; };
  }, []);

  /**
   * Guarda a escolha e a grava. Falhar a gravação só custa a escolha na
   * próxima sessão, então o painel segue funcionando.
   */
  const guardar = useCallback((novo: DashboardFilter) => {
    setFiltro(novo);
    AsyncStorage.setItem(CHAVE, JSON.stringify(novo)).catch(() => undefined);
  }, []);

  const alterar = useCallback(
    (mudanca: Partial<DashboardFilter>) => guardar({ ...filtro, ...mudanca }),
    [filtro, guardar],
  );

  const limpar = useCallback(() => guardar(FILTRO_VAZIO), [guardar]);

  /**
   * Memorizado porque é ele que dispara a busca dos indicadores: um objeto
   * novo a cada render faria o painel recarregar sem parar.
   */
  const consulta = useMemo(() => paraConsulta(filtro), [filtro]);

  return {
    filtro,
    consulta,
    opcoes,
    ativos: contarCriteriosAtivos(filtro),
    pronto,
    alterar,
    limpar,
  };
}
