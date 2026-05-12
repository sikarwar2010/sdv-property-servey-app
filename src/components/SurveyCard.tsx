import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBadge } from './Primitives';
import { timeAgo } from '@/src/utils/format';
import type { SurveyRecord } from '@/src/types';

interface Props {
  survey: SurveyRecord;
  onPress?: () => void;
}

export function SurveyCard({ survey, onPress }: Props) {
  const isFailed = survey.status === 'failed';
  const isDraft = survey.status === 'draft';

  return (
    <Pressable
      onPress={onPress}
      className={[
        'p-3.5 mb-2 rounded-xl border',
        isFailed
          ? 'bg-[#FFF8F8] dark:bg-danger-soft/30 border-danger-soft border-l-[3px] border-l-danger'
          : 'bg-surface-light dark:bg-surface-dark border-line-subtle',
      ].join(' ')}
    >
      <View className="flex-row items-start">
        <View className="flex-1 pr-2">
          <Text
            numberOfLines={1}
            className="text-body font-medium text-ink-primary-light dark:text-ink-primary-dark"
          >
            {survey.ownerName || 'Untitled draft'}
          </Text>
          <Text
            numberOfLines={1}
            className="text-helper text-ink-tertiary-light dark:text-ink-tertiary-dark"
          >
            {survey.propertyNo}
            {survey.addressLine ? ` · ${survey.addressLine}` : ''}
          </Text>
          <View className="flex-row items-center mt-1.5">
            <Ionicons name="location-outline" size={12} color="#64748B" />
            <Text className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark ml-1">
              Ward {survey.wardNo} · {timeAgo(survey.updatedAt)}
            </Text>
          </View>
          {isDraft ? (
            <View className="h-[3px] bg-line-subtle rounded mt-2.5 overflow-hidden">
              <View
                className="h-full bg-brand"
                style={{ width: `${(survey.step / survey.totalSteps) * 100}%` }}
              />
            </View>
          ) : null}
        </View>
        <StatusBadge status={survey.status} />
      </View>
      {isFailed ? (
        <View className="flex-row items-center mt-1.5">
          <Ionicons name="alert-circle" size={12} color="#DC2626" />
          <Text className="text-caption text-danger ml-1">Network timeout · 3 retries</Text>
        </View>
      ) : null}
    </Pressable>
  );
}
