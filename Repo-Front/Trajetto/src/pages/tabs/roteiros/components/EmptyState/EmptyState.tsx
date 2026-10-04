import React from 'react';
import { useTranslation } from 'react-i18next';
import IllustratedEmptyCard from '@/src/pages/tabs/shared/components/IllustratedEmptyCard/IllustratedEmptyCard';

type Props = {
  destIndex: number;
  onCreate: () => void;
};

export default function EmptyState({ destIndex, onCreate }: Props) {
  const { t } = useTranslation('roteiros');

  return (
    <IllustratedEmptyCard
      destIndex={destIndex}
      title={t('emptyState.title')}
      body={t('emptyState.body')}
      ctaLabel={t('emptyState.cta')}
      onPress={onCreate}
    />
  );
}
