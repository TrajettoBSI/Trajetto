import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import StarRating from '@/components/Rating';
import { PlaceHighlight } from '@/services';
import PressableScale from '@/src/components/motion/PressableScale';
import { useColors } from '@/src/theme';
import { cityImage } from '@/src/helpers/cityImage';
import { placeName } from '@/src/i18n/format';
import { styles } from './styles';

type PlaceHighlightsProps = {
  highlights: PlaceHighlight[];
  onPress: (highlight: PlaceHighlight) => void;
};

export default function PlaceHighlights({ highlights, onPress }: PlaceHighlightsProps) {
  const { t, i18n } = useTranslation('roteiros');
  const colors = useColors();
  const s = styles(colors);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [width, setWidth] = useState(0);
  const [page, setPage] = useState(0);

  if (highlights.length === 0) return null;

  return (
    <Animated.View entering={FadeInDown.delay(180).duration(380)} style={s.section}>
      <Text style={s.title}>{t('highlights.title')}</Text>
      <Text style={s.subtitle}>{t('highlights.subtitle')}</Text>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        onMomentumScrollEnd={(e) => width && setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
      >
        {highlights.map((h) => {
          const image = h.imageUrl && !failedImages.has(h.xid) ? { uri: h.imageUrl } : cityImage(h.city);
          return (
            <PressableScale key={h.xid} style={[s.card, { width }]} onPress={() => onPress(h)} scaleTo={0.98}>
              {image ? (
                <Image
                  source={image}
                  style={s.image}
                  contentFit="cover"
                  transition={280}
                  onError={() => setFailedImages((prev) => new Set(prev).add(h.xid))}
                />
              ) : <View style={s.image} />}
              <View style={s.body}>
                <Text style={s.name} numberOfLines={1}>{placeName(h.spot)}</Text>
                <View style={s.cityRow}>
                  <Ionicons name="location" size={12} color={colors.textSubtle} />
                  <Text style={s.city}>{t(`cities.${h.city}`, { defaultValue: h.city })}</Text>
                </View>
                <View style={s.ratingRow}>
                  {h.ratingsCount > 0 ? (
                    <>
                      <StarRating value={Math.round(h.average)} size={13} readonly />
                      <Text style={s.average}>
                        {h.average.toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                      </Text>
                      <Text style={s.count}>({t('highlights.ratingsCount', { count: h.ratingsCount })})</Text>
                    </>
                  ) : (
                    <Text style={s.count}>{t('highlights.noRatings')}</Text>
                  )}
                </View>
                {h.latestReview && (
                  <>
                    <Text style={s.review} numberOfLines={2}>&quot;{h.latestReview.comment}&quot;</Text>
                    <Text style={s.author} numberOfLines={1}>{t('highlights.reviewBy', { name: h.latestReview.userName })}</Text>
                  </>
                )}
              </View>
            </PressableScale>
          );
        })}
      </ScrollView>
      {highlights.length > 1 && (
        <View style={s.dots}>
          {highlights.map((h, i) => (
            <Animated.View key={h.xid} layout={LinearTransition.springify().damping(16)} style={[s.dot, i === page && s.dotActive]} />
          ))}
        </View>
      )}
    </Animated.View>
  );
}
