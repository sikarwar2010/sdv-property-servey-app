import { useAuthStore } from '@/src/stores/auth';
import { useNetworkSubscriber } from '@/src/stores/network';
import { ThemeProvider } from '@/src/theme';
import { Slot, useRouter, useSegments, type Href } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function AuthGate() {
  const segments = useSegments() as string[];
  const router = useRouter();
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!hydrated) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login' as Href);
    } else if (user && (inAuthGroup || segments.length === 0)) {
      router.replace('/(app)/dashboard' as Href);
    }
    SplashScreen.hideAsync().catch(() => undefined);
  }, [hydrated, user, segments, router]);

  useNetworkSubscriber();

  return <Slot />;
}

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <StatusBar style="auto" />
          <AuthGate />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
