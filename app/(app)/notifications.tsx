import { FlatList, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader, EmptyState } from '@/src/components';
import { useSurveyStore } from '@/src/stores/survey';
import { timeAgo } from '@/src/utils/format';
import type { NotificationItem } from '@/src/types/index';

const ICON_MAP: Record<
  NotificationItem['type'],
  { icon: keyof typeof Ionicons.glyphMap; tone: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }
> = {
  sync_success: { icon: 'cloud-done-outline', tone: 'success' },
  qc_remark: { icon: 'chatbubble-ellipses-outline', tone: 'warning' },
  sync_failed: { icon: 'alert-circle-outline', tone: 'danger' },
  target: { icon: 'flag-outline', tone: 'info' },
  system: { icon: 'notifications-outline', tone: 'neutral' },
};

const TONE_BG: Record<string, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  neutral: 'bg-ink-secondary-light',
};

export default function NotificationsScreen() {
  const notifications = useSurveyStore((s) => s.notifications);
  const markAll = useSurveyStore((s) => s.markAllNotificationsRead);
  const markOne = useSurveyStore((s) => s.markNotificationRead);

  return (
    <View className="flex-1 bg-page-light dark:bg-page-dark">
      <AppHeader
        title="Notifications"
        rightSlot={
          <Pressable onPress={markAll} hitSlop={8}>
            <Text className="text-helper font-medium text-brand">Mark all read</Text>
          </Pressable>
        }
      />
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 14 }}
        ItemSeparatorComponent={() => <View className="h-2" />}
        ListEmptyComponent={<EmptyState icon="notifications-off-outline" title="No notifications yet" />}
        renderItem={({ item }) => {
          const cfg = ICON_MAP[item.type];
          return (
            <Pressable
              onPress={() => markOne(item.id)}
              className={[
                'flex-row items-start p-3 rounded-xl border',
                item.read
                  ? 'bg-surface-light dark:bg-surface-dark border-line-subtle'
                  : 'bg-brand-soft border-transparent border-l-[3px]',
                !item.read && cfg.tone === 'success' ? 'border-l-success' : '',
                !item.read && cfg.tone === 'warning' ? 'border-l-warning' : '',
                !item.read && cfg.tone === 'danger' ? 'border-l-danger' : '',
                !item.read && cfg.tone === 'info' ? 'border-l-info' : '',
                !item.read && cfg.tone === 'neutral' ? 'border-l-ink-secondary-light' : '',
              ].join(' ')}
            >
              <View
                className={[
                  'w-8 h-8 rounded-full items-center justify-center',
                  TONE_BG[cfg.tone] ?? 'bg-ink-secondary-light',
                ].join(' ')}
              >
                <Ionicons name={cfg.icon} size={15} color="#FFFFFF" />
              </View>
              <View className="flex-1 ml-2.5">
                <Text className="text-[13px] font-medium text-ink-primary-light dark:text-ink-primary-dark">
                  {item.title}
                </Text>
                <Text className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark mt-0.5">
                  {item.body}
                </Text>
                <Text className="text-caption text-ink-disabled-light mt-1">{timeAgo(item.createdAt)}</Text>
              </View>
              {!item.read ? (
                <View className="bg-warning-soft px-2 py-0.5 rounded-full">
                  <Text className="text-[9px] font-medium text-warning-ink uppercase" style={{ letterSpacing: 0.4 }}>
                    New
                  </Text>
                </View>
              ) : null}
            </Pressable>
          );
        }}
      />
    </View>
  );
}
