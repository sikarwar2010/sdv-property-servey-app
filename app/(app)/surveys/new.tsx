import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Href, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppButton, AppCard, AppDropdown, AppHeader, AppInput } from '@/src/components';
import { useSurveyStore } from '@/src/stores/survey';
import { assessmentYears, ulbs, wards } from '@/src/mocks/masters';


export default function NewSurveyScreen() {
  const router = useRouter();
  const draft = useSurveyStore((s) => s.draft);
  const update = useSurveyStore((s) => s.updateDraft);
  const startDraft = useSurveyStore((s) => s.startDraft);

  // Auto-init draft if entered directly
  if (!draft) {
    startDraft();
    return null;
  }

  const [propertyNo, setPropertyNo] = useState(draft.propertyNo);
  const wardOptions = wards.filter((w) => w.ulbCode === draft.ulbCode).map((w) => ({ value: w.wardNo, label: w.name }));

  const handleContinue = () => {
    update({ propertyNo, step: 1 });
    router.push('/(app)/surveys/wizard' as Href);
  };

  return (
    <View className="flex-1 bg-page-light dark:bg-page-dark">
      <AppHeader title="New survey" subtitle="Step 0 of 8 · Context" />
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 120 }}>
        <View className="bg-brand rounded-xl p-4 mb-4 flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-white/15 items-center justify-center">
            <Ionicons name="information-circle-outline" size={20} color="#FFFFFF" />
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-helper font-medium text-white">Set context for the survey</Text>
            <Text className="text-caption text-white/80 mt-0.5">Pick assessment year, ULB and ward to begin.</Text>
          </View>
        </View>

        <AppCard padded className="mb-3">
          <AppDropdown
            label="Assessment year"
            required
            options={assessmentYears}
            value={draft.assessmentYear}
            onChange={(v) => update({ assessmentYear: v })}
          />
        </AppCard>

        <AppCard padded className="mb-3">
          <AppDropdown
            label="ULB"
            required
            options={ulbs.map((u) => ({ value: u.code, label: u.name }))}
            value={draft.ulbCode}
            onChange={(code) => {
              const u = ulbs.find((x) => x.code === code);
              update({ ulbCode: code, ulbName: u?.name ?? '', wardNo: '' });
            }}
          />
        </AppCard>

        <AppCard padded className="mb-3">
          <AppDropdown
            label="Ward"
            required
            options={wardOptions}
            value={draft.wardNo}
            onChange={(v) => update({ wardNo: v })}
            searchPlaceholder="Search ward…"
          />
        </AppCard>

        <AppCard padded className="mb-3">
          <AppInput
            label="Property no. (optional)"
            placeholder="e.g. PR-12-00482"
            value={propertyNo}
            onChangeText={setPropertyNo}
            iconLeft="barcode-outline"
            iconRight="qr-code-outline"
            onPressRightIcon={() => undefined}
            helper="Scan QR or auto-generate on save"
          />
        </AppCard>

        <AppButton
          label="Continue"
          iconRight="arrow-forward"
          onPress={handleContinue}
          disabled={!draft.assessmentYear || !draft.ulbCode || !draft.wardNo}
          fullWidth
          className="mt-2"
        />
      </ScrollView>
    </View>
  );
}
