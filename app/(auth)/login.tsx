import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { router, useLocalSearchParams } from 'expo-router';

import { COL } from '@/constants/colors';
import { useLang } from '@/context/LangContext';
import { supabase } from '@/lib/supabase';
import { Toast } from '@/components/ui/Toast';

export default function LoginScreen() {
  const { t, lang } = useLang();
  const { loggedOut } = useLocalSearchParams<{ loggedOut?: string }>();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(loggedOut === 'true');

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError('');

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setError(t.loginError);
      } else {
        router.replace('/(tabs)');
      }
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (signUpError) {
        setError(t.signupError);
      } else if (data.session) {
        router.replace('/(tabs)');
      } else {
        // 이메일 인증 활성화 시: 가입 직후 즉시 로그인 시도
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (loginError) {
          setMode('login');
          Alert.alert('', t.signupSuccess); // 이메일 인증 필요
        } else {
          router.replace('/(tabs)');
        }
      }
    }
    setLoading(false);
  }

  function toggleMode() {
    setMode(m => (m === 'login' ? 'signup' : 'login'));
    setError('');
  }

  const isLogin = mode === 'login';

  return (
    <SafeAreaView style={styles.container}>
      <Toast message={t.logoutSuccess} visible={showToast} type="success" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 앱 로고 */}
          <View style={styles.logoWrap}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🏘️</Text>
            </View>
            <Text style={styles.appName}>{lang === 'ko' ? '동네장터' : 'Dongnae'}</Text>
            <Text style={styles.appSub}>
              {lang === 'ko' ? '우리 동네 중고거래' : 'Local marketplace'}
            </Text>
          </View>

          {/* 모드 탭 */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              onPress={() => { setMode('login'); setError(''); }}
              style={[styles.tab, isLogin && styles.tabActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>
                {t.loginTitle}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setMode('signup'); setError(''); }}
              style={[styles.tab, !isLogin && styles.tabActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>
                {t.signupTitle}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 폼 */}
          <View style={styles.form}>
            <Text style={styles.label}>{t.email}</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="example@email.com"
              placeholderTextColor={COL.ink3}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />

            <Text style={[styles.label, { marginTop: 16 }]}>{t.password}</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder={lang === 'ko' ? '6자 이상 입력' : 'At least 6 characters'}
              placeholderTextColor={COL.ink3}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              onPress={handleSubmit}
              style={[styles.btn, (!email.trim() || !password.trim()) && styles.btnDisabled]}
              activeOpacity={0.85}
              disabled={loading || !email.trim() || !password.trim()}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>
                  {isLogin ? t.loginBtn : t.signupBtn}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* 모드 전환 링크 */}
          <TouchableOpacity onPress={toggleMode} style={styles.switchRow} activeOpacity={0.7}>
            <Text style={styles.switchText}>
              {isLogin ? t.noAccount : t.hasAccount}{' '}
              <Text style={styles.switchLink}>
                {isLogin ? t.signupTitle : t.loginTitle}
              </Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COL.bg },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  logoWrap: { alignItems: 'center', marginBottom: 36 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: COL.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoEmoji: { fontSize: 40 },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: COL.ink,
    letterSpacing: -0.8,
  },
  appSub: {
    fontSize: 14,
    color: COL.ink3,
    marginTop: 6,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COL.lineSoft,
    borderRadius: 12,
    padding: 4,
    marginBottom: 28,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: { backgroundColor: COL.surface },
  tabText: { fontSize: 15, fontWeight: '600', color: COL.ink3 },
  tabTextActive: { color: COL.ink, fontWeight: '700' },
  form: { gap: 4 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COL.ink2,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COL.surface,
    borderWidth: 1,
    borderColor: COL.line,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COL.ink,
  },
  errorText: {
    fontSize: 13,
    color: '#FF4D4F',
    marginTop: 8,
  },
  btn: {
    marginTop: 24,
    backgroundColor: COL.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnDisabled: { backgroundColor: COL.lineSoft },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },
  switchRow: { marginTop: 24, alignItems: 'center' },
  switchText: { fontSize: 14, color: COL.ink3 },
  switchLink: { color: COL.primary, fontWeight: '700' },
});
