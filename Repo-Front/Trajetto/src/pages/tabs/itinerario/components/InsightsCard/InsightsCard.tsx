import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useColors } from '@/src/theme';
import { DayWeather } from '@/services';
import { RouteSavings } from '@/src/domain/itinerary/routeSavings';
import { WEATHER_ICONS, weatherKind } from '@/src/domain/weather/weatherInfo';
import { formatDecimal } from '@/src/i18n/format';
import { styles } from './styles';

type InsightsCardProps = {
  savings: RouteSavings | null;
  weather: DayWeather | null;
};

export default function InsightsCard({ savings, weather }: InsightsCardProps) {
  const { t } = useTranslation('itinerario');
  const colors = useColors();
  const s = styles(colors);
  const kind = weather ? weatherKind(weather.weatherCode) : null;

  return (
    <View style={s.card}>
      <View style={s.tiles}>
        {savings && (
          <View style={s.tile}>
            <View style={s.tileHeader}>
              <Ionicons name="git-network-outline" size={16} color={colors.primaryText} />
              <Text style={s.tileLabel}>{t('insights.route')}</Text>
            </View>
            <Text style={s.tileValue}>{t('insights.km', { value: formatDecimal(savings.distanceKm) })}</Text>
            {savings.savedPercent > 0 ? (
              <View style={s.badge}>
                <Ionicons name="trending-down" size={12} color={colors.successText} />
                <Text style={s.badgeText}>{t('insights.saved', { percent: savings.savedPercent })}</Text>
              </View>
            ) : (
              <Text style={s.tileSub}>{t('insights.optimized')}</Text>
            )}
          </View>
        )}

        <View style={s.tile}>
          <View style={s.tileHeader}>
            <Ionicons name={(kind ? WEATHER_ICONS[kind] : 'partly-sunny-outline') as never} size={16} color={colors.primaryText} />
            <Text style={s.tileLabel}>{t('insights.weather')}</Text>
          </View>
          {weather && kind ? (
            <>
              <Text style={s.tileValue}>
                {Math.round(weather.maxTemperature)}° / {Math.round(weather.minTemperature)}°
              </Text>
              <Text style={s.tileSub}>
                {t(`insights.kinds.${kind}`)}{weather.precipitationProbability > 0 ? ` - ${t('insights.rainChance', { percent: weather.precipitationProbability })}` : ''}
              </Text>
            </>
          ) : (
            <Text style={s.tileSub}>{t('insights.noForecast')}</Text>
          )}
        </View>
      </View>

      {weather?.rainy && (
        <View style={s.rainBanner}>
          <Ionicons name="umbrella" size={16} color={colors.primaryText} />
          <Text style={s.rainText}>{t('insights.rainyDay')}</Text>
        </View>
      )}
    </View>
  );
}
