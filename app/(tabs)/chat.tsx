import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';

import { COL } from '@/constants/colors';
import { useLang } from '@/context/LangContext';
import { AppHeader } from '@/components/AppHeader';
import { ImageBlock } from '@/components/ui/ImageBlock';
import { supabase } from '@/lib/supabase';

interface Room {
  id: string;
  product_id: string;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  products: {
    title_ko: string;
    emoji: string;
    bg: string;
    image_url: string | null;
    price: number;
  } | null;
}

function timeAgo(iso: string, lang: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (lang === 'ko') {
    return m < 60 ? `${m}분 전` : m < 1440 ? `${Math.floor(m / 60)}시간 전` : `${Math.floor(m / 1440)}일 전`;
  }
  return m < 60 ? `${m}m ago` : m < 1440 ? `${Math.floor(m / 60)}h ago` : `${Math.floor(m / 1440)}d ago`;
}

export default function ChatListScreen() {
  const router = useRouter();
  const { t, lang } = useLang();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const currentTown = lang === 'ko' ? '망원동' : 'Mangwon';

  async function fetchRooms() {
    const { data } = await supabase
      .from('chat_rooms')
      .select(`
        id,
        product_id,
        last_message,
        last_message_at,
        created_at,
        products (
          title_ko,
          emoji,
          bg,
          image_url,
          price
        )
      `)
      .order('created_at', { ascending: false });

    if (data) {
      const sorted = [...data].sort((a, b) => {
        const ta = a.last_message_at ?? a.created_at;
        const tb = b.last_message_at ?? b.created_at;
        return tb > ta ? 1 : -1;
      });
      setRooms(sorted as Room[]);
    }
  }

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchRooms().finally(() => setLoading(false));
    }, [])
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <AppHeader
        currentTown={currentTown}
        onLocationPress={() => router.push('/location')}
      />

      <View style={styles.titleRow}>
        <Text style={styles.title}>{t.chatList}</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={COL.primary} />
      ) : rooms.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{t.chatEmpty}</Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <RoomRow
              room={item}
              lang={lang}
              onPress={() =>
                router.push({ pathname: '/chat-room/[id]', params: { id: item.product_id } })
              }
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

function RoomRow({
  room,
  lang,
  onPress,
}: {
  room: Room;
  lang: string;
  onPress: () => void;
}) {
  const product = room.products;
  const title = product?.title_ko ?? '';
  const ts = room.last_message_at ?? room.created_at;

  return (
    <TouchableOpacity onPress={onPress} style={styles.row} activeOpacity={0.85}>
      <ImageBlock
        emoji={product?.emoji ?? '📦'}
        bg={product?.bg ?? '#F1ECE8'}
        imageUrl={product?.image_url ?? undefined}
        size={54}
        radius={12}
      />
      <View style={styles.rowInfo}>
        <View style={styles.rowTop}>
          <Text style={styles.name} numberOfLines={1}>{title}</Text>
          <Text style={styles.time}>{timeAgo(ts, lang)}</Text>
        </View>
        <Text style={styles.lastMsg} numberOfLines={1}>
          {room.last_message ?? (lang === 'ko' ? '채팅을 시작해보세요' : 'Start chatting')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COL.bg },
  titleRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COL.line,
  },
  title: { fontSize: 20, fontWeight: '800', color: COL.ink, letterSpacing: -0.5 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 15, color: COL.ink3 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COL.lineSoft,
    backgroundColor: COL.surface,
  },
  rowInfo: { flex: 1, minWidth: 0 },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: { fontSize: 15, fontWeight: '600', color: COL.ink, flex: 1 },
  time: { fontSize: 12, color: COL.ink3, marginLeft: 8 },
  lastMsg: { fontSize: 13, color: COL.ink3, marginTop: 3 },
});
