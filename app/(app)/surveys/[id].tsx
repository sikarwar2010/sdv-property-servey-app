import { AppButton, AppCard, AppHeader, Banner, EmptyState, ListRow, StatusBadge, Tag } from '@/src/components';
import { surveyRowToRecord } from '@/src/database/survey-mapper';
import { useSurveyObservable } from '@/src/hooks/use-database';
import type { SurveyRecord } from '@/src/types';
import { formatDate, formatMobile, formatTime, sqftToSqm } from '@/src/utils/format';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function SurveyDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const wmId = params.id;
  const { survey: wmSurvey, loading } = useSurveyObservable(wmId);
  const [survey, setSurvey] = useState<SurveyRecord | null>(null);

  useEffect(() => {
    if (!wmSurvey) {
      setSurvey(null);
      return;
    }
    setSurvey(surveyRowToRecord(wmSurvey));
  }, [wmSurvey]);

  if (loading) {
    return (
      <View className="flex-1 bg-page-light dark:bg-page-dark">
        <AppHeader title="Survey" />
        <View className="flex-1 items-center justify-center">
          <Text className="text-body text-ink-secondary-light">Loading…</Text>
        </View>
      </View>
    );
  }

  if (!survey) {
    return (
      <View className="flex-1 bg-page-light dark:bg-page-dark">
        <AppHeader title="Survey" />
        <EmptyState icon="document-outline" title="Not found" message="This survey may have been deleted." />
      </View>
    );
  }

  const totalBuiltUp = survey.floors.reduce((acc, f) => acc + f.areaSqft, 0);

  return (
    <View className="flex-1 bg-page-light dark:bg-page-dark">
      <AppHeader
        title={survey.ownerName}
        subtitle={survey.propertyNo}
        rightSlot={
          survey.qcRemarks?.length ? (
            <Tag label={`${survey.qcRemarks.length} QC`} tone="warning" icon="chatbubble-ellipses" />
          ) : null
        }
      />
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 32 }}>
        <AppCard padded className="mb-4">
          <View className="flex-row items-start justify-between mb-2.5">
            <View className="flex-1">
              <Text className="text-h2 font-medium text-ink-primary-light dark:text-ink-primary-dark">
                {survey.ownerName}
              </Text>
              <Text className="text-helper text-ink-tertiary-light dark:text-ink-tertiary-dark mt-0.5">
                {survey.addressLine}
              </Text>
            </View>
            <StatusBadge status={survey.status} />
          </View>
          <View className="flex-row gap-1.5">
            <Tag label={`Ward ${survey.wardNo}`} tone="neutral" icon="location-outline" />
            <Tag label={survey.ulbName} tone="brand" />
          </View>
        </AppCard>

        {survey.status === 'failed' && survey.qcRemarks?.length ? (
          <Banner
            tone="warning"
            title="Returned by supervisor"
            message={`${survey.qcRemarks.length} remark${survey.qcRemarks.length === 1 ? '' : 's'} need your attention.`}
            actionLabel="View QC remarks"
            onAction={() => router.push(`/(app)/surveys/qc?id=${survey.id}` as Href)}
          />
        ) : null}

        <Text className="text-label uppercase tracking-wider font-medium text-ink-secondary-light mt-4 mb-2">
          Metadata
        </Text>
        <AppCard padded={false} className="mb-3">
          <ListRow
            icon="calendar-outline"
            iconTone="brand"
            title="Created"
            subtitle={`${formatDate(survey.createdAt)} at ${formatTime(survey.createdAt)}`}
            showChevron={false}
          />
          <View className="h-px bg-line-subtle" />
          <ListRow
            icon="time-outline"
            iconTone="neutral"
            title="Last updated"
            subtitle={`${formatDate(survey.updatedAt)} at ${formatTime(survey.updatedAt)}`}
            showChevron={false}
          />
          {survey.syncedAt ? (
            <>
              <View className="h-px bg-line-subtle" />
              <ListRow
                icon="cloud-done-outline"
                iconTone="success"
                title="Synced"
                subtitle={`${formatDate(survey.syncedAt)} at ${formatTime(survey.syncedAt)}`}
                showChevron={false}
              />
            </>
          ) : null}
          {survey.serverId ? (
            <>
              <View className="h-px bg-line-subtle" />
              <ListRow
                icon="finger-print-outline"
                iconTone="neutral"
                title="Server ID"
                subtitle={survey.serverId}
                showChevron={false}
              />
            </>
          ) : null}
        </AppCard>

        <Text className="text-label uppercase tracking-wider font-medium text-ink-secondary-light mb-2">
          Owner contact
        </Text>
        <AppCard padded className="mb-3">
          <Row label="Mobile" value={survey.mobileNo ? `+91 ${formatMobile(survey.mobileNo)}` : '—'} />
          <Row label="Family size" value={String(survey.family)} last />
        </AppCard>

        <Text className="text-label uppercase tracking-wider font-medium text-ink-secondary-light mb-2">Area</Text>
        <AppCard padded className="mb-3">
          <Row label="Plot" value={`${survey.plotSqft} sq ft · ${sqftToSqm(survey.plotSqft)} sq m`} />
          <Row label="Plinth" value={`${survey.plinthSqft} sq ft · ${sqftToSqm(survey.plinthSqft)} sq m`} />
          <Row label="Built-up" value={`${totalBuiltUp} sq ft`} highlight last />
        </AppCard>

        {survey.floors.length > 0 ? (
          <>
            <Text className="text-label uppercase tracking-wider font-medium text-ink-secondary-light mb-2">
              Floors ({survey.floors.length})
            </Text>
            <AppCard padded={false} className="mb-3">
              {survey.floors.map((f, i, arr) => (
                <View key={f.id}>
                  <ListRow
                    icon="layers-outline"
                    iconTone="brand"
                    title={f.floorName}
                    subtitle={`${f.areaSqft} sq ft · ${f.isOccupied ? 'occupied' : 'vacant'}`}
                    showChevron={false}
                  />
                  {i < arr.length - 1 ? <View className="h-px bg-line-subtle" /> : null}
                </View>
              ))}
            </AppCard>
          </>
        ) : null}

        {survey.gps ? (
          <>
            <Text className="text-label uppercase tracking-wider font-medium text-ink-secondary-light mb-2">GIS</Text>
            <AppCard padded className="mb-3">
              <View className="flex-row">
                <View className="flex-1">
                  <Text className="text-caption text-ink-tertiary-light">Latitude</Text>
                  <Text className="text-[13px] font-medium text-ink-primary-light dark:text-ink-primary-dark mt-0.5">
                    {survey.gps.latitude.toFixed(6)}°
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-caption text-ink-tertiary-light">Longitude</Text>
                  <Text className="text-[13px] font-medium text-ink-primary-light dark:text-ink-primary-dark mt-0.5">
                    {survey.gps.longitude.toFixed(6)}°
                  </Text>
                </View>
                <View>
                  <Text className="text-caption text-ink-tertiary-light">Accuracy</Text>
                  <Text className="text-[13px] font-medium text-success mt-0.5">
                    ±{Math.round(survey.gps.accuracyMeters)} m
                  </Text>
                </View>
              </View>
              <AppButton
                label="View on map"
                variant="outline"
                size="sm"
                iconLeft="map-outline"
                onPress={() => router.push('/(app)/map' as Href)}
                className="mt-3 self-start"
              />
            </AppCard>
          </>
        ) : null}

        {survey.status === 'failed' ? (
          <AppButton
            label="Edit and resubmit"
            iconRight="arrow-forward"
            onPress={() => router.push(`/(app)/surveys/wizard?id=${survey.id}` as Href)}
            fullWidth
            className="mt-2"
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

function Row({ label, value, highlight, last }: { label: string; value: string; highlight?: boolean; last?: boolean }) {
  return (
    <View
      className={['flex-row justify-between items-center py-2', !last ? 'border-b border-line-subtle' : ''].join(' ')}
    >
      <Text className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark">{label}</Text>
      <Text
        className={[
          'text-[13px] font-medium',
          highlight ? 'text-brand' : 'text-ink-primary-light dark:text-ink-primary-dark',
        ].join(' ')}
      >
        {value}
      </Text>
    </View>
  );
}
