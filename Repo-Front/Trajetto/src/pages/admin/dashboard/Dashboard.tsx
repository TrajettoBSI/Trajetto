import React from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { adminAccent, useColors } from '@/src/theme';
import AsyncState from '@/src/components/AsyncState/AsyncState';
import BarChart from '@/src/components/charts/BarChart/BarChart';
import DonutLegend from '@/src/components/charts/DonutLegend/DonutLegend';
import StatCard from '@/src/components/charts/StatCard/StatCard';
import Section from '@/src/components/charts/Section/Section';
import RankRow from '@/src/components/charts/RankRow/RankRow';
import { useDashboard } from './hooks/useDashboard';
import { umaCasa } from './dashboardFormat';
import BlockTitle from './components/BlockTitle/BlockTitle';
import { styles } from './styles/styles';

export default function Dashboard() {
  const { t } = useTranslation('admin');
  const colors = useColors();
  const s = styles(colors);
  const {
    overview, countries, profiles, ageGroups,
    perClient, itinerary, perMonth,
    categories, visited, topRated, commented,
    loading, refreshing, error, verifiedPct,
    load, onRefresh,
  } = useDashboard();

  if (loading || error) {
    return (
      <AsyncState
        style={s.center}
        loading={loading}
        loadingText={t('dashboard.loadingText')}
        spinnerColor={colors.primaryDark}
        error={error}
        onRetry={load}
      />
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryDark} />}
      >
        <View style={s.header}>
          <Text style={s.headerTitle}>{t('dashboard.headerTitle')}</Text>
          <Text style={s.headerSub}>{t('dashboard.headerSub')}</Text>
        </View>

        <BlockTitle>{t('dashboard.usersBlock')}</BlockTitle>

        <View style={s.statsGrid}>
          <StatCard icon="👥" label={t('dashboard.totalUsers')} value={overview?.totalUsers ?? 0} color={colors.primaryDark} />
          <StatCard icon="👤" label={t('dashboard.clients')} value={overview?.totalClients ?? 0} color={adminAccent.blue} />
          <StatCard icon="🛡️" label={t('dashboard.admins')} value={overview?.totalAdmins ?? 0} color={adminAccent.violet} />
          <StatCard icon="✅" label={t('dashboard.verified')} value={overview?.verifiedUsers ?? 0} color={adminAccent.green} sub={t('dashboard.verifiedSub', { pct: verifiedPct })} />
          <StatCard icon="⏳" label={t('dashboard.unverified')} value={overview?.unverifiedUsers ?? 0} color={adminAccent.red} />
          {overview?.avgAge && (
            <StatCard icon="🎂" label={t('dashboard.avgAge')} value={t('dashboard.avgAgeValue', { age: overview.avgAge })} color={adminAccent.cyan} />
          )}
        </View>

        <Section title={t('dashboard.verificationRate')}>
          <View style={s.verifiedRow}>
            <View style={s.verifiedBarTrack}>
              <View style={[s.verifiedBarFill, { width: `${verifiedPct}%` }]} />
            </View>
            <Text style={s.verifiedPct}>{verifiedPct}%</Text>
          </View>
          <View style={s.verifiedLegend}>
            <Text style={s.verifiedLegendText}>{t('dashboard.verifiedLegend', { count: overview?.verifiedUsers })}</Text>
            <Text style={s.verifiedLegendText}>{t('dashboard.unverifiedLegend', { count: overview?.unverifiedUsers })}</Text>
          </View>
        </Section>

        {profiles.length > 0 && (
          <Section title={t('dashboard.travelerProfiles')}>
            <DonutLegend data={profiles} labelKey="profile" valueKey="count" />
          </Section>
        )}

        {ageGroups.filter((g) => g.count > 0).length > 0 && (
          <Section title={t('dashboard.ageGroups')}>
            <BarChart data={ageGroups.filter((g) => g.count > 0)} labelKey="group" valueKey="count" />
          </Section>
        )}

        {countries.length > 0 && (
          <Section title={t('dashboard.countries', { count: countries.length })}>
            <BarChart data={countries} labelKey="country" valueKey="count" />
          </Section>
        )}

        <BlockTitle>{t('dashboard.itinerariesBlock')}</BlockTitle>

        <View style={s.statsGrid}>
          <StatCard icon="🗺️" label={t('dashboard.itinerariesCreated')} value={itinerary?.totalItineraries ?? 0} color={adminAccent.amber} />
          <StatCard icon="📅" label={t('dashboard.avgDuration')} value={t('dashboard.avgDurationValue', { days: umaCasa(itinerary?.avgDurationDays) })} color={adminAccent.cyan} />
          <StatCard icon="⭐" label={t('dashboard.avgRating')} value={t('dashboard.avgRatingValue', { value: umaCasa(itinerary?.avgRating) })} color={adminAccent.violet} />
          <StatCard icon="📝" label={t('dashboard.rated')} value={itinerary?.ratedCount ?? 0} color={adminAccent.green}
            sub={t('dashboard.unratedSub', { count: itinerary?.unratedCount ?? 0 })} />
        </View>

        {perMonth.length > 0 && (
          <Section title={t('dashboard.itinerariesPerMonth')}>
            <BarChart data={perMonth} labelKey="month" valueKey="count" limit={12} />
          </Section>
        )}

        {perClient && perClient.topClients.length > 0 && (
          <Section title={t('dashboard.topClients')}>
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
          </Section>
        )}

        {perClient && perClient.clientsWithoutItinerary > 0 && (
          <Section title={t('dashboard.clientsWithoutItinerary')}>
            <View style={s.noItineraryBox}>
              <Text style={s.noItineraryCount}>{perClient.clientsWithoutItinerary}</Text>
              <Text style={s.noItineraryLabel}>
                {t('dashboard.clientsWithoutCount', { count: perClient.clientsWithoutItinerary })}
              </Text>
              <Text style={s.noItinerarySub}>
                {t('dashboard.clientsWithCount', { count: perClient.clientsWithItinerary })}
              </Text>
            </View>
          </Section>
        )}

        <BlockTitle>{t('dashboard.placesBlock')}</BlockTitle>

        {categories.length > 0 && (
          <Section title={t('dashboard.categories', { count: categories.length })}>
            <DonutLegend data={categories} labelKey="category" valueKey="count" labelWidth={124} />
          </Section>
        )}

        {visited.length > 0 && (
          <Section title={t('dashboard.mostVisitedPlaces')}>
            <View>
              {visited.map((p, i, arr) => (
                <RankRow
                  key={i}
                  index={i}
                  isLast={i === arr.length - 1}
                  name={p.name}
                  count={p.count}
                  countLabel={t('dashboard.itineraryCount', { count: p.count })}
                />
              ))}
            </View>
          </Section>
        )}

        {topRated.length > 0 && (
          <Section title={t('dashboard.topRatedPlaces')}>
            <View>
              {topRated.map((p, i, arr) => (
                <RankRow
                  key={i}
                  index={i}
                  isLast={i === arr.length - 1}
                  name={p.name}
                  subtitle={t('dashboard.ratingsCount', { count: p.totalRatings })}
                  count={umaCasa(p.avgRating)}
                  countLabel={t('dashboard.outOfFive')}
                />
              ))}
            </View>
          </Section>
        )}

        {commented.length > 0 && (
          <Section title={t('dashboard.mostCommentedPlaces')}>
            <View>
              {commented.map((p, i, arr) => (
                <RankRow
                  key={i}
                  index={i}
                  isLast={i === arr.length - 1}
                  name={p.name}
                  count={p.commentCount}
                  countLabel={t('dashboard.commentsCount', { count: p.commentCount })}
                />
              ))}
            </View>
          </Section>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
