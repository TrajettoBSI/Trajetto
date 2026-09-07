import React from 'react';
import { ActivityIndicator, Modal, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Place } from '@/services';
import { Places } from '@/hooks/itineraryStore';
import { useColors } from '@/src/theme';
import AltCard from './AltCard';
import { styles } from './styles';

type AlternativesModalProps = {
  visible: boolean;
  swipedPlace: Places | null;
  alternatives: Place[];
  loading: boolean;
  onSelect: (alt: Place) => void;
  onCancel: () => void;
};

export default function AlternativesModal({
  visible, swipedPlace, alternatives, loading, onSelect, onCancel,
}: AlternativesModalProps) {
  const { t } = useTranslation('itinerario');
  const colors = useColors();
  const s = styles(colors);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onCancel}>
        <View style={s.sheet}>
          <View style={s.handle} />
          <Text style={s.title}>{t('alternativesModal.title')}</Text>
          {swipedPlace && (
            <Text style={s.subtitle}>
              {t('alternativesModal.replace', { name: swipedPlace.name })}
            </Text>
          )}

          {loading ? (
            <View style={s.loading}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={s.loadingText}>{t('alternativesModal.loading')}</Text>
            </View>
          ) : alternatives.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyText}>{t('alternativesModal.empty')}</Text>
            </View>
          ) : (
            <View style={s.list}>
              {alternatives.map((alt, i) => (
                <AltCard key={i} alt={alt} onPress={() => onSelect(alt)} />
              ))}
            </View>
          )}

          <TouchableOpacity style={s.cancelBtn} onPress={onCancel}>
            <Text style={s.cancelBtnText}>{t('alternativesModal.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
