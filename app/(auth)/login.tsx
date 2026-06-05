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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

import { COL } from '@/constants/colors';
import { useLang } from '@/context/LangContext';
import { supabase } from '@/lib/supabase';
import { Toast } from '@/components/ui/Toast';
import { GoogleIcon } from '@/components/ui/GoogleIcon';
import { KakaoIcon } from '@/components/ui/KakaoIcon';

export default function LoginScreen() {
  const { t, lang } = useLang();
  const { loggedOut } = useLocalSearchParams<{ loggedOut?: string }>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [kakaoLoading, setKakaoLoading] = useState(false);
  const [error, setError] = useState('');
  const showToast = loggedOut === 'true';

  function validate(): string {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return t.emailError;
    if (password.length < 6) return t.passwordError;
    return '';
  }

  async function handleSubmit() {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message ?? t.serverError);
    }
    setLoading(false);
  }

  async function signInWithGoogle() {
    setGoogleLoading(true);
    setError('');
    try {
      const redirectUrl = Linking.createURL('/');
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl, skipBrowserRedirect: true },
      });
      if (oauthError || !data?.url) throw oauthError ?? new Error('No URL');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
      if (result.type === 'success' && result.url) {
        const { queryParams } = Linking.parse(result.url);
        const code = queryParams?.code as string | undefined;
        if (code) {
          const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
          if (sessionError) throw sessionError;
          // 루트 레이아웃 useEffect가 session 업데이트 후 /(tabs)로 이동
        } else {
          throw new Error('인증 코드를 받지 못했어요. 다시 시도해주세요.');
        }
      } else if (result.type !== 'dismiss') {
        throw new Error('Google 로그인에 실패했어요.');
      }
    } catch (e: any) {
      setError(e.message ?? t.serverError);
    } finally {
      setGoogleLoading(false);
    }
  }

  async function signInWithKakao() {
    setKakaoLoading(true);
    setError('');
    try {
      const redirectUrl = Linking.createURL('/');
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: { redirectTo: redirectUrl, skipBrowserRedirect: true },
      });
      if (oauthError || !data?.url) throw oauthError ?? new Error('No URL');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
      if (result.type === 'success' && result.url) {
        const { queryParams } = Linking.parse(result.url);
        const code = queryParams?.code as string | undefined;
        if (code) {
          const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
          if (sessionError) throw sessionError;
        } else {
          throw new Error('인증 코드를 받지 못했어요. 다시 시도해주세요.');
        }
      } else if (result.type !== 'dismiss') {
        throw new Error('카카오 로그인에 실패했어요.');
      }
    } catch (e: any) {
      setError(e.message ?? t.serverError);
    } finally {
      setKakaoLoading(false);
    }
  }

  const isSubmitDisabled = loading || email.length === 0 || password.length === 0;

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
          <View style={styles.logoWrap}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🏘️</Text>
            </View>
            <Text style={styles.appName}>{lang === 'ko' ? '동네장터' : 'Dongnae'}</Text>
            <Text style={styles.appSub}>
              {lang === 'ko' ? '우리 동네 중고거래' : 'Local marketplace'}
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>{t.emailLabel}</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder={t.emailPlaceholder}
              placeholderTextColor={COL.ink3}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />

            <Text style={[styles.label, { marginTop: 16 }]}>{t.passwordLabel}</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder={t.passwordPlaceholder}
              placeholderTextColor={COL.ink3}
              secureTextEntry
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              onPress={handleSubmit}
              style={[styles.btn, isSubmitDisabled && styles.btnDisabled]}
              activeOpacity={0.85}
              disabled={isSubmitDisabled}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>{t.loginBtn}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t.orDivider}</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              onPress={signInWithGoogle}
              style={styles.googleBtn}
              activeOpacity={0.85}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <ActivityIndicator color="#1F1F1F" />
              ) : (
                <View style={styles.googleBtnContent}>
                  <GoogleIcon size={20} />
                  <Text style={styles.googleBtnText}>{t.continueWithGoogle}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={signInWithKakao}
              style={styles.kakaoBtn}
              activeOpacity={0.85}
              disabled={kakaoLoading}
            >
              {kakaoLoading ? (
                <ActivityIndicator color="#3C1E1E" />
              ) : (
                <View style={styles.googleBtnContent}>
                  <KakaoIcon size={20} />
                  <Text style={styles.kakaoBtnText}>{t.continueWithKakao}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
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
  divider: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COL.line },
  dividerText: { fontSize: 13, color: COL.ink3, marginHorizontal: 12 },
  googleBtn: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#747775',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  googleBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  googleBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  kakaoBtn: {
    marginTop: 12,
    backgroundColor: '#FEE500',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  kakaoBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#191919',
  },
});
