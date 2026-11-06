import { Ionicons } from '@expo/vector-icons';
import i18n from '@/src/i18n';

export function categoryIcon(category: string): keyof typeof Ionicons.glyphMap {
  const c = (category || '').toLowerCase();
  if (c.includes('museum')) return 'business';
  if (c.includes('monument')) return 'flag';
  if (c.includes('castle')) return 'shield';
  if (c.includes('palace')) return 'diamond';
  if (c.includes('church') || c.includes('cathedral')) return 'home';
  if (c.includes('synagogue') || c.includes('mosque') || c.includes('temple')) return 'sunny';
  if (c.includes('garden')) return 'flower';
  if (c.includes('park')) return 'leaf';
  if (c.includes('square')) return 'grid';
  if (c.includes('fountain')) return 'water';
  if (c.includes('aqueduct') || c.includes('bridge')) return 'git-merge';
  if (c.includes('ruins') || c.includes('historic')) return 'hourglass';
  if (c.includes('gallery') || c.includes('artwork') || c.includes('art')) return 'color-palette';
  if (c.includes('theatre') || c.includes('theater')) return 'musical-notes';
  if (c.includes('tower')) return 'radio';
  if (c.includes('view')) return 'image';
  if (c.includes('beach')) return 'umbrella';
  if (c.includes('peak')) return 'triangle';
  if (c.includes('waterfall')) return 'rainy';
  if (c.includes('cave')) return 'moon';
  if (c.includes('zoo')) return 'paw';
  if (c.includes('aquarium')) return 'fish';
  if (c.includes('amusement') || c.includes('theme_park')) return 'happy';
  if (c.includes('stadium')) return 'football';
  if (c.includes('market') || c.includes('shop')) return 'basket';
  if (c.includes('hotel')) return 'bed';
  if (c.includes('restaurant') || c.includes('food')) return 'restaurant';
  if (c.includes('bar') || c.includes('pub')) return 'wine';
  if (c.includes('cafe') || c.includes('coffee')) return 'cafe';
  if (c.includes('attraction')) return 'star';
  return 'location';
}

export function formatCategoryLabel(category: string): string {
  return (category || '')
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

const isRawKey = (value: string) => /^[a-z_]+$|^[A-Z_]+$/.test(value);

const fallbackLabel = (value: string) => (isRawKey(value) ? formatCategoryLabel(value) : value);

export function categoryLabel(category: string | null | undefined): string {
  if (!category) return '';
  return i18n.t(`places:categories.${category.toLowerCase()}`, { defaultValue: fallbackLabel(category) });
}

export function profileLabel(profile: string | null | undefined): string {
  if (!profile) return '';
  return i18n.t(`quiz:profiles.${profile.toUpperCase()}.nome`, { defaultValue: fallbackLabel(profile) });
}
