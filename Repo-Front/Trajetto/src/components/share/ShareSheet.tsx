import React, { ReactNode } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomButton from '@/components/CustomButton';
import { useColors } from '@/src/theme';
import { shareSheetStyles } from './shareSheetStyles';

type Props = {
  visible: boolean;
  title: string;
  sharing: boolean;
  onShare: () => void;
  onClose: () => void;
  /** O cartao que vira imagem. */
  children: ReactNode;
};

/** Mostra o cartao como vai ficar e o botao de compartilhar. */
export default function ShareSheet({ visible, title, sharing, onShare, onClose, children }: Props) {
  const { t } = useTranslation('common');
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const s = shareSheetStyles(colors);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={[s.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={s.header}>
            <Text style={s.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={s.close} accessibilityRole="button" accessibilityLabel={t('close')}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={s.preview} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
          <CustomButton
            title={t('share')}
            onPress={onShare}
            loading={sharing}
            icon={<Ionicons name="share-social" size={20} color={colors.onPrimary} />}
            style={s.button}
          />
        </View>
      </View>
    </Modal>
  );
}
