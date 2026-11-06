import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    // Ocupa a tela inteira: usado quando não há nada além do aviso para mostrar.
    screen: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
      paddingVertical: 40,
      gap: 12,
    },
    // Ocupa só o seu espaço: usado dentro de uma tela que continua com o resto do conteúdo.
    block: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 32,
      gap: 12,
    },
    // Uma faixa curta: usada acima de um formulário ou dentro de um cartão.
    inline: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    inlineError: { backgroundColor: colors.errorSurface },
    inlineNeutral: { backgroundColor: colors.backgroundMuted },
    inlineIcon: { fontSize: 20 },
    inlineTexts: { flex: 1, gap: 2 },
    inlineTitle: { fontSize: 13, fontFamily: 'Jakarta-Bold', color: colors.gray700 },
    inlineTitleError: { color: colors.errorText },
    inlineMessage: { fontSize: 13, lineHeight: 18, color: colors.gray600 },
    inlineMessageError: { color: colors.errorText },
    inlineAction: { fontSize: 13, fontFamily: 'Jakarta-Bold', color: colors.primaryDark },

    icon: { fontSize: 40 },
    iconTile: { width: 92, height: 92, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 6, backgroundColor: colors.primarySurface },
    title: { fontSize: 21, letterSpacing: -0.3, fontFamily: 'Display-Bold', color: colors.gray900, textAlign: 'center' },
    message: { fontSize: 14, lineHeight: 20, color: colors.gray500, textAlign: 'center' },

    actionFill: { ...StyleSheet.absoluteFill, borderRadius: 16 },
    action: {
      marginTop: 8,
      backgroundColor: colors.primary,
      borderRadius: 16,
      overflow: 'hidden',
      paddingHorizontal: 24,
      paddingVertical: 12,
    },
    actionText: { fontSize: 14, fontFamily: 'Jakarta-Bold', color: colors.onPrimary },
  });
