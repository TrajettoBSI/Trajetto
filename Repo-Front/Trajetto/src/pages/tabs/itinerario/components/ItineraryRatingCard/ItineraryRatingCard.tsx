import React from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import StarRating from '@/components/Rating';
import { useColors } from '@/src/theme';
import { FeedbackState } from '@/src/components/feedback';
import { RATING_COMMENT_MAX_LENGTH } from '../../hooks/useItineraryRating';
import { styles } from './styles';

type ItineraryRatingCardProps = {
  rating: number;
  draft: string;
  commentChanged: boolean;
  saving: boolean;
  error: string;
  onRate: (stars: number) => void;
  onChangeDraft: (text: string) => void;
  onSaveComment: () => void;
};

export default function ItineraryRatingCard({
  rating, draft, commentChanged, saving, error, onRate, onChangeDraft, onSaveComment,
}: ItineraryRatingCardProps) {
  const { t } = useTranslation('itinerario');
  const colors = useColors();
  const s = styles(colors);

  return (
    <View style={s.card}>
      <View style={s.header}>
        <View style={s.textBox}>
          <Text style={s.title}>{t('rating.title')}</Text>
          <Text style={s.subtitle}>{rating > 0 ? t('rating.yourRating', { count: rating }) : t('rating.subtitle')}</Text>
        </View>
        {saving && <ActivityIndicator size="small" color={colors.primary} />}
      </View>

      <StarRating value={rating} size={30} onChange={onRate} readonly={saving} />

      <TextInput
        style={s.input}
        placeholder={t('rating.commentPlaceholder')}
        placeholderTextColor={colors.gray500}
        value={draft}
        onChangeText={onChangeDraft}
        maxLength={RATING_COMMENT_MAX_LENGTH}
        multiline
        editable={!saving}
      />

      {commentChanged && (
        <TouchableOpacity style={s.saveBtn} onPress={onSaveComment} disabled={saving} activeOpacity={0.8}>
          <Text style={s.saveBtnText}>{t('rating.saveComment')}</Text>
        </TouchableOpacity>
      )}

      {error ? <FeedbackState variant="error" layout="inline" message={error} style={s.feedback} /> : null}
    </View>
  );
}
