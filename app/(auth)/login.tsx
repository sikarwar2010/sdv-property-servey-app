import { AppButton, AppInput } from '@/src/components';
import { env } from '@/src/config/env';
import { pingApiHealth } from '@/src/services/api/health';
import { useAuthStore } from '@/src/stores/auth';
import { Href, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('rajesh.surveyor@sdvedutech.in');
  const [password, setPassword] = useState('Admin@12345');
  const [showPassword, setShowPassword] = useState(false);
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const [apiChecking, setApiChecking] = useState(false);

  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const errorMessage = useAuthStore((s) => s.errorMessage);

  return (
    <View className="flex-1 bg-brand">
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <SafeAreaView edges={['top']} className="items-center pt-7 pb-7">
          <View className="w-16 h-16 bg-white rounded-xl items-center justify-center">
            <Text className="text-[22px] font-medium text-brand">SDV</Text>
          </View>
          <Text className="text-white text-h2 font-medium mt-3.5">Property Survey</Text>
          <Text className="text-white/70 text-caption mt-0.5">Nagar Panchayat · GIS field</Text>
        </SafeAreaView>

        <ScrollView
          className="flex-1 bg-surface-light dark:bg-surface-dark rounded-t-3xl"
          contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-h1 font-medium text-ink-primary-light dark:text-ink-primary-dark">Sign in</Text>
          <Text className="text-helper text-ink-tertiary-light dark:text-ink-tertiary-dark mt-1 mb-2">
            Sign in, capture surveys, submit to send data to the server.
          </Text>
          {__DEV__ ? (
            <Text className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark mb-6">
              Dev: Go API on port 8080 · `bun run go` (Expo Go) or `bun run android` (emulator build)
            </Text>
          ) : (
            <View className="mb-6" />
          )}

          <AppInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            iconLeft="mail-outline"
            containerClassName="mb-3.5"
          />

          <AppInput
            label="Password"
            required
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            iconLeft="lock-closed-outline"
            iconRight={showPassword ? 'eye-off-outline' : 'eye-outline'}
            onPressRightIcon={() => setShowPassword((v) => !v)}
            errorText={errorMessage ?? undefined}
            containerClassName="mb-3"
          />

          <Pressable
            onPress={() => router.push('/(auth)/forgot-password' as Href)}
            hitSlop={6}
            className="self-end mb-5"
          >
            <Text className="text-helper font-medium text-brand">Forgot password?</Text>
          </Pressable>

          <AppButton
            label={isLoading ? 'Signing in…' : 'Sign in'}
            loading={isLoading}
            onPress={() => login(email, password)}
            fullWidth
          />

          <Text className="text-caption text-ink-disabled-light text-center mt-6">
            v1.0.0 · For authorized field staff
          </Text>
          {__DEV__ ? (
            <>
              <Text className="text-caption text-ink-disabled-light text-center mt-2" numberOfLines={2}>
                API: {env.apiBaseUrl}
              </Text>
              <View className="mt-3">
                <AppButton
                  label={apiChecking ? 'Checking API…' : 'Test API connection'}
                  variant="outline"
                  loading={apiChecking}
                  onPress={async () => {
                    setApiChecking(true);
                    const res = await pingApiHealth();
                    setApiStatus(res.message);
                    setApiChecking(false);
                  }}
                  fullWidth
                />
              </View>
              {apiStatus ? (
                <Text
                  className={[
                    'text-caption text-center mt-2',
                    apiStatus.startsWith('Connected') ? 'text-green-600' : 'text-red-600',
                  ].join(' ')}
                  numberOfLines={4}
                >
                  {apiStatus}
                </Text>
              ) : null}
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
