import React from 'react';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { styles } from './styles/styles';

export default function ModalScreen() {
  const { t } = useTranslation('common');
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">{t('modal.title')}</ThemedText>
      <Link href="/" dismissTo style={styles.link}>
        <ThemedText type="link">{t('modal.goHome')}</ThemedText>
      </Link>
    </ThemedView>
  );
}
