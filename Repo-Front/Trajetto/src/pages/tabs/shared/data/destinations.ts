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
    bgColor: '#14284F',
  },
  {
    titleKey: 'destinations.paris',
    subtitleKey: 'destinations.france',
    hours: 11,
    image: require('@/assets/cities/paris.jpg'),
    bgColor: '#C2492F',
  },
  {
    titleKey: 'destinations.nyc',
    subtitleKey: 'destinations.usa',
    hours: 9,
    image: require('@/assets/cities/nova-york.jpg'),
    bgColor: '#1F5FAF',
  },
  {
    titleKey: 'destinations.rome',
    subtitleKey: 'destinations.italy',
    hours: 12,
    image: require('@/assets/cities/roma.jpg'),
    bgColor: '#B4650F',
  },
  {
    titleKey: 'destinations.venice',
    subtitleKey: 'destinations.italy',
    hours: 12,
    image: require('@/assets/appImgs/veniceImg.jpg'),
    bgColor: '#5A55B5',
  },
  {
    titleKey: 'destinations.curitiba',
    subtitleKey: 'destinations.brazil',
    hours: 2,
    image: require('@/assets/cities/curitiba.jpg'),
    bgColor: '#0E7C86',
  },
];
