import i18n from '@/src/i18n';

export function categoryIcon(category: string): string {
  const c = (category || '').toLowerCase();
  if (c.includes('museum')) return '🏛️';
  if (c.includes('monument')) return '🗿';
  if (c.includes('castle')) return '🏰';
  if (c.includes('palace')) return '🏯';
  if (c.includes('church') || c.includes('cathedral')) return '⛪';
  if (c.includes('synagogue') || c.includes('mosque') || c.includes('temple')) return '🛐';
  if (c.includes('garden')) return '🌷';
  if (c.includes('park')) return '🌳';
  if (c.includes('square')) return '🏙️';
  if (c.includes('fountain')) return '⛲';
  if (c.includes('aqueduct') || c.includes('bridge')) return '🌉';
  if (c.includes('ruins') || c.includes('historic')) return '🏚️';
  if (c.includes('gallery') || c.includes('artwork') || c.includes('art')) return '🎨';
  if (c.includes('theatre') || c.includes('theater')) return '🎭';
  if (c.includes('tower')) return '🗼';
  if (c.includes('view')) return '🌄';
  if (c.includes('beach')) return '🏖️';
  if (c.includes('peak')) return '⛰️';
  if (c.includes('waterfall')) return '💧';
  if (c.includes('cave')) return '🕳️';
  if (c.includes('zoo')) return '🦁';
  if (c.includes('aquarium')) return '🐠';
  if (c.includes('amusement') || c.includes('theme_park')) return '🎡';
  if (c.includes('stadium')) return '🏟️';
  if (c.includes('market') || c.includes('shop')) return '🛍️';
  if (c.includes('hotel')) return '🏨';
  if (c.includes('restaurant') || c.includes('food')) return '🍽️';
  if (c.includes('bar') || c.includes('pub')) return '🍸';
  if (c.includes('cafe') || c.includes('coffee')) return '☕';
  if (c.includes('attraction')) return '✨';
  return '📍';
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
