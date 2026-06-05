import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Shirt, Sparkles, FolderHeart, User } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          elevation: 8,
          shadowOpacity: 0.1,
          shadowRadius: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: theme.card,
          borderBottomColor: theme.border,
        },
        headerTitleStyle: {
          color: theme.text,
          fontSize: 18,
          fontWeight: '700',
        },
        headerShadowVisible: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Wardrobe',
          tabBarLabel: 'Wardrobe',
          tabBarIcon: ({ color, size }) => (
            <Shirt color={color} size={size ?? 24} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarLabel: 'Discover',
          tabBarIcon: ({ color, size }) => (
            <Sparkles color={color} size={size ?? 24} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="outfits"
        options={{
          title: 'Occasions',
          tabBarLabel: 'Occasions',
          tabBarIcon: ({ color, size }) => (
            <FolderHeart color={color} size={size ?? 24} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size ?? 24} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}

