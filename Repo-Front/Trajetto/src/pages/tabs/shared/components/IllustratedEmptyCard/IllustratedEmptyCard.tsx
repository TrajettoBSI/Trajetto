import React from 'react';
import { Text, View } from 'react-native';
import { useColors } from '@/src/theme';
import CustomButton from '@/components/CustomButton';
import { DESTINATIONS } from '../../data/destinations';
import DestinationCard from '../DestinationCard/DestinationCard';
import { styles } from './styles';

type Props = {
  destIndex: number;
  title: string;
  body: string;
  ctaLabel: string;
  onPress: () => void;
};

export default function IllustratedEmptyCard({ destIndex, title, body, ctaLabel, onPress }: Props) {
  const s = styles(useColors());
  const current = DESTINATIONS[destIndex];
  const next1 = DESTINATIONS[(destIndex + 1) % DESTINATIONS.length];
  const next2 = DESTINATIONS[(destIndex + 2) % DESTINATIONS.length];

  return (
    <View style={s.card}>
      <View style={s.cardsStack}>
        <DestinationCard
          titleKey={current.titleKey}
          subtitleKey={current.subtitleKey}
          hours={current.hours}
          image={current.image}
          bgColor={current.bgColor}
          rotation="-6deg"
          style={{ position: 'absolute', left: 0, top: 20 }}
          animKey={destIndex}
        />
        <DestinationCard
          titleKey={next1.titleKey}
          subtitleKey={next1.subtitleKey}
          hours={next1.hours}
          image={next1.image}
          bgColor={next1.bgColor}
          rotation="4deg"
          style={{ position: 'absolute', left: 60, top: 0 }}
          animKey={destIndex}
        />
        <DestinationCard
          titleKey={next2.titleKey}
          subtitleKey={next2.subtitleKey}
          hours={next2.hours}
          image={next2.image}
          bgColor={next2.bgColor}
          rotation="-2deg"
          style={{ position: 'absolute', left: 120, top: 30 }}
          animKey={destIndex}
        />
      </View>

      <Text style={s.title}>{title}</Text>
      <Text style={s.body}>{body}</Text>

      <CustomButton title={ctaLabel} onPress={onPress} style={s.button} textStyle={s.buttonText} />
    </View>
  );
}
