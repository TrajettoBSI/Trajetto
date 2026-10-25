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
import { AsyncBoundary } from '@/src/components/feedback';
import { useExplore } from './hooks/useExplore';
import { categoryIcon, categoryLabel } from '@/src/helpers/categoryIcon';
import SpotCard from './components/SpotCard/SpotCard';
import OptionPickerModal from '@/src/components/OptionPickerModal/OptionPickerModal';
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
    error,
    reload,
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
    cityOptions,
    selectedCity,
    showCityPicker,
    openCityPicker,
    closeCityPicker,
    handleSelectCity,
  } = useExplore();

  return (
    <View style={s.safe}>
      <View style={[s.headerWrapper, { paddingTop: insets.top }]}>
        <View style={s.headerRow}>
          <View style={s.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={s.headerBackBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={32} color={colors.onPrimary} />
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
            accessibilityRole="button"
            accessibilityLabel={t('explore:filterModalTitle')}
          >
            <Ionicons name="filter" size={20} color={activeFilters > 0 ? colors.primary : colors.gray400} />
            {activeFilters > 0 && (
              <View style={s.filterBadge}>
                <Text style={s.filterBadgeText}>{activeFilters}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[s.cityBtn, selectedCity && s.cityBtnActive]}
          onPress={openCityPicker}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t('explore:cityPickerTitle')}
        >
          <Ionicons name="location" size={16} color={colors.primary} />
          <Text style={s.cityBtnText}>
            {cityOptions.find((o) => o.value === (selectedCity?.slug ?? null))?.label}
          </Text>
          <Ionicons name="chevron-down" size={16} color={colors.primary} />
        </TouchableOpacity>

        {selectedCategory ? (
          <View style={s.activeFilterRow}>
            <View style={s.activeFilterChip}>
              <Text style={s.activeFilterText}>{categoryLabel(selectedCategory)}</Text>
              <TouchableOpacity onPress={handleClearFilter}>
                <Text style={s.activeFilterClose}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {searched && !loading && !error && (
          <Text style={s.resultsLabel}>
            {t('explore:resultsCount', { count: spots?.length ?? 0 })}
            {selectedCategory ? t('explore:resultsInCategory', { category: categoryLabel(selectedCategory) }) : ''}
          </Text>
        )}

        <AsyncBoundary
          state={{ loading, error, data: spots }}
          onRetry={reload}
          error={{ message: error }}
          style={s.loadingContainer}
          loading={{ title: t('explore:loadingText'), message: '' }}
          empty={{
            icon: searched ? '😕' : '🗺️',
            title: searched ? t('explore:emptyNotFoundTitle') : t('explore:emptyDefaultTitle'),
            message: searched ? t('explore:emptyNotFoundText') : t('explore:emptyDefaultText'),
            actionLabel: t('explore:clearFiltersButton'),
            onAction: searched ? handleClearFilter : undefined,
          }}
        >
          {(lista) => (
            <FlatList
              data={lista}
              keyExtractor={(item, index) => `${item.name}-${index}`}
              renderItem={({ item }) => (
                <SpotCard spot={item} onPress={() => handleSpotPress(item)} />
              )}
              contentContainerStyle={s.list}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </AsyncBoundary>

      </KeyboardAvoidingView>

      <OptionPickerModal
        visible={showCityPicker}
        title={t('explore:cityPickerTitle')}
        options={cityOptions}
        selected={selectedCity?.slug ?? null}
        onSelect={handleSelectCity}
        onClose={closeCityPicker}
      />

      <Modal visible={showFilter} transparent animationType="slide" onRequestClose={closeFilter}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={closeFilter}>
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>{t('explore:filterModalTitle')}</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              <TouchableOpacity
                style={[s.categoryItem, tempCategory === '' && s.categoryItemSelected]}
                onPress={() => setTempCategory('')}
                activeOpacity={0.7}
              >
                <View style={[s.categoryIconBadge, tempCategory === '' && s.categoryIconBadgeSelected]}>
                  <Ionicons name="apps" size={16} color={tempCategory === '' ? colors.primary : colors.gray500} />
                </View>
                <Text style={[s.categoryItemText, tempCategory === '' && s.categoryItemTextSelected]}>
                  {t('explore:allCategories')}
                </Text>
                {tempCategory === '' && <Ionicons name="checkmark" size={20} color={colors.primary} />}
              </TouchableOpacity>

              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[s.categoryItem, tempCategory === cat && s.categoryItemSelected]}
                  onPress={() => setTempCategory(cat)}
                  activeOpacity={0.7}
                >
                  <View style={[s.categoryIconBadge, tempCategory === cat && s.categoryIconBadgeSelected]}>
                    <Text style={s.categoryIconEmoji}>{categoryIcon(cat)}</Text>
                  </View>
                  <Text style={[s.categoryItemText, tempCategory === cat && s.categoryItemTextSelected]}>
                    {categoryLabel(cat)}
                  </Text>
                  {tempCategory === cat && <Ionicons name="checkmark" size={20} color={colors.primary} />}
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
