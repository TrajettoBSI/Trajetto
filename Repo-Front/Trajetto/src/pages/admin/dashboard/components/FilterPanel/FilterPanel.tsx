import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { FilterOptions } from '@/services';
import { useColors } from '@/src/theme';
import OptionPickerModal, { PickerOption } from '@/src/components/OptionPickerModal/OptionPickerModal';
import { DashboardFilter, PERIODOS, PeriodoId } from '../../dashboardFilter';
import { styles } from './styles';

type CampoId = keyof DashboardFilter;

/** Um seletor do painel: o que ele mostra fechado e o que oferece aberto. */
type CampoDoFiltro = {
  icone: keyof typeof Ionicons.glyphMap;
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
 * Os seletores aparecem como chips numa fileira horizontal rolável (em vez de
 * uma grade fixa): o rótulo de cada campo fica só no título do modal que ele
 * abre, e o chip mostra direto o valor escolhido - um texto de país ou
 * categoria longo nunca quebra o layout, só cresce o chip.
 *
 * O componente não guarda o recorte nem busca nada: exibe o que recebe e
 * avisa a mudança. Guardar entre sessões é do `useDashboardFilter`, buscar é
 * do `useDashboard`.
 */
export default function FilterPanel({
  filtro, opcoes, ativos, atualizando, onAlterar, onLimpar,
}: FilterPanelProps) {
  const { t } = useTranslation('admin');
  const colors = useColors();
  const s = styles(colors);
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
      icone: 'calendar-outline',
      valor: t(`dashboard.filters.periods.${filtro.periodo}`),
      ativo: filtro.periodo !== 'todo',
      titulo: t('dashboard.filters.selectPeriod'),
      opcoes: PERIODOS.map((id) => ({ value: id, label: t(`dashboard.filters.periods.${id}`) })),
      escolhido: filtro.periodo,
      escolher: (valor: string | null) => onAlterar({ periodo: (valor as PeriodoId) ?? 'todo' }),
    },
    profile: {
      icone: 'person-outline',
      valor: filtro.profile ?? todos,
      ativo: filtro.profile !== null,
      titulo: t('dashboard.filters.selectProfile'),
      opcoes: comOpcaoTodos(opcoes.profiles, todos),
      escolhido: filtro.profile,
      escolher: (valor: string | null) => onAlterar({ profile: valor }),
    },
    country: {
      icone: 'globe-outline',
      valor: filtro.country ?? todos,
      ativo: filtro.country !== null,
      titulo: t('dashboard.filters.selectCountry'),
      opcoes: comOpcaoTodos(opcoes.countries, todos),
      escolhido: filtro.country,
      escolher: (valor: string | null) => onAlterar({ country: valor }),
    },
    category: {
      icone: 'pricetag-outline',
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
        {atualizando && <ActivityIndicator size="small" color={colors.primary} style={s.spinner} />}
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

      <View style={s.scrollRowWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chipRow}
        >
          {ordem.map((id) => {
            const campo = campos[id];
            return (
              <TouchableOpacity
                key={id}
                style={[s.chip, campo.ativo && s.chipActive]}
                onPress={() => setAberto(id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={campo.icone}
                  size={15}
                  color={campo.ativo ? colors.primaryDark : colors.gray500}
                />
                <Text style={[s.chipText, campo.ativo && s.chipTextActive]} numberOfLines={1}>
                  {campo.valor}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={13}
                  color={campo.ativo ? colors.primaryDark : colors.gray400}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <LinearGradient
          colors={['rgba(255,255,255,0)', colors.white]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s.scrollFade}
          pointerEvents="none"
        />
      </View>

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
