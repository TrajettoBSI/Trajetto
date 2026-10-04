import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/src/theme';
import { AsyncBoundary } from '@/src/components/feedback';
import { useUserList } from './hooks/useUserList';
import UserCard from './components/UserCard/UserCard';
import { styles } from './styles/styles';

export default function UserList() {
  const { t } = useTranslation('admin');
  const router = useRouter();
  const colors = useColors();
  const s = styles(colors);
  const { admin, usuarios, editUser, deleteUser } = useUserList();

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <View style={[s.header, { paddingTop: 16 }]}>
        <View style={s.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={s.headerBackBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={s.headerTitle}>{t('userList.headerTitle')}</Text>
            <Text style={s.headerSub}>{t('userList.greeting', { name: admin?.firstName })}</Text>
          </View>
        </View>
      </View>

      <AsyncBoundary
        state={usuarios}
        onRetry={usuarios.reload}
        style={s.center}
        loading={{ title: t('userList.loadingText'), message: '' }}
        error={{ title: t('userList.loadError') }}
        empty={{ icon: '👥', title: t('userList.emptyTitle'), message: t('userList.emptyMessage') }}
      >
        {(lista) => (
          <FlatList
            data={lista}
            keyExtractor={(item, index) => item.id != null ? String(item.id) : String(index)}
            contentContainerStyle={s.list}
            ListHeaderComponent={
              <Text style={s.sectionLabel}>{t('userList.sectionLabel', { count: lista.length })}</Text>
            }
            renderItem={({ item }) => (
              <UserCard
                user={item}
                onEdit={() => editUser(item)}
                onDelete={() => deleteUser(item.id, item.firstName)}
              />
            )}
          />
        )}
      </AsyncBoundary>
    </SafeAreaView>
  );
}
