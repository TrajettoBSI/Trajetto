import React from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  Modal,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CustomInput from '@/components/CustomInput';
import { useColors } from '@/src/theme';
import AsyncState from '@/src/components/AsyncState/AsyncState';
import { useExplore } from './hooks/useExplore';
import { categoryIcon } from '@/src/helpers/categoryIcon';
import SpotCard from './components/SpotCard/SpotCard';
import { styles } from './styles/styles';

export default function Explore() {
  const { t } = useTranslation(['explore', 'common']);
  const router = useRouter();
  const colors = useColors();
  const s = styles(colors);
  const insets = useSafeAreaInsets();
  const {
    spots,
    categories,
    loading,
    search,
    selectedCategory,
    showFilter,
    tempCategory,
    searched,
    activeFilters,
    setTempCategory,
    openFilter,
    closeFilter,
    handleSearchChange,
    handleApplyFilter,
    handleClearFilter,
    handleSpotPress,
  } = useExplore();

  return (
    <View style={s.safe}>
      <View style={[s.headerWrapper, { paddingTop: insets.top }]}>
        <View style={s.headerRow}>
          <View style={s.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={s.headerBackBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={32} color={colors.white} />
            </TouchableOpacity>
            <Text style={s.headerText}>{t('explore:headerTitle')}</Text>
          </View>
        </View>
      </View>
      <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        <View style={s.header}>
          <Text style={s.headerTitle}>{t('explore:headerTitle')}</Text>
          <Text style={s.headerSubtitle}>{t('explore:subtitle')}</Text>
        </View>

        <View style={s.searchRow}>
          <CustomInput
            placeholder={t('explore:searchPlaceholder')}
            value={search}
            onChangeText={handleSearchChange}
            returnKeyType="search"
            autoCorrect={false}
            style={s.searchInput}
            inputWrapperStyle={s.searchInputWrapper}
            leftIcon={<Ionicons name="search" size={20} color={colors.gray400} />}
          />
          <TouchableOpacity
            style={[s.filterBtn, activeFilters > 0 && s.filterBtnActive]}
            onPress={openFilter}
            activeOpacity={0.8}
          >
            <Ionicons name="filter" size={20} color={activeFilters > 0 ? colors.primary : colors.gray400} />
            {activeFilters > 0 && (
              <View style={s.filterBadge}>
                <Text style={s.filterBadgeText}>{activeFilters}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {selectedCategory ? (
          <View style={s.activeFilterRow}>
            <View style={s.activeFilterChip}>
              <Text style={s.activeFilterText}>{selectedCategory}</Text>
              <TouchableOpacity onPress={handleClearFilter}>
                <Text style={s.activeFilterClose}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {searched && !loading && (
          <Text style={s.resultsLabel}>
            {t('explore:resultsCount', { count: spots.length })}
            {selectedCategory ? t('explore:resultsInCategory', { category: selectedCategory }) : ''}
          </Text>
        )}

        <AsyncState style={s.loadingContainer} loading={loading} loadingText={t('explore:loadingText')}>
          <FlatList
            data={spots}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            renderItem={({ item }) => (
              <SpotCard spot={item} onPress={() => handleSpotPress(item)} />
            )}
            ListEmptyComponent={
              <View style={s.emptyContainer}>
                <Text style={s.emptyIcon}>{searched ? '😕' : '🗺️'}</Text>
                <Text style={s.emptyTitle}>
                  {searched ? t('explore:emptyNotFoundTitle') : t('explore:emptyDefaultTitle')}
                </Text>
                <Text style={s.emptyText}>
                  {searched ? t('explore:emptyNotFoundText') : t('explore:emptyDefaultText')}
                </Text>
                {searched && (
                  <TouchableOpacity style={s.clearBtn} onPress={handleClearFilter}>
                    <Text style={s.clearBtnText}>{t('explore:clearFiltersButton')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
            contentContainerStyle={spots.length === 0 ? s.listEmpty : s.list}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        </AsyncState>

      </KeyboardAvoidingView>

      <Modal visible={showFilter} transparent animationType="slide" onRequestClose={closeFilter}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={closeFilter}>
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>{t('explore:filterModalTitle')}</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              <TouchableOpacity
                style={[s.categoryItem, tempCategory === '' && s.categoryItemSelected]}
                onPress={() => setTempCategory('')}
              >
                <Text style={[s.categoryItemText, tempCategory === '' && s.categoryItemTextSelected]}>
                  {t('explore:allCategories')}
                </Text>
                {tempCategory === '' && <Text style={s.checkmark}>✓</Text>}
              </TouchableOpacity>

              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[s.categoryItem, tempCategory === cat && s.categoryItemSelected]}
                  onPress={() => setTempCategory(cat)}
                >
                  <Text style={[s.categoryItemText, tempCategory === cat && s.categoryItemTextSelected]}>
                    {categoryIcon(cat)} {cat}
                  </Text>
                  {tempCategory === cat && <Text style={s.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={s.modalActions}>
              <TouchableOpacity style={s.clearFilterBtn} onPress={handleClearFilter}>
                <Text style={s.clearFilterBtnText}>{t('common:clear')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.applyBtn} onPress={handleApplyFilter}>
                <Text style={s.applyBtnText}>{t('common:apply')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}
