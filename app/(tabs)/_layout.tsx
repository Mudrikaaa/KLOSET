import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingBag, WandSparkles, FolderHeart, User } from 'lucide-react-native';

import { Crimson, Fonts } from '@/constants/Colors';

// Crimson redesign nav (KlosetNav.dc.html): dark glass bar, active #f9314f,
// inactive 50% white, 22px icons, tiny bold labels.
export default function TabLayout() {
  // why insets: on gesture-nav Androids the system home bar overlapped the
  // bar and clipped every label; the bar must grow by the bottom inset.
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Crimson.tabActive,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
        tabBarStyle: {
          backgroundColor: Crimson.navBg,
          borderTopColor: 'rgba(255,255,255,0.1)',
          borderTopWidth: 1,
          elevation: 12,
          shadowOpacity: 0.4,
          shadowRadius: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -6 },
          height: 62 + insets.bottom,
          paddingBottom: 10 + insets.bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 9.5,
          fontFamily: Fonts.body,
          letterSpacing: 0.2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Wardrobe',
          tabBarLabel: 'Wardrobe',
          tabBarIcon: ({ color }) => <ShoppingBag color={color} size={22} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarLabel: 'Discover',
          tabBarIcon: ({ color }) => <WandSparkles color={color} size={22} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="outfits"
        options={{
          title: 'Occasions',
          tabBarLabel: 'Occasions',
          tabBarIcon: ({ color }) => <FolderHeart color={color} size={22} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <User color={color} size={22} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
}
