import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import CustomInput from '@/components/CustomInput';
import { useColors } from '@/src/theme';
import { styles } from './styles';

type Props = {
  onPressSearch: () => void;
};

export default function SearchCard({ onPressSearch }: Props) {
  const { t } = useTranslation('roteiros');
  const colors = useColors();
  const s = styles(colors);

  return (
    <View style={s.card}>
      <Text style={s.title}>{t('searchCard.title')}</Text>

      <Pressable onPress={onPressSearch}>
        <View pointerEvents="none">
          <CustomInput
            value=""
            onChangeText={() => {}}
            editable={false}
            placeholder={t('searchCard.placeholder')}
            style={s.inputWrapper}
            inputWrapperStyle={s.inputBox}
            inputStyle={s.input}
            leftIcon={<Ionicons name="search" size={20} color={colors.textSubtle} style={{ marginRight: 8 }} />}
            rightElement={<Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />}
          />
        </View>
      </Pressable>
    </View>
  );
}
