import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton, AppCard, AppHeader, Banner, SectionLabel } from '@/src/components';

const FAQS = [
  {
    q: 'My survey is stuck in Pending sync. What do I do?',
    a: 'Surveys auto-sync every 5 minutes when online. If a survey stays Pending for more than 10 minutes, open the Sync tab and tap Retry. If retries keep failing, check that you have data signal and the server is reachable.',
  },
  {
    q: 'Can I edit a survey after submitting?',
    a: 'Only if your supervisor returns it via QC remarks. Synced surveys cannot be modified directly — this preserves audit trail. Use the QC remarks screen to discuss changes.',
  },
  {
    q: 'How do I capture GPS without internet?',
    a: 'GPS uses satellite signals, not internet. Step out into a clear area and tap Capture GPS location. Accuracy under 10 m is recommended. Photos and form data save locally even without network.',
  },
  {
    q: 'How big can photos be?',
    a: 'Photos are auto-compressed to about 120 KB each. The app keeps the original locally until upload succeeds. Total storage per survey stays under 600 KB.',
  },
  {
    q: 'What if my phone runs out of battery mid-survey?',
    a: 'Drafts auto-save every 5 seconds. When you reopen the app, your draft is exactly where you left it. No data is lost.',
  },
  {
    q: 'Can I assign a property to a different ward?',
    a: 'Use the New survey screen to pick the correct ward at the start. If you picked wrong, save the draft, discard it from the Drafts list, and start fresh.',
  },
  {
    q: 'My supervisor returned a survey. Where do I see why?',
    a: 'Open the survey from the Surveys list (it will show Failed status) and tap to view the QC remarks thread. The supervisor will have tagged specific sections to revise.',
  },
];

export default function HelpScreen() {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <View className="flex-1 bg-page-light dark:bg-page-dark">
      <AppHeader title="Help & support" />
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 32 }}>
        <Banner
          tone="brand"
          title="Field support hotline"
          message="Call 1800-XXX-XXXX (9 AM – 6 PM, Mon–Sat) for urgent technical issues during survey work."
          icon="call"
        />

        <SectionLabel className="mt-4">Frequently asked</SectionLabel>
        {FAQS.map((faq, i) => {
          const open = expanded === i;
          return (
            <View key={i} className="bg-surface-light dark:bg-surface-dark rounded-xl border border-line-subtle mb-2">
              <Pressable onPress={() => setExpanded(open ? null : i)} className="flex-row items-start p-3.5">
                <View className="w-7 h-7 rounded-full bg-brand-soft items-center justify-center mr-3">
                  <Text className="text-[11px] font-medium text-brand">{i + 1}</Text>
                </View>
                <Text className="flex-1 text-[13px] font-medium text-ink-primary-light dark:text-ink-primary-dark">
                  {faq.q}
                </Text>
                <Ionicons
                  name={open ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#64748B"
                  style={{ marginLeft: 8 }}
                />
              </Pressable>
              {open ? (
                <View className="px-3.5 pb-3.5 pl-[58px]">
                  <Text className="text-helper text-ink-secondary-light dark:text-ink-secondary-dark leading-[18px]">
                    {faq.a}
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })}

        <SectionLabel className="mt-5">Contact</SectionLabel>
        <AppCard padded className="mb-2">
          <View className="gap-3">
            <ContactRow icon="mail" label="Email" value="support@sdvedutech.in" />
            <ContactRow icon="call" label="Phone" value="1800-XXX-XXXX" />
            <ContactRow icon="globe" label="Web" value="sdvedutech.in/support" />
          </View>
          <AppButton label="Email support" iconLeft="mail-outline" variant="outline" className="mt-4" fullWidth />
        </AppCard>
      </ScrollView>
    </View>
  );
}

function ContactRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center">
      <View className="w-9 h-9 rounded-full bg-brand-soft items-center justify-center">
        <Ionicons name={icon} size={16} color="#003B8E" />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark">{label}</Text>
        <Text className="text-[13px] font-medium text-ink-primary-light dark:text-ink-primary-dark">{value}</Text>
      </View>
    </View>
  );
}
