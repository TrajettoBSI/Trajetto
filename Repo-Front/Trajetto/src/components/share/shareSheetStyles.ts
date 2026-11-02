import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const shareSheetStyles = (colors: AppColors) =>
  StyleSheet.create({
    overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24,
      paddingTop: 16, paddingHorizontal: 20, maxHeight: '94%',
    },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    title: { flex: 1, fontSize: 18, fontFamily: 'Inter-Bold', color: colors.text },
    close: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    preview: { alignItems: 'center', paddingBottom: 16 },
    button: { marginTop: 4 },
  });
