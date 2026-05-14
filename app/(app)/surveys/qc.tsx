import { AppButton, AppHeader, EmptyState } from '@/src/components';
import { useSurveyStore } from '@/src/stores/survey';
import { UserRole } from '@/src/types';
import { timeAgo } from '@/src/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

const SECTION_LABELS: Record<string, string> = {
  property: 'Property details',
  owner: 'Owner',
  address: 'Address',
  tax: 'Taxation',
  area: 'Area & floors',
  services: 'Services',
  gis: 'GIS',
  photos: 'Photos',
};

export default function QcScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const surveys = useSurveyStore((s) => s.surveys);
  const [reply, setReply] = useState('');

  const survey = surveys.find((s) => s.id === params.id) ?? surveys.find((s) => s.qcRemarks?.length);

  if (!survey) {
    return (
      <View className="flex-1 bg-page-light dark:bg-page-dark">
        <AppHeader title="QC remarks" />
        <EmptyState
          icon="chatbubble-ellipses-outline"
          title="No QC remarks"
          message="Surveys returned by your supervisor will appear here."
        />
      </View>
    );
  }

  const remarks = survey.qcRemarks ?? [];
  const allTags = Array.from(new Set(remarks.flatMap((r) => r.taggedSections)));

  const handleSendReply = () => {
    if (!reply.trim()) return;
    setReply('');
  };

  const handleEdit = () => {
    router.push('/(app)/surveys/wizard' as Href);
  };

  return (
    <View className="flex-1 bg-page-light dark:bg-page-dark">
      <AppHeader title="QC remarks" subtitle={`${survey.ownerName} · ${survey.propertyNo}`} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 24 }}>
          {/* Sections to revise */}
          {allTags.length > 0 ? (
            <View className="bg-warning-soft border border-warning/30 rounded-xl p-3.5 mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="alert-circle" size={16} color="#92400E" />
                <Text className="ml-2 text-helper font-medium text-warning-ink">
                  Sections to revise ({allTags.length})
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-1.5">
                {allTags.map((tag) => (
                  <View key={tag} className="bg-warning/20 border border-warning/40 rounded-full px-2.5 py-1">
                    <Text className="text-caption font-medium text-warning-ink">{SECTION_LABELS[tag] ?? tag}</Text>
                  </View>
                ))}
              </View>
              <AppButton
                label="Edit survey"
                iconRight="arrow-forward"
                variant="outline"
                size="sm"
                onPress={handleEdit}
                className="mt-3 self-start"
              />
            </View>
          ) : null}

          {/* Thread */}
          {remarks.map((r) => {
            const isSupervisor = r.authorRole === ('supervisor' as UserRole);
            return (
              <View key={r.id} className={['mb-3 flex-row', isSupervisor ? '' : 'flex-row-reverse'].join(' ')}>
                <View
                  className={[
                    'w-8 h-8 rounded-full items-center justify-center',
                    isSupervisor ? 'bg-brand' : 'bg-success',
                  ].join(' ')}
                >
                  <Text className="text-[11px] font-medium text-white">{r.author.slice(0, 1).toUpperCase()}</Text>
                </View>
                <View
                  className={[
                    'flex-1 mx-2 rounded-xl p-3',
                    isSupervisor ? 'bg-surface-light dark:bg-surface-dark border border-line-subtle' : 'bg-brand-soft',
                  ].join(' ')}
                >
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-[12px] font-medium text-ink-primary-light dark:text-ink-primary-dark">
                      {r.author}{' '}
                      <Text className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark">
                        · {isSupervisor ? 'Supervisor' : 'Surveyor'}
                      </Text>
                    </Text>
                    {!r.resolved ? (
                      <View className="bg-danger-soft px-1.5 py-0.5 rounded-full">
                        <Text
                          className="text-[9px] font-medium text-danger-ink uppercase"
                          style={{ letterSpacing: 0.4 }}
                        >
                          Open
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text className="text-[13px] text-ink-primary-light dark:text-ink-primary-dark leading-5">
                    {r.message}
                  </Text>
                  {r.taggedSections.length > 0 ? (
                    <View className="flex-row flex-wrap gap-1 mt-2">
                      {r.taggedSections.map((tag) => (
                        <View key={tag} className="bg-page-light dark:bg-page-dark/40 rounded px-1.5 py-0.5">
                          <Text className="text-[10px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark">
                            #{SECTION_LABELS[tag] ?? tag}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                  <Text className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark mt-1.5">
                    {timeAgo(r.createdAt)}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Reply composer */}
        <View className="bg-surface-light dark:bg-surface-dark border-t border-line-subtle p-2">
          <View className="flex-row items-end bg-page-light dark:bg-page-dark/40 rounded-2xl px-3 py-1">
            <TextInput
              value={reply}
              onChangeText={setReply}
              placeholder="Reply to supervisor…"
              placeholderTextColor="#94A3B8"
              multiline
              className="flex-1 py-2 text-[13px] text-ink-primary-light dark:text-ink-primary-dark"
              style={{ maxHeight: 100 }}
            />
            <Pressable
              onPress={handleSendReply}
              disabled={!reply.trim()}
              className={[
                'w-9 h-9 rounded-full items-center justify-center ml-1',
                reply.trim() ? 'bg-brand' : 'bg-line-subtle',
              ].join(' ')}
            >
              <Ionicons name="send" size={14} color={reply.trim() ? '#FFFFFF' : '#94A3B8'} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
