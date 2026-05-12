import { AppButton, AppInput } from '@/src/components';
import { useAuthStore } from '@/src/stores/auth';
import { Href, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('rajesh.surveyor');
  const [password, setPassword] = useState('demo1234');
  const [showPassword, setShowPassword] = useState(false);

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
          <Text className="text-helper text-ink-tertiary-light dark:text-ink-tertiary-dark mt-1 mb-6">
            Use credentials issued by your ULB
          </Text>

          <AppInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            iconLeft="person-outline"
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
            onPress={() => login(username, password)}
            fullWidth
          />

          <Text className="text-caption text-ink-disabled-light text-center mt-6">
            v1.0.0 · For authorized field staff
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
