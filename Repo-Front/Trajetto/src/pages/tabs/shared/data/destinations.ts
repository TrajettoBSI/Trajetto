import { ImageSourcePropType } from 'react-native';

export type Destination = {
  titleKey: string;
  subtitleKey: string;
  hours: number;
  image: ImageSourcePropType;
  bgColor: string;
};

export const DESTINATIONS: Destination[] = [
  {
    titleKey: 'destinations.tokyo',
    subtitleKey: 'destinations.japan',
    hours: 14,
    image: require('@/assets/cities/toquio.jpg'),
    bgColor: '#1a1a1a',
  },
  {
    titleKey: 'destinations.paris',
    subtitleKey: 'destinations.france',
    hours: 11,
    image: require('@/assets/cities/paris.jpg'),
    bgColor: '#e85d9b',
  },
  {
    titleKey: 'destinations.nyc',
    subtitleKey: 'destinations.usa',
    hours: 9,
    image: require('@/assets/cities/nova-york.jpg'),
    bgColor: '#3b82f6',
  },
  {
    titleKey: 'destinations.rome',
    subtitleKey: 'destinations.italy',
    hours: 12,
    image: require('@/assets/cities/roma.jpg'),
    bgColor: '#c7be40',
  },
  {
    titleKey: 'destinations.venice',
    subtitleKey: 'destinations.italy',
    hours: 12,
    image: require('@/assets/appImgs/veniceImg.jpg'),
    bgColor: '#aa88da',
  },
  {
    titleKey: 'destinations.curitiba',
    subtitleKey: 'destinations.brazil',
    hours: 2,
    image: require('@/assets/cities/curitiba.jpg'),
    bgColor: '#85d363',
  },
];
