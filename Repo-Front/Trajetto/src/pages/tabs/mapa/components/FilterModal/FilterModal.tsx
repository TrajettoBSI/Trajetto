import React from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { categoryIcon } from '@/src/helpers/categoryIcon';
import { useColors } from '@/src/theme';
import { DISTANCE_OPTIONS } from '../../data/distanceOptions';
import { formatDistance } from '../../mapaFormat';
import { styles } from './styles';

type FilterModalProps = {
  visible: boolean;
  categories: string[];
  profiles: string[];
  activeCount: number;
  tempCategory: string;
  setTempCategory: (v: string) => void;
  tempFee: 'yes' | 'no' | '';
  setTempFee: (v: 'yes' | 'no' | '') => void;
  tempHasHours: boolean;
  setTempHasHours: (v: boolean) => void;
  tempProfile: string;
  setTempProfile: (v: string) => void;
  tempMaxDistance: number | undefined;
  setTempMaxDistance: (v: number | undefined) => void;
  onApply: () => void;
  onClearAll: () => void;
  onClose: () => void;
};

export default function FilterModal({
  visible, categories, profiles, activeCount,
  tempCategory, setTempCategory,
  tempFee, setTempFee,
  tempHasHours, setTempHasHours,
  tempProfile, setTempProfile,
  tempMaxDistance, setTempMaxDistance,
  onApply, onClearAll, onClose,
}: FilterModalProps) {
  const { t } = useTranslation(['mapa', 'common']);
  const colors = useColors();
  const s = styles(colors);

  const FEE_OPTIONS: { label: string; value: 'yes' | 'no' | '' }[] = [
    { label: t('common:any'), value: '' },
    { label: t('mapa:filterModal.feeFree'), value: 'no' },
    { label: t('mapa:filterModal.feePaid'), value: 'yes' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={s.modalSheet}>
          <View style={s.modalHandle} />
          <View style={s.modalTitleRow}>
            <Text style={s.modalTitle}>{t('mapa:filterModal.title')}</Text>
            {activeCount > 0 && (
              <TouchableOpacity onPress={onClearAll}>
                <Text style={s.modalClearAll}>{t('mapa:filterModal.clearAll')}</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={s.scrollArea}>

            <Text style={s.filterSection}>{t('mapa:filterModal.categorySection')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterChipsRow}>
              {['', ...categories].map((cat) => (
                <TouchableOpacity
                  key={cat || 'all'}
                  style={[s.filterChip, tempCategory === cat && s.filterChipActive]}
                  onPress={() => setTempCategory(cat)}
                >
                  <Text style={[s.filterChipText, tempCategory === cat && s.filterChipTextActive]}>
                    {cat ? `${categoryIcon(cat)} ${cat}` : t('mapa:filterModal.allCategories')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={s.filterSection}>{t('mapa:filterModal.feeSection')}</Text>
            <View style={s.filterRow}>
              {FEE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[s.filterOption, tempFee === opt.value && s.filterOptionActive]}
                  onPress={() => setTempFee(opt.value)}
                >
                  <Text style={[s.filterOptionText, tempFee === opt.value && s.filterOptionTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={s.switchRow}>
              <View>
                <Text style={s.filterSection}>{t('mapa:filterModal.hoursSection')}</Text>
                <Text style={s.filterSubLabel}>{t('mapa:filterModal.hoursSubLabel')}</Text>
              </View>
              <Switch
                value={tempHasHours}
                onValueChange={setTempHasHours}
                trackColor={{ false: colors.gray300, true: colors.primary }}
                ios_backgroundColor={colors.gray300}
                thumbColor={colors.white}
              />
            </View>

            <Text style={s.filterSection}>{t('mapa:filterModal.profileSection')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterChipsRow}>
              {['', ...profiles].map((p) => (
                <TouchableOpacity
                  key={p || 'all'}
                  style={[s.filterChip, tempProfile === p && s.filterChipActive]}
                  onPress={() => setTempProfile(p)}
                >
                  <Text style={[s.filterChipText, tempProfile === p && s.filterChipTextActive]}>
                    {p || t('mapa:filterModal.allProfiles')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={s.filterSection}>{t('mapa:filterModal.distanceSection')}</Text>
            <View style={s.filterRow}>
              {DISTANCE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={String(opt.value)}
                  style={[s.filterOption, tempMaxDistance === opt.value && s.filterOptionActive]}
                  onPress={() => setTempMaxDistance(opt.value)}
                >
                  <Text style={[s.filterOptionText, tempMaxDistance === opt.value && s.filterOptionTextActive]}>
                    {opt.value ? formatDistance(opt.value) : t('common:any')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

          </ScrollView>

          <View style={s.modalActions}>
            <TouchableOpacity style={s.clearFilterBtn} onPress={onClose}>
              <Text style={s.clearFilterBtnText}>{t('common:cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.applyBtn} onPress={onApply}>
              <Text style={s.applyBtnText}>{t('mapa:filterModal.apply')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
