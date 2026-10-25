import 'react-native-gesture-handler/jestSetup';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';
import { resetRouterMock } from './tests/mocks/expoRouter';
import i18n from './src/i18n';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated/src/initializers', () =>
  jest.requireActual('react-native-reanimated/src/initializers.ts'),
);
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
jest.mock('react-native/src/private/assets/AssetRegistry', () => ({
  AssetRegistry: jest.requireMock('react-native/asset-registry'),
}));
jest.mock('expo-router', () => require('./tests/mocks/expoRouter'));
jest.mock('react-native-maps', () => require('./tests/mocks/reactNativeMaps'));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(async () => ({ coords: { latitude: 41.9009, longitude: 12.4833 } })),
  watchPositionAsync: jest.fn(async () => ({ remove: jest.fn() })),
  Accuracy: { Balanced: 3 },
}));

jest.mock('@react-native-community/datetimepicker', () => {
  const { Text, TouchableOpacity } = require('react-native');
  const Picker = ({ onChange }: { onChange: (event: { type: string }, date?: Date) => void }) => (
    <TouchableOpacity testID="date-picker" onPress={() => onChange({ type: 'set' }, new Date(2026, 10, 20))}>
      <Text>calendario</Text>
    </TouchableOpacity>
  );
  return { __esModule: true, default: Picker, DateTimePickerAndroid: { open: jest.fn() } };
});

beforeAll(async () => {
  await i18n.changeLanguage('pt-BR');
});

beforeEach(() => {
  resetRouterMock();
});
