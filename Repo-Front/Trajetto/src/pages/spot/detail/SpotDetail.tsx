import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import StarRating from '@/components/Rating';
import RatingForm from '@/src/components/rating/RatingForm/RatingForm';
import ReviewItem from '@/src/components/rating/ReviewItem/ReviewItem';
import { useColors } from '@/src/theme';
import { useSpotDetail } from './hooks/useSpotDetail';
import { useSpotRating } from './hooks/useSpotRating';
import { formatCar, formatDistance, formatWalk } from './spotFormat';
import InfoRow from './components/InfoRow/InfoRow';
import { styles } from './styles/styles';

export default function SpotDetail() {
  const { t } = useTranslation('spotDetail');
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();
  const s = styles(colors);
  const { spot, distance, region, hours, openNow, wc, openMaps, openWebsite, callPhone, openWikipedia } = useSpotDetail();
  const {
    user, commentInputRef, allRatings, isRatingOpen, setIsRatingOpen,
    ratingData, ratingValue, setRatingValue, comment, setComment,
    saveRating, startEditRating, deleteRating,
  } = useSpotRating(spot.xid);

  const wikipediaTitle = spot.wikipedia?.split(':')[1]?.replace(/_/g, ' ') ?? spot.wikipedia;

  return (
    <View style={s.safe}>
      <View style={[s.headerWrapper, { paddingTop: insets.top }]}>
        <View style={s.headerRow}>
          <View style={s.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={s.headerBackBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={32} color={colors.white} />
            </TouchableOpacity>
            <Text style={s.headerText}>{t('headerTitle')}</Text>
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>

        <View style={s.mapCard}>
          <MapView style={s.map} provider={PROVIDER_DEFAULT} initialRegion={region} scrollEnabled zoomEnabled>
            <Marker
              coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
              title={spot.name}
              description={spot.category}
            />
          </MapView>
        </View>

        <View style={s.badgeRow}>
          <View style={s.badgePill}>
            <Text style={s.badgePillText}>{spot.category}</Text>
          </View>
          {spot.fee === 'no' && (
            <View style={s.badgePill}>
              <Text style={s.badgePillText}>{t('free')}</Text>
            </View>
          )}
          {spot.fee === 'yes' && (
            <View style={s.badgePill}>
              <Text style={s.badgePillText}>{t('paid')}</Text>
            </View>
          )}
          {wc && (
            <View style={s.badgePill}>
              <Text style={s.badgePillText}>{t(`accessibility.${wc}`, { defaultValue: wc })}</Text>
            </View>
          )}
        </View>

        <Text style={s.name}>{spot.name}</Text>

        {distance !== null && (
          <Text style={s.subtitleLine}>
            {formatDistance(distance)} {t('awaySuffix')}  ·  {formatWalk(distance)} {t('walkSuffix')}  ·  {formatCar(distance)} {t('driveSuffix')}
          </Text>
        )}

        <View style={s.actionsRow}>
          <TouchableOpacity style={s.actionBtn} onPress={openMaps} activeOpacity={0.8}>
            <Ionicons name="map-outline" size={22} color={colors.gray900} />
            <Text style={s.actionBtnText}>{t('directions')}</Text>
          </TouchableOpacity>
          {spot.phone ? (
            <TouchableOpacity style={s.actionBtn} onPress={callPhone} activeOpacity={0.8}>
              <Ionicons name="call-outline" size={22} color={colors.gray900} />
              <Text style={s.actionBtnText}>{t('call')}</Text>
            </TouchableOpacity>
          ) : null}
          {spot.website ? (
            <TouchableOpacity style={s.actionBtn} onPress={openWebsite} activeOpacity={0.8}>
              <Ionicons name="globe-outline" size={22} color={colors.gray900} />
              <Text style={s.actionBtnText}>{t('website')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {spot.xid && (
          <>
            <Text style={s.sectionTitle}>{t('rating.sectionTitle')}</Text>
            <View style={s.card}>
              <TouchableOpacity style={s.ratingSummaryRow} onPress={() => setIsRatingOpen(!isRatingOpen)} activeOpacity={0.8}>
                <View style={s.ratingAverageRow}>
                  <Ionicons name="star" size={16} color="#f5b301" />
                  <Text style={s.ratingAverage}>{ratingData?.average?.toFixed(1) ?? '0.0'}</Text>
                </View>
                <StarRating value={ratingData?.average ?? 0} size={18} onChange={() => {}} readonly />
                <Text style={s.ratingCount}>{t('rating.visitedCount', { count: ratingData?.count ?? 0 })}</Text>
                <Text style={s.ratingToggle}>{isRatingOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {isRatingOpen && (
                <View style={s.ratingExpanded}>
                  <RatingForm
                    commentInputRef={commentInputRef}
                    ratingValue={ratingValue}
                    onChangeRatingValue={setRatingValue}
                    comment={comment}
                    onChangeComment={setComment}
                    onSave={saveRating}
                  />

                  {allRatings.map((r) => {
                    const isMine = r.userId === user?.id;
                    const name = isMine ? `${user?.firstName} ${user?.lastName}` : r.userName ?? t('rating.defaultUserName', { id: r.userId });
                    return (
                      <ReviewItem
                        key={r.id}
                        review={r}
                        displayName={name}
                        isMine={isMine}
                        onEdit={() => startEditRating(r)}
                        onDelete={() => deleteRating(r)}
                      />
                    );
                  })}
                </View>
              )}
            </View>
          </>
        )}

        <Text style={s.sectionTitle}>{t('information')}</Text>
        <View style={s.card}>
          <InfoRow value={spot.address} />
          <InfoRow value={spot.phone || ''} onPress={spot.phone ? callPhone : undefined} />
          <InfoRow value={spot.website || ''} onPress={spot.website ? openWebsite : undefined} />
          {spot.wikipedia ? (
            <InfoRow prefix={t('wikipedia')} value={wikipediaTitle ?? ''} onPress={openWikipedia} />
          ) : null}
          <InfoRow value={spot.wikidata || ''} isLast />
        </View>

        {hours.length > 0 && (
          <>
            <View style={s.sectionHeaderRow}>
              <Text style={s.sectionTitle}>{t('openingHours')}</Text>
              {openNow !== null && (
                <View style={s.openBadge}>
                  <Text style={s.openBadgeText}>{openNow ? t('openNow') : t('closedNow')}</Text>
                </View>
              )}
            </View>
            <View style={s.card}>
              {hours.map((h, i) => (
                <View key={i} style={[s.hourRow, i < hours.length - 1 && s.hourRowBorder]}>
                  <Text style={[s.hourPeriod, h.isToday && s.hourTextToday, h.closed && s.hourTextClosed]}>
                    {h.period}{h.isToday ? ` · ${t('today')}` : ''}
                  </Text>
                  <Text style={[s.hourValue, h.isToday && s.hourTextToday, h.closed && s.hourTextClosed]}>
                    {h.closed ? t('closed') : h.hours}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {spot.profiles?.length > 0 && (
          <>
            <Text style={s.sectionTitle}>{t('recommendedFor')}</Text>
            <View style={s.badgeRow}>
              {spot.profiles.map((p, i) => (
                <View key={i} style={s.badgePill}>
                  <Text style={s.badgePillText}>{p}</Text>
                </View>
              ))}
            </View>
          </>
        )}

      </ScrollView>
    </View>
  );
}
