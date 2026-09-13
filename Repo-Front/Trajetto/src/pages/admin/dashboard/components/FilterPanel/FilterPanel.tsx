import React, { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FilterOptions } from '@/services';
import { useColors } from '@/src/theme';
import OptionPickerModal, { PickerOption } from '@/src/components/OptionPickerModal/OptionPickerModal';
import { DashboardFilter, PERIODOS, PeriodoId } from '../../dashboardFilter';
import { styles } from './styles';

type CampoId = keyof DashboardFilter;

/** Um seletor do painel: o que ele mostra fechado e o que oferece aberto. */
type CampoDoFiltro = {
  rotulo: string;
  valor: string;
  ativo: boolean;
  titulo: string;
  opcoes: PickerOption[];
  escolhido: string | null;
  escolher: (valor: string | null) => void;
};

type FilterPanelProps = {
  filtro: DashboardFilter;
  opcoes: FilterOptions;
  ativos: number;
  /** Os números estão sendo refeitos para o recorte recém-escolhido. */
  atualizando: boolean;
  onAlterar: (mudanca: Partial<DashboardFilter>) => void;
  onLimpar: () => void;
};

/**
 * O painel de filtros do dashboard gerencial.
 *
 * São quatro seletores - período, perfil de viajante, país e categoria de
 * local - que recortam todos os indicadores da tela. O que eles mostram como
 * opção vem da própria base (`opcoes`), então o gerente nunca escolhe um país
 * ou uma categoria que não existe e volta com o painel vazio.
 *
 * O componente não guarda o recorte nem busca nada: exibe o que recebe e
 * avisa a mudança. Guardar entre sessões é do `useDashboardFilter`, buscar é
 * do `useDashboard`.
 */
export default function FilterPanel({
  filtro, opcoes, ativos, atualizando, onAlterar, onLimpar,
}: FilterPanelProps) {
  const { t } = useTranslation('admin');
  const s = styles(useColors());
  const [aberto, setAberto] = useState<CampoId | null>(null);

  const todos = t('dashboard.filters.all');
  const todas = t('dashboard.filters.allFemale');

  /** A opção que desfaz a escolha aparece sempre no topo de cada lista. */
  const comOpcaoTodos = (valores: string[], rotuloVazio: string): PickerOption[] => [
    { value: null, label: rotuloVazio },
    ...valores.map((valor) => ({ value: valor, label: valor })),
  ];

  const campos: Record<CampoId, CampoDoFiltro> = {
    periodo: {
      rotulo: t('dashboard.filters.period'),
      valor: t(`dashboard.filters.periods.${filtro.periodo}`),
      ativo: filtro.periodo !== 'todo',
      titulo: t('dashboard.filters.selectPeriod'),
      opcoes: PERIODOS.map((id) => ({ value: id, label: t(`dashboard.filters.periods.${id}`) })),
      escolhido: filtro.periodo,
      escolher: (valor: string | null) => onAlterar({ periodo: (valor as PeriodoId) ?? 'todo' }),
    },
    profile: {
      rotulo: t('dashboard.filters.profile'),
      valor: filtro.profile ?? todos,
      ativo: filtro.profile !== null,
      titulo: t('dashboard.filters.selectProfile'),
      opcoes: comOpcaoTodos(opcoes.profiles, todos),
      escolhido: filtro.profile,
      escolher: (valor: string | null) => onAlterar({ profile: valor }),
    },
    country: {
      rotulo: t('dashboard.filters.country'),
      valor: filtro.country ?? todos,
      ativo: filtro.country !== null,
      titulo: t('dashboard.filters.selectCountry'),
      opcoes: comOpcaoTodos(opcoes.countries, todos),
      escolhido: filtro.country,
      escolher: (valor: string | null) => onAlterar({ country: valor }),
    },
    category: {
      rotulo: t('dashboard.filters.category'),
      valor: filtro.category ?? todas,
      ativo: filtro.category !== null,
      titulo: t('dashboard.filters.selectCategory'),
      opcoes: comOpcaoTodos(opcoes.categories, todas),
      escolhido: filtro.category,
      escolher: (valor: string | null) => onAlterar({ category: valor }),
    },
  };

  const ordem: CampoId[] = ['periodo', 'profile', 'country', 'category'];
  const campoAberto = aberto ? campos[aberto] : null;

  return (
    <View style={s.card}>
      <View style={s.header}>
        <Text style={s.title}>{t('dashboard.filters.title')}</Text>
        {atualizando && <ActivityIndicator size="small" style={s.spinner} />}
        <View style={s.headerRight}>
          {ativos > 0 && (
            <>
              <View style={s.badge}>
                <Text style={s.badgeText}>{ativos}</Text>
              </View>
              <TouchableOpacity onPress={onLimpar} hitSlop={8}>
                <Text style={s.clear}>{t('dashboard.filters.clear')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <View style={s.grid}>
        {ordem.map((id) => {
          const campo = campos[id];
          return (
            <TouchableOpacity
              key={id}
              style={[s.field, campo.ativo && s.fieldActive]}
              onPress={() => setAberto(id)}
              activeOpacity={0.7}
            >
              <Text style={s.fieldLabel}>{campo.rotulo}</Text>
              <View style={s.fieldValueRow}>
                <Text
                  style={[s.fieldValue, campo.ativo && s.fieldValueActive]}
                  numberOfLines={1}
                >
                  {campo.valor}
                </Text>
                <Text style={s.chevron}>▾</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {ativos > 0 && (
        <Text style={s.note}>{t('dashboard.filters.activeNote', { count: ativos })}</Text>
      )}

      {campoAberto && (
        <OptionPickerModal
          visible
          title={campoAberto.titulo}
          options={campoAberto.opcoes}
          selected={campoAberto.escolhido}
          emptyText={t('dashboard.filters.noOptions')}
          onSelect={(valor) => {
            campoAberto.escolher(valor);
            setAberto(null);
          }}
          onClose={() => setAberto(null)}
        />
      )}
    </View>
  );
}
