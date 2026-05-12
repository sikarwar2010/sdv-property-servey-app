import { AppCard, AppHeader, ListRow, SectionLabel } from '@/src/components';
import { Linking, ScrollView, Text, View } from 'react-native';

const APP_VERSION = '1.0.0';
const BUILD_NUMBER = '1042';

export default function AboutScreen() {
  return (
    <View className="flex-1 bg-page-light dark:bg-page-dark">
      <AppHeader title="About" />
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 32 }}>
        <View className="items-center py-6">
          <View className="w-20 h-20 rounded-2xl bg-brand items-center justify-center">
            <Text className="text-3xl font-medium text-white">SDV</Text>
          </View>
          <Text className="text-h2 font-medium text-ink-primary-light dark:text-ink-primary-dark mt-3">
            Property Survey
          </Text>
          <Text className="text-helper text-ink-tertiary-light dark:text-ink-tertiary-dark mt-1">
            Version {APP_VERSION} (build {BUILD_NUMBER})
          </Text>
          <Text className="text-caption text-ink-disabled-light mt-3 text-center max-w-[280px]">
            Field survey app for Nagar Panchayat property assessment. Built for offline-first capture with GIS
            integration.
          </Text>
        </View>

        <SectionLabel>Organization</SectionLabel>
        <AppCard padded className="mb-4">
          <View className="gap-2">
            <InfoLine label="Published by" value="SDV EDUTECH PVT. LTD." />
            <InfoLine label="Deployment" value="Mathura Nagar Panchayat" />
            <InfoLine label="Build channel" value="production" />
          </View>
        </AppCard>

        <SectionLabel>Open-source credits</SectionLabel>
        <AppCard padded={false} className="mb-4">
          <ListRow icon="logo-react" iconTone="brand" title="React Native" subtitle="MIT License" />
          <View className="h-px bg-line-subtle" />
          <ListRow icon="leaf-outline" iconTone="success" title="Expo" subtitle="MIT License" />
          <View className="h-px bg-line-subtle" />
          <ListRow icon="color-palette-outline" iconTone="brand" title="NativeWind v4" subtitle="MIT License" />
          <View className="h-px bg-line-subtle" />
          <ListRow
            icon="library-outline"
            iconTone="neutral"
            title="Zustand · Reanimated · NetInfo"
            subtitle="Various MIT-compatible licenses"
          />
        </AppCard>

        <SectionLabel>Legal</SectionLabel>
        <AppCard padded={false} className="mb-4">
          <ListRow
            icon="shield-checkmark-outline"
            iconTone="brand"
            title="Privacy policy"
            onPress={() => Linking.openURL('https://sdvedutech.in/privacy').catch(() => undefined)}
          />
          <View className="h-px bg-line-subtle" />
          <ListRow
            icon="document-text-outline"
            iconTone="neutral"
            title="Terms of service"
            onPress={() => Linking.openURL('https://sdvedutech.in/terms').catch(() => undefined)}
          />
          <View className="h-px bg-line-subtle" />
          <ListRow icon="code-slash-outline" iconTone="neutral" title="Open-source licenses" />
        </AppCard>

        <Text className="text-caption text-center text-ink-disabled-light mt-2">
          © 2026 SDV EDUTECH PVT. LTD. · Built with care
        </Text>
      </ScrollView>
    </View>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center">
      <Text className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark">{label}</Text>
      <Text className="text-[13px] font-medium text-ink-primary-light dark:text-ink-primary-dark">{value}</Text>
    </View>
  );
}
