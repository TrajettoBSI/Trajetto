import { AppColors } from './colors';
import { useTheme } from './ThemeContext';

export function useColors(): AppColors {
  return useTheme().colors;
}
