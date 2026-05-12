import { useTheme } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function AppLayout() {
  const { theme } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.brand.primary,
        tabBarInactiveTintColor: theme.ink.disabled,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
        tabBarStyle: {
          backgroundColor: theme.bg.surface,
          borderTopColor: theme.border.subtle,
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="surveys"
        options={{
          title: 'Surveys',
          tabBarIcon: ({ color, size }) => <Ionicons name="document-text-outline" size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => <Ionicons name="map-outline" size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sync"
        options={{
          title: 'Sync',
          tabBarIcon: ({ color, size }) => <Ionicons name="sync-outline" size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size - 2} color={color} />,
        }}
      />
      {/* Hidden routes */}
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="offline" options={{ href: null }} />
      <Tabs.Screen name="search" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="help" options={{ href: null }} />
      <Tabs.Screen name="about" options={{ href: null }} />
      <Tabs.Screen name="masters" options={{ href: null }} />
      <Tabs.Screen name="activity" options={{ href: null }} />
      <Tabs.Screen name="reports" options={{ href: null }} />
      <Tabs.Screen name="photo-viewer" options={{ href: null }} />
      <Tabs.Screen name="surveys/new" options={{ href: null }} />
      <Tabs.Screen name="surveys/drafts" options={{ href: null }} />
      <Tabs.Screen name="surveys/wizard" options={{ href: null }} />
      <Tabs.Screen name="surveys/review" options={{ href: null }} />
      <Tabs.Screen name="surveys/qc" options={{ href: null }} />
      <Tabs.Screen name="surveys/[id]" options={{ href: null }} />
    </Tabs>
  );
}
