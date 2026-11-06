import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  ScrollViewInstance,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Reanimated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as ExpoImage } from 'expo-image';
import HeroFill from '../src/components/brand/HeroFill';
import RouteLoader from '../src/components/brand/RouteLoader';
import PressableScale from '../src/components/motion/PressableScale';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import DateTimePicker, { DateTimePickerAndroid, DateTimePickerChangeEvent } from '@react-native-community/datetimepicker';
import { useAuth } from '../context/AuthContext';
import { City, cityService, PlaceSuggestion, searchAddresses, TravelPace } from '../services';
import { getErrorMessage } from '../utils/apiError';
import { FeedbackState } from '../src/components/feedback';
import { Itinerary, useItineraryStore } from '../hooks/itineraryStore';
import CustomButton from './CustomButton';
import CustomInput from './CustomInput';
import OptionPickerModal from '../src/components/OptionPickerModal/OptionPickerModal';
import { countryLabelFromCode } from '../src/i18n/countries';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, placeColor, useColors } from '../src/theme';
import { addDays, groupByDay, toIsoDate } from '../src/domain/itinerary/itineraryDays';
import { freePeriod } from '../src/domain/itinerary/freePeriod';
import { formatDate, formatTime, formatWeekday, formatWeekdayDayMonth, itineraryTitle, placeName } from '../src/i18n/format';
import { cityImage } from '../src/helpers/cityImage';
import { NAME_MAX_LENGTH } from '../src/pages/tabs/itinerario/hooks/useItineraryRename';
import { REQUEST_MAX_LENGTH } from '../src/pages/tabs/itinerario/hooks/useItineraryAssistant';

type Step = 'config' | 'loading' | 'preview';

const MAX_DAYS = 7;

const PACES: { id: TravelPace; multiDayOnly: boolean }[] = [
  { id: 'INTENSO', multiDayOnly: false },
  { id: 'EQUILIBRADO', multiDayOnly: true },
  { id: 'LEVE', multiDayOnly: false },
];

const fromIsoDate = (iso: string) => new Date(`${iso}T00:00:00`);

/** Cidade do catalogo mais perto do ponto: e o destino quando o fluxo abre com um lugar ja escolhido. */
const nearestCity = (cities: City[], lat: number, lng: number) => {
  const dist = (c: City) => (c.latitude - lat) ** 2 + ((c.longitude - lng) * Math.cos((lat * Math.PI) / 180)) ** 2;
  return cities.reduce<City | null>((best, c) => (!best || dist(c) < dist(best) ? c : best), null);
};

type Props = {
  visible: boolean;
  initialPlace?: PlaceSuggestion;
  onAccept: (itinerary: Itinerary) => void;
  onClose: () => void;
};


const PACE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = { INTENSO: 'flash', EQUILIBRADO: 'options', LEVE: 'leaf' };

// ── Main component ───────────────────────────────────────────────────────────
export default function GenerateItineraryFlow({ visible, initialPlace, onAccept, onClose }: Props) {
  const { t, i18n } = useTranslation(['roteiros', 'common', 'itinerario']);
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
  const [cities, setCities] = useState<City[]>([]);
  const [citiesError, setCitiesError] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState<Itinerary | null>(null);
  const [startDate, setStartDate] = useState(() => toIsoDate(new Date()));
  const [days, setDays] = useState(1);
  const [pace, setPace] = useState<TravelPace>('INTENSO');
  const [name, setName] = useState('');
  const [tripRequest, setTripRequest] = useState('');
  const [showIosCalendar, setShowIosCalendar] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollViewRef = useRef<ScrollViewInstance>(null);
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
      setSelectedCity(null);
      setShowCityPicker(false);
      setGeneratedItinerary(null);
      setStartDate(toIsoDate(new Date()));
      setDays(1);
      setPace('INTENSO');
      setName('');
      setShowIosCalendar(false);
    }
  }

  const loadCities = async () => {
    setCitiesError(false);
    try {
      setCities(await cityService.getCities());
    } catch {
      setCitiesError(true);
    }
  };

  useEffect(() => {
    // Busca a lista no servidor ao abrir; precisa ser efeito.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (visible && cities.length === 0) loadCities();
    // so na abertura; a lista de cidades nao muda durante o uso
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Abriu com um lugar ja escolhido (o atalho "Roma"): o destino e a cidade dele.
  useEffect(() => {
    if (visible && initialPlace && cities.length > 0 && !selectedCity) {
      // A cidade depende da lista, que chega depois da abertura; precisa ser efeito.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedCity(nearestCity(cities, initialPlace.lat, initialPlace.lng));
    }
  }, [visible, initialPlace, cities, selectedCity]);

  const cityName = (city: City) => t(`roteiros:cities.${city.slug}`, { defaultValue: city.name });
  const cityPhoto = selectedCity ? cityImage(selectedCity.slug) : null;
  const cityLabel = (city: City) => `${cityName(city)}, ${countryLabelFromCode(city.country, i18n.language)}`;
  const cityOptions = [...cities]
    .sort((a, b) => cityName(a).localeCompare(cityName(b), i18n.language))
    .map((c) => ({ value: c.slug, label: cityLabel(c) }));

  const handleSelectCity = (slug: string | null) => {
    setShowCityPicker(false);
    const city = cities.find((c) => c.slug === slug) ?? null;
    if (!city || city.slug === selectedCity?.slug) return;
    // A partida tem de ser na cidade do roteiro: trocar de cidade descarta o endereco.
    setSelectedCity(city);
    handleClearInput();
  };

  const handleUseCityCenter = () => {
    if (!selectedCity) return;
    const label = t('roteiros:generateFlow.cityCenterLabel', { city: cityName(selectedCity) });
    handleSelectSuggestion({ lat: selectedCity.latitude, lng: selectedCity.longitude, shortName: label, displayName: label });
  };

  const endDate = addDays(startDate, days - 1);
  const genericName = itineraryTitle({ city: selectedCity?.slug, startDate });
  const summaryImage = cityImage(selectedCity?.slug);
  const availablePaces = PACES.filter((p) => days > 1 || !p.multiDayOnly);
  const effectivePace = availablePaces.some((p) => p.id === pace) ? pace : 'INTENSO';

  // So chamado quando uma data e escolhida; fechar o calendario sem escolher nao chama.
  const handlePickDate = (_event: DateTimePickerChangeEvent, date: Date) => {
    if (Platform.OS === 'ios') setShowIosCalendar(false);
    setStartDate(toIsoDate(date));
  };

  const openCalendar = () => {
    Keyboard.dismiss();
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: fromIsoDate(startDate),
        mode: 'date',
        minimumDate: new Date(),
        onValueChange: handlePickDate,
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
        const results = await searchAddresses(text.trim(), selectedCity ?? undefined);
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
    // Preenche o destino ao abrir; tambem cancela a busca pendente e fecha o teclado.
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
    const result = await generateItinerary(user!.id, selectedPlace!.lat, selectedPlace!.lng, startDate, days, effectivePace, selectedCity?.slug, name.trim() || undefined, tripRequest.trim() || undefined, i18n.language);
    const elapsed = Date.now() - start;
    const remaining = 2000 - elapsed;
    if (remaining > 0) await new Promise(r => setTimeout(r, remaining));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    return result;
  };

  // A falha devolve o usuario para onde ele estava, com o endereco e o roteiro que ja
  // tinha, e o aviso aparece ali mesmo com a opcao de tentar de novo.
  const gerar = async (voltarPara: Step) => {
    if (!selectedPlace || !selectedCity || !user) return;
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
  const completedFields = (selectedCity ? 1 : 0) + (selectedPlace ? 1 : 0);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={styles.container}>

          {/* ── Header ── */}
          {step !== 'loading' && (
            <View style={styles.header}>
              <HeroFill variant="bar" />
              <View style={styles.headerTopRow}>
                <View>
                  <Text style={styles.headerTitle}>
                    {step === 'config' ? t('roteiros:generateFlow.configureTitle') : t('roteiros:generateFlow.generatedTitle')}
                  </Text>
                  {step === 'config' && (
                    <Text style={styles.headerCounter}>{t('roteiros:generateFlow.configureSubtitle')}</Text>
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
                <View style={styles.cardHeader}>
                  <View style={styles.cardIcon}><Ionicons name="location" size={17} color={colors.primaryText} /></View>
                  <Text style={styles.cardLabel}>{t('roteiros:generateFlow.destinyLabel')}</Text>
                </View>
                <PressableScale
                  style={[styles.cityField, cityPhoto ? styles.cityFieldPhoto : null]}
                  onPress={() => { Keyboard.dismiss(); setShowCityPicker(true); }}
                  disabled={cities.length === 0}
                  scaleTo={0.98}
                  haptic
                  accessibilityRole="button"
                  accessibilityLabel={t('roteiros:generateFlow.pickCity')}
                >
                  {cityPhoto && <ExpoImage source={cityPhoto} style={styles.cityPhoto} contentFit="cover" transition={260} />}
                  {cityPhoto && <LinearGradient colors={[colors.scrimStart, colors.scrimEnd]} style={styles.cityPhoto} />}
                  <Ionicons name="location" size={20} color={cityPhoto ? colors.onPrimary : colors.textSubtle} style={styles.inputIcon} />
                  <Text style={[styles.cityText, !selectedCity && styles.cityPlaceholder, cityPhoto ? styles.cityTextOnPhoto : null]} numberOfLines={1}>
                    {selectedCity ? cityLabel(selectedCity) : t('roteiros:generateFlow.pickCity')}
                  </Text>
                  {cities.length === 0 && !citiesError
                    ? <ActivityIndicator size="small" color={colors.primaryText} />
                    : <Ionicons name="chevron-down" size={18} color={cityPhoto ? colors.onPrimary : colors.textSubtle} />}
                </PressableScale>
                {citiesError && (
                  <TouchableOpacity onPress={loadCities}>
                    <Text style={styles.searchMessage}>{t('roteiros:generateFlow.citiesError')}</Text>
                  </TouchableOpacity>
                )}
              </View>

              <OptionPickerModal
                visible={showCityPicker}
                title={t('roteiros:generateFlow.cityPickerTitle')}
                options={cityOptions}
                selected={selectedCity?.slug ?? null}
                onSelect={handleSelectCity}
                onClose={() => setShowCityPicker(false)}
              />

              {/* Ponto de partida */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIcon}><Ionicons name="navigate" size={17} color={colors.primaryText} /></View>
                  <Text style={styles.cardLabel}>{t('roteiros:generateFlow.originLabel')}</Text>
                </View>
                <Text style={styles.hint}>
                  {selectedCity
                    ? t('roteiros:generateFlow.originHint', { city: cityName(selectedCity) })
                    : t('roteiros:generateFlow.originNeedsCity')}
                </Text>

                {selectedCity && (<>

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
                          <ActivityIndicator size="small" color={colors.primaryText} />
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
                  <TouchableOpacity style={styles.chip} onPress={handleUseCityCenter}>
                    <Ionicons name="business-outline" size={15} color={colors.primaryText} />
                    <Text style={styles.chipText}>{t('roteiros:generateFlow.cityCenterChip')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.chip} onPress={handleUseCurrentLocation}>
                    <Ionicons name="locate-outline" size={15} color={colors.primaryText} />
                    <Text style={styles.chipText}>{t('roteiros:generateFlow.currentLocationLabel')}</Text>
                  </TouchableOpacity>
                </View>
                </>)}
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIcon}><Ionicons name="calendar" size={17} color={colors.primaryText} /></View>
                  <Text style={styles.cardLabel}>{t('roteiros:generateFlow.startDateLabel')}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.dateField, showIosCalendar && styles.dateFieldOpen]}
                  onPress={openCalendar}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={t('roteiros:generateFlow.pickStartDate')}
                >
                  <Ionicons name="calendar-outline" size={20} color={colors.primaryText} />
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
                    onValueChange={handlePickDate}
                    accentColor={colors.primary}
                    themeVariant="light"
                  />
                )}
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIcon}><Ionicons name="time" size={17} color={colors.primaryText} /></View>
                  <Text style={styles.cardLabel}>{t('roteiros:generateFlow.durationLabel')}</Text>
                </View>
                <View style={styles.stepperRow}>
                  <TouchableOpacity
                    style={[styles.stepperBtn, days <= 1 && styles.stepperBtnDisabled]}
                    onPress={() => setDays(d => Math.max(1, d - 1))}
                    disabled={days <= 1}
                    accessibilityLabel={t('roteiros:generateFlow.lessDays')}
                  >
                    <Ionicons name="remove" size={22} color={colors.primaryText} />
                  </TouchableOpacity>
                  <Text style={styles.durationValue}>{t('roteiros:generateFlow.daysCount', { count: days })}</Text>
                  <TouchableOpacity
                    style={[styles.stepperBtn, days >= MAX_DAYS && styles.stepperBtnDisabled]}
                    onPress={() => setDays(d => Math.min(MAX_DAYS, d + 1))}
                    disabled={days >= MAX_DAYS}
                    accessibilityLabel={t('roteiros:generateFlow.moreDays')}
                  >
                    <Ionicons name="add" size={22} color={colors.primaryText} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.periodText}>
                  {days > 1
                    ? `${formatWeekdayDayMonth(startDate)} -> ${formatWeekdayDayMonth(endDate)}`
                    : formatWeekdayDayMonth(startDate)}
                </Text>
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIcon}><Ionicons name="speedometer" size={17} color={colors.primaryText} /></View>
                  <Text style={styles.cardLabel}>{t('roteiros:generateFlow.paceLabel')}</Text>
                </View>
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
                      <View style={[styles.paceIcon, active && styles.paceIconActive]}>
                        <Ionicons name={PACE_ICONS[option.id] ?? 'walk'} size={18} color={active ? colors.onPrimary : colors.primaryText} />
                      </View>
                      <View style={styles.paceTextBox}>
                        <Text style={[styles.paceTitle, active && styles.paceTitleActive]}>
                          {t(`roteiros:generateFlow.paces.${option.id}.title`)}
                        </Text>
                        <Text style={styles.paceDescription}>{t(`roteiros:generateFlow.paces.${option.id}.description`)}</Text>
                      </View>
                      <Ionicons
                        name={active ? 'checkmark-circle' : 'ellipse-outline'}
                        size={24}
                        color={active ? colors.primaryText : colors.borderMuted}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIcon}><Ionicons name="pricetag" size={17} color={colors.primaryText} /></View>
                  <Text style={styles.cardLabel}>{t('roteiros:generateFlow.nameLabel')}</Text>
                </View>
                <CustomInput
                  value={name}
                  onChangeText={setName}
                  placeholder={genericName}
                  maxLength={NAME_MAX_LENGTH}
                  returnKeyType="done"
                  inputStyle={styles.addressInput}
                  style={{ marginBottom: 0 }}
                  inputWrapperStyle={styles.fakeSearchBox}
                  leftIcon={<Ionicons name="pricetag-outline" size={20} color={colors.textSubtle} style={styles.inputIcon} />}
                />
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIcon}><Ionicons name="chatbubble-ellipses" size={17} color={colors.primaryText} /></View>
                  <Text style={styles.cardLabel}>{t('roteiros:generateFlow.requestLabel')}</Text>
                </View>
                <CustomInput
                  value={tripRequest}
                  onChangeText={setTripRequest}
                  placeholder={t('roteiros:generateFlow.requestPlaceholder')}
                  maxLength={REQUEST_MAX_LENGTH}
                  multiline
                  inputStyle={styles.addressInput}
                  style={{ marginBottom: 0 }}
                  inputWrapperStyle={styles.fakeSearchBox}
                  leftIcon={<Ionicons name="create-outline" size={20} color={colors.textSubtle} style={styles.inputIcon} />}
                />
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

            </ScrollView>
          )}

          {step === 'config' && (
            <View style={styles.footer}>
              <CustomButton
                title={t('roteiros:generateFlow.generateButton')}
                onPress={handleGenerate}
                disabled={!selectedPlace || !selectedCity}
                icon={<Ionicons name="navigate" size={18} color={colors.onPrimary} />}
              />
            </View>
          )}

          {step === 'loading' && (
            <RouteLoader
              title={t('roteiros:generateFlow.loadingText')}
              steps={[
                t('roteiros:generateFlow.loadingStepPlaces', { city: selectedCity?.name ?? '' }),
                t('roteiros:generateFlow.loadingStepDays'),
                t('roteiros:generateFlow.loadingStepRoute'),
              ]}
            />
          )}

          {step === 'preview' && generatedItinerary && (
            <ScrollView contentContainerStyle={styles.content}>

              {/* Resumo */}
              <Reanimated.View entering={FadeInDown.duration(420)} style={styles.summaryCard}>
                {summaryImage && <Image source={summaryImage} style={styles.summaryImage} resizeMode="cover" />}
                {summaryImage && <LinearGradient colors={[colors.scrimStart, colors.scrimEnd]} style={styles.summaryShade} />}
                <Text style={styles.summaryName}>{itineraryTitle(generatedItinerary)}</Text>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                  <Ionicons name="location" size={18} color={colors.onPrimary} style={{marginBottom: 5}}/>
                  <Text style={[styles.summaryTitle]}>
                  {selectedCity ? cityLabel(selectedCity) : ''}
                  </Text>
                  </View>
                <Text style={styles.summaryMeta}>
                  {t('roteiros:generateFlow.summaryMeta', {
                    stops: generatedItinerary.places.length,
                    days: t('roteiros:generateFlow.daysCount', { count: groupByDay(generatedItinerary.startDate, generatedItinerary.places, generatedItinerary.endDate).length }),
                    origin: selectedPlace?.shortName ?? '',
                  })}
                </Text>
              </Reanimated.View>

              {generatedItinerary.assistantSummary ? (
                <Reanimated.View entering={FadeInDown.delay(120).duration(380)} style={styles.assistantCard}>
                  <Ionicons name="chatbubble-ellipses" size={18} color={colors.primaryText} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.assistantTitle}>{t('roteiros:generateFlow.assistantTitle')}</Text>
                    <Text style={styles.assistantText}>{generatedItinerary.assistantSummary}</Text>
                  </View>
                </Reanimated.View>
              ) : null}

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
                  const color = placeColor(colors, idx);
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
                            <Text style={styles.previewPlaceName} numberOfLines={2}>{placeName(place)}</Text>
                            {place.estimatedVisitTime ? (
                              <View style={[styles.timeBadge, { backgroundColor: color + '18', borderColor: color + '50' }]}>
                                <Text style={[styles.timeBadgeText, { color }]}>
                                  {formatTime(place.estimatedVisitTime)}
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
                    {t(`itinerario:freePeriod.${freePeriod(day.places)!.period}.title`)}
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
                  <LinearGradient colors={colors.gradientAction} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.acceptFill} />
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
    backgroundColor: colors.primaryDark,
    overflow: 'hidden',
    paddingTop: Platform.OS === 'ios' ? 20 : 16,
    paddingBottom: 16,
    paddingHorizontal: 24,
  },
  headerTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerTitle: { fontSize: 28, letterSpacing: -0.6, fontFamily: 'Display-Black', color: colors.onPrimary },
  headerCounter: { fontSize: 13, color: colors.onPrimaryFaint80, marginTop: 2 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.glassSurface, borderWidth: 1, borderColor: colors.glassBorder,
  },
  closeBtnText: { fontSize: 15, color: colors.onPrimary },
  progressTrack: { height: 5, backgroundColor: colors.glassSurface, borderRadius: 3, overflow: 'hidden', marginTop: 16 },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: colors.onPrimary },
  acceptFill: { ...StyleSheet.absoluteFill, borderRadius: 18 },

  content: { padding: 16, paddingBottom: 32 },
  footer: {
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, backgroundColor: colors.white,
    borderTopWidth: 1, borderTopColor: colors.borderSubtle,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  cardIcon: { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySurface },
  cityField: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingHorizontal: 14, minHeight: 54,
    backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  cityFieldPhoto: { minHeight: 132, alignItems: 'flex-end', paddingBottom: 12, borderWidth: 0, backgroundColor: colors.primaryDark },
  cityPhoto: { ...StyleSheet.absoluteFill },
  cityTextOnPhoto: { color: colors.onPrimary, fontFamily: 'Display-Bold', fontSize: 21, paddingVertical: 0 },
  paceIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySurface },
  paceIconActive: { backgroundColor: colors.primary },

  feedback: { marginTop: 18 },

  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardLabel: {
    fontSize: 17,
    fontFamily: 'Display-Bold',
    color: colors.text,
  },
  hint: { fontSize: 14, color: colors.textSubtle, marginBottom: 10, marginTop: -4, lineHeight: 20 },

  fakeSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cityText: { flex: 1, fontSize: 16, color: colors.text, fontFamily: 'Jakarta-Bold', paddingVertical: 12 },
  cityPlaceholder: { color: colors.textSubtle, fontFamily: 'Jakarta' },

  durationValue: { fontSize: 26, letterSpacing: -0.4, fontFamily: 'Display-Bold', color: colors.text, minWidth: 110, textAlign: 'center' },
  assistantCard: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: colors.primarySurface, borderRadius: 16, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: colors.primaryBorder,
  },
  assistantTitle: { fontSize: 12, fontFamily: 'Jakarta-Bold', color: colors.primaryText, textTransform: 'uppercase', letterSpacing: 0.5 },
  assistantText: { fontSize: 14, color: colors.text, marginTop: 4, lineHeight: 20 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySurface,
  },
  stepperBtnDisabled: { opacity: 0.35 },
  periodText: { fontSize: 13, color: colors.textSubtle, textAlign: 'center', marginTop: 10 },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateFieldOpen: { borderColor: colors.primary },
  dateFieldText: { flex: 1, fontSize: 17, fontFamily: 'Jakarta-Bold', color: colors.text },
  dateFieldWeekday: { fontSize: 13, color: colors.textSubtle, textTransform: 'capitalize' },
  paceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    padding: 12,
    marginBottom: 8,
    backgroundColor: colors.white,
  },
  paceOptionActive: { borderWidth: 2.5, padding: 11, borderColor: colors.primaryText, backgroundColor: colors.selectedSurface },
  paceTextBox: { flex: 1 },
  paceTitle: { fontSize: 16, fontFamily: 'Jakarta-Bold', color: colors.text },
  paceTitleActive: { color: colors.primaryText },
  paceDescription: { fontSize: 13, color: colors.textSubtle, marginTop: 2 },
  previewFreePeriod: { fontSize: 13, fontFamily: 'Jakarta-Bold', color: colors.successText, paddingVertical: 10 },
  previewDayLabel: {
    fontSize: 12,
    fontFamily: 'Jakarta-Bold',
    color: colors.textSubtle,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, marginBottom: 2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primarySurface,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  chipText: { fontFamily: 'Jakarta-Bold', fontSize: 13, color: colors.primaryText },

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
    fontSize: 17,
    color: colors.text,
  },
  clearBtn: { padding: 8 },
  clearBtnText: { fontSize: 14, color: colors.placeholder, fontFamily: 'Jakarta-Bold' },

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
  suggestionPrimary: { fontSize: 15, fontFamily: 'Jakarta-Bold', color: colors.text, marginBottom: 2 },
  suggestionSecondary: { fontSize: 13, color: colors.textSubtle },

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
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    marginTop: 28,
    shadowColor: colors.shadowBrand,
    shadowOpacity: 0.34,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    width: '100%', alignSelf: 'center', minHeight: 56,
  },
  generateBtnDisabled: { opacity: 0.45, shadowOpacity: 0 },
  generateBtnText: { color: colors.onPrimary, fontFamily: 'Jakarta-Bold', fontSize: 16 },

  // Loading

  // Preview
  summaryCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: 26,
    padding: 18,
    paddingTop: 110,
    marginBottom: 16,
    overflow: 'hidden',
  },
  summaryImage: { ...StyleSheet.absoluteFill, width: undefined, height: undefined },
  summaryShade: { ...StyleSheet.absoluteFill },
  summaryName: { fontSize: 30, lineHeight: 33, letterSpacing: -0.6, fontFamily: 'Display-Black', color: colors.onPrimary, marginBottom: 8 },
  summaryTitle: { fontSize: 16, fontFamily: 'Jakarta-Bold', color: colors.onPrimary, marginBottom: 4 },
  summaryMeta: { fontSize: 13, color: colors.onPrimaryFaint80 },

  previewList: {
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
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
  previewIndexText: { color: colors.onPrimary, fontFamily: 'Jakarta-Bold', fontSize: 13 },
  previewItemContent: { flex: 1, paddingBottom: 4 },
  previewItemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 3 },
  previewPlaceName: { flex: 1, fontSize: 14, fontFamily: 'Jakarta-Bold', color: colors.text, lineHeight: 20 },
  previewPlaceAddr: { fontSize: 12, color: colors.textSubtle },
  timeBadge: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  timeBadgeText: { fontSize: 11, fontFamily: 'Jakarta-Bold' },

  previewActions: { flexDirection: 'row', gap: 12 },
  regenBtn: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySurface,
  },
  regenBtnText: { fontSize: 16, fontFamily: 'Jakarta-Bold', color: colors.primaryText },
  acceptBtn: {
    flex: 1.3,
    backgroundColor: colors.primary,
    borderRadius: 18,
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
  acceptBtnText: { fontSize: 16, fontFamily: 'Jakarta-Bold', color: colors.onPrimary },
});
