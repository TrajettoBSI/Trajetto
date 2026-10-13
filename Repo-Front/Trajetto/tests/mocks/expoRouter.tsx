import React, { useEffect } from 'react';
import { View } from 'react-native';

export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  setParams: jest.fn(),
  canGoBack: jest.fn(() => true),
  navigate: jest.fn(),
  dismiss: jest.fn(),
};

let params: Record<string, unknown> = {};
let segments: string[] = [];

export const setMockParams = (next: Record<string, unknown>) => {
  params = next;
};

export const setMockSegments = (next: string[]) => {
  segments = next;
};

export const resetRouterMock = () => {
  Object.values(mockRouter).forEach((fn) => fn.mockClear());
  params = {};
  segments = [];
};

export const useRouter = () => mockRouter;
export const router = mockRouter;
export const useLocalSearchParams = () => params;
export const useGlobalSearchParams = () => params;
export const useSegments = () => segments;
export const usePathname = () => '/';
export const useNavigation = () => ({ setOptions: jest.fn(), addListener: jest.fn(() => jest.fn()) });

export const useFocusEffect = (effect: () => void | (() => void)) => {
  useEffect(() => effect(), [effect]);
};

const Passthrough = ({ children }: { children?: React.ReactNode }) => <View>{children}</View>;
const Screen = () => null;

export const Stack = Object.assign(Passthrough, { Screen });
export const Tabs = Object.assign(Passthrough, { Screen });
export const Link = Passthrough;
export const Redirect = () => null;
export const ThemeProvider = Passthrough;
export const DefaultTheme = {};
export const DarkTheme = {};
