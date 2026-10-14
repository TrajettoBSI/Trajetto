import React from 'react';
import { ActivityIndicator, Keyboard, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import MapView, { Marker, Polyline } from 'react-native-maps';
import CustomInput from '@/components/CustomInput';
import { useColors } from '@/src/theme';
import NoItineraryEmptyState from '@/src/pages/tabs/shared/components/NoItineraryEmptyState/NoItineraryEmptyState';
import DaySelector from '@/src/pages/tabs/shared/components/DaySelector/DaySelector';
import { AsyncBoundary } from '@/src/components/feedback';
import { useMapa } from './hooks/useMapa';
import { styles } from './styles/styles';
import RouteLines from './components/RouteLines/RouteLines';
import OriginMarker from './components/OriginMarker/OriginMarker';
import PlaceMarkers from './components/PlaceMarkers/PlaceMarkers';
import SearchPin from './components/SearchPin/SearchPin';
import RouteBar from './components/RouteBar/RouteBar';
import ActiveFilterChips from './components/ActiveFilterChips/ActiveFilterChips';
import SuggestionsList from './components/SuggestionsList/SuggestionsList';
import SpotDetailCard from './components/SpotDetailCard/SpotDetailCard';
import FilterModal from './components/FilterModal/FilterModal';
import NavigationPanel from './components/NavigationPanel/NavigationPanel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Mapa() {
  const { t } = useTranslation(['mapa', 'common']);
  const colors = useColors();
  const s = styles(colors);
  const insets = useSafeAreaInsets();
  const {
    destIndex,
    itinerary,
    loading,
    error,
    reload,
    region,
    segments,
    points,
    days,
    currentDay,
    selectDay,
    mapRef,
    pulseStyle,
    firstUpcomingIdx,
    hasOriginSeg,
    currentSegIdx,
    handlePinPress,
    search,
    suggestions,
    showSuggestions,
    searchLoading,
    selectedSpot,
    setSelectedSpot,
    handleSearchChange,
    handleSelectSuggestion,
    handleClearSearch,
    hideSuggestions,
    showFilter,
    setShowFilter,
    categories,
    profiles,
    activeFilter,
    activeCount,
    tempCategory,
    setTempCategory,
    tempFee,
    setTempFee,
    tempHasHours,
    setTempHasHours,
    tempProfile,
    setTempProfile,
    tempMaxDistance,
    setTempMaxDistance,
    openFilter,
    handleApplyFilter,
    handleClearAllFilters,
    removeFilter,
    spotDistance,
    navigation,
  } = useMapa();

  return (
    <AsyncBoundary
      state={{ loading, error, data: itinerary }}
      onRetry={reload}
      loading={{ title: t('loadingText'), message: '' }}
      renderEmpty={() => {
        const emptyRegion = region ?? { latitude: -25.4284, longitude: -49.2733, latitudeDelta: 0.05, longitudeDelta: 0.05 };
        return (
          <NoItineraryEmptyState
            destIndex={destIndex}
            title={t('common:tabMap')}
            background={
              <>
                <MapView
                  key={region ? 'gps' : 'fallback'}
                  style={s.map}
                  initialRegion={emptyRegion}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  rotateEnabled={false}
                  pitchEnabled={false}
                  showsUserLocation
                >
                  <Marker coordinate={emptyRegion} />
                </MapView>
                <View style={s.mapEmptyScrim} />
              </>
            }
          />
        );
      }}
    >
      {(roteiro) => (
        <View style={s.container}>
          <MapView
            ref={mapRef}
            style={s.map}
            initialRegion={region}
            showsUserLocation
            onPress={() => { hideSuggestions(); Keyboard.dismiss(); }}
          >
            <RouteLines
              segments={segments}
              currentSegIdx={currentSegIdx}
              hasOriginSeg={hasOriginSeg}
              firstUpcomingIdx={firstUpcomingIdx}
            />

            {roteiro.originLatitude != null && roteiro.originLongitude != null && (
              <OriginMarker latitude={roteiro.originLatitude} longitude={roteiro.originLongitude} />
            )}

            <PlaceMarkers
              points={points}
              startDate={roteiro.startDate}
              firstUpcomingIdx={firstUpcomingIdx}
              pulseStyle={pulseStyle}
              onPinPress={handlePinPress}
            />

            {selectedSpot && <SearchPin spot={selectedSpot} />}

            {navigation.active && navigation.routeCoords.length > 1 && (
              <Polyline coordinates={navigation.routeCoords} strokeColor={colors.success} strokeWidth={6} zIndex={10} />
            )}
          </MapView>

          <View style={s.searchWrapper}>
            <CustomInput
              placeholder={t('searchPlaceholder')}
              value={search}
              onChangeText={handleSearchChange}
              returnKeyType="search"
              autoCorrect={false}
              style={{ marginBottom: 0 }}
              inputWrapperStyle={s.searchBar}
              inputStyle={s.searchInput}
              leftIcon={
                searchLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name="search" size={20} color={colors.gray400} />
                )
              }
              rightElement={
                <View style={s.filterBtnWrapper}>
                  {search.length > 0 && (
                    <TouchableOpacity onPress={handleClearSearch} style={s.clearBtn}>
                      <Text style={s.clearBtnText}>✕</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[s.filterBtn, activeCount > 0 && s.filterBtnActive]} onPress={openFilter} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel={t('filterModal.title')}>
                    <Ionicons name="filter" size={20} color={activeCount > 0 ? colors.primary : colors.gray400} />
                    {activeCount > 0 && (
                      <View style={s.filterBadge}>
                        <Text style={s.filterBadgeText}>{activeCount}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              }
            />

            <DaySelector
              days={days}
              selectedDate={currentDay?.date ?? null}
              onSelect={selectDay}
              style={s.daySelector}
            />

            {currentSegIdx >= 0 && firstUpcomingIdx < points.length && (
              <RouteBar
                firstUpcomingIdx={firstUpcomingIdx}
                hasOriginSeg={hasOriginSeg}
                placeName={points[firstUpcomingIdx]?.name}
              />
            )}

            {activeCount > 0 && (
              <ActiveFilterChips activeFilter={activeFilter} onRemove={removeFilter} />
            )}

            {showSuggestions && (
              <SuggestionsList suggestions={suggestions} onSelect={handleSelectSuggestion} />
            )}
          </View>

          {!navigation.active && !selectedSpot && points.length > 0 && (
            <TouchableOpacity
              style={[s.startBtn, { bottom: insets.bottom + 100 }]}
              onPress={navigation.startNavigation}
              activeOpacity={0.85}
              accessibilityRole="button"
            >
              <Ionicons name="navigate" size={20} color={colors.onPrimary} />
              <Text style={s.startBtnText}>{t('navigation.start')}</Text>
            </TouchableOpacity>
          )}

          {navigation.active && <NavigationPanel nav={navigation} bottomInset={insets.bottom + 80} />}

          {selectedSpot && (
            <SpotDetailCard
              spot={selectedSpot}
              distanceMeters={spotDistance}
              onClose={() => setSelectedSpot(null)}
            />
          )}

          <FilterModal
            visible={showFilter}
            categories={categories}
            profiles={profiles}
            activeCount={activeCount}
            tempCategory={tempCategory}
            setTempCategory={setTempCategory}
            tempFee={tempFee}
            setTempFee={setTempFee}
            tempHasHours={tempHasHours}
            setTempHasHours={setTempHasHours}
            tempProfile={tempProfile}
            setTempProfile={setTempProfile}
            tempMaxDistance={tempMaxDistance}
            setTempMaxDistance={setTempMaxDistance}
            onApply={handleApplyFilter}
            onClearAll={handleClearAllFilters}
            onClose={() => setShowFilter(false)}
          />
        </View>
      )}
    </AsyncBoundary>
  );
}
