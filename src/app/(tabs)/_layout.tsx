import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { View, Pressable, Text } from 'react-native';
import { Home, User, Clock, Settings, Car, DollarSign } from 'lucide-react-native';
import { useI18n, useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabIcon({ icon: Icon, focused, label }: { icon: any; focused: boolean; label: string }) {
  return (
    <View className="items-center justify-center pt-2">
      <Icon
        size={24}
        color={focused ? '#FFB800' : '#6B7280'}
        strokeWidth={focused ? 2.5 : 2}
      />
      <Text
        className={`text-xs mt-1 ${focused ? 'text-amber-500 font-semibold' : 'text-gray-500'}`}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const { t } = useTranslation();
  const userMode = useAppStore((s) => s.userMode);
  const loadState = useAppStore((s) => s.loadState);
  const loadLanguage = useI18n((s) => s.loadLanguage);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadState();
    loadLanguage();
  }, []);

  const isDriver = userMode === 'driver';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#1A1A1A',
          borderTopWidth: 0,
          height: 80 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={Home} focused={focused} label={t('home')} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={Clock} focused={focused} label={t('activity')} />
          ),
        }}
      />
      <Tabs.Screen
        name="meter"
        options={{
          href: isDriver ? '/meter' : null,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={Car} focused={focused} label={t('taxiMeter')} />
          ),
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          href: isDriver ? '/earnings' : null,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={DollarSign} focused={focused} label={t('earnings')} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={User} focused={focused} label={t('profile')} />
          ),
        }}
      />
    </Tabs>
  );
}
