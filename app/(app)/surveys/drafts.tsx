import { AppButton, AppHeader, EmptyState } from '@/src/components';
import { useSurveyStore } from '@/src/stores/survey';
import { timeAgo } from '@/src/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';

const STEP_NAMES = ['Property details', 'Owner', 'Address', 'Tax', 'Area', 'Services', 'GIS', 'Photos'];

export default function DraftsScreen() {
  const router = useRouter();
  const surveys = useSurveyStore((s) => s.surveys);
  const startDraft = useSurveyStore((s) => s.startDraft);
  const drafts = surveys.filter((s) => s.status === 'draft');

  const handleResume = () => {
    router.push('/(app)/surveys/wizard' as Href);
  };

  const handleDiscard = () => {
    Alert.alert('Discard draft?', 'This will permanently remove the draft.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Discard', style: 'destructive' },
    ]);
  };

  return (
    <View className="flex-1 bg-page-light dark:bg-page-dark">
      <AppHeader
        title="Drafts"
        subtitle={`${drafts.length} unfinished survey${drafts.length === 1 ? '' : 's'}`}
        rightSlot={
          <Pressable
            onPress={() => {
              startDraft();
              router.push('/(app)/surveys/new' as Href);
            }}
            hitSlop={8}
          >
            <Ionicons name="add" size={22} color="#003B8E" />
          </Pressable>
        }
      />
      <FlatList
        data={drafts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 14 }}
        ItemSeparatorComponent={() => <View className="h-2" />}
        ListEmptyComponent={
          <EmptyState
            icon="document-outline"
            title="No drafts"
            message="Surveys you save will appear here. They auto-save every 5 seconds."
            actionLabel="Start new survey"
            onAction={() => {
              startDraft();
              router.push('/(app)/surveys/new' as Href);
            }}
          />
        }
        renderItem={({ item }) => {
          const stepName = STEP_NAMES[item.step - 1] ?? 'In progress';
          return (
            <View className="p-3.5 bg-surface-light dark:bg-surface-dark rounded-xl border border-line-subtle">
              <View className="flex-row items-start justify-between mb-2.5">
                <View className="flex-1 pr-2">
                  <Text className="text-body font-medium text-ink-primary-light dark:text-ink-primary-dark">
                    {item.ownerName || 'Untitled draft'}
                  </Text>
                  <Text className="text-helper text-ink-tertiary-light dark:text-ink-tertiary-dark mt-0.5">
                    {item.propertyNo} · Ward {item.wardNo}
                  </Text>
                </View>
                <View className="bg-warning-soft px-2 py-1 rounded-full">
                  <Text className="text-[10px] font-medium text-warning-ink uppercase" style={{ letterSpacing: 0.4 }}>
                    Draft
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between mb-1.5">
                <Text className="text-caption text-ink-secondary-light dark:text-ink-secondary-dark">
                  Step {item.step} of {item.totalSteps} · {stepName}
                </Text>
                <Text className="text-caption text-brand font-medium">
                  {Math.round((item.step / item.totalSteps) * 100)}%
                </Text>
              </View>

              <View className="h-1 bg-line-subtle rounded-full overflow-hidden">
                <View className="h-full bg-brand" style={{ width: `${(item.step / item.totalSteps) * 100}%` }} />
              </View>

              <View className="flex-row items-center mt-2">
                <Ionicons name="time-outline" size={12} color="#64748B" />
                <Text className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark ml-1 flex-1">
                  Saved {timeAgo(item.updatedAt)}
                </Text>
              </View>

              <View className="flex-row gap-2 mt-3">
                <AppButton
                  label="Resume"
                  iconRight="arrow-forward"
                  size="md"
                  className="flex-1"
                  onPress={handleResume}
                />
                <AppButton label="Discard" variant="ghost" size="md" onPress={handleDiscard} />
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}
