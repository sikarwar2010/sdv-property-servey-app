import { AppButton, AppInput, SegmentedControl } from '@/src/components';
import { isValidMobile } from '@/src/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Channel = 'sms' | 'email';
type Stage = 'identify' | 'otp' | 'reset' | 'done';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('identify');
  const [channel, setChannel] = useState<Channel>('sms');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resendSeconds, setResendSeconds] = useState(45);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (stage !== 'otp' || resendSeconds <= 0) return;
    const t = setTimeout(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, resendSeconds]);

  const validIdentifier = channel === 'sms' ? isValidMobile(identifier) : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
  const otpValid = otp.every((d) => /^\d$/.test(d));
  const passwordsMatch = newPassword.length >= 8 && newPassword === confirmPassword;

  const handleOtpChange = (i: number, v: string) => {
    const digit = v.replace(/\D/g, '').slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[i] = digit;
      return next;
    });
  };

  return (
    <View className="flex-1 bg-brand">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <SafeAreaView edges={['top']}>
          <View className="px-4 py-3 flex-row items-center">
            <Pressable onPress={() => router.back()} className="w-9 h-9 items-center justify-center" hitSlop={8}>
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </Pressable>
          </View>
        </SafeAreaView>

        <ScrollView
          className="flex-1 bg-surface-light dark:bg-surface-dark rounded-t-3xl"
          contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
        >
          {stage === 'identify' ? (
            <>
              <Text className="text-h1 font-medium text-ink-primary-light dark:text-ink-primary-dark">
                Reset password
              </Text>
              <Text className="text-helper text-ink-tertiary-light dark:text-ink-tertiary-dark mt-1 mb-6">
                We'll send a one-time code to verify your identity
              </Text>

              <View className="mb-4">
                <SegmentedControl<Channel>
                  items={[
                    { value: 'sms', label: 'SMS' },
                    { value: 'email', label: 'Email' },
                  ]}
                  value={channel}
                  onChange={(v) => {
                    setChannel(v);
                    setIdentifier('');
                  }}
                />
              </View>

              <AppInput
                label={channel === 'sms' ? 'Mobile number' : 'Email'}
                required
                value={identifier}
                onChangeText={(v) => setIdentifier(channel === 'sms' ? v.replace(/\D/g, '').slice(0, 10) : v)}
                placeholder={channel === 'sms' ? '10-digit number' : 'you@example.com'}
                keyboardType={channel === 'sms' ? 'phone-pad' : 'email-address'}
                autoCapitalize="none"
                prefix={channel === 'sms' ? '+91' : undefined}
                iconLeft={channel === 'sms' ? 'call-outline' : 'mail-outline'}
                containerClassName="mb-6"
              />

              <AppButton
                label="Send code"
                iconRight="arrow-forward"
                onPress={() => {
                  setStage('otp');
                  setResendSeconds(45);
                }}
                disabled={!validIdentifier}
                fullWidth
              />
            </>
          ) : stage === 'otp' ? (
            <>
              <Text className="text-h1 font-medium text-ink-primary-light dark:text-ink-primary-dark">Enter code</Text>
              <Text className="text-helper text-ink-tertiary-light dark:text-ink-tertiary-dark mt-1 mb-6">
                We sent a 6-digit code to{' '}
                <Text className="font-medium text-ink-primary-light dark:text-ink-primary-dark">
                  {channel === 'sms' ? `+91 ${identifier}` : identifier}
                </Text>
              </Text>

              <View className="flex-row justify-between mb-6 gap-1.5">
                {otp.map((d, i) => (
                  <View
                    key={i}
                    className={[
                      'flex-1 aspect-square border-2 rounded-lg items-center justify-center',
                      d ? 'border-brand bg-brand-soft' : 'border-line-subtle bg-surface-light dark:bg-surface-dark',
                    ].join(' ')}
                  >
                    <Text className="text-h1 font-medium text-ink-primary-light dark:text-ink-primary-dark">{d}</Text>
                  </View>
                ))}
              </View>

              {/* Hidden trigger field for OTP entry - tap to focus */}
              <AppInput
                value={otp.join('')}
                onChangeText={(v) => {
                  const digits = v.replace(/\D/g, '').slice(0, 6).split('');
                  const next = ['', '', '', '', '', ''];
                  digits.forEach((d, i) => (next[i] = d));
                  setOtp(next);
                }}
                placeholder="Tap to type code"
                keyboardType="number-pad"
                containerClassName="mb-4"
                autoFocus
              />

              <View className="flex-row items-center justify-center mb-6">
                <Text className="text-helper text-ink-tertiary-light dark:text-ink-tertiary-dark">Didn't get it? </Text>
                {resendSeconds > 0 ? (
                  <Text className="text-helper text-ink-disabled-light">Resend in {resendSeconds}s</Text>
                ) : (
                  <Pressable onPress={() => setResendSeconds(45)} hitSlop={6}>
                    <Text className="text-helper font-medium text-brand">Resend</Text>
                  </Pressable>
                )}
              </View>

              <AppButton label="Verify" onPress={() => setStage('reset')} disabled={!otpValid} fullWidth />
            </>
          ) : stage === 'reset' ? (
            <>
              <Text className="text-h1 font-medium text-ink-primary-light dark:text-ink-primary-dark">
                New password
              </Text>
              <Text className="text-helper text-ink-tertiary-light dark:text-ink-tertiary-dark mt-1 mb-6">
                At least 8 characters · mix of letters and numbers
              </Text>

              <AppInput
                label="New password"
                required
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNew}
                iconLeft="lock-closed-outline"
                iconRight={showNew ? 'eye-off-outline' : 'eye-outline'}
                onPressRightIcon={() => setShowNew((v) => !v)}
                containerClassName="mb-3.5"
              />

              <AppInput
                label="Confirm password"
                required
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                iconLeft="lock-closed-outline"
                iconRight={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                onPressRightIcon={() => setShowConfirm((v) => !v)}
                errorText={confirmPassword && confirmPassword !== newPassword ? "Passwords don't match" : undefined}
                successText={passwordsMatch ? 'Passwords match' : undefined}
                containerClassName="mb-6"
              />

              <AppButton label="Reset password" onPress={() => setStage('done')} disabled={!passwordsMatch} fullWidth />
            </>
          ) : (
            <View className="items-center py-6">
              <View className="w-16 h-16 rounded-full bg-success-soft items-center justify-center">
                <Ionicons name="checkmark-circle" size={32} color="#16A34A" />
              </View>
              <Text className="text-h2 font-medium text-ink-primary-light dark:text-ink-primary-dark mt-4">
                Password reset
              </Text>
              <Text className="text-helper text-ink-tertiary-light dark:text-ink-tertiary-dark mt-1 text-center max-w-[280px]">
                Use your new password to sign in.
              </Text>
              <AppButton
                label="Go to sign in"
                iconRight="arrow-forward"
                onPress={() => router.replace('/(auth)/login' as Href)}
                className="mt-6"
                fullWidth
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
