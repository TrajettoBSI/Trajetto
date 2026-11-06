import React from 'react';
import { Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Reanimated, { FadeInDown, FadeOutLeft, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeroFill from '@/src/components/brand/HeroFill';
import { useLightStatusBar } from '@/src/pages/tabs/shared/hooks/useLightStatusBar';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import GenerateItineraryFlow from '@/components/GenerateItineraryFlow';
import CustomButton from '@/components/CustomButton';
import { useColors } from '@/src/theme';
import { AsyncBoundary } from '@/src/components/feedback';
import { useRoteiros } from './hooks/useRoteiros';
import { styles } from './styles/styles';
import AdminBanners from './components/AdminBanners/AdminBanners';
import ActiveItineraryCard from './components/ActiveItineraryCard/ActiveItineraryCard';
import InactiveItineraryRow from './components/InactiveItineraryRow/InactiveItineraryRow';
import EmptyState from './components/EmptyState/EmptyState';
import SelectBar from './components/SelectBar/SelectBar';
import SearchCard from './components/SearchCard/SearchCard';
import ExploreDestinationsCard from './components/ExploreDestinationsCard/ExploreDestinationsCard';
import PlaceHighlights from './components/PlaceHighlights/PlaceHighlights';
import RoteirosSkeleton from './components/RoteirosSkeleton/RoteirosSkeleton';
import OfflineBanner from '@/src/pages/tabs/shared/components/OfflineBanner/OfflineBanner';
import PressableScale from '@/src/components/motion/PressableScale';
import { usePullToRefresh } from '@/src/pages/tabs/shared/hooks/usePullToRefresh';

const enterSection = (index: number) => FadeInDown.delay(index * 70).duration(380);

export default function Roteiros() {
  const { t } = useTranslation('roteiros');
  const colors = useColors();
  const s = styles(colors);
  const insets = useSafeAreaInsets();
  useLightStatusBar();
  const {
    destIndex,
    user,
    router,
    itinerary,
    itineraries,
    loading,
    error,
    reload,
    refresh,
    deleting,
    activating,
    showGenerate,
    setShowGenerate,
    generatePrefill,
    openGenerate,
    selectMode,
    selectedIds,
    bulkDeleting,
    showAllInactive,
    setShowAllInactive,
    enterSelectMode,
    exitSelectMode,
    toggleSelect,
    selectAll,
    handleDelete,
    handleBulkDelete,
    handleActivate,
    highlights,
    openHighlight,
  } = useRoteiros();
  const { refreshing, onRefresh } = usePullToRefresh(refresh);
  const initial = user?.firstName?.trim().charAt(0).toUpperCase();

  const inactiveItineraries = itineraries.filter((i) => !i.active);
  const visibleInactiveItineraries = showAllInactive ? inactiveItineraries : inactiveItineraries.slice(0, 4);
  const hiddenInactiveCount = inactiveItineraries.length - visibleInactiveItineraries.length;

  return (
    <View style={s.safe}>
      {selectMode && (
        <View style={[s.header, { paddingTop: insets.top + 12 }]}>
          <>
            <TouchableOpacity onPress={exitSelectMode} activeOpacity={0.8}>
              <Text style={s.cancelSelectText}>{t('header.cancelSelect')}</Text>
            </TouchableOpacity>
            <Text style={Platform.OS === 'ios' ? s.headerTitleIos : s.headerTitleAndroid}>
              {t('header.selectedCount', { count: selectedIds.size })}
            </Text>
            <TouchableOpacity onPress={selectAll} activeOpacity={0.8}>
              <Text style={s.selectAllText}>{t('header.selectAll')}</Text>
            </TouchableOpacity>
          </>
        </View>
      )}

      {!selectMode && user?.isAdmin && (
        <AdminBanners
          onPressUsers={() => router.push('/UserListScreen')}
        />
      )}

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        {!selectMode && (
          <View style={[s.hero, { paddingTop: insets.top + 16 }]}>
            <HeroFill />
            <View style={s.heroTop}>
              <Reanimated.View entering={FadeInDown.duration(460)} style={s.heroText}>
                <Text style={s.headerGreeting}>{t('header.greeting', { name: user?.firstName })}</Text>
                <Text style={s.headerTitle}>{t('header.title')}</Text>
              </Reanimated.View>
              <PressableScale
                style={s.avatarBtn}
                onPress={() => router.push('/perfil')}
                scaleTo={0.9}
                haptic
                accessibilityRole="button"
              >
                {initial
                  ? <Text style={s.avatarInitial}>{initial}</Text>
                  : <Ionicons name="person" size={22} color={colors.onPrimary} />}
              </PressableScale>
            </View>
            <Reanimated.View entering={enterSection(1)}>
              <SearchCard onPressSearch={() => openGenerate()} />
            </Reanimated.View>
          </View>
        )}

        <View style={s.content}>
        <OfflineBanner />

        {!selectMode && (
          <Reanimated.View entering={enterSection(2)}>
            <ExploreDestinationsCard onPress={() => router.push('/ExploreScreen')} />
          </Reanimated.View>
        )}

        {!selectMode && itineraries.length > 0 && (
          <Reanimated.View entering={enterSection(3)} style={s.generateSection}>
            <Text style={s.generateLabel}>{t('generate.wantNew')}</Text>
            <CustomButton
              title={t('generate.button')}
              onPress={() => openGenerate()}
            />
          </Reanimated.View>
        )}

        {!selectMode && <PlaceHighlights highlights={highlights} onPress={openHighlight} />}

        <AsyncBoundary
          state={{ loading, error, data: loading && itineraries.length === 0 ? null : itineraries }}
          onRetry={reload}
          error={{ message: error ?? undefined }}
          style={s.centerState}
          renderLoading={() => <RoteirosSkeleton />}
          renderEmpty={() => <EmptyState destIndex={destIndex} onCreate={() => openGenerate()} />}
        >
          {() => (
          <>
            {itinerary && (
              <>
                <Text style={s.sectionLabel}>{t('activeSectionLabel')}</Text>

                <Reanimated.View entering={FadeInDown.duration(420)} layout={LinearTransition.springify().damping(18)}>
                  <ActiveItineraryCard
                    itinerary={itinerary}
                    selectMode={selectMode}
                    selected={selectedIds.has(itinerary.id)}
                    deleting={deleting === itinerary.id}
                    onPress={() => selectMode ? toggleSelect(itinerary.id) : router.push('/itinerario')}
                    onLongPress={() => !selectMode && enterSelectMode(itinerary.id)}
                    onDelete={() => handleDelete(itinerary.id)}
                  />
                </Reanimated.View>
              </>
            )}

            {inactiveItineraries.length > 0 && (
              <>
                <Text style={[s.sectionLabel, itinerary && s.sectionLabelSpaced]}>{t('otherSectionLabel')}</Text>
                {visibleInactiveItineraries.map((item, index) => (
                  <Reanimated.View
                    key={item.id}
                    entering={FadeInDown.delay(Math.min(index, 5) * 60).duration(320)}
                    exiting={FadeOutLeft.duration(220)}
                    layout={LinearTransition.springify().damping(18)}
                  >
                    <InactiveItineraryRow
                      item={item}
                      selectMode={selectMode}
                      selected={selectedIds.has(item.id)}
                      activating={activating === item.id}
                      deleting={deleting === item.id}
                      onPress={() => selectMode && toggleSelect(item.id)}
                      onLongPress={() => !selectMode && enterSelectMode(item.id)}
                      onActivate={() => handleActivate(item.id)}
                      onDelete={() => handleDelete(item.id)}
                    />
                  </Reanimated.View>
                ))}
                {hiddenInactiveCount > 0 && (
                  <TouchableOpacity
                    style={s.showMoreBtn}
                    onPress={() => setShowAllInactive(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={s.showMoreText}>{t('showMore', { count: hiddenInactiveCount })}</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </>
          )}
        </AsyncBoundary>
        </View>
      </ScrollView>

      {selectMode && (
        <SelectBar
          count={selectedIds.size}
          bulkDeleting={bulkDeleting}
          onBulkDelete={handleBulkDelete}
        />
      )}

      <GenerateItineraryFlow
        visible={showGenerate}
        initialPlace={generatePrefill}
        onClose={() => setShowGenerate(false)}
        onAccept={() => {
          setShowGenerate(false);
          router.push('/itinerario');
        }}
      />
    </View>
  );
}
