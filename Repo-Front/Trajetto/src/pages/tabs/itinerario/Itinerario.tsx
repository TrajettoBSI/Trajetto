import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomButton from '@/components/CustomButton';
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
import RenameModal from './components/RenameModal/RenameModal';
import MealSuggestionCard from './components/MealSuggestionCard/MealSuggestionCard';
import FreePeriodCard from './components/FreePeriodCard/FreePeriodCard';
import ItineraryRatingCard from './components/ItineraryRatingCard/ItineraryRatingCard';
import OptionPickerModal from '@/src/components/OptionPickerModal/OptionPickerModal';
import { freePeriod } from '@/src/domain/itinerary/freePeriod';
import { itineraryTitle } from '@/src/i18n/format';
import { cityImage } from '@/src/helpers/cityImage';
import InsightsCard from './components/InsightsCard/InsightsCard';
import TravelLeg from './components/TravelLeg/TravelLeg';
import AssistantModal from './components/AssistantModal/AssistantModal';
import OfflineBanner from '@/src/pages/tabs/shared/components/OfflineBanner/OfflineBanner';
import ShareSheet from '@/src/components/share/ShareSheet';
import ItineraryStoryCard from '@/src/components/share/ItineraryStoryCard';

const TAB_BAR_SPACE = 64 + 4 + 24;

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
    mealSuggestions,
    retryMealSuggestions,
    openMealPlace,
    router,
    notePlace,
    noteDraft,
    setNoteDraft,
    savingNote,
    noteError,
    openNote,
    closeNote,
    saveNote,
    edit,
    rename,
    rating,
    assistant,
    savings,
    dayWeather,
    share,
    shareCardRef,
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
        const free = freePeriod(sorted);

        return (
          <View style={s.safe}>
            <View style={[s.headerBar, { paddingTop: insets.top + 12 }]}>
              <Text style={s.headerBarTitle}>Trajetto</Text>
              <View style={s.headerActions}>
                <TouchableOpacity
                  style={[s.headerExportBtn, edit.editing && s.headerEditActive]}
                  onPress={edit.toggleEditing}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityState={{ selected: edit.editing }}
                >
                  <Ionicons name={edit.editing ? 'checkmark' : 'create-outline'} size={18} color={edit.editing ? colors.primary : colors.onPrimary} />
                  <Text style={[s.headerExportText, edit.editing && s.headerEditActiveText]}>
                    {edit.editing ? t('edit.done') : t('edit.start')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.headerExportBtn}
                  onPress={share.open}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={t('share.button')}
                >
                  <Ionicons name="share-social-outline" size={18} color={colors.onPrimary} />
                  <Text style={s.headerExportText}>{t('share.buttonShort')}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView
              ref={scrollRef}
              style={s.container}
              contentContainerStyle={[s.content, { paddingBottom: insets.bottom + TAB_BAR_SPACE + 64 }]}
              showsVerticalScrollIndicator={false}
            >
              <OfflineBanner />

              <ItineraryHeaderCard
                title={itineraryTitle(roteiro)}
                image={cityImage(roteiro.city)}
                onRename={rename.open}
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

              {!edit.editing && (
                <InsightsCard savings={savings} weather={dayWeather} />
              )}

              <Text style={s.sectionLabel}>
                {days.length > 1 && currentDay
                  ? t('daySectionLabel', { number: currentDay.number, total: days.length })
                  : t('sectionLabel')}
              </Text>

              {edit.editing && <Text style={s.editHint}>{t('edit.hint')}</Text>}

              <View style={s.timeline}>
                {sorted.map((place, idx) => {
                  const isPast = isPlacePast(placeDate(roteiro.startDate, place), place.estimatedVisitTime);
                  const color = colors.placeBadge;
                  const isLast = idx === sorted.length - 1;
                  const isHighlighted = highlightedPlaceIndex === place.orderIndex;

                  return (
                    <React.Fragment key={`${place.name}-${place.orderIndex}`}>
                    {free?.insertAt === idx && <FreePeriodCard period={free.period} />}
                    {mealSuggestions.filter((m) => m.insertAt === idx).map((m) => (
                      <MealSuggestionCard key={m.key} suggestion={m} onSelect={openMealPlace} onRetry={retryMealSuggestions} />
                    ))}
                    {!edit.editing && place.walkingMinutesFromPrevious != null && place.distanceFromPreviousKm != null && (
                      <TravelLeg minutes={place.walkingMinutesFromPrevious} km={place.distanceFromPreviousKm} fromStart={idx === 0} />
                    )}
                    <TimelineRow
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
                      edit={edit.editing ? {
                        canMoveUp: idx > 0,
                        canMoveDown: !isLast,
                        disabled: edit.busy,
                        onMoveUp: () => edit.moveUp(place),
                        onMoveDown: () => edit.moveDown(place),
                        onRemove: () => edit.confirmRemove(place),
                      } : null}
                    />
                    </React.Fragment>
                  );
                })}
                {free?.insertAt === sorted.length && <FreePeriodCard period={free.period} />}
                {mealSuggestions.filter((m) => m.insertAt === sorted.length).map((m) => (
                  <MealSuggestionCard key={m.key} suggestion={m} onSelect={openMealPlace} onRetry={retryMealSuggestions} />
                ))}
              </View>

              {!edit.editing && (
                <ItineraryRatingCard
                  rating={rating.rating}
                  draft={rating.draft}
                  commentChanged={rating.commentChanged}
                  saving={rating.saving}
                  error={rating.error}
                  onRate={rating.rate}
                  onChangeDraft={rating.setDraft}
                  onSaveComment={rating.saveComment}
                />
              )}

              {edit.editing && (
                <CustomButton
                  title={t('edit.addFavorite')}
                  onPress={edit.openFavorites}
                  loading={edit.busy}
                  icon={<Ionicons name="heart-outline" size={20} color={colors.onPrimary} />}
                  style={s.btnAdd}
                />
              )}

              <CustomButton
                title={t('exportPdf')}
                onPress={handleExportPDF}
                icon={<Ionicons name="download-outline" size={22} color={colors.onPrimary} />}
                style={s.btnExport}
              />
            </ScrollView>

            {!edit.editing && (
              <TouchableOpacity
                style={[s.assistantFab, { bottom: insets.bottom + TAB_BAR_SPACE - 8 }]}
                onPress={assistant.open}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={t('assistant.open')}
              >
                <Ionicons name="sparkles" size={20} color={colors.onPrimary} />
                <Text style={s.assistantFabText}>{t('assistant.fab')}</Text>
              </TouchableOpacity>
            )}

            <AssistantModal
              visible={assistant.visible}
              draft={assistant.draft}
              sending={assistant.sending}
              error={assistant.error}
              replies={assistant.replies}
              preferences={roteiro.preferences}
              onChangeDraft={assistant.setDraft}
              onSend={assistant.send}
              onClose={assistant.close}
            />

            <ShareSheet
              visible={share.visible}
              title={t('share.title')}
              sharing={share.sharing}
              onShare={share.send}
              onClose={share.close}
            >
              {share.stats && (
                <ItineraryStoryCard
                  ref={shareCardRef}
                  width={share.cardWidth}
                  city={roteiro.city}
                  title={itineraryTitle(roteiro)}
                  startDate={roteiro.startDate}
                  endDate={roteiro.endDate}
                  stats={share.stats}
                  headline={t('share.headlinePlan')}
                />
              )}
            </ShareSheet>

            <AlternativesModal
              visible={showAltModal}
              swipedPlace={swipedPlace}
              alternatives={alternatives}
              loading={loadingAlts}
              onSelect={handleSelectAlternative}
              onCancel={handleCancelAlt}
            />

            <OptionPickerModal
              visible={edit.showFavorites}
              title={t('edit.favoritesTitle')}
              options={edit.favoriteOptions}
              selected={null}
              onSelect={edit.addFavorite}
              onClose={edit.closeFavorites}
              emptyText={edit.loadingFavorites ? '' : t('edit.favoritesEmpty')}
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

            <RenameModal
              visible={rename.visible}
              draft={rename.draft}
              genericName={itineraryTitle({ ...roteiro, name: null })}
              saving={rename.saving}
              error={rename.error}
              onChangeDraft={rename.setDraft}
              onSave={rename.save}
              onCancel={rename.close}
            />
          </View>
        );
      }}
    </AsyncBoundary>
  );
}
