import { colors } from './colors';

export const chartColors = [
  colors.primary, '#1F5FAF', '#5A55B5', '#96457F',
  '#D97706', '#16A34A', '#0891B2', '#DC2626',
] as const;

export const adminAccent = {
  primary: chartColors[0],
  blue: chartColors[1],
  violet: chartColors[2],
  pink: chartColors[3],
  amber: chartColors[4],
  green: chartColors[5],
  cyan: chartColors[6],
  red: chartColors[7],
};
