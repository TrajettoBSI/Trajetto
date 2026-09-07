import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColors } from '@/src/theme';
import { styles } from './styles';

export default function ExploreBanner({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation('roteiros');
  const s = styles(useColors());
  return (
    <TouchableOpacity style={s.exploreBanner} onPress={onPress} activeOpacity={0.92}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80' }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      <View style={s.exploreBannerOverlay} />

      <View style={s.exploreBannerContent}>
        <View style={s.exploreBannerTag}>
          <Text style={s.exploreBannerTagText}>{t('exploreBanner.tag')}</Text>
        </View>
        <Text style={s.exploreBannerTitle}>{t('exploreBanner.title')}</Text>
        <View style={s.exploreBannerBtn}>
          <Text style={s.exploreBannerBtnText}>{t('exploreBanner.cta')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
