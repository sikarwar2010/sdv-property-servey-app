import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppButton, AppCard, AppHeader, SectionLabel, Toast } from '@/src/components';
import { useSurveyStore } from '@/src/stores/survey';
import { useIsOnline } from '@/src/stores/network';
import { sqftToSqm, formatMobile } from '@/src/utils/format';
import {
  ownershipTypes,
  propertyTypes,
  propertyUses,
  relationships,
  roadTypes,
  sanitationTypes,
  solidWasteTypes,
  taxRateZones,
  usageTypes,
  waterSources,
} from '@/src/mocks/masters';

const labelFromOptions = (opts: { value: string; label: string }[], v: string) =>
  opts.find((o) => o.value === v)?.label ?? v;

export default function ReviewScreen() {
  const router = useRouter();
  const draft = useSurveyStore((s) => s.draft);
  const submit = useSurveyStore((s) => s.submitSurvey);
  const update = useSurveyStore((s) => s.updateDraft);
  const online = useIsOnline();
  const [toast, setToast] = useState(false);

  if (!draft) {
    return (
      <View className="flex-1 items-center justify-center bg-page-light">
        <Text className="text-body text-ink-secondary-light">No active draft.</Text>
      </View>
    );
  }

  const totalBuiltUp = draft.floors.reduce((acc, f) => acc + f.areaSqft, 0);
  const requiredPhotos = ['front', 'inside'] as const;
  const missingPhotos = requiredPhotos.filter((slot) => !draft.photos.some((p) => p.slot === slot));
  const canSubmit =
    draft.propertyNo &&
    draft.respondentName &&
    draft.mobileNo.length === 10 &&
    draft.houseNo &&
    draft.pinCode.length === 6 &&
    draft.plotSqft > 0 &&
    draft.gps &&
    missingPhotos.length === 0;

  const handleEdit = (toStep: number) => {
    update({ step: toStep });
    router.back();
  };

  const handleSubmit = () => {
    submit();
    setToast(true);
    setTimeout(() => router.replace('/(app)/dashboard'), 600);
  };

  return (
    <View className="flex-1 bg-page-light dark:bg-page-dark">
      <AppHeader title="Review & submit" subtitle="Check everything before submitting" />
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 120 }}>
        {!online ? (
          <View className="bg-warning-soft border border-warning/30 rounded-xl p-3 mb-3 flex-row items-start">
            <Ionicons name="cloud-offline" size={16} color="#92400E" />
            <Text className="flex-1 ml-2 text-caption text-warning-ink">
              You're offline. Submitting will queue for sync; the survey will upload when you're back online.
            </Text>
          </View>
        ) : null}

        <ReviewSection title="Property details" step={1} onEdit={handleEdit}>
          <RowLine label="Property no." value={draft.propertyNo || '—'} />
          <RowLine label="ULB" value={`${draft.ulbName} (${draft.ulbCode})`} />
          <RowLine label="Ward" value={draft.wardNo} />
          <RowLine label="In slum?" value={draft.isSlum ? 'Yes' : 'No'} last />
        </ReviewSection>

        <ReviewSection title="Owner & family" step={2} onEdit={handleEdit}>
          <RowLine label="Respondent" value={draft.respondentName || '—'} />
          <RowLine label="Relationship" value={labelFromOptions(relationships, draft.relationship)} />
          <RowLine label="Mobile" value={draft.mobileNo ? `+91 ${formatMobile(draft.mobileNo)}` : '—'} />
          <RowLine label="Family size" value={String(draft.family)} last />
        </ReviewSection>

        <ReviewSection title="Address" step={3} onEdit={handleEdit}>
          <RowLine label="House / street" value={[draft.houseNo, draft.streetName].filter(Boolean).join(', ') || '—'} />
          <RowLine label="Locality" value={draft.locality || '—'} />
          <RowLine label="City" value={draft.city || '—'} />
          <RowLine label="Pin code" value={draft.pinCode || '—'} last />
        </ReviewSection>

        <ReviewSection title="Taxation" step={4} onEdit={handleEdit}>
          <RowLine label="Tax zone" value={labelFromOptions(taxRateZones, draft.taxRateZone)} />
          <RowLine label="Ownership" value={labelFromOptions(ownershipTypes, draft.ownership)} />
          <RowLine label="Property type" value={labelFromOptions(propertyTypes, draft.propertyType)} />
          <RowLine label="Use" value={labelFromOptions(propertyUses, draft.propertyUse)} />
          <RowLine label="Road type" value={labelFromOptions(roadTypes, draft.roadType)} last />
        </ReviewSection>

        <ReviewSection title={`Area & floors (${draft.floors.length})`} step={5} onEdit={handleEdit}>
          <RowLine label="Plot" value={`${draft.plotSqft} sq ft · ${sqftToSqm(draft.plotSqft)} sq m`} />
          <RowLine label="Plinth" value={`${draft.plinthSqft} sq ft · ${sqftToSqm(draft.plinthSqft)} sq m`} />
          <RowLine label="Built-up" value={`${totalBuiltUp} sq ft`} highlight last={draft.floors.length === 0} />
          {draft.floors.map((f, i) => (
            <RowLine
              key={f.id}
              label={`Floor ${i + 1}`}
              value={`${f.floorName} · ${f.areaSqft} sq ft · ${labelFromOptions(usageTypes, f.usageType)}`}
              last={i === draft.floors.length - 1}
            />
          ))}
        </ReviewSection>

        <ReviewSection title="Services" step={6} onEdit={handleEdit}>
          <RowLine label="Water" value={labelFromOptions(waterSources, draft.waterSource)} />
          <RowLine label="Sanitation" value={labelFromOptions(sanitationTypes, draft.sanitation)} />
          <RowLine label="Solid waste" value={labelFromOptions(solidWasteTypes, draft.solidWaste)} />
          <RowLine label="Electricity" value={draft.electricityNo || '—'} last />
        </ReviewSection>

        <ReviewSection title="GIS coordinates" step={7} onEdit={handleEdit}>
          {draft.gps ? (
            <>
              <RowLine label="Latitude" value={`${draft.gps.latitude.toFixed(6)}°`} />
              <RowLine label="Longitude" value={`${draft.gps.longitude.toFixed(6)}°`} />
              <RowLine label="Accuracy" value={`±${Math.round(draft.gps.accuracyMeters)} m`} last />
            </>
          ) : (
            <RowLine label="GPS" value="Not captured" warn last />
          )}
        </ReviewSection>

        <ReviewSection title={`Photos (${draft.photos.length})`} step={8} onEdit={handleEdit}>
          <RowLine
            label="Front"
            value={draft.photos.find((p) => p.slot === 'front') ? '✓ Attached' : 'Missing'}
            warn={!draft.photos.find((p) => p.slot === 'front')}
          />
          <RowLine
            label="Inside"
            value={draft.photos.find((p) => p.slot === 'inside') ? '✓ Attached' : 'Missing'}
            warn={!draft.photos.find((p) => p.slot === 'inside')}
          />
          <RowLine label="Side" value={draft.photos.find((p) => p.slot === 'side') ? '✓ Attached' : 'Optional'} />
          <RowLine
            label="Document"
            value={draft.photos.find((p) => p.slot === 'document') ? '✓ Attached' : 'Optional'}
            last
          />
        </ReviewSection>

        {!canSubmit ? (
          <View className="bg-danger-soft border border-danger/30 rounded-xl p-3 mb-3 flex-row items-start">
            <Ionicons name="alert-circle" size={16} color="#DC2626" />
            <Text className="flex-1 ml-2 text-caption text-danger-ink">
              Some required fields are missing. Tap a section's edit icon to fix.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <View className="absolute left-0 right-0 bottom-0 bg-surface-light dark:bg-surface-dark border-t border-line-subtle p-3 flex-row gap-2">
        <AppButton label="Back" variant="outline" size="md" onPress={() => router.back()} className="px-4" />
        <AppButton
          label={online ? 'Submit survey' : 'Queue for sync'}
          iconRight={online ? 'checkmark' : 'cloud-upload-outline'}
          size="md"
          className="flex-1"
          onPress={handleSubmit}
          disabled={!canSubmit}
        />
      </View>

      <Toast
        visible={toast}
        title={online ? 'Survey submitted' : 'Queued for sync'}
        message={online ? 'Uploading to server' : 'Will upload when online'}
        tone="success"
        onHide={() => setToast(false)}
      />
    </View>
  );
}

function ReviewSection({
  title,
  step,
  onEdit,
  children,
}: {
  title: string;
  step: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-3">
      <View className="flex-row items-center justify-between mb-1.5">
        <SectionLabel className="mb-0">{title}</SectionLabel>
        <Pressable onPress={() => onEdit(step)} hitSlop={8} className="flex-row items-center">
          <Ionicons name="pencil-outline" size={12} color="#003B8E" />
          <Text className="text-caption font-medium text-brand ml-1">Edit</Text>
        </Pressable>
      </View>
      <AppCard padded={false}>{children}</AppCard>
    </View>
  );
}

function RowLine({
  label,
  value,
  highlight,
  warn,
  last,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  warn?: boolean;
  last?: boolean;
}) {
  return (
    <View
      className={[
        'flex-row justify-between items-center px-3.5 py-2.5',
        !last ? 'border-b border-line-subtle' : '',
      ].join(' ')}
    >
      <Text className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark">{label}</Text>
      <Text
        numberOfLines={1}
        className={[
          'max-w-[60%] text-right text-[13px]',
          highlight
            ? 'font-medium text-brand'
            : warn
              ? 'text-danger font-medium'
              : 'text-ink-primary-light dark:text-ink-primary-dark font-medium',
        ].join(' ')}
      >
        {value}
      </Text>
    </View>
  );
}
