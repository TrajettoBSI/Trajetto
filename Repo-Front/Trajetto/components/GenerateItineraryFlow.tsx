import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import DateTimePicker, { DateTimePickerAndroid, DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useAuth } from '../context/AuthContext';
import { PlaceSuggestion, searchAddresses, TravelPace } from '../services';
import { getErrorMessage } from '../utils/apiError';
import { FeedbackState } from '../src/components/feedback';
import { Itinerary, useItineraryStore } from '../hooks/itineraryStore';
import CustomButton from './CustomButton';
import CustomInput from './CustomInput';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, useColors } from '../src/theme';
import { addDays, groupByDay, toIsoDate } from '../src/domain/itinerary/itineraryDays';
import { freePeriod } from '../src/domain/itinerary/freePeriod';
import { formatDate, formatWeekday, formatWeekdayDayMonth } from '../src/i18n/format';

const STOP_COLORS = ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C'];

type Step = 'config' | 'loading' | 'preview';

const MAX_DAYS = 7;

const PACES: { id: TravelPace; icon: string; multiDayOnly: boolean }[] = [
  { id: 'INTENSO', icon: '🔥', multiDayOnly: false },
  { id: 'EQUILIBRADO', icon: '⚖️', multiDayOnly: true },
  { id: 'LEVE', icon: '🌿', multiDayOnly: false },
];

const fromIsoDate = (iso: string) => new Date(`${iso}T00:00:00`);

type Props = {
  visible: boolean;
  initialPlace?: PlaceSuggestion;
  onAccept: (itinerary: Itinerary) => void;
  onClose: () => void;
};


const RADIUS = 54;
const BALL_R = 9;
const SIZE = (RADIUS + BALL_R + 6) * 2;
const CENTER = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function OrbitLoader() {
  const colors = useColors();
  const loaderStyles = getLoaderStyles(colors);
  // Two separate values: ball uses native driver, arc (SVG prop) cannot
  const [ballRot] = useState(() => new Animated.Value(0));
  const [arcProg] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const anim = Animated.loop(
      Animated.parallel([
        Animated.timing(ballRot, {
          toValue: 1,
          duration: 1800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(arcProg, {
          toValue: 1,
          duration: 1800,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [ballRot, arcProg]);

  const rotate = ballRot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  // Offset shrinks from full circumference (nothing drawn) → 0 (fully drawn)
  const dashOffset = arcProg.interpolate({ inputRange: [0, 1], outputRange: [CIRCUMFERENCE, 0] });

  return (
    <View style={loaderStyles.container}>
      {/* Arc draws itself as ball moves — starts at 12 o'clock, grows clockwise */}
      <Svg width={SIZE} height={SIZE} style={{ position: 'absolute' }}>
        <AnimatedCircle
          cx={CENTER} cy={CENTER} r={RADIUS}
          stroke={colors.primary} strokeWidth={3} fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          rotation={-90} origin={`${CENTER},${CENTER}`}
        />
      </Svg>
      {/* Ball leads at the growing tip of the arc */}
      <Animated.View style={[loaderStyles.arm, { transform: [{ rotate }] }]}>
        <View style={loaderStyles.ball} />
      </Animated.View>
    </View>
  );
}

const getLoaderStyles = (colors: AppColors) => StyleSheet.create({
  container: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  arm: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
  },
  ball: {
    position: 'absolute',
    width: BALL_R * 2,
    height: BALL_R * 2,
    borderRadius: BALL_R,
    backgroundColor: colors.primary,
    top: CENTER - BALL_R - RADIUS,
    left: CENTER - BALL_R,
    shadowColor: colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
});

// ── Main component ───────────────────────────────────────────────────────────
export default function GenerateItineraryFlow({ visible, initialPlace, onAccept, onClose }: Props) {
  const { t } = useTranslation(['roteiros', 'common', 'itinerario']);
  const colors = useColors();
  const styles = getStyles(colors);
  const { user } = useAuth();
  const { generateItinerary, acceptGeneratedItinerary } = useItineraryStore();

  const [step, setStep] = useState<Step>('config');
  const [erro, setErro] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<PlaceSuggestion | null>(null);
  const [generatedItinerary, setGeneratedItinerary] = useState<Itinerary | null>(null);
  const [startDate, setStartDate] = useState(() => toIsoDate(new Date()));
  const [days, setDays] = useState(1);
  const [pace, setPace] = useState<TravelPace>('INTENSO');
  const [showIosCalendar, setShowIosCalendar] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputLayoutY = useRef<number>(0);
  const searchRequestId = useRef(0);

  // Reset on open
  const [visibleAnterior, setVisibleAnterior] = useState(visible);
  if (visible !== visibleAnterior) {
    setVisibleAnterior(visible);
    if (visible) {
      setStep('config');
      setAddressInput('');
      setSuggestions([]);
      setSelectedPlace(null);
      setGeneratedItinerary(null);
      setStartDate(toIsoDate(new Date()));
      setDays(1);
      setPace('INTENSO');
      setShowIosCalendar(false);
    }
  }

  const endDate = addDays(startDate, days - 1);
  const availablePaces = PACES.filter((p) => days > 1 || !p.multiDayOnly);
  const effectivePace = availablePaces.some((p) => p.id === pace) ? pace : 'INTENSO';

  const handlePickDate = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'ios') setShowIosCalendar(false);
    if (event.type === 'set' && date) setStartDate(toIsoDate(date));
  };

  const openCalendar = () => {
    Keyboard.dismiss();
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: fromIsoDate(startDate),
        mode: 'date',
        minimumDate: new Date(),
        onChange: handlePickDate,
      });
    } else {
      setShowIosCalendar(v => !v);
    }
  };

  const handleInputChange = (text: string) => {
    // Selecionar uma sugestao atualiza o value do input controlado, o que pode ecoar
    // um onChangeText espurio com o mesmo texto (comum no Android) — ignora esse eco
    // pra nao zerar a selecao que acabou de ser confirmada.
    if (selectedPlace && text === selectedPlace.shortName) return;

    setAddressInput(text);
    setSelectedPlace(null);
    setSearchMessage('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length < 3) {
      setSuggestions([]);
      setSearching(false);
      searchRequestId.current += 1; // invalida qualquer busca ainda em voo
      return;
    }
    setSearching(true);
    const requestId = ++searchRequestId.current;
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchAddresses(text.trim());
        if (searchRequestId.current !== requestId) return; // resposta de uma busca ja abandonada
        setSuggestions(results);
        if (results.length === 0) setSearchMessage(t('roteiros:generateFlow.addressNotFound'));
        if (results.length > 0) {
          // Scroll to show suggestions above the keyboard
          scrollViewRef.current?.scrollTo({ y: Math.max(0, inputLayoutY.current - 20), animated: true });
        }
      } catch {
        if (searchRequestId.current !== requestId) return;
        setSuggestions([]);
        setSearchMessage(t('common:networkError'));
      } finally {
        if (searchRequestId.current === requestId) setSearching(false);
      }
    }, 400);
  };

  const handleSelectSuggestion = (item: PlaceSuggestion) => {
    searchRequestId.current += 1; // cancela qualquer busca pendente/em voo pra nao repopular a lista depois da selecao
    if (debounceRef.current) clearTimeout(debounceRef.current);
    Keyboard.dismiss();
    setSelectedPlace(item);
    setAddressInput(item.shortName);
    setSuggestions([]);
  };

  useEffect(() => {
    if (visible && initialPlace) handleSelectSuggestion(initialPlace);
  }, [visible, initialPlace]);

  const handleUseCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      const label = t('roteiros:generateFlow.currentLocationLabel');
      handleSelectSuggestion({ lat: loc.coords.latitude, lng: loc.coords.longitude, shortName: label, displayName: label });
    } catch {
      // GPS indisponivel: usuario ainda pode digitar o endereco manualmente
    }
  };

  const handleClearInput = () => {
    setAddressInput('');
    setSuggestions([]);
    setSelectedPlace(null);
    setSearching(false);
    setSearchMessage('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  const runGenerate = async () => {
    const start = Date.now();
    const result = await generateItinerary(user!.id, selectedPlace!.lat, selectedPlace!.lng, startDate, days, effectivePace);
    const elapsed = Date.now() - start;
    const remaining = 2000 - elapsed;
    if (remaining > 0) await new Promise(r => setTimeout(r, remaining));
    return result;
  };

  // A falha devolve o usuario para onde ele estava, com o endereco e o roteiro que ja
  // tinha, e o aviso aparece ali mesmo com a opcao de tentar de novo.
  const gerar = async (voltarPara: Step) => {
    if (!selectedPlace || !user) return;
    setErro('');
    setStep('loading');
    try {
      const result = await runGenerate();
      setGeneratedItinerary(result);
      setStep('preview');
    } catch (e) {
      setStep(voltarPara);
      setErro(getErrorMessage(e, t('roteiros:generateFlow.genericError')));
    }
  };

  const handleGenerate = () => gerar('config');

  const handleRegenerate = () => gerar(generatedItinerary ? 'preview' : 'config');

  const handleAccept = () => {
    if (!generatedItinerary) return;
    acceptGeneratedItinerary(generatedItinerary);
    onAccept(generatedItinerary);
  };

  const totalFields = 2;
  const completedFields = 1 + (selectedPlace ? 1 : 0);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={styles.container}>

          {/* ── Header ── */}
          {step !== 'loading' && (
            <View style={styles.header}>
              <View style={styles.headerTopRow}>
                <View>
                  <Text style={styles.headerTitle}>
                    {step === 'config' ? t('roteiros:generateFlow.configureTitle') : t('roteiros:generateFlow.generatedTitle')}
                  </Text>
                  {step === 'config' && (
                    <Text style={styles.headerCounter}>{completedFields}/{totalFields}</Text>
                  )}
                </View>
                {step === 'config' && (
                  <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
              {step === 'config' && (
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${(completedFields / totalFields) * 100}%` }]} />
                </View>
              )}
            </View>
          )}

          {/* ══════════ STEP: CONFIG ══════════ */}
          {step === 'config' && (
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >

              {/* Destino */}
              <View style={styles.card}>
                <Text style={styles.cardLabel}>{t('roteiros:generateFlow.destinyLabel')}</Text>
                <View style={styles.fakeSearchBoxDisabled}>
                  <Ionicons name="location" size={20} color={colors.textSubtle} style={styles.inputIcon} />
                  <Text style={styles.fakeSearchTextFilled}>
                    {t('roteiros:destinations.rome')}, {t('roteiros:destinations.italy')}
                  </Text>
                </View>
              </View>

              {/* Ponto de partida */}
              <View style={styles.card}>
                <Text style={styles.cardLabel}>{t('roteiros:generateFlow.originLabel')}</Text>
                <Text style={styles.hint}>{t('roteiros:generateFlow.originHint')}</Text>

                {/* Wrapper com zIndex para garantir visibilidade no iOS */}
                <View style={{ zIndex: 10, elevation: 10 }}>
                  {/* Campo com ícone de lupa e X */}
                  <View
                    style={styles.autocompleteWrapper}
                    onLayout={e => { inputLayoutY.current = e.nativeEvent.layout.y; }}
                  >
                    <CustomInput
                      value={addressInput}
                      onChangeText={handleInputChange}
                      placeholder={t('roteiros:generateFlow.originPlaceholder')}
                      returnKeyType="search"
                      autoCorrect={false}
                      inputStyle={styles.addressInput}
                      style={{ marginBottom: 0 }}
                      inputWrapperStyle={[
                        styles.fakeSearchBox,
                        selectedPlace ? styles.inputRowSelected : null,
                        (suggestions.length > 0 && !selectedPlace) && { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
                      ]}
                      leftIcon={<Ionicons name="search" size={20} color={colors.textSubtle} style={styles.inputIcon} />}
                      rightElement={
                        searching ? (
                          <ActivityIndicator size="small" color={colors.primary} />
                        ) : addressInput.length > 0 ? (
                          <TouchableOpacity onPress={handleClearInput} style={styles.clearBtn}>
                            <Text style={styles.clearBtnText}>✕</Text>
                          </TouchableOpacity>
                        ) : null
                      }
                    />
                  </View>

                  {/* Dropdown de sugestões */}
                  {suggestions.length > 0 && !selectedPlace && (
                    <View style={styles.suggestionsBox}>
                      {suggestions.map((item, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={[styles.suggestionItem, idx < suggestions.length - 1 && styles.suggestionDivider]}
                          onPress={() => handleSelectSuggestion(item)}
                        >
                          <Ionicons name="location" size={22} color={colors.textSubtle}/>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.suggestionPrimary} numberOfLines={1}>{item.shortName}</Text>
                            <Text style={styles.suggestionSecondary} numberOfLines={1}>
                              {item.displayName.split(',').slice(1, 3).join(',')}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {!selectedPlace && !searching && searchMessage ? (
                  <Text style={styles.searchMessage}>{searchMessage}</Text>
                ) : null}

                {/* Endereço confirmado */}
                {selectedPlace && (
                  <View style={styles.resolvedBox}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.successText} style={styles.resolvedIcon} />
                    <Text style={styles.resolvedText} numberOfLines={2}>
                      {selectedPlace.displayName.split(',').slice(0, 3).join(',')}
                    </Text>
                  </View>
                )}

                <View style={styles.chipRow}>
                  <TouchableOpacity style={styles.chip} onPress={handleUseCurrentLocation}>
                    <Text style={styles.chipText}>{t('roteiros:generateFlow.currentLocationLabel')}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>{t('roteiros:generateFlow.startDateLabel')}</Text>
                <TouchableOpacity
                  style={[styles.dateField, showIosCalendar && styles.dateFieldOpen]}
                  onPress={openCalendar}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={t('roteiros:generateFlow.pickStartDate')}
                >
                  <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                  <Text style={styles.dateFieldText}>{formatDate(startDate)}</Text>
                  <Text style={styles.dateFieldWeekday}>{formatWeekday(startDate)}</Text>
                  <Ionicons name={showIosCalendar ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSubtle} />
                </TouchableOpacity>
                {Platform.OS === 'ios' && showIosCalendar && (
                  <DateTimePicker
                    value={fromIsoDate(startDate)}
                    mode="date"
                    display="inline"
                    minimumDate={new Date()}
                    onChange={handlePickDate}
                    accentColor={colors.primary}
                    themeVariant="light"
                  />
                )}
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>{t('roteiros:generateFlow.durationLabel')}</Text>
                <View style={styles.stepperRow}>
                  <TouchableOpacity
                    style={[styles.stepperBtn, days <= 1 && styles.stepperBtnDisabled]}
                    onPress={() => setDays(d => Math.max(1, d - 1))}
                    disabled={days <= 1}
                    accessibilityLabel={t('roteiros:generateFlow.lessDays')}
                  >
                    <Ionicons name="remove" size={22} color={colors.primary} />
                  </TouchableOpacity>
                  <Text style={styles.durationValue}>{t('roteiros:generateFlow.daysCount', { count: days })}</Text>
                  <TouchableOpacity
                    style={[styles.stepperBtn, days >= MAX_DAYS && styles.stepperBtnDisabled]}
                    onPress={() => setDays(d => Math.min(MAX_DAYS, d + 1))}
                    disabled={days >= MAX_DAYS}
                    accessibilityLabel={t('roteiros:generateFlow.moreDays')}
                  >
                    <Ionicons name="add" size={22} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.periodText}>
                  {days > 1
                    ? `${formatWeekdayDayMonth(startDate)} -> ${formatWeekdayDayMonth(endDate)}`
                    : formatWeekdayDayMonth(startDate)}
                </Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>{t('roteiros:generateFlow.paceLabel')}</Text>
                {availablePaces.map((option) => {
                  const active = option.id === effectivePace;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[styles.paceOption, active && styles.paceOptionActive]}
                      onPress={() => setPace(option.id)}
                      activeOpacity={0.8}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: active }}
                    >
                      <Text style={styles.paceIcon}>{option.icon}</Text>
                      <View style={styles.paceTextBox}>
                        <Text style={[styles.paceTitle, active && styles.paceTitleActive]}>
                          {t(`roteiros:generateFlow.paces.${option.id}.title`)}
                        </Text>
                        <Text style={styles.paceDescription}>{t(`roteiros:generateFlow.paces.${option.id}.description`)}</Text>
                      </View>
                      <Ionicons
                        name={active ? 'radio-button-on' : 'radio-button-off'}
                        size={22}
                        color={active ? colors.primary : colors.borderMuted}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              {erro ? (
                <FeedbackState
                  variant="error"
                  layout="inline"
                  message={erro}
                  onAction={handleGenerate}
                  style={styles.feedback}
                />
              ) : null}

              <CustomButton
                title={t('roteiros:generateFlow.generateButton')}
                onPress={handleGenerate}
                disabled={!selectedPlace}
                style={styles.generateBtn}
              />
            </ScrollView>
          )}

          {step === 'loading' && (
            <View style={styles.loadingContainer}>
              <OrbitLoader />
              <Text style={styles.loadingText}>{t('roteiros:generateFlow.loadingText')}</Text>
            </View>
          )}

          {step === 'preview' && generatedItinerary && (
            <ScrollView contentContainerStyle={styles.content}>

              {/* Resumo */}
              <View style={styles.summaryCard}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                  <Ionicons name="location" size={18} color={colors.onPrimary} style={{marginBottom: 5}}/>
                  <Text style={[styles.summaryTitle]}>
                  {t('roteiros:generateFlow.summaryTitle')}
                  </Text>
                  </View>
                <Text style={styles.summaryMeta}>
                  {t('roteiros:generateFlow.summaryMeta', {
                    stops: generatedItinerary.places.length,
                    days: t('roteiros:generateFlow.daysCount', { count: groupByDay(generatedItinerary.startDate, generatedItinerary.places, generatedItinerary.endDate).length }),
                    origin: selectedPlace?.shortName ?? '',
                  })}
                </Text>
              </View>

              {/* Lista completa de lugares */}
              {groupByDay(generatedItinerary.startDate, generatedItinerary.places, generatedItinerary.endDate).map((day, _dayIdx, allDays) => (
              <View key={day.date}>
              {allDays.length > 1 && (
                <Text style={styles.previewDayLabel}>
                  {t('itinerario:daySelector.day', { number: day.number })} - {formatWeekdayDayMonth(day.date)}
                </Text>
              )}
              <View style={styles.previewList}>
                {day.places.map((place, idx) => {
                  const color = STOP_COLORS[idx % STOP_COLORS.length];
                  const isLast = idx === day.places.length - 1;
                  return (
                    <View key={idx}>
                      <View style={styles.previewItem}>
                        {/* Linha vertical da timeline */}
                        <View style={styles.timelineCol}>
                          <View style={[styles.previewIndex, { backgroundColor: color }]}>
                            <Text style={styles.previewIndexText}>{idx + 1}</Text>
                          </View>
                          {!isLast && <View style={[styles.timelineLine, { backgroundColor: color + '40' }]} />}
                        </View>
                        <View style={styles.previewItemContent}>
                          <View style={styles.previewItemRow}>
                            <Text style={styles.previewPlaceName} numberOfLines={2}>{place.name}</Text>
                            {place.estimatedVisitTime ? (
                              <View style={[styles.timeBadge, { backgroundColor: color + '18', borderColor: color + '50' }]}>
                                <Text style={[styles.timeBadgeText, { color }]}>
                                  {place.estimatedVisitTime.slice(0, 5)}
                                </Text>
                              </View>
                            ) : null}
                          </View>
                          {place.address ? (
                            <Text style={styles.previewPlaceAddr} numberOfLines={1}>{place.address}</Text>
                          ) : null}
                        </View>
                      </View>
                    </View>
                  );
                })}
                {freePeriod(day.places) && (
                  <Text style={styles.previewFreePeriod}>
                    🌿 {t(`itinerario:freePeriod.${freePeriod(day.places)!.period}.title`)}
                  </Text>
                )}
              </View>
              </View>
              ))}

              {erro ? (
                <FeedbackState
                  variant="error"
                  layout="inline"
                  message={erro}
                  onAction={handleRegenerate}
                  style={styles.feedback}
                />
              ) : null}

              {/* Ações */}
              <View style={styles.previewActions}>
                <TouchableOpacity style={styles.regenBtn} onPress={handleRegenerate} activeOpacity={0.85}>
                  <Text style={styles.regenBtnText}>{t('roteiros:generateFlow.regenerate')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept} activeOpacity={0.85}>
                  <Text style={styles.acceptBtnText}>{t('roteiros:generateFlow.accept')}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}

        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const getStyles = (colors: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundMuted },

  header: {
    backgroundColor: colors.white,
    paddingTop: Platform.OS === 'ios' ? 20 : 16,
    paddingBottom: 16,
    paddingHorizontal: 24,
  },
  headerTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerTitle: { fontSize: Platform.OS === 'ios' ? 20 : 26, fontWeight: 'bold', color: colors.text },
  headerCounter: { fontSize: 13, color: colors.textSubtle, marginTop: 2 },
  closeBtn: { padding: 4 },
  closeBtnText: { fontSize: 18, color: colors.textSubtle },
  progressTrack: { height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden', marginTop: 16 },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },

  content: { padding: 24, paddingBottom: 80 },

  feedback: { marginTop: 18 },

  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: Platform.OS === 'ios' ? 11 : 16,
    fontWeight: '700',
    color: colors.textSubtle,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  hint: { fontSize: Platform.OS === 'ios' ? 13 : 18, color: colors.textSubtle, marginBottom: 10, marginTop: -6 },

  fakeSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    shadowColor: colors.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  fakeSearchBoxDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundMuted,
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  fakeSearchTextFilled: { fontSize: Platform.OS === 'ios' ? 15 : 18, color: colors.textMuted, fontWeight: '600', paddingVertical: 9 },

  durationValue: { fontSize: Platform.OS === 'ios' ? 18 : 22, fontWeight: 'bold', color: colors.text, minWidth: 90, textAlign: 'center' },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  stepperBtnDisabled: { opacity: 0.35 },
  periodText: { fontSize: 13, color: colors.textSubtle, textAlign: 'center', marginTop: 10 },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.backgroundMuted,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateFieldOpen: { borderColor: colors.primary },
  dateFieldText: { flex: 1, fontSize: Platform.OS === 'ios' ? 16 : 18, fontWeight: '600', color: colors.text },
  dateFieldWeekday: { fontSize: 13, color: colors.textSubtle, textTransform: 'capitalize' },
  paceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 8,
    backgroundColor: colors.white,
  },
  paceOptionActive: { borderColor: colors.primary, backgroundColor: colors.backgroundMuted },
  paceIcon: { fontSize: 22 },
  paceTextBox: { flex: 1 },
  paceTitle: { fontSize: Platform.OS === 'ios' ? 15 : 17, fontWeight: '700', color: colors.text },
  paceTitleActive: { color: colors.primary },
  paceDescription: { fontSize: Platform.OS === 'ios' ? 12 : 14, color: colors.textSubtle, marginTop: 2 },
  previewFreePeriod: { fontSize: 13, fontWeight: '600', color: colors.successText, paddingVertical: 10 },
  previewDayLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSubtle,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  chipRow: { flexDirection: 'row', gap: 10, marginTop: 12, marginBottom: 4 },
  chip: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  chipText: { fontWeight: '700', fontSize: Platform.OS === 'ios' ? 12 : 18, color: colors.text },

  autocompleteWrapper: { marginBottom: 0 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  inputRowSelected: { borderColor: colors.successStrong },
  inputIcon: { marginRight: 8 },
  addressInput: {
    flex: 1,
    paddingVertical: 9,
    fontSize: Platform.OS === 'ios' ? 16 : 18,
    color: colors.text,
  },
  clearBtn: { padding: 8 },
  clearBtnText: { fontSize: 14, color: colors.placeholder, fontWeight: '600' },

  suggestionsBox: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.border,
    marginTop: 0,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  suggestionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.dividerSoft,
  },
  suggestionPrimary: { fontSize: Platform.OS === 'ios' ? 14 : 22, fontWeight: '600', color: colors.text, marginBottom: 2 },
  suggestionSecondary: { fontSize: Platform.OS === 'ios' ? 12 : 16, color: colors.textSubtle },

  resolvedBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.activeBadgeSurface,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginTop: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.activeBadgeSurface,
  },
  resolvedIcon: { marginTop: -1 },
  resolvedText: { flex: 1, fontSize: 13, color: colors.successText, lineHeight: 18 },
  searchMessage: { fontSize: 13, color: colors.warningBannerText, lineHeight: 18, marginTop: 10 },

  generateBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 28,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    width: '80%', alignSelf: 'center', minHeight: 55,
  },
  generateBtnDisabled: { opacity: 0.45, shadowOpacity: 0 },
  generateBtnText: { color: colors.onPrimary, fontWeight: 'bold', fontSize: 16 },

  // Loading
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28 },
  loadingText: { fontSize: 16, color: colors.textSubtle, fontWeight: '500' },

  // Preview
  summaryCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
  },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: colors.onPrimary, marginBottom: 4 },
  summaryMeta: { fontSize: 13, color: colors.onPrimaryFaint70 },

  previewList: {
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 24,
    shadowColor: colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  previewItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    gap: 14,
  },
  timelineCol: {
    alignItems: 'center',
    width: 30,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    minHeight: 16,
  },
  previewIndex: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewIndexText: { color: colors.onPrimary, fontWeight: 'bold', fontSize: 13 },
  previewItemContent: { flex: 1, paddingBottom: 4 },
  previewItemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 3 },
  previewPlaceName: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.text, lineHeight: 20 },
  previewPlaceAddr: { fontSize: 12, color: colors.textSubtle },
  timeBadge: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  timeBadgeText: { fontSize: 11, fontWeight: '700' },

  previewActions: { flexDirection: 'row', gap: 12 },
  regenBtn: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  regenBtnText: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  acceptBtn: {
    flex: 1.3,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  acceptBtnText: { fontSize: 16, fontWeight: 'bold', color: colors.onPrimary },
});
