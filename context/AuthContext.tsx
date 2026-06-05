import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface Profile {
  id: string;
  email: string | null;
  nickname: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  tier: 'free' | 'paid';
  role: 'user' | 'admin';
  provider: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setProfile(data);
      return;
    }

    // 신규 OAuth 유저 — Google 메타데이터로 프로필 자동 생성
    const { data: { user } } = await supabase.auth.getUser();
    const meta = user?.user_metadata ?? {};
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: user?.email ?? null,
        nickname: meta.name ?? meta.full_name ?? null,
        avatar_url: meta.avatar_url ?? meta.picture ?? null,
        provider: user?.app_metadata?.provider ?? 'email',
        tier: 'free',
        role: 'user',
      })
      .select()
      .single();
    setProfile(newProfile ?? null);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session?.user) fetchProfile(session.user.id);
        else setProfile(null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (session?.user) await fetchProfile(session.user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading,
        signOut: async () => {
          try { await supabase.auth.signOut(); } catch {}
        },
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
