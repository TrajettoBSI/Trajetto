import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: colors.white,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 24,
      paddingBottom: 40,
      maxHeight: '80%',
    },
    /**
     * Sem isso, a FlatList (um ScrollView por baixo) nao recebe altura
     * definida do pai -- so ter maxHeight no modalSheet nao basta, porque o
     * Yoga nao propaga altura disponivel para um filho sem flex proprio. O
     * sintoma e sempre o mesmo: a lista parece mostrar so o primeiro item.
     */
    optionsList: {
      flexGrow: 0,
      flexShrink: 1,
    },
    modalHandle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: 12,
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      marginBottom: 12,
    },
    modalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    modalItemText: {
      fontSize: 15,
      color: colors.text,
    },
    modalItemSelected: {
      color: colors.primary,
      fontFamily: 'Inter-Bold',
    },
    checkmark: {
      color: colors.primary,
      fontSize: 16,
      fontFamily: 'Inter-Bold',
    },
    emptyText: {
      fontSize: 14,
      color: colors.gray500,
      paddingVertical: 20,
      textAlign: 'center',
    },
  });
