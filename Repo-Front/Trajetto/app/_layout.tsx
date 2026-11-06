import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text, TextInput } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans';
import { BricolageGrotesque_700Bold, BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque';

import '@/src/i18n';
import { ThemeProvider as AppThemeProvider, useTheme } from '@/src/theme';
import { AuthProvider, useAuth } from '../context/AuthContext';

(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.allowFontScaling = false;

(TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
(TextInput as any).defaultProps.allowFontScaling = false;


export const unstable_settings = { anchor: '(tabs)' };

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { t } = useTranslation(['admin', 'resetPassword']);
  const { scheme } = useTheme();
  const [fontsLoaded, fontError] = useFonts({
    'Jakarta': PlusJakartaSans_400Regular,
    'Jakarta-Medium': PlusJakartaSans_500Medium,
    'Jakarta-Bold': PlusJakartaSans_700Bold,
    'Display-Bold': BricolageGrotesque_700Bold,
    'Display-Black': BricolageGrotesque_800ExtraBold,
  });
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  // Define a fonte Plus Jakarta Sans como padrão global para os componentes nativos
  useEffect(() => {
    if (fontsLoaded) {
      (Text as any).defaultProps = {
      ...((Text as any).defaultProps || {}),
      allowFontScaling: false,
      style: { fontFamily: 'Jakarta', includeFontPadding: false },
    };
    (TextInput as any).defaultProps = {
      ...((TextInput as any).defaultProps || {}),
      allowFontScaling: false,
      style: { fontFamily: 'Jakarta', includeFontPadding: false },
    };
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (loading) return;

    const currentSegment = segments[0] ?? '';
    const publicRoutes = ['LoginScreen', 'RegisterScreen', 'ForgotPasswordScreen', 'ResetPasswordScreen', 'VerifyEmailScreen'];
    const inPublic = publicRoutes.includes(currentSegment);
    const inTabs = currentSegment === '(tabs)';
    const adminRoutes = ['AdminPanelScreen', 'AdminProfileScreen', 'UserListScreen', 'UserDetailScreen'];
    const inAdmin = adminRoutes.includes(currentSegment);

    const needsQuiz = !user?.isAdmin && (!user?.travelerProfile || user.travelerProfile === 'SKIPPED');

    if (!user && !inPublic) {
      if (router.canDismiss()) router.dismissAll();
      router.replace('/LoginScreen');
    } else if (user && inPublic) {
      if (router.canDismiss()) router.dismissAll();
      if (user.isAdmin) {
        router.replace('/AdminPanelScreen');
      } else if (needsQuiz) {
        router.replace('/TravelerTestScreen');
      } else {
        router.replace('/(tabs)');
      }
    } else if (user?.isAdmin && inTabs) {
      router.replace('/AdminPanelScreen');
    } else if (user && !user.isAdmin && inAdmin) {
      if (router.canDismiss()) router.dismissAll();
      router.replace('/(tabs)');
    }

    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [user, loading, segments, fontsLoaded, fontError, router]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ animation: 'slide_from_right' }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, headerBackTitle: '' }} />
        <Stack.Screen name="LoginScreen" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="RegisterScreen" options={{ headerShown: false }} />
        <Stack.Screen name="VerifyEmailScreen" options={{ headerShown: false }} />
        <Stack.Screen name="UserListScreen" options={{ headerShown: false }} />
        <Stack.Screen name="UserDetailScreen" options={{ headerShown: false }} />
        <Stack.Screen name="AdminProfileScreen" options={{ headerShown: false }} />
        <Stack.Screen name="ForgotPasswordScreen" options={{ headerShown: false }} />
        <Stack.Screen name="ResetPasswordScreen" options={{ title: t('resetPassword:title'), headerBackTitle: '' }} />
        <Stack.Screen name="TravelerTestScreen" options={{ headerShown: false }} />
        <Stack.Screen name="QuizScreen" options={{ headerShown: false }} />
        <Stack.Screen name="QuizResultScreen" options={{ headerShown: false, animation: 'fade_from_bottom' }} />
        <Stack.Screen name="perfil" options={{ headerShown: false }} />
        <Stack.Screen name="ProfileScreen" options={{ headerShown: false }} />
        <Stack.Screen name="ExploreScreen" options={{ headerShown: false }} />
        <Stack.Screen name="SpotDetailScreen" options={{ headerShown: false, animation: 'fade_from_bottom' }} />
        <Stack.Screen name="FavoritesScreen" options={{ headerShown: false }} />
        <Stack.Screen name="AdminPanelScreen" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppThemeProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </AppThemeProvider>
    </GestureHandlerRootView>
  );
}