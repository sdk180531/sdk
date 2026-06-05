import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COL } from '@/constants/colors';
import { useLang } from '@/context/LangContext';
import { useAuth, Profile } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function AdminScreen() {
  const { t } = useLang();
  const { profile: myProfile } = useAuth();

  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (myProfile?.role === 'admin') fetchUsers();
  }, [myProfile]);

  async function fetchUsers() {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*');
    setUsers(data ?? []);
    setLoading(false);
  }

  async function toggleTier(userId: string, currentTier: 'free' | 'paid') {
    const newTier = currentTier === 'free' ? 'paid' : 'free';
    setUpdatingId(userId);
    await supabase.from('profiles').update({ tier: newTier }).eq('id', userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, tier: newTier } : u));
    setUpdatingId(null);
  }

  if (myProfile?.role !== 'admin') {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.denied}>
          <Text style={styles.deniedText}>🔒</Text>
          <Text style={styles.deniedLabel}>접근 권한이 없어요</Text>
        </View>
      </SafeAreaView>
    );
  }

  const paid = users.filter(u => u.tier === 'paid');
  const free = users.filter(u => u.tier === 'free');

  const sections = [
    { title: `${t.paidMembers} (${paid.length})`, data: paid },
    { title: `${t.freeMembers} (${free.length})`, data: free },
  ];

  function renderItem({ item }: { item: Profile }) {
    const isPaid = item.tier === 'paid';
    const isUpdating = updatingId === item.id;
    const displayName = item.nickname ?? item.email ?? item.id.slice(0, 8);

    return (
      <View style={styles.row}>
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
          {item.email && item.nickname && (
            <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
          )}
        </View>
        <View style={[styles.tierBadge, isPaid ? styles.tierBadgePaid : styles.tierBadgeFree]}>
          <Text style={[styles.tierText, isPaid ? styles.tierTextPaid : styles.tierTextFree]}>
            {isPaid ? t.tierPaid : t.tierFree}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.toggleBtn, isUpdating && styles.toggleBtnDisabled]}
          onPress={() => toggleTier(item.id, item.tier)}
          disabled={isUpdating}
          activeOpacity={0.75}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color={COL.ink3} />
          ) : (
            <Text style={styles.toggleText}>
              {isPaid ? t.changeToFree : t.changeToPaid}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Text style={styles.header}>{t.adminPage}</Text>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={COL.primary} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>{t.noUsers}</Text>
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          onRefresh={fetchUsers}
          refreshing={loading}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COL.bg },
  header: {
    fontSize: 22,
    fontWeight: '800',
    color: COL.ink,
    letterSpacing: -0.5,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionHeader: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COL.ink2,
    letterSpacing: -0.2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COL.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COL.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    gap: 10,
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { fontSize: 14, fontWeight: '600', color: COL.ink },
  userEmail: { fontSize: 12, color: COL.ink3, marginTop: 2 },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tierBadgePaid: { backgroundColor: '#EEF4FF' },
  tierBadgeFree: { backgroundColor: COL.lineSoft },
  tierText: { fontSize: 11, fontWeight: '700' },
  tierTextPaid: { color: '#3B6FD4' },
  tierTextFree: { color: COL.ink3 },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COL.primarySoft,
    minWidth: 72,
    alignItems: 'center',
  },
  toggleBtnDisabled: { backgroundColor: COL.lineSoft },
  toggleText: { fontSize: 12, fontWeight: '600', color: COL.primary },
  denied: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  deniedText: { fontSize: 40 },
  deniedLabel: { fontSize: 16, color: COL.ink3, fontWeight: '500' },
  empty: { textAlign: 'center', color: COL.ink3, marginTop: 40, fontSize: 14 },
});
