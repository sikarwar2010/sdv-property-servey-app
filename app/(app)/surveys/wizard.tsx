import {
  AppButton,
  AppCard,
  AppDropdown,
  AppHeader,
  AppInput,
  ChipSelector,
  GisSatelliteMap,
  GPSButton,
  ImageUploader,
  NumberStepper,
  PropertyPhotosGisNoticeRow,
  SectionLabel,
  Toast,
} from '@/src/components';
import {
  constructionTypes,
  floors as floorOptions,
  individualTenancyTypes,
  ownershipTypes,
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
import { useSurveyStore, type DraftSurvey } from '@/src/stores/survey';
import type { FloorData, PhotoRef } from '@/src/types';
import { isValidMobile, isValidPin, sqftToSqmDetailed } from '@/src/utils/format';
import { surveyDraftToAddressContext } from '@/src/utils/property-geocode';
import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();

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

  const handleSave = async () => {
    await save();
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
        className="flex-1"
        style={{ flex: 1 }}
      >
        <View className="flex-1">
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              flexGrow: 1,
              padding: 14,
              paddingBottom: 20,
            }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            nestedScrollEnabled
          >
            {step === 1 ? <Step1 draft={draft} update={update} /> : null}
            {step === 2 ? <Step2 draft={draft} update={update} /> : null}
            {step === 3 ? <Step3 draft={draft} update={update} /> : null}
            {step === 4 ? <Step4 draft={draft} update={update} /> : null}
            {step === 5 ? <Step5 draft={draft} update={update} /> : null}
            {step === 6 ? <Step6 draft={draft} update={update} /> : null}
            {step === 7 ? <Step7 draft={draft} update={update} /> : null}
            {step === 8 ? <Step8 draft={draft} update={update} /> : null}
          </ScrollView>

          <View
            className="bg-surface-light dark:bg-surface-dark border-t border-line-subtle px-3 pt-3 gap-2"
            style={{ paddingBottom: Math.max(insets.bottom, 12) }}
          >
            <View className="flex-row gap-2">
              <AppButton
                label={step === 1 ? 'Cancel' : 'Back'}
                iconLeft={step === 1 ? undefined : 'chevron-back'}
                variant="outline"
                size="md"
                onPress={handleBack}
                className="px-4"
              />
              <AppButton
                label={step === 8 ? 'Review' : 'Next'}
                iconRight={step === 8 ? 'document-text-outline' : 'chevron-forward'}
                size="md"
                className="flex-1"
                onPress={handleNext}
              />
            </View>
            <AppButton
              label="Save draft"
              iconLeft="save-outline"
              variant="outline"
              size="md"
              fullWidth
              onPress={() => void handleSave()}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
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
            label="E-Nagarpalika Id"
            value={draft.eNagarpalikaId}
            onChangeText={(v) => update({ eNagarpalikaId: v })}
            placeholder="e.g. ENP-10294"
            iconLeft="id-card-outline"
          />
          <AppInput
            label="Parcel no."
            value={draft.parcelNo}
            onChangeText={(v) => update({ parcelNo: v })}
            placeholder="Parcel identifier"
            iconLeft="layers-outline"
          />
          <AppInput
            label="Property no."
            required
            value={draft.propertyNo}
            onChangeText={(v) => update({ propertyNo: v })}
            placeholder="PR-12-00482"
            iconLeft="barcode-outline"
          />
          <AppInput
            label="Sector number"
            value={draft.sectorNumber}
            onChangeText={(v) => update({ sectorNumber: v })}
            placeholder="e.g. 12-A"
            iconLeft="grid-outline"
          />
          <AppInput
            label="Constructed year"
            value={draft.constructedYear}
            onChangeText={(v) => update({ constructedYear: v.replace(/\D/g, '').slice(0, 4) })}
            placeholder="1995"
            keyboardType="number-pad"
            iconLeft="calendar-outline"
          />
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Text className="text-label uppercase tracking-wider font-medium text-ink-secondary-light mb-1.5">
                ULB
              </Text>
              <View className="bg-page-light dark:bg-page-dark/40 rounded-lg px-3 py-3 border border-line-subtle">
                <Text className="text-body text-ink-primary-light dark:text-ink-primary-dark" numberOfLines={2}>
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
          {draft.ulbCode ? (
            <View className="pt-0.5">
              <Text className="text-[11px] uppercase tracking-wider font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-0.5">
                ULB code
              </Text>
              <Text className="text-body text-ink-primary-light dark:text-ink-primary-dark">{draft.ulbCode}</Text>
            </View>
          ) : null}
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
  const altDigits = draft.alternateMobileNo.replace(/\D/g, '').slice(0, 10);
  const altConflict = altDigits.length === 10 && altDigits === draft.mobileNo;
  const altFormatOk = !altDigits || isValidMobile(altDigits);
  const altErrorText =
    altDigits.length > 0 && altDigits.length < 10
      ? 'Enter all 10 digits'
      : altDigits.length === 10 && !altFormatOk
        ? 'Enter a valid 10-digit mobile'
        : altConflict
          ? 'Must differ from primary mobile'
          : undefined;
  const altSuccessText = altDigits.length === 10 && altFormatOk && !altConflict ? 'Looks good' : undefined;

  return (
    <View>
      <AppCard padded className="mb-3">
        <View className="gap-3 mb-5">
          <AppInput
            label="Name of respondent"
            required
            value={draft.respondentName}
            onChangeText={(v) => update({ respondentName: v })}
            placeholder="Full name as told by respondent"
            iconLeft="person-outline"
          />
          <AppDropdown
            label="Relationship with owner"
            options={relationships}
            value={draft.relationship}
            onChange={(v) => update({ relationship: v })}
          />
          <View>
            <Text className="text-label uppercase tracking-wider font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-2">
              Number of family members
            </Text>
            <NumberStepper value={draft.family} onChange={(v) => update({ family: v })} min={1} max={50} />
          </View>
        </View>

        <View className="gap-3 mb-5">
          <AppInput
            label="Owner name"
            required
            value={draft.ownerName}
            onChangeText={(v) => update({ ownerName: v })}
            placeholder="Registered owner"
            iconLeft="shield-checkmark-outline"
          />
          <AppInput
            label="Father / husband name"
            required
            value={draft.fatherOrHusbandName}
            onChangeText={(v) => update({ fatherOrHusbandName: v })}
            placeholder="Father's or husband's name"
            iconLeft="people-outline"
          />
        </View>

        <View className="gap-3">
          <AppInput
            label="Mobile no."
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
          <AppInput
            label="Alternate mobile no."
            value={altDigits}
            onChangeText={(v) => update({ alternateMobileNo: v.replace(/\D/g, '').slice(0, 10) })}
            placeholder="Optional second number"
            keyboardType="phone-pad"
            iconLeft="phone-portrait-outline"
            prefix="+91"
            helper="Leave blank if not available"
            errorText={altErrorText}
            successText={altSuccessText}
          />
        </View>
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
        <Text className="text-helper text-ink-tertiary-light dark:text-ink-tertiary-dark mb-3 leading-5">
          Enter the address as used for post and official records. Fields marked required must be filled before you
          submit the survey.
        </Text>
        <View className="gap-3">
          <AppInput
            label="House no."
            required
            value={draft.houseNo}
            onChangeText={(v) => update({ houseNo: v })}
            placeholder="e.g. 142, B-7"
            iconLeft="home-outline"
            autoCapitalize="characters"
          />
          <AppInput
            label="Street name"
            required
            value={draft.streetName}
            onChangeText={(v) => update({ streetName: v })}
            placeholder="e.g. Krishna Nagar Road"
            iconLeft="navigate-outline"
          />
          <AppInput
            label="Locality"
            value={draft.locality}
            onChangeText={(v) => update({ locality: v })}
            placeholder="Area or neighbourhood"
            iconLeft="location-outline"
            helper="Ward, mohalla, or sector pocket if applicable"
          />
          <AppInput
            label="Colony"
            value={draft.colony}
            onChangeText={(v) => update({ colony: v })}
            placeholder="Housing colony or layout name"
            iconLeft="business-outline"
          />
          <View className="flex-row gap-2">
            <View className="flex-1">
              <AppInput
                label="City"
                required
                value={draft.city}
                onChangeText={(v) => update({ city: v })}
                placeholder="City"
                iconLeft="map-outline"
              />
            </View>
            <View className="flex-1">
              <AppInput
                label="Pin code"
                required
                value={draft.pinCode}
                onChangeText={(v) => update({ pinCode: v.replace(/\D/g, '').slice(0, 6) })}
                keyboardType="number-pad"
                placeholder="281001"
                iconLeft="mail-outline"
                errorText={!pinValid ? 'Enter 6 digits' : undefined}
                successText={pinValid && draft.pinCode.length === 6 ? 'Valid PIN' : undefined}
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
  const isIndividual = draft.ownershipType === 'individual';

  return (
    <View>
      <AppCard padded className="mb-3">
        <SectionLabel>Tax rate zone</SectionLabel>
        <AppDropdown options={taxRateZones} value={draft.taxRateZone} onChange={(v) => update({ taxRateZone: v })} />
      </AppCard>

      <AppCard padded className="mb-3">
        <SectionLabel>Ownership</SectionLabel>
        <AppDropdown
          options={ownershipTypes}
          value={draft.ownershipType}
          onChange={(v) =>
            update({
              ownershipType: v,
              individualTenancy: v === 'individual' ? draft.individualTenancy || 'single' : '',
            })
          }
        />
        {isIndividual ? (
          <View className="mt-3 pt-3 border-t border-line-subtle">
            <SectionLabel>Individual</SectionLabel>
            <Text className="text-helper text-ink-tertiary-light dark:text-ink-tertiary-dark mb-2.5 leading-5">
              Choose whether the property is held by a single owner or joint owners.
            </Text>
            <AppDropdown
              label="Single / joint"
              options={individualTenancyTypes}
              value={draft.individualTenancy}
              onChange={(v) => update({ individualTenancy: v })}
            />
          </View>
        ) : null}
      </AppCard>

      <AppCard padded className="mb-3">
        <SectionLabel>Property type & use</SectionLabel>
        <View className="gap-3">
          <AppDropdown
            label="Property type"
            options={propertyTypes}
            value={draft.propertyType}
            onChange={(v) => update({ propertyType: v })}
          />
          <AppDropdown
            label="Property use"
            options={propertyUses}
            value={draft.propertyUse}
            onChange={(v) => update({ propertyUse: v })}
          />
        </View>
      </AppCard>

      <AppCard padded className="mb-3">
        <SectionLabel>Road type</SectionLabel>
        <AppDropdown options={roadTypes} value={draft.roadType} onChange={(v) => update({ roadType: v })} />
      </AppCard>

      <AppCard padded>
        <SectionLabel>Situation</SectionLabel>
        <AppDropdown options={situations} value={draft.situation} onChange={(v) => update({ situation: v })} />
      </AppCard>
    </View>
  );
}

/* ============================================================================
   STEP 5 — Area & floors (dual sq ft / sq m + floor table)
   ========================================================================== */

function DualAreaPair({
  title,
  required,
  sqft,
  onChangeSqft,
  readOnly,
}: {
  title: string;
  required?: boolean;
  sqft: number;
  onChangeSqft?: (sqft: number) => void;
  readOnly?: boolean;
}) {
  const ro = Boolean(readOnly);
  const sqftStr = sqft ? String(sqft) : '';
  const sqmStr = sqftToSqmDetailed(sqft);
  return (
    <View className="mb-4">
      <Text className="text-[11px] uppercase tracking-wider font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-2">
        {title}
        {required ? <Text className="text-danger"> *</Text> : null}
      </Text>
      <View className="flex-row gap-2">
        <View className="flex-1">
          <AppInput
            value={sqftStr}
            onChangeText={ro ? () => {} : (v) => onChangeSqft?.(Number(v.replace(/\D/g, '')) || 0)}
            keyboardType="number-pad"
            placeholder="0"
            editable={!ro}
          />
          <Text className="text-[11px] text-ink-tertiary-light dark:text-ink-tertiary-dark mt-1">
            Unit (square feet)
          </Text>
        </View>
        <View className="flex-1">
          <AppInput value={sqmStr} editable={false} placeholder="0.0000" />
          <Text className="text-[11px] text-ink-tertiary-light dark:text-ink-tertiary-dark mt-1">
            Unit (square meter)
          </Text>
        </View>
      </View>
    </View>
  );
}

function Step5({ draft, update }: { draft: DraftSurvey; update: (p: Partial<DraftSurvey>) => void }) {
  const addFloor = useSurveyStore((s) => s.addFloor);
  const updateFloor = useSurveyStore((s) => s.updateFloor);
  const removeFloor = useSurveyStore((s) => s.removeFloor);

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

  const confirmRemoveFloor = (f: FloorData) => {
    Alert.alert('Remove floor', `Remove ${f.floorName} from the list?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeFloor(f.id) },
    ]);
  };

  const tableHeaderCls =
    'text-[10px] uppercase tracking-wide font-semibold text-ink-secondary-light dark:text-ink-secondary-dark';

  return (
    <View>
      <AppCard padded className="mb-3">
        <SectionLabel>Area detail</SectionLabel>
        <Text className="text-helper text-ink-tertiary-light dark:text-ink-tertiary-dark mb-4 leading-5">
          Enter plot and plinth in square feet; square metres update automatically. Add each floor, then confirm total
          built-up matches your measurements.
        </Text>

        <DualAreaPair title="Plot area" required sqft={draft.plotSqft} onChangeSqft={(v) => update({ plotSqft: v })} />

        <View className="border-t border-line-subtle pt-4 mt-1">
          <View className="flex-row items-start justify-between gap-3 mb-2">
            <Text className="flex-1 text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark leading-5">
              Note: Long press on a row to delete the row.
            </Text>
            <Pressable
              onPress={handleAddFloor}
              accessibilityRole="button"
              accessibilityLabel="Add floor"
              className="w-10 h-10 rounded-full bg-brand items-center justify-center shrink-0"
              hitSlop={6}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </Pressable>
          </View>

          <View className="rounded-lg bg-page-light dark:bg-page-dark/80 px-2 py-2 mb-3">
            <Text className={`${tableHeaderCls} text-center`}>Floor details</Text>
            <Text className="text-[10px] text-ink-tertiary-light dark:text-ink-tertiary-dark text-center mt-0.5">
              Floor no., area, usage, and construction per row
            </Text>
          </View>

          {draft.floors.length === 0 ? (
            <View className="rounded-xl border border-dashed border-line-subtle py-8 px-3 items-center mb-1">
              <Ionicons name="layers-outline" size={28} color="#94A3B8" />
              <Text className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark mt-2 text-center">
                No floors added yet. Tap + to add a floor row.
              </Text>
            </View>
          ) : (
            draft.floors.map((f) => (
              <Pressable
                key={f.id}
                onLongPress={() => confirmRemoveFloor(f)}
                delayLongPress={480}
                className="mb-2.5 active:opacity-90"
              >
                <View className="rounded-xl border border-line-subtle bg-surface-light dark:bg-surface-dark p-2.5 gap-3">
                  <View className="flex-row gap-2.5">
                    <View className="flex-1 min-w-0">
                      <AppDropdown
                        label="Floor no."
                        options={floorOptions}
                        value={f.floorNo}
                        onChange={(v) =>
                          updateFloor(f.id, {
                            floorNo: v,
                            floorName: floorOptions.find((o) => o.value === v)?.label ?? v,
                          })
                        }
                      />
                    </View>
                    <View className="flex-1 min-w-0">
                      <AppInput
                        label="Area (sq ft)"
                        value={f.areaSqft ? String(f.areaSqft) : ''}
                        onChangeText={(v) => updateFloor(f.id, { areaSqft: Number(v.replace(/\D/g, '')) || 0 })}
                        keyboardType="number-pad"
                        placeholder="0"
                      />
                      <Text className="text-[11px] text-ink-tertiary-light dark:text-ink-tertiary-dark mt-1">
                        Unit (square meter): {sqftToSqmDetailed(f.areaSqft)}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row gap-2.5">
                    <View className="flex-1 min-w-0">
                      <AppDropdown
                        label="Usage type"
                        options={usageTypes}
                        value={f.usageType}
                        onChange={(v) => updateFloor(f.id, { usageType: v })}
                      />
                    </View>
                    <View className="flex-1 min-w-0">
                      <AppDropdown
                        label="Construction"
                        options={constructionTypes}
                        value={f.constructionType}
                        onChange={(v) => updateFloor(f.id, { constructionType: v })}
                      />
                    </View>
                  </View>
                  <View>
                    <Text className="text-[10px] uppercase tracking-wider font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1.5">
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
              </Pressable>
            ))
          )}
        </View>

        <View className="border-t border-line-subtle pt-4 mt-2">
          <DualAreaPair title="Plinth area" sqft={draft.plinthSqft} onChangeSqft={(v) => update({ plinthSqft: v })} />
        </View>

        <View className="border-t border-line-subtle pt-4 mt-2">
          <DualAreaPair title="Total built-up area" sqft={totalBuiltUp} readOnly />
          <Text className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark mt-2">
            Sum of all floor areas ({draft.floors.length} floor{draft.floors.length === 1 ? '' : 's'}).
          </Text>
        </View>
      </AppCard>

      <View className="flex-row justify-end items-center px-0.5">
        <Text className="text-helper font-medium text-brand">Built-up subtotal: {totalBuiltUp} sq ft</Text>
      </View>
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
          <Text className="text-helper font-medium text-white">Stand at the property with a clear sky view</Text>
          <Text className="text-caption text-white/80 mt-0.5">
            The app samples GNSS for up to ~30 s and keeps the best fix. Handheld phones often reach about ±3–10 m in
            the open; true ±1 m needs survey-grade equipment.
          </Text>
        </View>
      </View>

      <AppCard padded className="mb-3">
        <SectionLabel>GIS Map (Satellite View)</SectionLabel>
        <Text className="text-caption text-ink-secondary-light dark:text-ink-secondary-dark mt-0.5 mb-1">
          Same style as the printed demand notice: aerial imagery with a red pin on the captured coordinates and a ring
          for reported accuracy. Use expand to open in Google Maps.
        </Text>
        <GisSatelliteMap
          capturedGps={draft.gps}
          addressContext={surveyDraftToAddressContext(draft)}
          variant="default"
          markerColor="notice"
        />
      </AppCard>

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
const PHOTO_SLOTS: PhotoRef['slot'][] = ['front', 'side'];

function Step8({ draft, update }: { draft: DraftSurvey; update: (p: Partial<DraftSurvey>) => void }) {
  const legacyStripDone = useRef(false);
  useEffect(() => {
    if (legacyStripDone.current) return;
    const next = draft.photos.filter((p) => PHOTO_SLOTS.includes(p.slot));
    if (next.length !== draft.photos.length) {
      update({ photos: next });
    }
    legacyStripDone.current = true;
  }, [draft.photos, update]);

  const handleAdd = (photo: PhotoRef) => {
    update({ photos: [...draft.photos.filter((p) => p.slot !== photo.slot), photo] });
  };
  const handleRemove = (id: string) => {
    update({ photos: draft.photos.filter((p) => p.id !== id) });
  };

  return (
    <View>
      <AppCard padded className="mb-3">
        <SectionLabel>Property photos</SectionLabel>
        <Text className="text-helper text-ink-tertiary-light dark:text-ink-tertiary-dark mb-2.5">
          Front view is required; side view is optional. Tap a slot, then use the camera or photo library. The preview
          matches the demand notice layout (photos beside the GIS satellite map).
        </Text>

        <View className="mb-3">
          <PropertyPhotosGisNoticeRow
            photos={draft.photos}
            capturedGps={draft.gps}
            addressContext={surveyDraftToAddressContext(draft)}
          />
        </View>

        <ImageUploader
          slots={[
            { slot: 'front', label: 'Front view', required: true },
            { slot: 'side', label: 'Side view' },
          ]}
          photos={draft.photos}
          onAdd={handleAdd}
          onRemove={handleRemove}
        />
      </AppCard>

      <View className="bg-info-soft border border-info/30 rounded-xl p-3 flex-row items-start">
        <Ionicons name="information-circle" size={16} color="#1E40AF" />
        <Text className="flex-1 ml-2 text-caption text-info-ink">
          Photos are compressed for upload when you sync. Remove a photo to retake or pick a different one. You can
          change them until you submit.
        </Text>
      </View>
    </View>
  );
}
