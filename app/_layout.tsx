import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { LangProvider } from '@/context/LangContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';

function RootLayoutNav() {
  const { loading } = useAuth();

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
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}

export default function RootLayout() {
  return (
    <LangProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </LangProvider>
  );
}
