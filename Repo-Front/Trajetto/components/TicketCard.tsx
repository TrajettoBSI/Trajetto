import React from 'react';
import { Linking, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { categoryLabel } from '@/src/helpers/categoryIcon';
import { AppColors, useColors } from '@/src/theme';
import { formatOpeningHours, formatTime, placeName } from '@/src/i18n/format';

function categoryIcon(category: string): string {
    const c = (category || '').toLowerCase();
    if (c.includes('museum')) return '🏛️';
    if (c.includes('monument')) return '🗿';
    if (c.includes('castle')) return '🏰';
    if (c.includes('church')) return '⛪';
    if (c.includes('park')) return '🌳';
    if (c.includes('square')) return '🏙️';
    if (c.includes('fountain')) return '⛲';
    if (c.includes('ruins')) return '🏚️';
    if (c.includes('art')) return '🎨';
    if (c.includes('view')) return '🌄';
    if (c.includes('restaurant') || c.includes('food')) return '🍽️';
    if (c.includes('cafe') || c.includes('coffee')) return '☕';
    return '📍';
}


interface TicketCardProps {
    place: {
        name: string;
        address: string;
        estimatedVisitTime: string;
        category?: string | null;
        fee?: string | null;
        openingHours?: string | null;
        orderIndex: number;
        note?: string | null;
        openAtVisit?: boolean | null;
        bookingUrl?: string | null;
        ticketUrl?: string | null;
        names?: Record<string, string> | null;
    };
    idx: number;
    color: string;
    isPast: boolean;
    isHighlighted: boolean;
    isLast: boolean;
    onPress: () => void;
    onInfoPress: () => void;
    onSwitchPress: () => void;
    onNotePress: () => void;
}

export function TicketCard({
    place, idx, color, isPast, isHighlighted, isLast, onPress, onInfoPress, onSwitchPress, onNotePress,
}: TicketCardProps) {
    const { t } = useTranslation('itinerario');
    const colors = useColors();
    const ticketStyles = getTicketStyles(colors);
    return (
        <TouchableOpacity
            style={[
                ticketStyles.ticket,
                isLast && { marginBottom: 0 },
                isHighlighted && { borderColor: color },
                isPast && ticketStyles.pastTicket,
            ]}
            activeOpacity={0.75}
            onPress={onPress}
        >
          <View style={ticketStyles.ticketInner}>
            {/* Cabeçalho colorido */}
            <View style={[ticketStyles.header, { backgroundColor: isPast ? colors.timelineDotPast : color }]}>
                <View style={ticketStyles.headerLeft}>
                    <Text style={ticketStyles.stopLabel}>{t('ticketCard.stopLabel')}</Text>
                    <Text style={ticketStyles.stopNumber}>{String(idx + 1).padStart(2, '0')}</Text>
                </View>
                <View style={ticketStyles.headerCenter}>
                    <Text style={ticketStyles.categoryEmoji}>
                        {categoryIcon(place.category ?? '')}
                    </Text>
                </View>
                <View style={ticketStyles.headerRight}>
                    <Text style={ticketStyles.timeLabel}>{t('ticketCard.timeLabel')}</Text>
                    <Text style={ticketStyles.timeValue}>{formatTime(place.estimatedVisitTime)}</Text>
                </View>
            </View>


            <View style={ticketStyles.perforationRow}>
                <View style={ticketStyles.notchLeft} />
                <View style={ticketStyles.dashes}>
                    {Array.from({ length: 22 }).map((_, i) => (
                        <View key={i} style={[ticketStyles.dash, { backgroundColor: isPast ? colors.borderMuted : `${color}55` }]} />
                    ))}
                </View>
                <View style={ticketStyles.notchRight} />
            </View>

            {/* Corpo do ticket */}
            <View style={ticketStyles.body}>
                <Text style={[ticketStyles.placeName, isPast && { color: colors.timelineDotPast }]} numberOfLines={2}>
                    {placeName(place)}
                </Text>

                <View style={ticketStyles.addressRow}>
                    <Ionicons name="location-outline" size={13} color={isPast ? colors.textFaintBlue : colors.textSubtle} />
                    <Text style={[ticketStyles.addressText, isPast && { color: colors.textFaintBlue }]} numberOfLines={1}>
                        {place.address}
                    </Text>
                </View>

                {place.openingHours ? (
                    <View style={ticketStyles.addressRow}>
                        <Ionicons name="time-outline" size={13} color={isPast ? colors.textFaintBlue : colors.textSubtle} />
                        <Text style={[ticketStyles.addressText, isPast && { color: colors.textFaintBlue }]} numberOfLines={1}>
                            {formatOpeningHours(place.openingHours)}
                        </Text>
                    </View>
                ) : null}

                <View style={ticketStyles.tagsRow}>
                    {place.category ? (
                        <View style={[ticketStyles.badge, { backgroundColor: isPast ? colors.pinBgPast : `${color}18` }]}>
                            <Text style={[ticketStyles.badgeText, { color: isPast ? colors.timelineDotPast : color }]}>
                                {categoryLabel(place.category)}
                            </Text>
                        </View>
                    ) : null}
                    {place.fee === 'yes' ? (
                        <View style={ticketStyles.feeBadge}>
                            <Text style={ticketStyles.feeBadgeText}>{t('ticketCard.paid')}</Text>
                        </View>
                    ) : place.fee === 'no' ? (
                        <View style={ticketStyles.freeBadge}>
                            <Text style={ticketStyles.freeBadgeText}>{t('ticketCard.free')}</Text>
                        </View>
                    ) : null}
                </View>

                {place.openAtVisit === false && !isPast ? (
                    <View style={ticketStyles.closedRow}>
                        <Ionicons name="alert-circle-outline" size={15} color={colors.errorText} />
                        <Text style={ticketStyles.closedText}>{t('ticketCard.closedAtVisit')}</Text>
                    </View>
                ) : null}

                {place.bookingUrl ? (
                    <TouchableOpacity
                        style={ticketStyles.bookingRow}
                        onPress={() => Linking.openURL(place.bookingUrl!).catch(() => {})}
                        accessibilityRole="link"
                        accessibilityHint={t('ticketCard.bookingHint')}
                    >
                        <Ionicons name="ticket-outline" size={15} color={colors.warningBannerText} />
                        <Text style={ticketStyles.bookingText}>{t('ticketCard.booking')}</Text>
                        <Ionicons name="open-outline" size={14} color={colors.warningBannerText} />
                    </TouchableOpacity>
                ) : place.ticketUrl ? (
                    <TouchableOpacity
                        style={ticketStyles.ticketRow}
                        onPress={() => Linking.openURL(place.ticketUrl!).catch(() => {})}
                        accessibilityRole="link"
                        accessibilityHint={t('ticketCard.ticketsHint')}
                    >
                        <Ionicons name="ticket-outline" size={15} color={colors.primary} />
                        <Text style={ticketStyles.ticketText}>{t('ticketCard.tickets')}</Text>
                        <Ionicons name="open-outline" size={14} color={colors.primary} />
                    </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                    style={[ticketStyles.noteBox, place.note ? ticketStyles.noteBoxFilled : null]}
                    onPress={onNotePress}
                    accessibilityRole="button"
                    accessibilityLabel={place.note ? t('ticketCard.editNote') : t('ticketCard.addNote')}
                >
                    <Ionicons
                        name={place.note ? 'document-text-outline' : 'add-circle-outline'}
                        size={15}
                        color={place.note ? colors.warningBannerArrow : colors.textSubtle}
                    />
                    <Text
                        style={[ticketStyles.noteText, place.note ? ticketStyles.noteTextFilled : null]}
                        numberOfLines={3}
                    >
                        {place.note || t('ticketCard.addNote')}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Rodapé do ticket */}
            <View style={ticketStyles.footer}>
                <TouchableOpacity
                    style={ticketStyles.aboutBtn}
                    onPress={onInfoPress}
                >
                    <Text style={ticketStyles.aboutBtnText}>{t('ticketCard.about')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[ticketStyles.switchBtn, { backgroundColor: isPast ? colors.pinBorderPast : color }]}
                    onPress={onSwitchPress}
                    disabled={isPast}
                >
                    <Text style={ticketStyles.switchBtnText}>{t('ticketCard.switch')}</Text>
                </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
    );
}

const getTicketStyles = (colors: AppColors) => StyleSheet.create({
    ticket: {
        flex: 1,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: colors.shadow,
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    ticketInner: {
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: colors.white,
    },
    pastTicket: {
        opacity: 0.55,
    },
    closedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: colors.dangerSurface,
        borderWidth: 1,
        borderColor: colors.dangerBorder,
    },
    closedText: { flex: 1, fontSize: 12, fontWeight: '700', color: colors.errorText },
    bookingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: colors.warningBannerBg,
        borderWidth: 1,
        borderColor: colors.warningBannerBorder,
    },
    bookingText: { flex: 1, fontSize: 12, fontWeight: '700', color: colors.warningBannerText },
    // Ingresso pago sem reserva obrigatoria: informacao, nao alerta.
    ticketRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: colors.backgroundMuted,
    },
    ticketText: { flex: 1, fontSize: 12, fontWeight: '700', color: colors.primary },

    // ── Cabeçalho ──
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    headerLeft: { flex: 1 },
    headerCenter: { alignItems: 'center', paddingHorizontal: 12 },
    headerRight: { flex: 1, alignItems: 'flex-end' },
    stopLabel: { fontSize: 9, fontWeight: '700', color: colors.onPrimaryFaint70, letterSpacing: 1 },
    stopNumber: { fontSize: 22, fontWeight: '900', color: colors.onPrimary, letterSpacing: -0.5 },
    timeLabel: { fontSize: 9, fontWeight: '700', color: colors.onPrimaryFaint70, letterSpacing: 1 },
    timeValue: { fontSize: 18, fontWeight: '800', color: colors.onPrimary },
    categoryEmoji: { fontSize: 28 },


    perforationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 30,
        marginTop: 6,
        overflow: 'visible',
    },
    notchLeft: {
        width: 30,
        height: 30,
        borderRadius: 20,
        marginLeft: -9,
        backgroundColor: colors.backgroundMuted,
    },
    notchRight: {
        width: 30,
        height: 30,
        borderRadius: 20,
        marginRight: -9,
        backgroundColor: colors.backgroundMuted,
    },
    dashes: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    dash: {
        width: 5,
        height: 1.5,
        borderRadius: 1,
    },

    // ── Corpo ──
    body: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 16,
    },
    placeName: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.text,
        marginBottom: 6,
        letterSpacing: -0.3,
        lineHeight: 22,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 3,
    },
    addressText: {
        fontSize: 12,
        color: colors.textSubtle,
        flex: 1,
        lineHeight: 17,
    },

    tagsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 10 },
    badge: {
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    badgeText: { fontSize: 11, fontWeight: '700' },
    feeBadge: {
        backgroundColor: colors.warningSurface,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    feeBadgeText: { fontSize: 11, fontWeight: '600', color: colors.feeTextOrange },
    freeBadge: {
        backgroundColor: colors.successSurface,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    freeBadgeText: { fontSize: 11, fontWeight: '600', color: colors.successText },
    noteBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 6,
        marginTop: 12,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.borderMuted,
    },
    noteBoxFilled: {
        borderStyle: 'solid',
        borderColor: colors.warningBannerBorder,
        backgroundColor: colors.warningBannerBg,
    },
    noteText: { flex: 1, fontSize: 12, color: colors.textSubtle, lineHeight: 17 },
    noteTextFilled: { color: colors.warningBannerText },
    footer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: colors.divider,
    },
    aboutBtn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        backgroundColor: colors.white,
    },
    aboutBtnText: { fontSize: 15, fontWeight: '700', color: colors.text },
    switchBtn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    switchBtnText: { fontSize: 15, fontWeight: '700', color: colors.onPrimary },

    // ── Ícone mapa (canto) ──
    mapCorner: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 26,
        height: 26,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
    },
});