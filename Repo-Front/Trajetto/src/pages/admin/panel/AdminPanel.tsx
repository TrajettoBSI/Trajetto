import React from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { adminAccent, useColors } from '@/src/theme';
import AsyncState from '@/src/components/AsyncState/AsyncState';
import { useAdminPanel } from './hooks/useAdminPanel';
import { styles } from './styles/styles';
import BarChart from '@/src/components/charts/BarChart/BarChart';
import DonutLegend from '@/src/components/charts/DonutLegend/DonutLegend';
import StatCard from '@/src/components/charts/StatCard/StatCard';
import Section from '@/src/components/charts/Section/Section';
import StarRating from './components/StarRating/StarRating';
import RankRow from '@/src/components/charts/RankRow/RankRow';
import FilterPanel from '../dashboard/components/FilterPanel/FilterPanel';

export default function AdminPanel() {
  const { t } = useTranslation('admin');
  const router = useRouter();
  const colors = useColors();
  const s = styles(colors);
  const {
    activeTab, setActiveTab,
    filtro, opcoes, ativos, alterarFiltro, limparFiltro,
    overview, countries, profiles, ageGroups, perClient,
    itinOv, perMonth, categories, topRated, mostComment, mostVisited,
    loading, updating, refreshing, error, verifiedPct,
    userFirstName, logout, load, onRefresh,
  } = useAdminPanel();

  const filtrando = ativos > 0;
  const periodoOuCategoria = filtro.periodo !== 'todo' || filtro.category !== null;
  const faixasEtarias = ageGroups.filter((g) => g.count > 0);
  const totalClientes = (perClient?.clientsWithItinerary ?? 0) + (perClient?.clientsWithoutItinerary ?? 0);
  const usuariosVazio = (overview?.totalUsers ?? 0) === 0;
  const roteirosVazio = (itinOv?.totalItineraries ?? 0) === 0
    && categories.length === 0 && topRated.length === 0
    && mostComment.length === 0 && mostVisited.length === 0;

  const semDadosNoGrafico = (
    <Text style={s.emptyChartText}>
      {t(filtrando ? 'panel.empty.chartFiltered' : 'panel.empty.chart')}
    </Text>
  );

  const semDadosNaAba = (icone: string, titulo: string, descricao: string) => (
    <>
      <AsyncState
        style={s.stateBox}
        empty
        emptyIcon={filtrando ? '🔍' : icone}
        emptyTitle={filtrando ? t('panel.empty.titleFiltered') : titulo}
        emptyDescription={filtrando ? t('panel.empty.descriptionFiltered') : descricao}
      />
      {filtrando && (
        <TouchableOpacity style={[s.retryBtn, s.clearFiltersBtn]} onPress={limparFiltro} activeOpacity={0.85}>
          <Text style={s.retryText}>{t('panel.empty.clearFilters')}</Text>
        </TouchableOpacity>
      )}
    </>
  );

  return (
    <SafeAreaView style={s.safe}>

      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>{t('panel.headerTitle')}</Text>
          <Text style={s.headerSub}>{t('panel.greeting', { name: userFirstName })}</Text>
        </View>
        <TouchableOpacity style={s.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <Text style={s.logoutText}>{t('panel.logout')}</Text>
        </TouchableOpacity>
      </View>

      <View style={s.quickActions}>
        <TouchableOpacity style={s.quickCard} onPress={() => router.push('/UserListScreen')} activeOpacity={0.85}>
          <Text style={s.quickLabel}>{t('panel.quickUsers')}</Text>
          <Text style={s.quickCount}>{overview?.totalUsers ?? '—'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.quickCard, s.quickCardViolet]} activeOpacity={0.85}>
          <Text style={s.quickLabel}>{t('panel.quickItineraries')}</Text>
          <Text style={s.quickCount}>{overview?.totalItineraries ?? '—'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.quickCard, s.quickCardGreen]} activeOpacity={0.85}>
          <Text style={s.quickLabel}>{t('panel.quickVerified')}</Text>
          <Text style={s.quickCount}>{overview ? `${verifiedPct}%` : '—'}</Text>
        </TouchableOpacity>
      </View>

      <View style={s.tabBar}>
        <TouchableOpacity
          style={[s.tabBtn, activeTab === 'usuarios' && s.tabBtnActive]}
          onPress={() => setActiveTab('usuarios')}
          activeOpacity={0.8}
        >
          <Text style={[s.tabText, activeTab === 'usuarios' && s.tabTextActive]}>{t('panel.tabUsers')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tabBtn, activeTab === 'roteiros' && s.tabBtnActive]}
          onPress={() => setActiveTab('roteiros')}
          activeOpacity={0.8}
        >
          <Text style={[s.tabText, activeTab === 'roteiros' && s.tabTextActive]}>{t('panel.tabItineraries')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryDark} />}
      >
        <FilterPanel
          filtro={filtro}
          opcoes={opcoes}
          ativos={ativos}
          atualizando={updating}
          onAlterar={alterarFiltro}
          onLimpar={limparFiltro}
        />

        {loading || error ? (
          <AsyncState
            style={s.stateBox}
            loading={loading}
            loadingText={t('panel.loadingData')}
            spinnerColor={colors.primaryDark}
            error={error}
            onRetry={load}
          />
        ) : activeTab === 'usuarios' ? (
          <>
            {periodoOuCategoria && (
              <Text style={s.filterNote}>{t('panel.empty.usersScope')}</Text>
            )}

            {usuariosVazio ? (
              semDadosNaAba('👥', t('panel.empty.title'), t('panel.empty.description'))
            ) : (
              <>
                <View style={s.statsGrid}>
                  <StatCard icon="👥" label={t('panel.totalUsers')} value={overview?.totalUsers ?? 0} color={colors.primaryDark} />
                  <StatCard icon="🛡️" label={t('panel.admins')} value={overview?.totalAdmins ?? 0} color={adminAccent.violet} />
                  <StatCard icon="🗺️" label={t('panel.itineraries')} value={overview?.totalItineraries ?? 0} color={adminAccent.amber} />
                  <StatCard icon="✅" label={t('panel.verified')} value={overview?.verifiedUsers ?? 0} color={adminAccent.green} sub={t('panel.verifiedSub', { pct: verifiedPct })} />
                  <StatCard icon="⏳" label={t('panel.unverified')} value={overview?.unverifiedUsers ?? 0} color={adminAccent.red} />
                  {overview?.avgAge && (
                    <StatCard icon="🎂" label={t('panel.avgAge')} value={t('panel.avgAgeValue', { age: overview.avgAge })} color={adminAccent.cyan} />
                  )}
                </View>

                <Section title={t('panel.verificationRate')}>
                  <View style={s.verifiedRow}>
                    <View style={s.verifiedBarTrack}>
                      <View style={[s.verifiedBarFill, { width: `${verifiedPct}%` }]} />
                    </View>
                    <Text style={s.verifiedPct}>{verifiedPct}%</Text>
                  </View>
                  <View style={s.verifiedLegend}>
                    <Text style={s.verifiedLegendText}>{t('panel.verifiedLegend', { count: overview?.verifiedUsers })}</Text>
                    <Text style={s.verifiedLegendText}>{t('panel.unverifiedLegend', { count: overview?.unverifiedUsers })}</Text>
                  </View>
                </Section>

                <Section title={t('panel.travelerProfiles')}>
                  {profiles.length > 0
                    ? <DonutLegend data={profiles} labelKey="profile" valueKey="count" />
                    : semDadosNoGrafico}
                </Section>

                <Section title={t('panel.ageGroups')}>
                  {faixasEtarias.length > 0
                    ? <BarChart data={faixasEtarias} labelKey="group" valueKey="count" />
                    : semDadosNoGrafico}
                </Section>

                <Section title={t('panel.countries', { count: countries.length })}>
                  {countries.length > 0
                    ? <BarChart data={countries} labelKey="country" valueKey="count" />
                    : semDadosNoGrafico}
                </Section>
              </>
            )}

            <TouchableOpacity
              style={s.userListBtn}
              onPress={() => router.push('/UserListScreen')}
              activeOpacity={0.85}
            >
              <Text style={s.userListBtnIcon}>👥</Text>
              <Text style={s.userListBtnText}>{t('panel.viewAllUsers')}</Text>
              <Text style={s.userListBtnArrow}>›</Text>
            </TouchableOpacity>
          </>
        ) : roteirosVazio ? (
          semDadosNaAba('📊', t('panel.noPlacesData'), t('panel.noPlacesDataSub'))
        ) : (
          <>
            <View style={s.statsGrid}>
              <StatCard icon="🗺️" label={t('panel.totalItineraries')} value={itinOv?.totalItineraries ?? 0} color={colors.primaryDark} />
              <StatCard icon="📅" label={t('panel.avgDuration')} value={itinOv?.avgDurationDays != null ? t('panel.avgDurationValue', { days: itinOv.avgDurationDays }) : '—'} color={adminAccent.blue} />
              <StatCard icon="⭐" label={t('panel.avgRating')} value={itinOv?.avgRating != null ? t('panel.avgRatingValue', { value: itinOv.avgRating }) : '—'} color={adminAccent.amber} />
              <StatCard icon="✅" label={t('panel.withRating')} value={itinOv?.ratedCount ?? 0} color={adminAccent.green} sub={t('panel.withoutRating', { count: itinOv?.unratedCount ?? 0 })} />
            </View>

            <Section title={t('panel.itinerariesPerMonth')}>
              {perMonth.length > 0
                ? <BarChart data={perMonth} labelKey="month" valueKey="count" />
                : semDadosNoGrafico}
            </Section>

            <Section title={t('dashboard.topClients')}>
              {perClient && perClient.topClients.length > 0 ? (
                <View>
                  {perClient.topClients.map((c, i, arr) => (
                    <RankRow
                      key={i}
                      index={i}
                      isLast={i === arr.length - 1}
                      name={c.user}
                      subtitle={c.email}
                      count={c.count}
                      countLabel={t('dashboard.itineraryCount', { count: c.count })}
                    />
                  ))}
                </View>
              ) : semDadosNoGrafico}
            </Section>

            <Section title={t('dashboard.clientsWithoutItinerary')}>
              {perClient && totalClientes > 0 ? (
                <View style={s.noItineraryBox}>
                  <Text style={s.noItineraryCount}>{perClient.clientsWithoutItinerary}</Text>
                  <Text style={s.noItineraryLabel}>
                    {t('dashboard.clientsWithoutCount', { count: perClient.clientsWithoutItinerary })}
                  </Text>
                  <Text style={s.noItinerarySub}>
                    {t('dashboard.clientsWithCount', { count: perClient.clientsWithItinerary })}
                  </Text>
                </View>
              ) : semDadosNoGrafico}
            </Section>

            <Section title={t('panel.placesByCategory')}>
              {categories.length > 0
                ? <DonutLegend data={categories} labelKey="category" valueKey="count" />
                : semDadosNoGrafico}
            </Section>

            <Section title={t('panel.topRatedPlaces')}>
              {topRated.length > 0 ? (
                <View>
                  {topRated.slice(0, 8).map((item, i, arr) => (
                    <RankRow
                      key={i}
                      index={i}
                      isLast={i === arr.length - 1}
                      name={item.name}
                      subtitle={<StarRating value={item.avgRating} />}
                      count={item.avgRating}
                      countLabel={t('panel.ratingsCount', { count: item.totalRatings })}
                    />
                  ))}
                </View>
              ) : semDadosNoGrafico}
            </Section>

            <Section title={t('panel.mostCommentedPlaces')}>
              {mostComment.length > 0 ? (
                <View>
                  {mostComment.slice(0, 8).map((item, i, arr) => (
                    <RankRow
                      key={i}
                      index={i}
                      isLast={i === arr.length - 1}
                      name={item.name}
                      subtitle={t('panel.commentsInline', { count: item.commentCount })}
                      count={item.commentCount}
                      countLabel={t('panel.commentsAbbrev')}
                    />
                  ))}
                </View>
              ) : semDadosNoGrafico}
            </Section>

            <Section title={t('panel.mostVisitedPlaces')}>
              {mostVisited.length > 0
                ? <BarChart data={mostVisited} labelKey="name" valueKey="count" />
                : semDadosNoGrafico}
            </Section>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
