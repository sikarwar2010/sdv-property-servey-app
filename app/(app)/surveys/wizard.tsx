import {
  AppButton,
  AppCard,
  AppDropdown,
  AppHeader,
  AppInput,
  ChipSelector,
  FloatingSaveButton,
  GPSButton,
  ImageUploader,
  NumberStepper,
  SectionLabel,
  Toast,
} from '@/src/components';
import {
  constructionTypes,
  floors as floorOptions,
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
import { useSurveyStore, type DraftSurvey } from '@/src/stores/survey';
import type { FloorData, PhotoRef } from '@/src/types';
import { isValidMobile, isValidPin, sqftToSqm } from '@/src/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';

const STEP_TITLES = [
  'Property details',
  'Owner details',
  'Address',
  'Taxation',
  'Area & floors',
  'Services',
  'GIS coordinates',
  'Photos',
];

export default function WizardScreen() {
  const router = useRouter();
  const draft = useSurveyStore((s) => s.draft);
  const update = useSurveyStore((s) => s.updateDraft);
  const save = useSurveyStore((s) => s.saveDraft);
  const cancel = useSurveyStore((s) => s.cancelDraft);

  const [toastVisible, setToastVisible] = useState(false);

  if (!draft) {
    return (
      <View className="flex-1 items-center justify-center bg-page-light">
        <Text className="text-body text-ink-secondary-light">No active draft.</Text>
        <AppButton label="Start new" onPress={() => router.replace('/(app)/surveys/new')} className="mt-4" />
      </View>
    );
  }

  const step = draft.step;
  const handleNext = () => {
    if (step < 8) {
      update({ step: step + 1 });
    } else {
      router.push('/(app)/surveys/review' as Href);
    }
  };

  const handleBack = () => {
    if (step > 1) update({ step: step - 1 });
    else router.back();
  };

  const handleSave = () => {
    save();
    setToastVisible(true);
  };

  const handleCancel = () => {
    cancel();
    router.replace('/(app)/dashboard');
  };

  return (
    <View className="flex-1 bg-page-light dark:bg-page-dark">
      <AppHeader
        title={STEP_TITLES[step - 1] ?? 'Survey'}
        subtitle={`Survey · ${draft.propertyNo || 'New'}`}
        step={{ current: step, total: 8 }}
        rightSlot={
          <Pressable onPress={handleCancel} hitSlop={8}>
            <Ionicons name="close" size={22} color="#0F172A" />
          </Pressable>
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 140 }} keyboardShouldPersistTaps="handled">
          {step === 1 ? <Step1 draft={draft} update={update} /> : null}
          {step === 2 ? <Step2 draft={draft} update={update} /> : null}
          {step === 3 ? <Step3 draft={draft} update={update} /> : null}
          {step === 4 ? <Step4 draft={draft} update={update} /> : null}
          {step === 5 ? <Step5 draft={draft} update={update} /> : null}
          {step === 6 ? <Step6 draft={draft} update={update} /> : null}
          {step === 7 ? <Step7 draft={draft} update={update} /> : null}
          {step === 8 ? <Step8 draft={draft} update={update} /> : null}
        </ScrollView>

        <View className="absolute left-0 right-0 bottom-0 bg-surface-light dark:bg-surface-dark border-t border-line-subtle p-3 flex-row gap-2">
          <AppButton
            label={step === 1 ? 'Cancel' : 'Back'}
            iconLeft={step === 1 ? undefined : 'chevron-back'}
            variant="outline"
            size="md"
            onPress={handleBack}
            className="px-4"
          />
          <AppButton
            label={step === 8 ? 'Review & submit' : 'Next'}
            iconRight={step === 8 ? 'checkmark' : 'chevron-forward'}
            size="md"
            className="flex-1"
            onPress={handleNext}
          />
        </View>
      </KeyboardAvoidingView>

      <FloatingSaveButton onPress={handleSave} />
      <Toast
        visible={toastVisible}
        title="Draft saved"
        message="Auto-syncs when online"
        tone="success"
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
}

/* ============================================================================
   STEP 1 — Property details
   ========================================================================== */
function Step1({ draft, update }: { draft: DraftSurvey; update: (p: Partial<DraftSurvey>) => void }) {
  return (
    <View>
      <AppCard padded className="mb-3">
        <SectionLabel>Identification</SectionLabel>
        <View className="gap-3">
          <AppInput
            label="Property number"
            required
            value={draft.propertyNo}
            onChangeText={(v) => update({ propertyNo: v })}
            placeholder="PR-12-00482"
            iconLeft="barcode-outline"
          />
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Text className="text-label uppercase tracking-wider font-medium text-ink-secondary-light mb-1.5">
                ULB
              </Text>
              <View className="bg-page-light dark:bg-page-dark/40 rounded-lg px-3 py-3 border border-line-subtle">
                <Text className="text-body text-ink-primary-light dark:text-ink-primary-dark" numberOfLines={1}>
                  {draft.ulbName}
                </Text>
              </View>
            </View>
            <View className="w-24">
              <Text className="text-label uppercase tracking-wider font-medium text-ink-secondary-light mb-1.5">
                Ward
              </Text>
              <View className="bg-page-light dark:bg-page-dark/40 rounded-lg px-3 py-3 border border-line-subtle">
                <Text className="text-body text-ink-primary-light dark:text-ink-primary-dark">{draft.wardNo}</Text>
              </View>
            </View>
          </View>
        </View>
      </AppCard>

      <AppCard padded>
        <SectionLabel>Classification</SectionLabel>
        <View className="gap-3">
          <View>
            <Text className="text-label uppercase tracking-wider font-medium text-ink-secondary-light mb-2">
              Is this property in a slum area?
            </Text>
            <ChipSelector<'yes' | 'no'>
              options={[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ]}
              value={draft.isSlum ? 'yes' : 'no'}
              onChange={(v) => update({ isSlum: v === 'yes' })}
            />
          </View>
        </View>
      </AppCard>
    </View>
  );
}

/* ============================================================================
   STEP 2 — Owner details
   ========================================================================== */
function Step2({ draft, update }: { draft: DraftSurvey; update: (p: Partial<DraftSurvey>) => void }) {
  const mobileValid = !draft.mobileNo || isValidMobile(draft.mobileNo);
  return (
    <View>
      <AppCard padded className="mb-3">
        <SectionLabel>Respondent</SectionLabel>
        <View className="gap-3">
          <AppInput
            label="Respondent name"
            required
            value={draft.respondentName}
            onChangeText={(v) => update({ respondentName: v })}
            placeholder="Full name"
            iconLeft="person-outline"
          />
          <AppDropdown
            label="Relationship with owner"
            options={relationships}
            value={draft.relationship}
            onChange={(v) => update({ relationship: v })}
          />
          <AppInput
            label="Mobile number"
            required
            value={draft.mobileNo}
            onChangeText={(v) => update({ mobileNo: v.replace(/\D/g, '').slice(0, 10) })}
            placeholder="10-digit number"
            keyboardType="phone-pad"
            iconLeft="call-outline"
            prefix="+91"
            errorText={!mobileValid ? 'Enter a valid 10-digit mobile' : undefined}
            successText={mobileValid && draft.mobileNo.length === 10 ? 'Looks good' : undefined}
          />
        </View>
      </AppCard>

      <AppCard padded>
        <SectionLabel>Family</SectionLabel>
        <Text className="text-helper text-ink-tertiary-light mb-2">Number of members</Text>
        <NumberStepper value={draft.family} onChange={(v) => update({ family: v })} min={0} max={50} />
      </AppCard>
    </View>
  );
}

/* ============================================================================
   STEP 3 — Address
   ========================================================================== */
function Step3({ draft, update }: { draft: DraftSurvey; update: (p: Partial<DraftSurvey>) => void }) {
  const pinValid = !draft.pinCode || isValidPin(draft.pinCode);
  return (
    <View>
      <AppCard padded className="mb-3">
        <SectionLabel>Postal address</SectionLabel>
        <View className="gap-3">
          <View className="flex-row gap-2">
            <View className="flex-1">
              <AppInput
                label="House no."
                required
                value={draft.houseNo}
                onChangeText={(v) => update({ houseNo: v })}
                placeholder="142"
              />
            </View>
            <View className="flex-[2]">
              <AppInput
                label="Street"
                value={draft.streetName}
                onChangeText={(v) => update({ streetName: v })}
                placeholder="Krishna Nagar Road"
              />
            </View>
          </View>
          <AppInput
            label="Locality / colony"
            value={draft.locality}
            onChangeText={(v) => update({ locality: v })}
            placeholder="Govind Vihar"
          />
          <View className="flex-row gap-2">
            <View className="flex-1">
              <AppInput label="City" value={draft.city} onChangeText={(v) => update({ city: v })} />
            </View>
            <View className="flex-1">
              <AppInput
                label="Pin code"
                required
                value={draft.pinCode}
                onChangeText={(v) => update({ pinCode: v.replace(/\D/g, '').slice(0, 6) })}
                keyboardType="number-pad"
                placeholder="281001"
                errorText={!pinValid ? 'Enter 6 digits' : undefined}
              />
            </View>
          </View>
        </View>
      </AppCard>
    </View>
  );
}

/* ============================================================================
   STEP 4 — Taxation
   ========================================================================== */
function Step4({ draft, update }: { draft: DraftSurvey; update: (p: Partial<DraftSurvey>) => void }) {
  return (
    <View>
      <AppCard padded className="mb-3">
        <SectionLabel>Tax zone</SectionLabel>
        <AppDropdown options={taxRateZones} value={draft.taxRateZone} onChange={(v) => update({ taxRateZone: v })} />
      </AppCard>

      <AppCard padded className="mb-3">
        <SectionLabel>Ownership</SectionLabel>
        <AppDropdown options={ownershipTypes} value={draft.ownership} onChange={(v) => update({ ownership: v })} />
      </AppCard>

      <AppCard padded className="mb-3">
        <SectionLabel>Property type & use</SectionLabel>
        <View className="gap-3">
          <AppDropdown
            label="Type"
            options={propertyTypes}
            value={draft.propertyType}
            onChange={(v) => update({ propertyType: v })}
          />
          <AppDropdown
            label="Use"
            options={propertyUses}
            value={draft.propertyUse}
            onChange={(v) => update({ propertyUse: v })}
          />
        </View>
      </AppCard>

      <AppCard padded>
        <SectionLabel>Road type</SectionLabel>
        <AppDropdown options={roadTypes} value={draft.roadType} onChange={(v) => update({ roadType: v })} />
      </AppCard>
    </View>
  );
}

/* ============================================================================
   STEP 5 — Area & floors
   ========================================================================== */
function Step5({ draft, update }: { draft: DraftSurvey; update: (p: Partial<DraftSurvey>) => void }) {
  const addFloor = useSurveyStore((s) => s.addFloor);
  const updateFloor = useSurveyStore((s) => s.updateFloor);
  const removeFloor = useSurveyStore((s) => s.removeFloor);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalBuiltUp = draft.floors.reduce((acc, f) => acc + f.areaSqft, 0);

  const handleAddFloor = () => {
    const next: Omit<FloorData, 'id'> = {
      floorNo: 'ground',
      floorName: 'Ground',
      areaSqft: 0,
      usageType: 'self_resi',
      constructionType: 'rcc',
      isOccupied: true,
    };
    addFloor(next);
  };

  return (
    <View>
      <AppCard padded className="mb-3">
        <SectionLabel>Plot & plinth</SectionLabel>
        <View className="gap-3">
          <AppInput
            label="Plot area (sq ft)"
            required
            value={draft.plotSqft ? String(draft.plotSqft) : ''}
            onChangeText={(v) => update({ plotSqft: Number(v.replace(/\D/g, '')) || 0 })}
            keyboardType="number-pad"
            placeholder="0"
            helper={draft.plotSqft ? `≈ ${sqftToSqm(draft.plotSqft)} sq m` : undefined}
          />
          <AppInput
            label="Plinth area (sq ft)"
            value={draft.plinthSqft ? String(draft.plinthSqft) : ''}
            onChangeText={(v) => update({ plinthSqft: Number(v.replace(/\D/g, '')) || 0 })}
            keyboardType="number-pad"
            placeholder="0"
            helper={draft.plinthSqft ? `≈ ${sqftToSqm(draft.plinthSqft)} sq m` : undefined}
          />
        </View>
      </AppCard>

      <View className="flex-row justify-between items-center mb-2 mt-1">
        <Text className="text-body font-medium text-ink-primary-light dark:text-ink-primary-dark">
          Floors ({draft.floors.length})
        </Text>
        <Text className="text-helper font-medium text-brand">Built-up: {totalBuiltUp} sq ft</Text>
      </View>

      {draft.floors.map((f, idx) => {
        const expanded = expandedId === f.id;
        return (
          <AppCard padded={false} key={f.id} className="mb-2">
            <Pressable onPress={() => setExpandedId(expanded ? null : f.id)} className="flex-row items-center p-3">
              <View className="w-7 h-7 rounded-full bg-brand-soft items-center justify-center">
                <Text className="text-[11px] font-medium text-brand">F{idx + 1}</Text>
              </View>
              <View className="flex-1 ml-2.5">
                <Text className="text-[13px] font-medium text-ink-primary-light dark:text-ink-primary-dark">
                  {f.floorName} · {f.areaSqft} sq ft
                </Text>
                <Text className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark">
                  {usageTypes.find((u) => u.value === f.usageType)?.label ?? '—'} ·{' '}
                  {constructionTypes.find((c) => c.value === f.constructionType)?.label ?? '—'}
                </Text>
              </View>
              <Pressable onPress={() => removeFloor(f.id)} hitSlop={8} className="mr-1">
                <Ionicons name="trash-outline" size={16} color="#DC2626" />
              </Pressable>
              <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color="#64748B" />
            </Pressable>
            {expanded ? (
              <View className="px-3 pb-3 gap-3 border-t border-line-subtle pt-3">
                <AppDropdown
                  label="Floor"
                  options={floorOptions}
                  value={f.floorNo}
                  onChange={(v) =>
                    updateFloor(f.id, {
                      floorNo: v,
                      floorName: floorOptions.find((o) => o.value === v)?.label ?? v,
                    })
                  }
                />
                <AppInput
                  label="Floor area (sq ft)"
                  value={f.areaSqft ? String(f.areaSqft) : ''}
                  onChangeText={(v) => updateFloor(f.id, { areaSqft: Number(v.replace(/\D/g, '')) || 0 })}
                  keyboardType="number-pad"
                  placeholder="0"
                  helper={f.areaSqft ? `≈ ${sqftToSqm(f.areaSqft)} sq m` : undefined}
                />
                <AppDropdown
                  label="Usage type"
                  options={usageTypes}
                  value={f.usageType}
                  onChange={(v) => updateFloor(f.id, { usageType: v })}
                />
                <AppDropdown
                  label="Construction type"
                  options={constructionTypes}
                  value={f.constructionType}
                  onChange={(v) => updateFloor(f.id, { constructionType: v })}
                />
                <View>
                  <Text className="text-label uppercase tracking-wider font-medium text-ink-secondary-light mb-2">
                    Occupied?
                  </Text>
                  <ChipSelector<'yes' | 'no'>
                    options={[
                      { value: 'yes', label: 'Occupied' },
                      { value: 'no', label: 'Vacant' },
                    ]}
                    value={f.isOccupied ? 'yes' : 'no'}
                    onChange={(v) => updateFloor(f.id, { isOccupied: v === 'yes' })}
                  />
                </View>
              </View>
            ) : null}
          </AppCard>
        );
      })}

      <AppButton
        label="Add floor"
        variant="outline"
        iconLeft="add"
        onPress={handleAddFloor}
        fullWidth
        size="md"
        className="mt-1"
      />
    </View>
  );
}

/* ============================================================================
   STEP 6 — Services
   ========================================================================== */
function Step6({ draft, update }: { draft: DraftSurvey; update: (p: Partial<DraftSurvey>) => void }) {
  return (
    <View>
      <AppCard padded className="mb-3">
        <SectionLabel>Water supply</SectionLabel>
        <AppDropdown options={waterSources} value={draft.waterSource} onChange={(v) => update({ waterSource: v })} />
      </AppCard>

      <AppCard padded className="mb-3">
        <SectionLabel>Sanitation</SectionLabel>
        <AppDropdown options={sanitationTypes} value={draft.sanitation} onChange={(v) => update({ sanitation: v })} />
      </AppCard>

      <AppCard padded className="mb-3">
        <SectionLabel>Solid waste</SectionLabel>
        <AppDropdown options={solidWasteTypes} value={draft.solidWaste} onChange={(v) => update({ solidWaste: v })} />
      </AppCard>

      <AppCard padded>
        <SectionLabel>Electricity</SectionLabel>
        <AppInput
          label="Connection / consumer no."
          value={draft.electricityNo}
          onChangeText={(v) => update({ electricityNo: v })}
          placeholder="e.g. UPCL-43-09421"
          iconLeft="flash-outline"
          helper="Optional — used for cross-verification"
        />
      </AppCard>
    </View>
  );
}

/* ============================================================================
   STEP 7 — GIS coordinates
   ========================================================================== */
function Step7({ draft, update }: { draft: DraftSurvey; update: (p: Partial<DraftSurvey>) => void }) {
  return (
    <View>
      <View className="bg-brand rounded-xl p-4 mb-4 flex-row items-start">
        <View className="w-9 h-9 rounded-full bg-white/15 items-center justify-center">
          <Ionicons name="map-outline" size={18} color="#FFFFFF" />
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-helper font-medium text-white">Stand right next to the property</Text>
          <Text className="text-caption text-white/80 mt-0.5">
            Best accuracy when you're outdoors with a clear sky view.
          </Text>
        </View>
      </View>

      <AppCard padded>
        <SectionLabel>GPS coordinates</SectionLabel>
        <GPSButton value={draft.gps} onChange={(v) => update({ gps: v })} />
      </AppCard>
    </View>
  );
}

/* ============================================================================
   STEP 8 — Photos
   ========================================================================== */
function Step8({ draft, update }: { draft: DraftSurvey; update: (p: Partial<DraftSurvey>) => void }) {
  const handleAdd = (photo: PhotoRef) => {
    update({ photos: [...draft.photos, photo] });
  };
  const handleRemove = (id: string) => {
    update({ photos: draft.photos.filter((p) => p.id !== id) });
  };

  return (
    <View>
      <AppCard padded className="mb-3">
        <SectionLabel>Property photos</SectionLabel>
        <Text className="text-helper text-ink-tertiary-light dark:text-ink-tertiary-dark mb-2.5">
          Front and inside are required. Side and document are optional.
        </Text>
        <ImageUploader
          slots={[
            { slot: 'front', label: 'Front view', required: true },
            { slot: 'inside', label: 'Inside', required: true },
            { slot: 'side', label: 'Side view' },
            { slot: 'document', label: 'Document' },
          ]}
          photos={draft.photos}
          onAdd={handleAdd}
          onRemove={handleRemove}
        />
      </AppCard>

      <View className="bg-info-soft border border-info/30 rounded-xl p-3 flex-row items-start">
        <Ionicons name="information-circle" size={16} color="#1E40AF" />
        <Text className="flex-1 ml-2 text-caption text-info-ink">
          Photos are compressed to ~120 KB each and uploaded when you sync. You can edit or replace them before
          submitting.
        </Text>
      </View>
    </View>
  );
}
