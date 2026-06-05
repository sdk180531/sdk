import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LangProvider } from '@/context/LangContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';

function RootLayoutNav() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (session && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [session, loading, segments]);

  if (loading) return null;

  return (
    <>
      <Stack screenOptions={{ animation: 'slide_from_right', headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="chat-room/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="location" options={{ headerShown: false }} />
        <Stack.Screen name="product/create" options={{ headerShown: false }} />
        <Stack.Screen name="payment" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LangProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </LangProvider>
    </SafeAreaProvider>
  );
}
