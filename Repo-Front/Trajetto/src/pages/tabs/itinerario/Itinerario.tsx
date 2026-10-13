import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomButton from '@/components/CustomButton';
import { PLACE_COLORS } from '@/constants/placeColors';
import { isPlacePast } from '@/app/utils/isPlacePast';
import { useColors } from '@/src/theme';
import { AsyncBoundary } from '@/src/components/feedback';
import NoItineraryEmptyState from '@/src/pages/tabs/shared/components/NoItineraryEmptyState/NoItineraryEmptyState';
import DaySelector from '@/src/pages/tabs/shared/components/DaySelector/DaySelector';
import { placeDate } from '@/src/domain/itinerary/itineraryDays';
import { useItinerario } from './hooks/useItinerario';
import { styles } from './styles/styles';
import ItineraryHeaderCard from './components/ItineraryHeaderCard/ItineraryHeaderCard';
import TimelineRow from './components/TimelineRow/TimelineRow';
import AlternativesModal from './components/AlternativesModal/AlternativesModal';
import NoteModal from './components/NoteModal/NoteModal';

export default function Itinerario() {
  const { t } = useTranslation('itinerario');
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const s = styles(colors);
  const {
    destIndex,
    itinerary,
    loading,
    error,
    reload,
    setFocusedMapPlace,
    days,
    currentDay,
    dayPlaces,
    selectDay,
    scrollRef,
    highlightedPlaceIndex,
    registerCardOffset,
    showAltModal,
    swipedPlace,
    alternatives,
    loadingAlts,
    handleSwipeLeft,
    handleSelectAlternative,
    handleCancelAlt,
    handleExportPDF,
    openSpotDetail,
    router,
    notePlace,
    noteDraft,
    setNoteDraft,
    savingNote,
    noteError,
    openNote,
    closeNote,
    saveNote,
  } = useItinerario();

  return (
    <AsyncBoundary
      state={{ loading, error, data: itinerary }}
      onRetry={reload}
      error={{ message: error ?? undefined }}
      style={s.center}
      loading={{ title: t('loadingText'), message: '' }}
      renderEmpty={() => <NoItineraryEmptyState destIndex={destIndex} title="Trajetto" />}
    >
      {(roteiro) => {
        const sorted = dayPlaces;

        return (
          <View style={s.safe}>
            <View style={[s.headerBar, { paddingTop: insets.top + 12 }]}>
              <Text style={s.headerBarTitle}>Trajetto</Text>
            </View>
            <ScrollView
              ref={scrollRef}
              style={s.container}
              contentContainerStyle={s.content}
              showsVerticalScrollIndicator={false}
            >
              <ItineraryHeaderCard
                startDate={roteiro.startDate}
                endDate={roteiro.endDate}
                stopsCount={roteiro.places.length}
                daysCount={days.length}
                startTime={sorted[0]?.estimatedVisitTime}
                endTime={sorted[sorted.length - 1]?.estimatedVisitTime}
              />

              <DaySelector
                days={days}
                selectedDate={currentDay?.date ?? null}
                onSelect={selectDay}
                style={s.daySelector}
              />

              <Text style={s.sectionLabel}>
                {days.length > 1 && currentDay
                  ? t('daySectionLabel', { number: currentDay.number, total: days.length })
                  : t('sectionLabel')}
              </Text>

              <View style={s.timeline}>
                {sorted.map((place, idx) => {
                  const isPast = isPlacePast(placeDate(roteiro.startDate, place), place.estimatedVisitTime);
                  const color = PLACE_COLORS[idx % PLACE_COLORS.length];
                  const isLast = idx === sorted.length - 1;
                  const isHighlighted = highlightedPlaceIndex === place.orderIndex;

                  return (
                    <TimelineRow
                      key={`${place.name}-${place.orderIndex}`}
                      place={place}
                      idx={idx}
                      color={color}
                      isPast={isPast}
                      isLast={isLast}
                      isHighlighted={isHighlighted}
                      onLayout={(e) => registerCardOffset(place.orderIndex, e.nativeEvent.layout.y)}
                      onSwitchPress={() => handleSwipeLeft(place)}
                      onPress={() => {
                        setFocusedMapPlace(idx);
                        router.push({ pathname: '/mapa', params: { from: 'itinerario' } });
                      }}
                      onInfoPress={() => openSpotDetail(place)}
                      onNotePress={() => openNote(place)}
                    />
                  );
                })}
              </View>

              <CustomButton
                title={t('exportPdf')}
                onPress={handleExportPDF}
                icon={<Ionicons name="download-outline" size={22} color={colors.white} />}
                style={s.btnExport}
              />
            </ScrollView>

            <AlternativesModal
              visible={showAltModal}
              swipedPlace={swipedPlace}
              alternatives={alternatives}
              loading={loadingAlts}
              onSelect={handleSelectAlternative}
              onCancel={handleCancelAlt}
            />

            <NoteModal
              place={notePlace}
              draft={noteDraft}
              saving={savingNote}
              error={noteError}
              onChangeDraft={setNoteDraft}
              onSave={saveNote}
              onCancel={closeNote}
            />
          </View>
        );
      }}
    </AsyncBoundary>
  );
}
