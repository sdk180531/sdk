import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';

import { COL } from '@/constants/colors';
import { useLang } from '@/context/LangContext';
import { PRODUCTS, Product, ProductStatus } from '@/data';
import { ImageBlock } from '@/components/ui/ImageBlock';
import { Icon } from '@/components/ui/Icon';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { PAID_ONLY_EMOJIS } from '@/constants/paidContent';

const chatBtnShadow = Platform.select({
  web: { boxShadow: '0px 4px 8px rgba(255, 122, 85, 0.3)' } as object,
  default: { shadowColor: COL.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 } as object,
})!;

const HERO_HEIGHT = 320;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, lang } = useLang();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();

  const mockProduct = PRODUCTS.find(p => p.id === id);
  const [product, setProduct] = useState<Product>(mockProduct ?? PRODUCTS[0]);
  const [loading, setLoading] = useState(!mockProduct);
  const [deleting, setDeleting] = useState(false);
  const [liked, setLiked] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (mockProduct) return;
    supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProduct({
            id: data.id,
            emoji: data.emoji,
            bg: data.bg,
            titleKo: data.title_ko,
            titleEn: data.title_ko,
            price: data.price,
            location: data.location,
            locationEn: data.location,
            minutesAgo: Math.floor((Date.now() - new Date(data.created_at).getTime()) / 60000),
            hearts: data.hearts,
            chats: data.chats,
            views: data.views,
            status: data.status as ProductStatus,
            seller: '나',
            sellerEn: 'Me',
            sellerEmoji: '😊',
            mannerTemp: 36.5,
            descKo: data.description ?? '',
            descEn: data.description ?? '',
            imageUrl: data.image_url ?? undefined,
          });
        }
        setLoading(false);
      });
  }, [id]);

  const title = lang === 'ko' ? product.titleKo : product.titleEn;
  const loc = lang === 'ko' ? product.location : product.locationEn;
  const desc = lang === 'ko' ? product.descKo : product.descEn;
  const seller = lang === 'ko' ? product.seller : product.sellerEn;
  const isMyProduct = product.seller === '나' || product.sellerEn === 'Me';

  const similar = PRODUCTS.filter(p => p.id !== product.id).slice(0, 4);

  async function handleDelete() {
    if (deleting) return;
    setDeleting(true);
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', product.id);
    if (error) {
      setDeleting(false);
      Alert.alert(lang === 'ko' ? '오류' : 'Error', lang === 'ko' ? '삭제에 실패했어요.' : 'Failed to delete.');
      return;
    }
    if (product.imageUrl) {
      const filename = product.imageUrl.split('/').pop();
      if (filename) {
        await supabase.storage.from('product-images').remove([filename]);
      }
    }
    router.replace('/(tabs)');
  }

  const headerBg = scrollY.interpolate({
    inputRange: [HERO_HEIGHT - 80, HERO_HEIGHT],
    outputRange: ['rgba(255,252,250,0)', COL.surface],
    extrapolate: 'clamp',
  });
  const headerBorder = scrollY.interpolate({
    inputRange: [HERO_HEIGHT - 80, HERO_HEIGHT],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const titleOpacity = scrollY.interpolate({
    inputRange: [HERO_HEIGHT - 80, HERO_HEIGHT],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  if (!loading && PAID_ONLY_EMOJIS.includes(product.emoji) && profile?.tier !== 'paid') {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.headerBtn, { position: 'absolute', top: 52, left: 8 }]}
          activeOpacity={0.8}
        >
          <Icon name="back" size={24} color={COL.ink} />
        </TouchableOpacity>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>🔒</Text>
        <Text style={{ fontSize: 16, fontWeight: '700', color: COL.ink, marginBottom: 6 }}>
          유료회원 전용
        </Text>
        <Text style={{ fontSize: 14, color: COL.ink3 }}>
          유료 회원만 볼 수 있는 상품이에요
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Floating header */}
      <Animated.View style={[styles.floatingHeader, { backgroundColor: headerBg, borderBottomWidth: headerBorder, borderBottomColor: COL.line }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} activeOpacity={0.8}>
          <Icon name="back" size={24} color={COL.ink} />
        </TouchableOpacity>
        <Animated.Text style={[styles.headerTitle, { opacity: titleOpacity }]} numberOfLines={1}>
          {title}
        </Animated.Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
            <Icon name="share" size={22} color={COL.ink} />
          </TouchableOpacity>
          {isMyProduct ? (
            <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8} onPress={handleDelete} disabled={deleting}>
              {deleting
                ? <ActivityIndicator size="small" color="#FF4D4F" />
                : <Icon name="trash" size={22} color="#FF4D4F" />}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
              <Icon name="menu" size={22} color={COL.ink} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: product.imageUrl ? '#111' : product.bg }]}>
          {loading ? (
            <ActivityIndicator color={COL.primary} size="large" />
          ) : product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={styles.heroImage} contentFit="cover" />
          ) : (
            <Text style={styles.heroEmoji}>{product.emoji}</Text>
          )}
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>1 / 1</Text>
          </View>
        </View>

        {/* Seller row */}
        <View style={styles.sellerRow}>
          <ImageBlock emoji={product.sellerEmoji} bg="#FFEDE5" size={42} radius={21} fontSize={22} />
          <View style={{ flex: 1 }}>
            <Text style={styles.sellerName}>{seller}</Text>
            <Text style={styles.sellerLoc}>{loc}</Text>
          </View>
          <MannerTemp temp={product.mannerTemp} label={t.manners} />
        </View>

        {/* Title + meta */}
        <View style={styles.section}>
          <Text style={styles.productTitle}>{title}</Text>
          <Text style={styles.productMeta}>
            {t.categories[1]} · {t.timeAgo(product.minutesAgo)}
          </Text>
          <Text style={styles.productDesc}>{desc}</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statLabel}>{t.chatN(product.chats)}</Text>
            <Text style={styles.statLabel}>{t.interested(product.hearts)}</Text>
            <Text style={styles.statLabel}>{t.viewN(product.views)}</Text>
          </View>
        </View>

        {/* Safety tip */}
        <View style={styles.safetyTip}>
          <Icon name="flame" size={16} color={COL.primaryDark} stroke={1.8} />
          <Text style={styles.safetyText}>{t.safetyTip}</Text>
        </View>

        {/* Similar items */}
        <View style={styles.similar}>
          <Text style={styles.similarTitle}>{t.similar}</Text>
          <View style={styles.similarGrid}>
            {similar.map(s => (
              <TouchableOpacity
                key={s.id}
                style={styles.similarItem}
                activeOpacity={0.85}
                onPress={() => router.replace({ pathname: '/product/[id]', params: { id: s.id } })}
              >
                <View style={[styles.similarImage, { backgroundColor: s.bg }]}>
                  <Text style={styles.similarEmoji}>{s.emoji}</Text>
                </View>
                <Text style={styles.similarName} numberOfLines={1}>
                  {lang === 'ko' ? s.titleKo : s.titleEn}
                </Text>
                <Text style={styles.similarPrice}>
                  {s.price === 0 ? (lang === 'ko' ? '나눔' : 'Free') : t.won(s.price)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 80 }} />
      </Animated.ScrollView>

      {/* Bottom action bar */}
      <View style={[styles.actionBar, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity
          onPress={() => setLiked(v => !v)}
          style={[styles.likeBtn, { borderRightColor: COL.line }]}
          activeOpacity={0.8}
        >
          <Icon
            name={liked ? 'heartFill' : 'heart'}
            size={26}
            color={liked ? COL.primary : COL.ink2}
          />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.actionPrice}>
            {product.price === 0 ? (lang === 'ko' ? '나눔' : 'Free') : t.won(product.price)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/chat-room/[id]', params: { id: product.id } })}
          style={[styles.chatBtn, chatBtnShadow]}
          activeOpacity={0.85}
        >
          <Text style={styles.chatBtnText}>{t.chatStart}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MannerTemp({ temp, label }: { temp: number; label: string }) {
  const ratio = Math.min(1, Math.max(0, (temp - 30) / 30));
  return (
    <View style={styles.mannerWrap}>
      <Text style={styles.mannerTemp}>{temp.toFixed(1)}°C</Text>
      <View style={styles.mannerBarBg}>
        <View style={[styles.mannerBarFill, { width: `${ratio * 100}%` }]} />
      </View>
      <Text style={styles.mannerLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COL.surface },
  floatingHeader: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    height: 52, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  headerTitle: {
    flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700',
    color: COL.ink, marginHorizontal: 4,
  },
  headerRight: { flexDirection: 'row', gap: 4 },
  hero: {
    height: HERO_HEIGHT, alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  heroImage: { width: '100%', height: HERO_HEIGHT },
  heroEmoji: { fontSize: 120, lineHeight: 140 },
  imageCounter: {
    position: 'absolute', bottom: 14, right: 14,
    backgroundColor: 'rgba(26,20,16,0.45)', paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 12,
  },
  imageCounterText: { fontSize: 12, fontWeight: '600', color: '#fff', letterSpacing: -0.2 },
  sellerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, borderBottomWidth: 1, borderBottomColor: COL.line,
  },
  sellerName: { fontSize: 15, fontWeight: '700', color: COL.ink },
  sellerLoc: { fontSize: 12, color: COL.ink3 },
  section: { padding: 16 },
  productTitle: { fontSize: 21, fontWeight: '700', color: COL.ink, lineHeight: 27, letterSpacing: -0.5 },
  productMeta: { marginTop: 6, fontSize: 12, color: COL.ink3 },
  productDesc: { marginTop: 16, fontSize: 16, color: COL.ink, lineHeight: 25 },
  statsRow: { marginTop: 18, flexDirection: 'row', gap: 14 },
  statLabel: { fontSize: 13, color: COL.ink3 },
  safetyTip: {
    marginHorizontal: 16, marginBottom: 24, padding: 12,
    backgroundColor: COL.primarySoft, borderRadius: 10,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  safetyText: { fontSize: 12.5, color: COL.primaryDark, fontWeight: '600', flex: 1 },
  similar: {
    borderTopWidth: 8, borderTopColor: COL.lineSoft,
    padding: 20, paddingBottom: 24,
  },
  similarTitle: { fontSize: 15, fontWeight: '700', color: COL.ink, marginBottom: 14 },
  similarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  similarItem: { width: '47%' },
  similarImage: {
    width: '100%', aspectRatio: 1, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  similarEmoji: { fontSize: 56 },
  similarName: { fontSize: 13, color: COL.ink, marginTop: 8, lineHeight: 17 },
  similarPrice: { fontSize: 14, fontWeight: '800', color: COL.ink, letterSpacing: -0.3, marginTop: 2 },
  actionBar: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingTop: 10,
    backgroundColor: COL.surface, borderTopWidth: 1, borderTopColor: COL.line,
  },
  likeBtn: {
    padding: 8, paddingRight: 14,
    borderRightWidth: 1,
  },
  actionPrice: { fontSize: 17, fontWeight: '800', color: COL.ink, letterSpacing: -0.4 },
  chatBtn: {
    backgroundColor: COL.primary, paddingHorizontal: 22, paddingVertical: 11,
    borderRadius: 8,
    elevation: 4,
  },
  chatBtnText: { fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: -0.3 },
  mannerWrap: { alignItems: 'flex-end', minWidth: 90 },
  mannerTemp: { fontSize: 14, fontWeight: '700', color: COL.primary, letterSpacing: -0.3 },
  mannerBarBg: { marginTop: 3, height: 4, width: 80, backgroundColor: COL.line, borderRadius: 2, overflow: 'hidden' },
  mannerBarFill: { height: '100%', backgroundColor: COL.primary, borderRadius: 2 },
  mannerLabel: { fontSize: 10.5, color: COL.ink3, marginTop: 3 },
});
