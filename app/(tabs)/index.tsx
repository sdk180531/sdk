import React, { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SELECTED_TOWN_KEY } from '../location';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';

import { COL } from '@/constants/colors';
import { useLang } from '@/context/LangContext';
import { Product, ProductStatus } from '@/data';
import { AppHeader } from '@/components/AppHeader';
import { ImageBlock } from '@/components/ui/ImageBlock';
import { StatusChip } from '@/components/ui/StatusChip';
import { FAB } from '@/components/ui/FAB';
import { Icon } from '@/components/ui/Icon';
import { supabase } from '@/lib/supabase';

interface SupabaseRow {
  id: string;
  emoji: string;
  bg: string;
  title_ko: string;
  price: number;
  location: string;
  status: string;
  description: string;
  hearts: number;
  chats: number;
  views: number;
  created_at: string;
  image_url: string | null;
  category: number;
}

function mapRow(row: SupabaseRow): Product {
  return {
    id: row.id,
    emoji: row.emoji,
    bg: row.bg,
    titleKo: row.title_ko,
    titleEn: row.title_ko,
    price: row.price,
    location: row.location,
    locationEn: row.location,
    minutesAgo: Math.floor((Date.now() - new Date(row.created_at).getTime()) / 60000),
    hearts: row.hearts,
    chats: row.chats,
    views: row.views,
    status: row.status as ProductStatus,
    seller: '나',
    sellerEn: 'Me',
    sellerEmoji: '😊',
    mannerTemp: 36.5,
    descKo: row.description ?? '',
    descEn: row.description ?? '',
    imageUrl: row.image_url ?? undefined,
    category: row.category ?? 0,
  };
}

export default function HomeScreen() {
  const router = useRouter();
  const { t, lang } = useLang();
  const [selectedCat, setSelectedCat] = useState(0);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [currentTown, setCurrentTown] = useState(lang === 'ko' ? '망원동' : 'Mangwon');

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) {
      setDbProducts(data.map(mapRow));
    }
  }

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchProducts().finally(() => setLoading(false));
      AsyncStorage.getItem(SELECTED_TOWN_KEY).then(saved => {
        if (saved) setCurrentTown(saved);
      });
    }, [])
  );

  async function onRefresh() {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  }

  const allProducts = selectedCat === 0
    ? dbProducts
    : dbProducts.filter(p => p.category === selectedCat);

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        currentTown={currentTown}
        onLocationPress={() => router.push('/location')}
      />

      {/* Category chips */}
      <View style={styles.categoryWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContent}
        >
          {t.categories.map((cat, i) => {
            const on = i === selectedCat;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedCat(i)}
                style={[styles.chip, on ? styles.chipActive : styles.chipInactive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, on ? styles.chipTextActive : styles.chipTextInactive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Product feed */}
      <View style={{ flex: 1 }}>
        <FlatList
          data={allProducts}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <ProductRow
              product={item}
              lang={lang}
              t={t}
              liked={!!liked[item.id]}
              onLike={() => setLiked(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
              onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
              first={index === 0}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COL.primary}
            />
          }
          ListHeaderComponent={
            loading && dbProducts.length === 0
              ? <ActivityIndicator style={styles.loader} color={COL.primary} />
              : null
          }
        />
        <FAB onPress={() => router.push('/product/create')} />
      </View>
    </SafeAreaView>
  );
}

interface ProductRowProps {
  product: Product;
  lang: string;
  t: ReturnType<typeof useLang>['t'];
  liked: boolean;
  onLike: () => void;
  onPress: () => void;
  first: boolean;
}

function ProductRow({ product: p, lang, t, liked, onLike, onPress, first }: ProductRowProps) {
  const title = lang === 'ko' ? p.titleKo : p.titleEn;
  const loc = lang === 'ko' ? p.location : p.locationEn;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.row, !first && styles.rowBorder]}
    >
      <View>
        <ImageBlock emoji={p.emoji} bg={p.bg} imageUrl={p.imageUrl} size={88} radius={12} />
        {p.status !== 'sale' && (
          <View style={styles.statusOverlay}>
            <Text style={styles.statusOverlayText}>
              {p.status === 'reserved' ? t.chip.reserved : p.status === 'sold' ? t.chip.sold : ''}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.rowInfo}>
        <View>
          <Text style={styles.rowTitle} numberOfLines={2}>{title}</Text>
          <Text style={styles.rowMeta}>{loc} · {t.timeAgo(p.minutesAgo)}</Text>

          <View style={styles.rowPrice}>
            {p.status === 'free' && <StatusChip status="free" />}
            {p.status === 'reserved' && <StatusChip status="reserved" />}
            <Text style={styles.priceText}>
              {p.price === 0 ? (lang === 'ko' ? '나눔' : 'Free') : t.won(p.price)}
            </Text>
          </View>
        </View>

        <View style={styles.rowStats}>
          {p.chats > 0 && (
            <View style={styles.stat}>
              <Icon name="chat" size={14} color={COL.ink3} stroke={1.6} />
              <Text style={styles.statText}>{p.chats}</Text>
            </View>
          )}
          {p.hearts > 0 && (
            <View style={styles.stat}>
              <Icon name="heart" size={14} color={COL.ink3} stroke={1.6} />
              <Text style={styles.statText}>{p.hearts}</Text>
            </View>
          )}
          <TouchableOpacity onPress={onLike} style={styles.likeBtn} activeOpacity={0.7}>
            <Icon
              name={liked ? 'heartFill' : 'heart'}
              size={18}
              color={liked ? COL.primary : COL.ink3}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COL.bg,
  },
  categoryWrapper: {
    height: 38,
    flexShrink: 0,
  },
  categoryContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 5,
    borderRadius: 20,
  },
  chipActive: {
    backgroundColor: COL.ink,
  },
  chipInactive: {
    backgroundColor: COL.surface,
    borderWidth: 1,
    borderColor: COL.line,
  },
  chipText: {
    fontSize: 13,
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  chipTextInactive: {
    color: COL.ink2,
    fontWeight: '500',
  },
  loader: {
    paddingVertical: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 12,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: COL.lineSoft,
  },
  rowInfo: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'space-between',
  },
  rowTitle: {
    fontSize: 15,
    color: COL.ink,
    lineHeight: 20,
    fontWeight: '500',
  },
  rowMeta: {
    marginTop: 2,
    fontSize: 12,
    color: COL.ink3,
  },
  rowPrice: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
    color: COL.ink,
    letterSpacing: -0.4,
  },
  rowStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    fontSize: 12,
    color: COL.ink3,
  },
  likeBtn: {
    padding: 4,
  },
  statusOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26,20,16,0.5)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOverlayText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
