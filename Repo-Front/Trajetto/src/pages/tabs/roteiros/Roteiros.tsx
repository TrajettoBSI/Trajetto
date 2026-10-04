import React, { useRef } from 'react';
import { Animated, Platform, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

export default function Roteiros() {
  const { t } = useTranslation('roteiros');
  const colors = useColors();
  const s = styles(colors);
  const {
    destIndex,
    user,
    router,
    itinerary,
    itineraries,
    loading,
    error,
    reload,
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
  } = useRoteiros();

  const inactiveItineraries = itineraries.filter((i) => !i.active);
  const visibleInactiveItineraries = showAllInactive ? inactiveItineraries : inactiveItineraries.slice(0, 4);
  const hiddenInactiveCount = inactiveItineraries.length - visibleInactiveItineraries.length;

  const scrollY = useRef(new Animated.Value(0)).current;
  const GREETING_COLLAPSE_RANGE = 70;
  const greetingFontSize = scrollY.interpolate({
    inputRange: [0, GREETING_COLLAPSE_RANGE],
    outputRange: [Platform.OS === 'ios' ? 20 : 24, Platform.OS === 'ios' ? 13 : 18],
    extrapolate: 'clamp',
  });
  const greetingMarginTop = scrollY.interpolate({
    inputRange: [0, GREETING_COLLAPSE_RANGE],
    outputRange: [14, 2],
    extrapolate: 'clamp',
  });
  const titleFontSize = scrollY.interpolate({
    inputRange: [0, GREETING_COLLAPSE_RANGE],
    outputRange: [Platform.OS === 'ios' ? 19 : 27, Platform.OS === 'ios' ? 16 : 24],
    extrapolate: 'clamp',
  });
  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      <View style={s.header}>
        {selectMode ? (
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
        ) : (
          <>
            <View>
              <Animated.Text style={[s.headerTitle, { fontSize: titleFontSize }]}>{t('header.title')}</Animated.Text>
              <Animated.Text style={[s.headerGreeting, { fontSize: greetingFontSize, marginTop: greetingMarginTop }]}>
                {t('header.greeting', { name: user?.firstName })}
              </Animated.Text>
            </View>
            <TouchableOpacity
              style={s.avatarBtn}
              onPress={() => router.push('/perfil')}
              activeOpacity={0.8}
            >
              <Ionicons name="person" size={24} color={colors.textSubtle} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {!selectMode && user?.isAdmin && (
        <AdminBanners
          onPressUsers={() => router.push('/UserListScreen')}
        />
      )}

      <Animated.ScrollView
        contentContainerStyle={[s.content, { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {!selectMode && (
          <SearchCard
            onPressSearch={() => openGenerate()}
            onPressChip={() => openGenerate({
              lat: 41.9028,
              lng: 12.4964,
              shortName: t('destinations.rome'),
              displayName: `${t('destinations.rome')}, ${t('destinations.italy')}`,
            })}
          />
        )}

        {!selectMode && (
          <ExploreDestinationsCard onPress={() => router.push('/ExploreScreen')} />
        )}

        <AsyncBoundary
          state={{ loading, error, data: itinerary }}
          onRetry={reload}
          error={{ message: error ?? undefined }}
          style={s.centerState}
          loading={{ title: t('loadingItineraries'), message: '' }}
          renderEmpty={() => <EmptyState destIndex={destIndex} onCreate={() => openGenerate()} />}
        >
          {(roteiroAtivo) => (
          <>
            <Text style={s.sectionLabel}>{t('activeSectionLabel')}</Text>

            <ActiveItineraryCard
              itinerary={roteiroAtivo}
              selectMode={selectMode}
              selected={selectedIds.has(roteiroAtivo.id)}
              deleting={deleting === roteiroAtivo.id}
              onPress={() => selectMode ? toggleSelect(roteiroAtivo.id) : router.push('/itinerario')}
              onLongPress={() => !selectMode && enterSelectMode(roteiroAtivo.id)}
              onDelete={() => handleDelete(roteiroAtivo.id)}
            />

            {inactiveItineraries.length > 0 && (
              <>
                <Text style={[s.sectionLabel, s.sectionLabelSpaced]}>{t('otherSectionLabel')}</Text>
                {visibleInactiveItineraries.map((item) => (
                  <InactiveItineraryRow
                    key={item.id}
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

        {!selectMode && itinerary && (
          <View style={s.generateSection}>
            <Text style={s.generateLabel}>{t('generate.wantNew')}</Text>
            <CustomButton
              title={t('generate.button')}
              onPress={() => openGenerate()}
            />
          </View>
        )}
      </Animated.ScrollView>

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
    </SafeAreaView>
  );
}
