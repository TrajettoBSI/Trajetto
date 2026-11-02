import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

/**
 * Os cartoes de story tem fundo escuro (foto + degrade) nos dois temas do app: a imagem
 * compartilhada sai igual para todo mundo. Por isso o texto e sempre claro.
 */
export const STORY_GRADIENT = ['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.88)'] as const;
const LIGHT = '#FFFFFF';
const LIGHT_MUTED = 'rgba(255,255,255,0.78)';
const GLASS = 'rgba(255,255,255,0.16)';
const GLASS_BORDER = 'rgba(255,255,255,0.28)';

/** @param u escala: 1 num cartao de 360 de largura */
export const storyStyles = (u: number, colors: AppColors) =>
  StyleSheet.create({
    card: { borderRadius: 24 * u, overflow: 'hidden', backgroundColor: colors.primaryDark, padding: 22 * u },
    background: { ...StyleSheet.absoluteFill },
    topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    brand: { fontFamily: 'Righteous', fontSize: 22 * u, color: LIGHT, letterSpacing: 0.5 },
    pill: {
      backgroundColor: colors.primary, borderRadius: 14 * u, paddingHorizontal: 12 * u, paddingVertical: 5 * u,
    },
    pillText: { fontFamily: 'Inter-Bold', fontSize: 12 * u, color: colors.onPrimary },
    body: { flex: 1, justifyContent: 'flex-end' },
    headline: {
      fontFamily: 'Inter-Bold', fontSize: 13 * u, color: LIGHT_MUTED, textTransform: 'uppercase', letterSpacing: 2 * u,
    },
    city: { fontFamily: 'FugazOne', fontSize: 44 * u, lineHeight: 50 * u, color: LIGHT, marginTop: 4 * u },
    subtitle: { fontFamily: 'Inter-Medium', fontSize: 14 * u, color: LIGHT_MUTED, marginTop: 2 * u },
    statsRow: { flexDirection: 'row', gap: 8 * u, marginTop: 16 * u, marginBottom: 14 * u },
    stat: {
      flex: 1, backgroundColor: GLASS, borderColor: GLASS_BORDER, borderWidth: 1, borderRadius: 14 * u,
      paddingVertical: 10 * u, alignItems: 'center',
    },
    statValue: { fontFamily: 'Inter-Bold', fontSize: 22 * u, color: LIGHT },
    statLabel: { fontFamily: 'Inter-Medium', fontSize: 11 * u, color: LIGHT_MUTED, marginTop: 2 * u },
    day: { marginTop: 10 * u },
    dayLabel: { fontFamily: 'Inter-Bold', fontSize: 11 * u, color: colors.primarySurface, letterSpacing: 1.5 * u },
    dayStops: { fontFamily: 'Inter', fontSize: 13 * u, lineHeight: 18 * u, color: LIGHT, marginTop: 2 * u },
    more: { fontFamily: 'Inter-Medium', fontSize: 12 * u, color: LIGHT_MUTED, marginTop: 8 * u },
    footer: { fontFamily: 'Inter-Medium', fontSize: 11 * u, color: LIGHT_MUTED, textAlign: 'center', marginTop: 16 * u },

  });
