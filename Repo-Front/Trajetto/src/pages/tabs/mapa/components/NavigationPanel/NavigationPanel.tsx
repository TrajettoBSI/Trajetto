import React from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import CustomButton from '@/components/CustomButton';
import { TravelMode } from '@/services';
import { useColors } from '@/src/theme';
import { formatDistance, formatTime } from '@/src/i18n/format';
import { FeedbackState } from '@/src/components/feedback';
import { formatDuration, optionFor } from '@/src/domain/navigation/navigation';
import type { MapaNavigation } from '../../hooks/useMapaNavigation';
import { styles } from './styles';

const MODES: { mode: TravelMode; icon: keyof typeof Ionicons.glyphMap }[] = [
  { mode: 'WALK', icon: 'walk-outline' },
  { mode: 'TRANSIT', icon: 'subway-outline' },
  { mode: 'CAR', icon: 'car-outline' },
];

const pad = (n: number) => String(n).padStart(2, '0');

export default function NavigationPanel({ nav, bottomInset }: { nav: MapaNavigation; bottomInset: number }) {
  const { t } = useTranslation('mapa');
  const colors = useColors();
  const s = styles(colors);

  if (nav.finished) {
    return (
      <View style={[s.panel, { paddingBottom: bottomInset + 16 }]}>
        <Text style={s.finishedEmoji}>🎉</Text>
        <Text style={s.finishedTitle}>{t('navigation.finishedTitle')}</Text>
        <Text style={s.finishedText}>{t('navigation.finishedText')}</Text>
        <CustomButton title={t('navigation.close')} onPress={nav.stopNavigation} style={s.primaryBtn} />
      </View>
    );
  }

  const fromLabel = nav.origin?.kind === 'you'
    ? t('navigation.fromYou')
    : nav.origin?.kind === 'origin' ? t('navigation.fromStart') : nav.origin?.name ?? '';
  const isLast = nav.legIndex === nav.total - 1;

  return (
    <View style={[s.panel, { paddingBottom: bottomInset + 16 }]}>
      <View style={s.headerRow}>
        <View style={s.headerText}>
          <Text style={s.legLabel}>{t('navigation.legLabel', { number: nav.legIndex + 1, total: nav.total })}</Text>
          <Text style={s.destName} numberOfLines={1}>{nav.dest?.name}</Text>
          <Text style={s.fromText} numberOfLines={1}>{t('navigation.from', { place: fromLabel })}</Text>
        </View>
        <TouchableOpacity onPress={nav.stopNavigation} style={s.closeBtn} accessibilityRole="button" accessibilityLabel={t('navigation.close')}>
          <Ionicons name="close" size={22} color={colors.gray600} />
        </TouchableOpacity>
      </View>

      {nav.loading && !nav.directions ? (
        <View style={s.loadingBox}>
          <ActivityIndicator color={colors.primary} />
          <Text style={s.loadingText}>{t('navigation.loading')}</Text>
        </View>
      ) : null}

      {nav.error ? (
        <FeedbackState variant="error" layout="inline" title="" message={nav.error} onAction={nav.retry} style={s.feedback} />
      ) : null}

      {nav.directions && nav.remaining ? (
        <>
          <View style={s.remainingRow}>
            <Text style={s.remainingBig}>{formatDuration(nav.remaining.duration)}</Text>
            <Text style={s.remainingSmall}>
              {formatDistance(nav.remaining.distance)}
              {nav.arrival ? `  ·  ${t('navigation.arrival', { time: formatTime(`${pad(nav.arrival.getHours())}:${pad(nav.arrival.getMinutes())}`) })}` : ''}
            </Text>
          </View>

          <View style={s.modesRow}>
            {MODES.map(({ mode, icon }) => {
              const option = optionFor(mode, nav.directions!);
              if (!option) return null;
              const selected = nav.mode === mode;
              const recommended = nav.directions!.recommended === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  style={[s.modeCard, selected && s.modeCardSelected]}
                  onPress={() => nav.setMode(mode)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={t(`navigation.mode.${mode}`)}
                >
                  {recommended ? <Text style={s.recommended}>{t('navigation.recommended')}</Text> : null}
                  <Ionicons name={icon} size={22} color={selected ? colors.onPrimary : colors.primary} />
                  <Text style={[s.modeName, selected && s.modeTextSelected]}>{t(`navigation.mode.${mode}`)}</Text>
                  <Text style={[s.modeTime, selected && s.modeTextSelected]}>
                    {option.estimated ? '~' : ''}{formatDuration(option.duration)}
                  </Text>
                  <Text style={[s.modeDistance, selected && s.modeTextSelected]}>{formatDistance(option.distance)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={s.reason}>{t(`navigation.reason.${nav.directions.recommended}`)}</Text>

          {nav.option && nav.option.steps.length > 0 ? (
            <ScrollView style={s.steps} nestedScrollEnabled>
              {nav.option.steps.map((step, i) => (
                <View key={`${i}-${step.instruction}`} style={s.stepRow}>
                  <Text style={s.stepNumber}>{i + 1}</Text>
                  <Text style={s.stepText}>{step.instruction}</Text>
                  {step.distance > 0 ? <Text style={s.stepDistance}>{formatDistance(step.distance)}</Text> : null}
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={s.estimateNote}>
              {nav.mode === 'TRANSIT' ? t('navigation.transitNote') : t('navigation.estimateNote')}
            </Text>
          )}

          <View style={s.actions}>
            <TouchableOpacity style={s.secondaryBtn} onPress={nav.openExternal} accessibilityRole="link">
              <Ionicons name="navigate-outline" size={18} color={colors.primary} />
              <Text style={s.secondaryText}>{t('navigation.openMaps')}</Text>
            </TouchableOpacity>
            <CustomButton
              title={isLast ? t('navigation.finish') : t('navigation.arrived')}
              onPress={nav.nextLeg}
              style={s.primaryBtn}
            />
          </View>
        </>
      ) : null}
    </View>
  );
}
