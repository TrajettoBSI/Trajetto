import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/src/theme';
import { AsyncBoundary } from '@/src/components/feedback';
import SpotCard from '@/src/pages/explore/components/SpotCard/SpotCard';
import { useFavorites } from './hooks/useFavorites';
import { styles } from './styles/styles';

export default function Favorites() {
  const { t } = useTranslation('favorites');
  const colors = useColors();
  const s = styles(colors);
  const insets = useSafeAreaInsets();
  const { router, favorites, loading, error, reload, openSpotDetail } = useFavorites();

  return (
    <View style={s.safe}>
      <View style={[s.headerWrapper, { paddingTop: insets.top }]}>
        <View style={s.headerRow}>
          <View style={s.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={s.headerBackBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={32} color={colors.onPrimary} />
            </TouchableOpacity>
            <Text style={s.headerText}>{t('backLabel')}</Text>
          </View>
        </View>
      </View>

      <View style={s.container}>
        <View style={s.header}>
          <Text style={s.headerTitle}>{t('title')}</Text>
          <Text style={s.headerSubtitle}>{t('subtitle')}</Text>
        </View>

        <AsyncBoundary
          state={{ loading: loading && !favorites, error: favorites ? null : error, data: favorites }}
          onRetry={reload}
          style={s.feedback}
          loading={{ title: t('loadingText'), message: '' }}
          empty={{
            icon: '🤍',
            title: t('emptyTitle'),
            message: t('emptyText'),
            actionLabel: t('emptyAction'),
            onAction: () => router.push('/ExploreScreen'),
          }}
        >
          {(lista) => (
            <FlatList
              data={lista}
              keyExtractor={(item) => item.xid}
              renderItem={({ item }) => (
                <SpotCard
                  spot={{ name: item.name, category: item.category ?? '', address: item.address ?? '' }}
                  onPress={() => openSpotDetail(item)}
                />
              )}
              contentContainerStyle={s.list}
              showsVerticalScrollIndicator={false}
              refreshing={loading}
              onRefresh={reload}
            />
          )}
        </AsyncBoundary>
      </View>
    </View>
  );
}
