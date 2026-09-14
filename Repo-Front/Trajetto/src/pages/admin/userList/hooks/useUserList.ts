import { useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { userService } from '@/services';
import { getErrorMessage } from '@/utils/apiError';
import { User } from '@/types/user';
import { useAuth } from '@/context/AuthContext';
import { showAlert } from '@/src/components/alerts/alertService';
import { AsyncData, useAsyncData } from '@/src/components/feedback';

export type UserListData = {
  admin: User | null;
  usuarios: AsyncData<User[]>;
  logout: () => Promise<void>;
  editUser: (user: User) => void;
  deleteUser: (id: number, name: string) => void;
};

export function useUserList(): UserListData {
  const { t } = useTranslation(['admin', 'common']);
  const { user: admin, logout } = useAuth();
  const router = useRouter();
  // A busca roda ao abrir a tela e a cada volta para ela, e nao sozinha ao montar.
  const usuarios = useAsyncData<User[]>(() => userService.getAll(), [], { auto: false });
  const { reload } = usuarios;

  useFocusEffect(
    useCallback(() => { reload(); }, [reload])
  );

  const deleteUser = (id: number, name: string) => {
    showAlert(t('admin:userList.deleteConfirm', { name }), {
      title: t('admin:userList.deleteTitle'),
      buttons: [
        { text: t('common:cancel'), style: 'cancel' },
        {
          text: t('common:delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.remove(id);
              reload();
            } catch (e) {
              showAlert(getErrorMessage(e, t('admin:userList.deleteError')), { title: t('common:error') });
            }
          },
        },
      ],
    });
  };

  return {
    admin,
    usuarios,
    logout,
    editUser: (user) => router.push({ pathname: '/UserDetailScreen', params: { user: JSON.stringify(user) } }),
    deleteUser,
  };
}
