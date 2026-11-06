import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 72, backgroundColor: colors.backgroundMuted },
    header: { width: '100%', height: 190, borderRadius: 20, marginBottom: 20 },
    insights: { width: '100%', height: 90, borderRadius: 16, marginBottom: 20 },
    ticket: { backgroundColor: colors.white, borderRadius: 16, marginBottom: 12, overflow: 'hidden' },
    ticketHeader: { width: '100%', height: 60, borderRadius: 0 },
    ticketBody: { padding: 16, gap: 10 },
    ticketTitle: { width: '70%', height: 16 },
    ticketSubtitle: { width: '90%', height: 11 },
    ticketTag: { width: 80, height: 22, borderRadius: 20 },
  });
