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

export default function AdminPanel() {
  const { t } = useTranslation('admin');
  const router = useRouter();
  const colors = useColors();
  const s = styles(colors);
  const {
    activeTab, setActiveTab,
    overview, countries, profiles, ageGroups,
    itinOv, perMonth, categories, topRated, mostComment, mostVisited,
    loading, refreshing, error, verifiedPct,
    userFirstName, logout, load, onRefresh,
  } = useAdminPanel();

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

      <AsyncState
        style={s.center}
        loading={loading}
        loadingText={t('panel.loadingData')}
        spinnerColor={colors.primaryDark}
        error={error}
        onRetry={load}
      >
        {activeTab === 'usuarios' ? (
          <ScrollView
            contentContainerStyle={s.container}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryDark} />}
          >
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

            {profiles.length > 0 && (
              <Section title={t('panel.travelerProfiles')}>
                <DonutLegend data={profiles} labelKey="profile" valueKey="count" />
              </Section>
            )}

            {ageGroups.filter((g) => g.count > 0).length > 0 && (
              <Section title={t('panel.ageGroups')}>
                <BarChart data={ageGroups.filter((g) => g.count > 0)} labelKey="group" valueKey="count" />
              </Section>
            )}

            {countries.length > 0 && (
              <Section title={t('panel.countries', { count: countries.length })}>
                <BarChart data={countries} labelKey="country" valueKey="count" />
              </Section>
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
          </ScrollView>

        ) : (
          <ScrollView
            contentContainerStyle={s.container}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryDark} />}
          >
            <View style={s.statsGrid}>
              <StatCard icon="🗺️" label={t('panel.totalItineraries')} value={itinOv?.totalItineraries ?? 0} color={colors.primaryDark} />
              <StatCard icon="📅" label={t('panel.avgDuration')} value={itinOv?.avgDurationDays != null ? t('panel.avgDurationValue', { days: itinOv.avgDurationDays }) : '—'} color={adminAccent.blue} />
              <StatCard icon="⭐" label={t('panel.avgRating')} value={itinOv?.avgRating != null ? t('panel.avgRatingValue', { value: itinOv.avgRating }) : '—'} color={adminAccent.amber} />
              <StatCard icon="✅" label={t('panel.withRating')} value={itinOv?.ratedCount ?? 0} color={adminAccent.green} sub={t('panel.withoutRating', { count: itinOv?.unratedCount ?? 0 })} />
            </View>

            {perMonth.length > 0 && (
              <Section title={t('panel.itinerariesPerMonth')}>
                <BarChart data={perMonth} labelKey="month" valueKey="count" />
              </Section>
            )}

            {categories.length > 0 && (
              <Section title={t('panel.placesByCategory')}>
                <DonutLegend data={categories} labelKey="category" valueKey="count" />
              </Section>
            )}

            {topRated.length > 0 && (
              <Section title={t('panel.topRatedPlaces')}>
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
              </Section>
            )}

            {mostComment.length > 0 && (
              <Section title={t('panel.mostCommentedPlaces')}>
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
              </Section>
            )}

            {mostVisited.length > 0 && (
              <Section title={t('panel.mostVisitedPlaces')}>
                <BarChart data={mostVisited} labelKey="name" valueKey="count" />
              </Section>
            )}

            {topRated.length === 0 && mostComment.length === 0 && mostVisited.length === 0 && (
              <View style={s.emptyBox}>
                <Text style={s.emptyIcon}>📊</Text>
                <Text style={s.emptyText}>{t('panel.noPlacesData')}</Text>
                <Text style={s.emptySubText}>{t('panel.noPlacesDataSub')}</Text>
              </View>
            )}
          </ScrollView>
        )}
      </AsyncState>
    </SafeAreaView>
  );
}
