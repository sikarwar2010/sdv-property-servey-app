import { AppButton, AppCard, AppDropdown, AppHeader } from '@/src/components';
import { surveyRepo } from '@/src/database/survey.repo';
import { assessmentYears, ulbs, wards } from '@/src/mocks/masters';
import { useAuthStore } from '@/src/stores/auth';
import { useSurveyStore } from '@/src/stores/survey';
import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

export default function NewSurveyScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const draft = useSurveyStore((s) => s.draft);
  const update = useSurveyStore((s) => s.updateDraft);
  const startDraft = useSurveyStore((s) => s.startDraft);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!draft) {
      startDraft();
    }
  }, [draft, startDraft]);

  // Auto-init draft if entered directly
  if (!draft) {
    return null;
  }
  const wardOptions = wards.filter((w) => w.ulbCode === draft.ulbCode).map((w) => ({ value: w.wardNo, label: w.name }));

  const handleContinue = async () => {
    if (!draft) return;
    if (!user) {
      Alert.alert('Sign in required', 'Log in to create a survey stored on this device.');
      return;
    }
    setBusy(true);
    try {
      if (!draft.wmSurveyId) {
        const row = await surveyRepo.createDraft(user.id);
        update({ wmSurveyId: row.id, id: row.localId });
      }
      const live = useSurveyStore.getState().draft;
      if (!live?.wmSurveyId) return;
      await surveyRepo.writeWizardDraft(live.wmSurveyId, { ...live, step: 1 });
      update({ step: 1 });
      router.push(`/(app)/surveys/wizard?id=${live.wmSurveyId}` as Href);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not create local survey record';
      Alert.alert('Save failed', message);
    } finally {
      setBusy(false);
    }
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
          {draft.ulbCode ? (
            <View className="mt-2.5 pt-2.5 border-t border-line-subtle">
              <Text className="text-[11px] uppercase tracking-wider font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-0.5">
                ULB code
              </Text>
              <Text className="text-body text-ink-primary-light dark:text-ink-primary-dark">{draft.ulbCode}</Text>
            </View>
          ) : null}
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

        <AppButton
          label="Continue"
          iconRight="arrow-forward"
          onPress={() => void handleContinue()}
          disabled={!draft.assessmentYear || !draft.ulbCode || !draft.wardNo || busy}
          loading={busy}
          fullWidth
          className="mt-2"
        />
      </ScrollView>
    </View>
  );
}
