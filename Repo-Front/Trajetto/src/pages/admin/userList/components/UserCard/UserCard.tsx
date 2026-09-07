import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { User } from '@/types/user';
import { useColors } from '@/src/theme';
import { styles } from './styles';

type UserCardProps = {
  user: User;
  onEdit: () => void;
  onDelete: () => void;
};

export default function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  const { t } = useTranslation('admin');
  const s = styles(useColors());

  return (
    <View style={s.card}>
      <View style={s.cardLeft}>
        <View style={s.avatarCircle}>
          <Text style={s.avatarEmoji}>👤</Text>
        </View>
        <View style={s.cardInfo}>
          <Text style={s.cardName}>{user.firstName} {user.lastName}</Text>
          <Text style={s.cardEmail}>{user.email}</Text>
          <Text style={s.cardMeta}>{user.country}{user.telephone ? ` · ${user.telephone}` : ''}</Text>
          <View style={[s.roleBadge, user.isAdmin && s.roleBadgeAdmin]}>
            <Text style={[s.roleBadgeText, user.isAdmin && s.roleBadgeTextAdmin]}>
              {user.isAdmin ? t('userList.roleAdmin') : t('userList.roleUser')}
            </Text>
          </View>
        </View>
      </View>
      <View style={s.cardActions}>
        <TouchableOpacity style={s.editBtn} onPress={onEdit} activeOpacity={0.8}>
          <Text style={s.editBtnText}>{t('userList.edit')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.deleteBtn} onPress={onDelete} activeOpacity={0.8}>
          <Text style={s.deleteBtnIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
