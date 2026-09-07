import React, { Ref } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import StarRating from '@/components/Rating';
import { useColors } from '@/src/theme';
import { styles } from './styles';

type RatingFormProps = {
  commentInputRef: Ref<TextInput>;
  ratingValue: number;
  onChangeRatingValue: (v: number) => void;
  comment: string;
  onChangeComment: (v: string) => void;
  onSave: () => void;
};

export default function RatingForm({
  commentInputRef, ratingValue, onChangeRatingValue, comment, onChangeComment, onSave,
}: RatingFormProps) {
  const { t } = useTranslation('itinerario');
  const colors = useColors();
  const s = styles(colors);

  return (
    <View style={s.ratingDropdown}>
      <Text style={s.ratingTitle}>{t('ratingSheet.formTitle')}</Text>
      <StarRating value={ratingValue} size={22} onChange={onChangeRatingValue} />
      <TextInput
        ref={commentInputRef}
        value={comment}
        onChangeText={onChangeComment}
        placeholder={t('ratingSheet.commentPlaceholder')}
        placeholderTextColor={colors.timelineDotPast}
        style={s.ratingInput}
        multiline
      />
      <TouchableOpacity style={s.ratingButton} onPress={onSave}>
        <Text style={s.ratingButtonText}>{t('ratingSheet.saveButton')}</Text>
      </TouchableOpacity>
    </View>
  );
}
