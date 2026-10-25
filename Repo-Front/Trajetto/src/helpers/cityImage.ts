import { ImageSourcePropType } from 'react-native';

// Uma foto por cidade do catalogo, em assets/cities/<slug>.jpg.
const CITY_IMAGES: Record<string, ImageSourcePropType> = {
  atenas: require('@/assets/cities/atenas.jpg'),
  barcelona: require('@/assets/cities/barcelona.jpg'),
  'buenos-aires': require('@/assets/cities/buenos-aires.jpg'),
  cairo: require('@/assets/cities/cairo.jpg'),
  'cidade-do-cabo': require('@/assets/cities/cidade-do-cabo.jpg'),
  'cidade-do-mexico': require('@/assets/cities/cidade-do-mexico.jpg'),
  curitiba: require('@/assets/cities/curitiba.jpg'),
  dubai: require('@/assets/cities/dubai.jpg'),
  florenca: require('@/assets/cities/florenca.jpg'),
  istambul: require('@/assets/cities/istambul.jpg'),
  kyoto: require('@/assets/cities/kyoto.jpg'),
  lisboa: require('@/assets/cities/lisboa.jpg'),
  londres: require('@/assets/cities/londres.jpg'),
  marrakech: require('@/assets/cities/marrakech.jpg'),
  'nova-york': require('@/assets/cities/nova-york.jpg'),
  paris: require('@/assets/cities/paris.jpg'),
  'rio-de-janeiro': require('@/assets/cities/rio-de-janeiro.jpg'),
  roma: require('@/assets/cities/roma.jpg'),
  'sao-paulo': require('@/assets/cities/sao-paulo.jpg'),
  toquio: require('@/assets/cities/toquio.jpg'),
};

export function cityImage(slug?: string | null): ImageSourcePropType | null {
  return (slug && CITY_IMAGES[slug]) || null;
}
