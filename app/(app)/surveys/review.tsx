import { AppButton, AppCard, AppHeader, PropertyPhotosGisNoticeRow, SectionLabel, Toast } from '@/src/components';
import {
    formatOwnershipDisplay,
    propertyTypes,
    propertyUses,
    relationships,
    roadTypes,
    sanitationTypes,
    situations,
    solidWasteTypes,
    taxRateZones,
    usageTypes,
    waterSources,
} from '@/src/mocks/masters';
import { useIsOnline } from '@/src/stores/network';
import { useSurveyStore } from '@/src/stores/survey';
import { formatMobile, isValidMobile, sqftToSqm } from '@/src/utils/format';
import { surveyDraftToAddressContext } from '@/src/utils/property-geocode';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

const labelFromOptions = (opts: { value: string; label: string }[], v: string) =>
  opts.find((o) => o.value === v)?.label ?? v;

export default function ReviewScreen() {
  const router = useRouter();
  const draft = useSurveyStore((s) => s.draft);
  const submit = useSurveyStore((s) => s.submitSurvey);
  const update = useSurveyStore((s) => s.updateDraft);
  const online = useIsOnline();
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastError, setToastError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!draft) {
    return (
      <View className="flex-1 items-center justify-center bg-page-light">
        <Text className="text-body text-ink-secondary-light">No active draft.</Text>
      </View>
    );
  }

  const totalBuiltUp = draft.floors.reduce((acc, f) => acc + f.areaSqft, 0);
  const requiredPhotos = ['front'] as const;
  const missingPhotos = requiredPhotos.filter((slot) => !draft.photos.some((p) => p.slot === slot));
  const alt = draft.alternateMobileNo ?? '';
  const alternateOk = alt.length === 0 || (alt.length === 10 && isValidMobile(alt) && alt !== draft.mobileNo);
  const canSubmit =
    Boolean(draft.wmSurveyId) &&
    Boolean(draft.propertyNo?.trim()) &&
    Boolean(draft.respondentName?.trim()) &&
    Boolean(draft.ownerName?.trim()) &&
    Boolean(draft.fatherOrHusbandName?.trim()) &&
    draft.mobileNo.length === 10 &&
    isValidMobile(draft.mobileNo) &&
    alternateOk &&
    Boolean(draft.houseNo?.trim()) &&
    Boolean(draft.streetName?.trim()) &&
    draft.pinCode.length === 6 &&
    Boolean(draft.city?.trim()) &&
    draft.plotSqft > 0 &&
    draft.gps &&
    missingPhotos.length === 0;

  const handleEdit = (toStep: number) => {
    update({ step: toStep });
    router.back();
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setToastError(null);
    const outcome = await submit();
    setSubmitting(false);
    if (!outcome.ok) {
      setToastError(outcome.message);
      return;
    }
    setToastMessage(outcome.message);
    setToast(true);
    setTimeout(() => router.replace(outcome.mode === 'queued' ? '/(app)/sync' : '/(app)/dashboard'), 900);
  };

  return (
    <View className="flex-1 bg-page-light dark:bg-page-dark">
      <AppHeader
        title="Review"
        subtitle={online ? 'Submit saves on device and sends to server' : 'Submit saves on device — sync when online'}
      />
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 120 }}>
        {!draft.wmSurveyId ? (
          <View className="bg-danger-soft border border-danger/30 rounded-xl p-3 mb-3 flex-row items-start">
            <Ionicons name="alert-circle" size={16} color="#DC2626" />
            <Text className="flex-1 ml-2 text-caption text-danger-ink">
              Saving on device… go back to Home → New property survey and wait a moment, then try again.
            </Text>
          </View>
        ) : null}

        {!online ? (
          <View className="bg-warning-soft border border-warning/30 rounded-xl p-3 mb-3 flex-row items-start">
            <Ionicons name="cloud-offline" size={16} color="#92400E" />
            <Text className="flex-1 ml-2 text-caption text-warning-ink">
              You're offline. Submitting will queue for sync; the survey will upload when you're back online.
            </Text>
          </View>
        ) : null}

        <ReviewSection title="Property details" step={1} onEdit={handleEdit}>
          <RowLine label="E-Nagarpalika Id" value={draft.eNagarpalikaId || '—'} />
          <RowLine label="Parcel no." value={draft.parcelNo || '—'} />
          <RowLine label="Property no." value={draft.propertyNo || '—'} />
          <RowLine label="Sector number" value={draft.sectorNumber || '—'} />
          <RowLine label="Constructed year" value={draft.constructedYear || '—'} />
          <RowLine label="ULB" value={`${draft.ulbName} (${draft.ulbCode})`} />
          <RowLine label="Ward" value={draft.wardNo} last />
        </ReviewSection>

        <ReviewSection title="Owner details" step={2} onEdit={handleEdit}>
          <RowLine label="Name of respondent" value={draft.respondentName || '—'} />
          <RowLine label="Relationship with owner" value={labelFromOptions(relationships, draft.relationship)} />
          <RowLine label="Family members" value={String(draft.family)} />
          <RowLine label="Owner name" value={draft.ownerName || '—'} />
          <RowLine label="Father / husband name" value={draft.fatherOrHusbandName || '—'} />
          <RowLine label="Mobile no." value={draft.mobileNo ? `+91 ${formatMobile(draft.mobileNo)}` : '—'} />
          <RowLine
            label="Alternate mobile"
            value={draft.alternateMobileNo ? `+91 ${formatMobile(draft.alternateMobileNo)}` : '—'}
            warn={alt.length > 0 && !alternateOk}
            last
          />
        </ReviewSection>

        <ReviewSection title="Address" step={3} onEdit={handleEdit}>
          <RowLine label="House no." value={draft.houseNo || '—'} />
          <RowLine label="Street name" value={draft.streetName || '—'} />
          <RowLine label="Locality" value={draft.locality || '—'} />
          <RowLine label="Colony" value={draft.colony || '—'} />
          <RowLine label="City" value={draft.city || '—'} />
          <RowLine label="Pin code" value={draft.pinCode || '—'} last />
        </ReviewSection>

        <ReviewSection title="Taxation" step={4} onEdit={handleEdit}>
          <RowLine label="Tax rate zone" value={labelFromOptions(taxRateZones, draft.taxRateZone)} />
          <RowLine label="Ownership" value={formatOwnershipDisplay(draft.ownershipType, draft.individualTenancy)} />
          <RowLine label="Property type" value={labelFromOptions(propertyTypes, draft.propertyType)} />
          <RowLine label="Property use" value={labelFromOptions(propertyUses, draft.propertyUse)} />
          <RowLine label="Road type" value={labelFromOptions(roadTypes, draft.roadType)} />
          <RowLine label="Situation" value={labelFromOptions(situations, draft.situation)} last />
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

        <ReviewSection title={`Photos & GIS map (${draft.photos.length})`} step={8} onEdit={handleEdit}>
          <View className="px-3 pt-3 border-b border-line-subtle">
            <PropertyPhotosGisNoticeRow
              photos={draft.photos}
              capturedGps={draft.gps}
              addressContext={surveyDraftToAddressContext(draft)}
            />
          </View>
          <RowLine
            label="Front"
            value={draft.photos.find((p) => p.slot === 'front') ? '✓ Attached' : 'Missing'}
            warn={!draft.photos.find((p) => p.slot === 'front')}
          />
          <RowLine label="Side" value={draft.photos.find((p) => p.slot === 'side') ? '✓ Attached' : 'Optional'} last />
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
          onPress={() => void handleSubmit()}
          disabled={!canSubmit || submitting}
          loading={submitting}
        />
      </View>

      <Toast
        visible={toast}
        title="Done"
        message={toastMessage}
        tone="success"
        onHide={() => setToast(false)}
      />
      <Toast
        visible={Boolean(toastError)}
        title="Submit failed"
        message={toastError ?? ''}
        tone="danger"
        onHide={() => setToastError(null)}
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
