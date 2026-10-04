import React from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/src/theme';
import { FeedbackState } from '@/src/components/feedback';
import { useAdminPanel } from './hooks/useAdminPanel';
import { styles } from './styles/styles';
import BarChart from '@/src/components/charts/BarChart/BarChart';
import DonutLegend from '@/src/components/charts/DonutLegend/DonutLegend';
import StatListRow from '@/src/components/charts/StatListRow/StatListRow';
import HeroStatCard from '@/src/components/charts/HeroStatCard/HeroStatCard';
import Section from '@/src/components/charts/Section/Section';

export default function AdminPanel() {
  const { t } = useTranslation('admin');
  const router = useRouter();
  const colors = useColors();
  const s = styles(colors);
  const {
    activeTab, setActiveTab,
    overview, countries, profiles, ageGroups,
    itinOv, perMonth, categories, topRated, mostVisited,
    loading, refreshing, error, verifiedPct,
    userFirstName, load, onRefresh,
  } = useAdminPanel();

  const faixasEtarias = ageGroups.filter((g) => g.count > 0);
  const usuariosVazio = (overview?.totalUsers ?? 0) === 0;
  const roteirosVazio = (itinOv?.totalItineraries ?? 0) === 0
    && categories.length === 0 && topRated.length === 0 && mostVisited.length === 0;
  const unratedPct = itinOv && itinOv.totalItineraries > 0
    ? Math.round((itinOv.unratedCount / itinOv.totalItineraries) * 100) : 0;
  const featured = topRated[0];

  const semDadosNoGrafico = (
    <FeedbackState
      variant="empty"
      layout="inline"
      icon="📈"
      title=""
      message={t('panel.empty.chart')}
    />
  );

  const semDadosNaAba = (icone: string, titulo: string, descricao: string) => (
    <FeedbackState
      variant="empty"
      layout="block"
      style={s.stateBox}
      icon={icone}
      title={titulo}
      message={descricao}
    />
  );

  return (
    <SafeAreaView style={s.safe}>

      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>{t('panel.headerTitle')}</Text>
          <Text style={s.headerSub}>{t('panel.greeting', { name: userFirstName })}</Text>
        </View>
        <TouchableOpacity style={s.avatarBtn} onPress={() => router.push('/AdminProfileScreen')} activeOpacity={0.8}>
          <Ionicons name="person" size={22} color={colors.textSubtle} />
        </TouchableOpacity>
      </View>

      {activeTab === 'usuarios' ? (
        <HeroStatCard
          label={t('panel.quickUsers')}
          value={overview?.totalUsers ?? 0}
          chips={[
            t('panel.itinerariesChip', { count: overview?.totalItineraries ?? 0 }),
            t('panel.verifiedChip', { pct: verifiedPct }),
          ]}
        />
      ) : (
        <HeroStatCard
          label={t('panel.quickItineraries')}
          value={itinOv?.totalItineraries ?? 0}
          chips={[
            t('panel.usersChip', { count: overview?.totalUsers ?? 0 }),
            t('panel.unratedChip', { pct: unratedPct }),
          ]}
        />
      )}

      <View style={s.tabBar}>
        <TouchableOpacity
          style={[s.tabBtn, activeTab === 'usuarios' && s.tabBtnActive]}
          onPress={() => setActiveTab('usuarios')}
          activeOpacity={0.8}
        >
          <Ionicons name="people" size={16} color={activeTab === 'usuarios' ? colors.text : colors.gray500} />
          <Text style={[s.tabText, activeTab === 'usuarios' && s.tabTextActive]}>{t('panel.tabUsers')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tabBtn, activeTab === 'roteiros' && s.tabBtnActive]}
          onPress={() => setActiveTab('roteiros')}
          activeOpacity={0.8}
        >
          <Ionicons name="map" size={16} color={activeTab === 'roteiros' ? colors.text : colors.gray500} />
          <Text style={[s.tabText, activeTab === 'roteiros' && s.tabTextActive]}>{t('panel.tabItineraries')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryDark} />}
      >
        {loading || error ? (
          <FeedbackState
            variant={loading ? 'loading' : 'error'}
            layout="block"
            style={s.stateBox}
            title={loading ? t('panel.loadingData') : undefined}
            message={loading ? '' : error}
            onAction={load}
          />
        ) : activeTab === 'usuarios' ? (
          <>
            {usuariosVazio ? (
              semDadosNaAba('👥', t('panel.empty.title'), t('panel.empty.description'))
            ) : (
              <>
                <View style={s.metricsCard}>
                  <StatListRow label={t('panel.admins')} value={overview?.totalAdmins ?? 0} />
                  <StatListRow label={t('panel.itinerariesCreated')} value={overview?.totalItineraries ?? 0} />
                  <StatListRow label={t('panel.verified')} value={overview?.verifiedUsers ?? 0} subValue={`${verifiedPct}%`} />
                  <StatListRow
                    label={t('panel.avgAge')}
                    value={overview?.avgAge ? t('panel.avgAgeValue', { age: overview.avgAge }) : '—'}
                    isLast
                  />
                </View>

                <Section title={t('panel.verificationRate')}>
                  <View style={s.verifiedBarTrack}>
                    <View style={[s.verifiedBarFill, { width: `${verifiedPct}%` }]} />
                  </View>
                  <View style={s.verifiedLegend}>
                    <View style={s.chip}>
                      <Text style={s.chipText}>{t('panel.verifiedChip', { pct: verifiedPct })}</Text>
                    </View>
                    <Text style={s.verifiedPendingText}>{t('panel.pendingCount', { count: overview?.unverifiedUsers ?? 0 })}</Text>
                  </View>
                </Section>

                <Section title={t('panel.travelerProfiles')}>
                  {profiles.length > 0
                    ? <DonutLegend data={profiles} labelKey="profile" valueKey="count" />
                    : semDadosNoGrafico}
                </Section>

                <View style={s.twoColRow}>
                  <View style={s.twoCol}>
                    <Text style={s.twoColTitle}>{t('panel.ageGroups')}</Text>
                    <View style={s.metricsCard}>
                      {faixasEtarias.length > 0
                        ? faixasEtarias.map((g, i) => (
                          <StatListRow key={g.group} label={g.group} value={g.count} isLast={i === faixasEtarias.length - 1} />
                        ))
                        : semDadosNoGrafico}
                    </View>
                  </View>
                  <View style={s.twoCol}>
                    <Text style={s.twoColTitle}>{t('panel.countries', { count: countries.length })}</Text>
                    <View style={s.metricsCard}>
                      {countries.length > 0
                        ? countries.map((c, i) => (
                          <StatListRow key={c.country} label={c.country} value={c.count} isLast={i === countries.length - 1} />
                        ))
                        : semDadosNoGrafico}
                    </View>
                  </View>
                </View>
              </>
            )}

            <TouchableOpacity
              style={s.userListBtn}
              onPress={() => router.push('/UserListScreen')}
              activeOpacity={0.85}
            >
              <Text style={s.userListBtnText}>{t('panel.viewAllUsers')}</Text>
              <Text style={s.userListBtnArrow}>›</Text>
            </TouchableOpacity>
          </>
        ) : roteirosVazio ? (
          semDadosNaAba('📊', t('panel.noPlacesData'), t('panel.noPlacesDataSub'))
        ) : (
          <>
            <View style={s.metricsCard}>
              <StatListRow
                label={t('panel.avgDuration')}
                value={itinOv?.avgDurationDays != null ? t('panel.avgDurationValue', { days: itinOv.avgDurationDays }) : '—'}
              />
              <StatListRow
                label={t('panel.avgRating')}
                value={itinOv?.avgRating != null ? t('panel.avgRatingValue', { value: itinOv.avgRating }) : '—'}
              />
              <StatListRow
                label={t('panel.withRating')}
                value={itinOv?.ratedCount ?? 0}
                subValue={t('panel.withoutRating', { count: itinOv?.unratedCount ?? 0 })}
                isLast
              />
            </View>

            <Section title={t('panel.itinerariesPerMonth')}>
              {perMonth.length > 0
                ? <BarChart data={perMonth} labelKey="month" valueKey="count" />
                : semDadosNoGrafico}
            </Section>

            <Section title={t('panel.placesByCategory')}>
              {categories.length > 0
                ? <DonutLegend data={categories} labelKey="category" valueKey="count" uppercase={false} bold={false} />
                : semDadosNoGrafico}
            </Section>

            {featured && (
              <Section title={t('panel.featuredLocation')}>
                <View style={s.featuredRow}>
                  <View style={s.featuredRank}>
                    <Text style={s.featuredRankText}>1</Text>
                  </View>
                  <View style={s.featuredInfo}>
                    <Text style={s.featuredName} numberOfLines={1}>{featured.name}</Text>
                    <Text style={s.featuredSub}>
                      {t('panel.avgRatingValue', { value: featured.avgRating })} · {t('panel.ratingsCount', { count: featured.totalRatings })}
                    </Text>
                  </View>
                </View>
              </Section>
            )}

            <Section title={t('panel.mostVisitedPlaces')}>
              {mostVisited.length > 0
                ? <DonutLegend data={mostVisited} labelKey="name" valueKey="count" uppercase={false} bold={false} bullet={false} labelWidth={160} />
                : semDadosNoGrafico}
            </Section>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
