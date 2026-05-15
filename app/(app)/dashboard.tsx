import { AppButton, AppCard, KpiCard, OfflineBanner, PulseDot } from '@/src/components';
import { useSurveyKpi } from '@/src/hooks/use-survey-kpi';
import { useAuthStore } from '@/src/stores/auth';
import { useIsOnline } from '@/src/stores/network';
import { useSurveyStore } from '@/src/stores/survey';
import { timeOfDayGreeting } from '@/src/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const startDraft = useSurveyStore((s) => s.startDraft);
  const kpi = useSurveyKpi();
  const notifications = useSurveyStore((s) => s.notifications);
  const online = useIsOnline();
  const unread = notifications.filter((n) => !n.read).length;

  const handleNewSurvey = () => {
    startDraft();
    router.push('/(app)/surveys/new' as Href);
  };

  return (
    <View className="flex-1 bg-page-light dark:bg-page-dark">
      <StatusBar style="light" />
      <OfflineBanner />
      <SafeAreaView edges={['top']} className="bg-brand">
        <View className="px-4 pt-2 pb-7">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-helper text-white/65">{timeOfDayGreeting()}</Text>
              <Text className="text-h2 font-medium text-white mt-0.5">{user?.name ?? 'Surveyor'}</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={() => router.push('/(app)/search' as Href)}
                className="w-9 h-9 rounded-full bg-white/15 items-center justify-center"
              >
                <Ionicons name="search" size={16} color="#FFFFFF" />
              </Pressable>
              <Pressable
                onPress={() => router.push('/(app)/notifications' as Href)}
                className="w-9 h-9 rounded-full bg-white/15 items-center justify-center"
              >
                <Ionicons name="notifications-outline" size={16} color="#FFFFFF" />
                {unread > 0 ? (
                  <View className="absolute -top-0.5 -right-0.5 bg-accent rounded-full min-w-[16px] h-4 items-center justify-center px-1">
                    <Text className="text-[9px] font-medium text-white">{unread}</Text>
                  </View>
                ) : null}
              </Pressable>
            </View>
          </View>

          <View className="flex-row items-center mt-3.5 gap-2">
            <View className="flex-row items-center bg-white/15 px-2.5 py-1 rounded-full">
              <PulseDot tone={online ? 'success' : 'warning'} />
              <Text className="ml-1.5 text-[11px] font-medium text-white">{online ? 'Online' : 'Offline'}</Text>
            </View>
            <View className="flex-row items-center bg-white/15 px-2.5 py-1 rounded-full">
              <Ionicons name="location-outline" size={11} color="rgba(255,255,255,0.85)" />
              <Text className="ml-1 text-[11px] font-medium text-white/85">{user?.ulbName ?? 'Mathura NP'}</Text>
            </View>
          </View>
          <Text className="text-caption text-white/60 mt-1.5">
            Wards assigned: {user?.wardAssignments.join(', ') ?? '—'}
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ padding: 14, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        className="-mt-4"
      >
        <AppCard padded className="mb-4">
          <Text className="text-label uppercase tracking-wider font-medium text-brand mb-2.5">Quick action</Text>
          <AppButton label="Start new survey" iconLeft="add" onPress={handleNewSurvey} fullWidth size="md" />
          <View className="flex-row gap-2 mt-2">
            <AppButton
              label={`Drafts (${kpi.drafts})`}
              variant="secondary"
              size="md"
              className="flex-1"
              onPress={() => router.push('/(app)/surveys/drafts' as Href)}
            />
            <AppButton
              label={`Sync (${kpi.pending})`}
              variant="outline"
              size="md"
              className="flex-1"
              onPress={() => router.push('/(app)/sync' as Href)}
            />
          </View>
        </AppCard>

        <View className="flex-row gap-2 mb-4">
          <Pressable
            onPress={() => router.push('/(app)/map' as Href)}
            className="flex-1 p-3 bg-surface-light dark:bg-surface-dark rounded-xl border border-line-subtle"
          >
            <View className="w-9 h-9 rounded-full bg-brand-soft items-center justify-center">
              <Ionicons name="map-outline" size={18} color="#003B8E" />
            </View>
            <Text className="text-[13px] font-medium text-ink-primary-light dark:text-ink-primary-dark mt-2">
              Map view
            </Text>
            <Text className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark mt-0.5">
              See surveys on map
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(app)/reports' as Href)}
            className="flex-1 p-3 bg-surface-light dark:bg-surface-dark rounded-xl border border-line-subtle"
          >
            <View className="w-9 h-9 rounded-full bg-success-soft items-center justify-center">
              <Ionicons name="bar-chart-outline" size={18} color="#16A34A" />
            </View>
            <Text className="text-[13px] font-medium text-ink-primary-light dark:text-ink-primary-dark mt-2">
              Reports
            </Text>
            <Text className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark mt-0.5">
              {kpi.today} of 10 today
            </Text>
          </Pressable>
        </View>

        <Text className="text-body font-medium text-ink-primary-light dark:text-ink-primary-dark mb-2">Overview</Text>
        <View className="flex-row flex-wrap -mx-0.5">
          <View className="w-1/3 p-0.5">
            <KpiCard icon="clipboard-outline" iconColor="#003B8E" value={kpi.total} label="Total" />
          </View>
          <View className="w-1/3 p-0.5">
            <KpiCard icon="calendar-outline" iconColor="#0EA5E9" value={kpi.today} label="Today" />
          </View>
          <View className="w-1/3 p-0.5">
            <KpiCard icon="cloud-upload-outline" iconColor="#F59E0B" value={kpi.pending} label="Pending" />
          </View>
          <View className="w-1/3 p-0.5">
            <KpiCard icon="checkmark-circle-outline" iconColor="#16A34A" value={kpi.submitted} label="Submitted" />
          </View>
          <View className="w-1/3 p-0.5">
            <KpiCard icon="alert-circle-outline" iconColor="#DC2626" value={kpi.failed} label="Failed" />
          </View>
          <View className="w-1/3 p-0.5">
            <KpiCard icon="document-outline" iconColor="#475569" value={kpi.drafts} label="Drafts" />
          </View>
        </View>

        {kpi.pending > 0 ? (
          <Pressable
            onPress={() => router.push('/(app)/sync' as Href)}
            className="flex-row items-center p-3 mt-4 rounded-xl bg-warning-soft border border-warning/30"
          >
            <View className="w-7 h-7 rounded-full bg-warning items-center justify-center">
              <Ionicons name="cloud-upload-outline" size={16} color="#FFFFFF" />
            </View>
            <View className="flex-1 ml-2.5">
              <Text className="text-helper font-medium text-warning-ink">
                {kpi.pending} survey{kpi.pending === 1 ? '' : 's'} pending sync
              </Text>
              <Text className="text-caption text-warning-ink">Tap to sync now</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#92400E" />
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}
