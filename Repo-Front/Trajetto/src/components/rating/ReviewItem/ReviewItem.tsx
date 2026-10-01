import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Rating } from '@/services';
import StarRating from '@/components/Rating';
import { useColors } from '@/src/theme';
import { styles } from './styles';

type ReviewItemProps = {
  review: Rating;
  displayName: string;
  isMine: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

export default function ReviewItem({ review, displayName, isMine, onEdit, onDelete }: ReviewItemProps) {
  const colors = useColors();
  const s = styles(colors);

  return (
    <View style={s.reviewCard}>
      <View style={s.reviewHeader}>
        <View style={s.reviewAvatar}>
          <Text style={s.reviewAvatarText}>{displayName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={s.reviewInfo}>
          <Text style={s.reviewName}>{displayName}</Text>
          <StarRating value={review.rating} size={14} readonly onChange={() => {}} />
        </View>
        {isMine && (
          <View style={s.reviewActions}>
            <TouchableOpacity onPress={onEdit}>
              <Ionicons name="pencil-outline" size={18} color={colors.gray500} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete}>
              <Ionicons name="trash-outline" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
      </View>
      {review.comment ? <Text style={s.reviewComment}>{review.comment}</Text> : null}
    </View>
  );
}
