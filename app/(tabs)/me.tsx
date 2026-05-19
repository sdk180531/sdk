import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { COL } from '@/constants/colors';
import { useLang } from '@/context/LangContext';
import { useAuth } from '@/context/AuthContext';
import { Icon } from '@/components/ui/Icon';

export default function MeScreen() {
  const { t } = useLang();
  const { session, profile, signOut } = useAuth();

  function handleLogout() {
    router.replace('/(auth)/login?loggedOut=true');
    signOut();
  }

  const displayName = profile?.nickname ?? session?.user.email ?? '';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Icon name="me" size={36} color={COL.ink2} />
        </View>
        <Text style={styles.displayName}>{displayName}</Text>
        {profile?.nickname && (
          <Text style={styles.email}>{session?.user.email ?? ''}</Text>
        )}
      </View>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.8}>
        <Text style={styles.logoutText}>{t.logOut}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COL.bg },
  profile: { alignItems: 'center', paddingTop: 48, paddingBottom: 32 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COL.surface,
    borderWidth: 1,
    borderColor: COL.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  displayName: { fontSize: 16, color: COL.ink, fontWeight: '600' },
  email: { fontSize: 13, color: COL.ink3, marginTop: 4 },
  logoutBtn: {
    marginHorizontal: 24,
    marginTop: 8,
    backgroundColor: COL.surface,
    borderWidth: 1,
    borderColor: COL.line,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: { fontSize: 16, color: '#FF4D4F', fontWeight: '600' },
});
