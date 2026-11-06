import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    overlay: { flex: 1, backgroundColor: colors.overlay45, justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: colors.white,
      borderTopLeftRadius: 32, borderTopRightRadius: 32,
      paddingHorizontal: 20, paddingBottom: 28, paddingTop: 8,
      maxHeight: '88%',
    },
    handle: {
      width: 40, height: 4, backgroundColor: colors.border,
      borderRadius: 2, alignSelf: 'center', marginBottom: 16,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    titleIcon: {
      width: 40, height: 40, borderRadius: 14, backgroundColor: colors.primary,
      alignItems: 'center', justifyContent: 'center',
    },
    title: { fontSize: 18, fontFamily: 'Jakarta-Bold', color: colors.gray900 },
    subtitle: { fontSize: 13, color: colors.gray500, marginTop: 2 },
    prefsBox: { backgroundColor: colors.surfaceAlt, borderRadius: 14, padding: 12, marginBottom: 10 },
    prefsLabel: {
      fontSize: 11, fontFamily: 'Jakarta-Bold', color: colors.textSubtle,
      letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8,
    },
    chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    prefChip: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1,
    },
    prefChipPositive: { backgroundColor: colors.successSurface, borderColor: colors.successSurface },
    prefChipNegative: { backgroundColor: colors.errorSurface, borderColor: colors.errorSurface },
    prefChipText: { fontSize: 12, color: colors.gray800 },
    chat: { flexGrow: 0, maxHeight: 320 },
    chatContent: { paddingVertical: 8, gap: 8 },
    userBubble: {
      alignSelf: 'flex-end', maxWidth: '85%', marginBottom: 8,
    },
    userBubbleFill: { backgroundColor: colors.primary, borderRadius: 18, borderBottomRightRadius: 5, paddingHorizontal: 14, paddingVertical: 10 },
    userText: { color: colors.onPrimary, fontSize: 14, lineHeight: 20 },
    botBubble: {
      alignSelf: 'flex-start', backgroundColor: colors.surfaceAlt, borderRadius: 16,
      borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 10, maxWidth: '90%', marginBottom: 8,
    },
    botText: { color: colors.gray900, fontSize: 14, lineHeight: 20 },
    sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    typing: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 16 },
    suggestionsTitle: {
      fontSize: 11, fontFamily: 'Jakarta-Bold', color: colors.textSubtle,
      letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8,
    },
    suggestion: {
      borderWidth: 1.5, borderColor: colors.primaryBorder, backgroundColor: colors.primarySurface,
      borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8,
    },
    suggestionText: { fontSize: 13, color: colors.primaryText, fontFamily: 'Jakarta-Bold' },
    feedback: { marginTop: 8 },
    inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 10 },
    input: {
      flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: 18,
      paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.gray900,
      backgroundColor: colors.surfaceAlt, maxHeight: 110,
    },
    sendBtn: {
      width: 46, height: 46, borderRadius: 23, backgroundColor: colors.primary,
      alignItems: 'center', justifyContent: 'center',
    },
    sendBtnDisabled: { backgroundColor: colors.primaryDisabled },
    hint: { fontSize: 11, color: colors.textSubtle, marginTop: 8, textAlign: 'center' },
  });
