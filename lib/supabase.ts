import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SUPABASE_URL = 'https://hvdknawuszensgmifpdt.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_cMsnAAlikWAzA-UllqL6HA_NnFP7T58';

// SSR(서버사이드 렌더링) 환경에서 window가 없으면 안전하게 null 반환
const ssrSafeStorage = {
  getItem: (key: string): Promise<string | null> => {
    if (typeof window === 'undefined') return Promise.resolve(null);
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string): Promise<void> => {
    if (typeof window === 'undefined') return Promise.resolve();
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string): Promise<void> => {
    if (typeof window === 'undefined') return Promise.resolve();
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: ssrSafeStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
