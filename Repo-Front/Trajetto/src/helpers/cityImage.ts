import { ImageSourcePropType } from 'react-native';

// Uma foto por cidade do catalogo, em assets/cities/<slug>.jpg.
const CITY_IMAGES: Record<string, ImageSourcePropType> = {
  curitiba: require('@/assets/cities/curitiba.jpg'),
  'nova-york': require('@/assets/cities/nova-york.jpg'),
  paris: require('@/assets/cities/paris.jpg'),
  roma: require('@/assets/cities/roma.jpg'),
  toquio: require('@/assets/cities/toquio.jpg'),
};

export function cityImage(slug?: string | null): ImageSourcePropType | null {
  return (slug && CITY_IMAGES[slug]) || null;
}
