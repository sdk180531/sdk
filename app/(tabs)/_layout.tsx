import { Redirect, Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Icon } from '@/components/ui/Icon';
import { COL } from '@/constants/colors';
import { useLang } from '@/context/LangContext';
import { useAuth } from '@/context/AuthContext';

export default function TabLayout() {
  const { t } = useLang();
  const { session, loading } = useAuth();

  if (loading) return null;
  if (!session) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COL.primary,
        tabBarInactiveTintColor: COL.ink3,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: COL.surface,
          borderTopColor: COL.line,
          height: 60,
          paddingBottom: 4,
        },
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: '500',
          letterSpacing: -0.2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t.home,
          tabBarIcon: ({ color, focused }) => (
            <Icon name="home" size={24} color={color} stroke={focused ? 2.2 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: t.community,
          tabBarIcon: ({ color, focused }) => (
            <Icon name="community" size={24} color={color} stroke={focused ? 2.2 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t.chat,
          tabBarIcon: ({ color, focused }) => (
            <Icon name="chat" size={24} color={color} stroke={focused ? 2.2 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: t.me,
          tabBarIcon: ({ color, focused }) => (
            <Icon name="me" size={24} color={color} stroke={focused ? 2.2 : 1.8} />
          ),
        }}
      />
    </Tabs>
  );
}
