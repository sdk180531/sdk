import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { COL } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Icon } from '@/components/ui/Icon';

const FREE_FEATURES = [
  '기본 상품 열람',
  '채팅 기능',
  '커뮤니티 참여',
];

const PRO_FEATURES = [
  '모든 상품 열람',
  '💻 전자기기 카테고리',
  '🧸 장난감 카테고리',
  '채팅 기능',
  '커뮤니티 참여',
  'PRO 전용 뱃지',
];

export default function PaymentScreen() {
  const { profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const isPro = profile?.tier === 'paid';

  async function handlePayment() {
    if (!profile) return;
    setLoading(true);
    await supabase.from('profiles').update({ tier: 'paid' }).eq('id', profile.id);
    await refreshProfile();
    setLoading(false);
    setDone(true);
    setTimeout(() => router.back(), 1500);
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Icon name="back" size={22} color={COL.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>유료 회원 업그레이드</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.body}>
        {done ? (
          <View style={styles.successBox}>
            <Text style={styles.successIcon}>🎉</Text>
            <Text style={styles.successTitle}>PRO 회원이 됐어요!</Text>
            <Text style={styles.successSub}>잠시 후 이전 화면으로 돌아갑니다.</Text>
          </View>
        ) : (
          <>
            <View style={styles.plansRow}>
              <View style={[styles.planCard, styles.planCardFree]}>
                <Text style={styles.planLabel}>FREE</Text>
                <Text style={styles.planPrice}>무료</Text>
                {FREE_FEATURES.map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <Text style={styles.featureCheck}>✓</Text>
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>

              <View style={[styles.planCard, styles.planCardPro]}>
                <View style={styles.proBadgeRow}>
                  <Text style={styles.planLabel}>PRO</Text>
                  <View style={styles.recommendBadge}>
                    <Text style={styles.recommendText}>추천</Text>
                  </View>
                </View>
                <Text style={styles.planPricePro}>₩9,900<Text style={styles.planPriceSub}>/월</Text></Text>
                {PRO_FEATURES.map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <Text style={[styles.featureCheck, styles.featureCheckPro]}>✓</Text>
                    <Text style={[styles.featureText, styles.featureTextPro]}>{f}</Text>
                  </View>
                ))}
              </View>
            </View>

            <Text style={styles.demoNotice}>* 데모 버전 — 실제 결제가 발생하지 않습니다.</Text>

            {isPro ? (
              <View style={styles.alreadyProBox}>
                <Text style={styles.alreadyProText}>이미 PRO 회원입니다 ✨</Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handlePayment}
                style={[styles.payBtn, loading && styles.payBtnDisabled]}
                activeOpacity={0.85}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.payBtnText}>결제하기 (데모)</Text>
                )}
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COL.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COL.line,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: COL.ink },
  body: { flex: 1, paddingHorizontal: 20, paddingTop: 28 },

  plansRow: { flexDirection: 'row', gap: 12 },
  planCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: COL.line,
    backgroundColor: COL.surface,
  },
  planCardFree: {},
  planCardPro: {
    borderColor: COL.primary,
    backgroundColor: COL.primarySoft,
  },
  proBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  planLabel: { fontSize: 13, fontWeight: '700', color: COL.ink2, marginBottom: 4 },
  planPrice: { fontSize: 20, fontWeight: '800', color: COL.ink, marginBottom: 12 },
  planPricePro: { fontSize: 20, fontWeight: '800', color: COL.primaryDark, marginBottom: 12 },
  planPriceSub: { fontSize: 13, fontWeight: '400', color: COL.ink3 },
  recommendBadge: {
    backgroundColor: COL.primary,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  recommendText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  featureCheck: { fontSize: 12, color: COL.ink3, width: 14 },
  featureCheckPro: { color: COL.primary },
  featureText: { fontSize: 12, color: COL.ink2, flex: 1 },
  featureTextPro: { color: COL.ink, fontWeight: '500' },

  demoNotice: {
    fontSize: 11,
    color: COL.ink3,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
  },

  payBtn: {
    backgroundColor: COL.primary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 4,
  },
  payBtnDisabled: { opacity: 0.6 },
  payBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },

  alreadyProBox: {
    backgroundColor: COL.primarySoft,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 4,
    borderWidth: 1,
    borderColor: COL.primary,
  },
  alreadyProText: { fontSize: 15, fontWeight: '600', color: COL.primaryDark },

  successBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  successIcon: { fontSize: 56 },
  successTitle: { fontSize: 22, fontWeight: '800', color: COL.ink },
  successSub: { fontSize: 14, color: COL.ink3 },
});
