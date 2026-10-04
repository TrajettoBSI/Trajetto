import { useEffect, useRef, useState } from 'react';
import { TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RatingService, Rating, RatingSummary } from '@/services';
import { getErrorMessage } from '@/utils/apiError';
import { showAlert } from '@/src/components/alerts/alertService';
import { useAuth } from '@/context/AuthContext';

export function useSpotRating(xid: string | undefined) {
  const { t } = useTranslation(['spotDetail', 'common']);
  const { user } = useAuth();
  const commentInputRef = useRef<TextInput>(null);

  const [allRatings, setAllRatings] = useState<Rating[]>([]);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [ratingData, setRatingData] = useState<RatingSummary | undefined>();
  const [myRating, setMyRating] = useState<Rating | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!xid) return;
    RatingService.getSummary(xid).then(setRatingData).catch(() => {});
    RatingService.getByPlace(xid).then((ratings) => {
      setAllRatings(ratings);
      const mine = ratings.find((r) => r.userId === user?.id);
      setMyRating(mine ?? null);
    }).catch(() => {});
  }, [xid, user?.id]);

  const refreshRatings = async () => {
    if (!xid) return;
    const summary = await RatingService.getSummary(xid);
    setRatingData(summary);
    const ratings = await RatingService.getByPlace(xid);
    setAllRatings(ratings);
  };

  const saveRating = async () => {
    if (!xid) return;
    try {
      if (myRating) {
        const updated = await RatingService.update(myRating.id, {
          userId: user?.id ?? 0,
          rating: ratingValue,
          comment,
        });
        setMyRating(updated);
      } else {
        const created = await RatingService.create({
          placeId: xid,
          userId: user?.id ?? 0,
          userName: `${user?.firstName} ${user?.lastName}`,
          rating: ratingValue,
          comment,
        });
        setMyRating(created);
      }
      setIsRatingOpen(false);
      await refreshRatings();
    } catch (e) {
      showAlert(getErrorMessage(e, t('spotDetail:rating.saveError')), { title: t('common:error') });
    }
  };

  const startEditRating = (r: Rating) => {
    setMyRating(r);
    setRatingValue(r.rating);
    setComment(r.comment ?? '');
    setIsRatingOpen(true);
    setTimeout(() => commentInputRef.current?.focus(), 100);
  };

  const deleteRating = (r: Rating) => {
    if (!xid) return;
    showAlert(t('spotDetail:rating.deleteConfirm'), {
      title: t('spotDetail:rating.deleteTitle'),
      buttons: [
        { text: t('common:cancel'), style: 'cancel' },
        {
          text: t('common:delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await RatingService.delete(r.id, user?.id ?? 0);
              setMyRating(null);
              await refreshRatings();
            } catch (e) {
              showAlert(getErrorMessage(e, t('spotDetail:rating.deleteError')), { title: t('common:error') });
            }
          },
        },
      ],
    });
  };

  return {
    user,
    commentInputRef,
    allRatings,
    isRatingOpen,
    setIsRatingOpen,
    ratingData,
    myRating,
    ratingValue,
    setRatingValue,
    comment,
    setComment,
    saveRating,
    startEditRating,
    deleteRating,
  };
}
