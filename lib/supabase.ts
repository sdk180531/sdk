import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SUPABASE_URL = 'https://hvdknawuszensgmifpdt.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_cMsnAAlikWAzA-UllqL6HA_NnFP7T58';

// Node.js (Expo static gen)에서 window가 없으면 AsyncStorage의 web 구현이 크래시.
// React Native 디바이스에서는 global.window = global이므로 AsyncStorage 사용.
const storage = typeof window !== 'undefined' ? AsyncStorage : undefined;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});
