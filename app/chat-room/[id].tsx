import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { COL } from '@/constants/colors';
import { useLang } from '@/context/LangContext';
import { ImageBlock } from '@/components/ui/ImageBlock';
import { Icon } from '@/components/ui/Icon';
import { supabase } from '@/lib/supabase';

interface Msg {
  id: string;
  room_id: string;
  text: string;
  is_mine: boolean;
  created_at: string;
}

interface ProductInfo {
  title_ko: string;
  emoji: string;
  bg: string;
  image_url: string | null;
  price: number;
  status: string;
}

export default function ChatRoomScreen() {
  const { id: productId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, lang } = useLang();
  const insets = useSafeAreaInsets();

  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    const pid = Array.isArray(productId) ? productId[0] : productId;
    if (!pid) return;
    initRoom(pid);
  }, [productId]);

  async function initRoom(pid: string) {
    // 상품 정보 조회
    const { data: prod } = await supabase
      .from('products')
      .select('title_ko, emoji, bg, image_url, price, status')
      .eq('id', pid)
      .single();
    if (prod) setProduct(prod);

    // 채팅방 찾거나 생성
    let room: { id: string } | null = null;
    const { data: existing } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('product_id', pid)
      .maybeSingle();

    if (existing) {
      room = existing;
    } else {
      const { data: created } = await supabase
        .from('chat_rooms')
        .insert({ product_id: pid })
        .select('id')
        .single();
      room = created;
    }

    if (!room) { setLoading(false); return; }
    setRoomId(room.id);

    // 메시지 로드
    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', room.id)
      .order('created_at', { ascending: true });

    if (msgs) setMessages(msgs);
    setLoading(false);
  }

  // 실시간 구독
  useEffect(() => {
    if (!roomId) return;
    const channel = supabase
      .channel(`messages-${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
        (payload) => {
          setMessages(prev => {
            if (prev.find(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new as Msg];
          });
          setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  async function send() {
    if (!input.trim() || !roomId || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);

    // 낙관적 업데이트
    const tempId = `tmp-${Date.now()}`;
    const tempMsg: Msg = { id: tempId, room_id: roomId, text, is_mine: true, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);

    // Supabase 저장
    const { data } = await supabase
      .from('messages')
      .insert({ room_id: roomId, text, is_mine: true })
      .select()
      .single();

    if (data) {
      setMessages(prev => prev.map(m => m.id === tempId ? data : m));
    }

    // 채팅방 마지막 메시지 업데이트
    await supabase
      .from('chat_rooms')
      .update({ last_message: text, last_message_at: new Date().toISOString() })
      .eq('id', roomId);

    setSending(false);
  }

  const title = product?.title_ko ?? '';
  const priceText = product
    ? product.price === 0
      ? lang === 'ko' ? '나눔' : 'Free'
      : t.won(product.price)
    : '';

  return (
    <View style={[styles.container]}>
      {/* 헤더 */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} activeOpacity={0.8}>
          <Icon name="back" size={24} color={COL.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title || t.chat}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* 상품 배너 */}
      {product && (
        <View style={styles.banner}>
          <ImageBlock
            emoji={product.emoji}
            bg={product.bg}
            imageUrl={product.image_url ?? undefined}
            size={46}
            radius={10}
          />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.bannerTitle} numberOfLines={1}>{title}</Text>
            <Text style={styles.bannerPrice}>{priceText}</Text>
          </View>
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 52}
      >
        {/* 메시지 목록 */}
        {loading ? (
          <ActivityIndicator style={{ flex: 1 }} color={COL.primary} />
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <Bubble msg={item} />}
            contentContainerStyle={styles.msgList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>
                  {lang === 'ko' ? '첫 메시지를 보내보세요!' : 'Say hello!'}
                </Text>
              </View>
            }
          />
        )}

        {/* 입력창 */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={styles.inputField}
            value={input}
            onChangeText={setInput}
            placeholder={t.typing}
            placeholderTextColor={COL.ink3}
            multiline
            returnKeyType="send"
            onSubmitEditing={send}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={send}
            disabled={!input.trim() || sending}
            style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnOff]}
            activeOpacity={0.8}
          >
            <Icon name="send" size={20} color={input.trim() && !sending ? '#fff' : COL.ink3} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  return (
    <View style={[styles.bubbleWrap, msg.is_mine ? styles.bubbleWrapMe : styles.bubbleWrapThem]}>
      <View style={[styles.bubble, msg.is_mine ? styles.bubbleMe : styles.bubbleThem]}>
        <Text style={[styles.bubbleText, msg.is_mine ? styles.bubbleTextMe : styles.bubbleTextThem]}>
          {msg.text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COL.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COL.line,
    backgroundColor: COL.surface,
  },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: COL.ink,
    letterSpacing: -0.3,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COL.line,
    backgroundColor: COL.surface,
  },
  bannerTitle: { fontSize: 14, fontWeight: '600', color: COL.ink },
  bannerPrice: { fontSize: 13, color: COL.ink2, marginTop: 2 },
  msgList: { padding: 16, gap: 6, flexGrow: 1 },
  emptyWrap: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 14, color: COL.ink3 },
  bubbleWrap: { flexDirection: 'row', marginBottom: 4 },
  bubbleWrapMe: { justifyContent: 'flex-end' },
  bubbleWrapThem: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleMe: {
    backgroundColor: COL.primary,
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: COL.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COL.line,
  },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  bubbleTextMe: { color: '#fff' },
  bubbleTextThem: { color: COL.ink },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COL.line,
    backgroundColor: COL.surface,
  },
  inputField: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: COL.bg,
    borderWidth: 1,
    borderColor: COL.line,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: COL.ink,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COL.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnOff: { backgroundColor: COL.lineSoft },
});
