import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { COL } from '@/constants/colors';
import { useLang } from '@/context/LangContext';
import { POSTS, Post } from '@/data';
import { AppHeader } from '@/components/AppHeader';
import { ImageBlock } from '@/components/ui/ImageBlock';
import { FAB } from '@/components/ui/FAB';
import { Icon } from '@/components/ui/Icon';

export default function CommunityScreen() {
  const router = useRouter();
  const { t, lang } = useLang();
  const [selectedTab, setSelectedTab] = useState(0);
  const [feedTab, setFeedTab] = useState(0);
  const [likes, setLikes] = useState<Record<string, boolean>>({});

  const currentTown = lang === 'ko' ? '망원동' : 'Mangwon';

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        currentTown={currentTown}
        onLocationPress={() => router.push('/location')}
      />

      {/* Category tabs */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {t.communityTabs.map((tab, i) => {
            const on = i === selectedTab;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedTab(i)}
                style={styles.tabItem}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, on ? styles.tabTextActive : styles.tabTextInactive]}>
                  {tab}
                </Text>
                {on && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <View style={styles.tabDivider} />
      </View>

      {/* Feed sort row */}
      <View style={styles.feedRow}>
        <View style={styles.feedTabs}>
          {t.feedTabs.map((label, i) => {
            const on = i === feedTab;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => setFeedTab(i)}
                style={[styles.feedTabBtn, on && styles.feedTabBtnActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.feedTabText, on && styles.feedTabTextActive]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
          <Icon name="sliders" size={14} color={COL.ink2} stroke={1.6} />
          <Text style={styles.filterText}>{t.filter}</Text>
        </TouchableOpacity>
      </View>

      {/* Posts */}
      <View style={{ flex: 1 }}>
        <FlatList
          data={POSTS}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <PostCard
              post={item}
              lang={lang}
              t={t}
              liked={!!likes[item.id]}
              onLike={() => setLikes(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
              first={index === 0}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
        <FAB />
      </View>
    </SafeAreaView>
  );
}

interface PostCardProps {
  post: Post;
  lang: string;
  t: ReturnType<typeof useLang>['t'];
  liked: boolean;
  onLike: () => void;
  first: boolean;
}

function PostCard({ post: po, lang, t, liked, onLike, first }: PostCardProps) {
  const author = lang === 'ko' ? po.author : po.authorEn;
  const cat = lang === 'ko' ? po.cat : po.catEn;
  const title = lang === 'ko' ? po.titleKo : po.titleEn;
  const body = lang === 'ko' ? po.body : po.bodyEn;

  return (
    <View style={[styles.card, !first && styles.cardBorder]}>
      <View style={styles.cardMeta}>
        <View style={styles.catChip}>
          <Text style={styles.catText}>{cat}</Text>
        </View>
        <Text style={styles.authorText}>{author}</Text>
        <Text style={styles.timeText}>· {t.timeAgo(po.minutesAgo)}</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardBodyText} numberOfLines={2}>{body}</Text>
        </View>
        <ImageBlock emoji={po.emoji} bg={po.bg} size={70} radius={8} fontSize={32} />
      </View>

      <View style={styles.cardStats}>
        <TouchableOpacity onPress={onLike} style={styles.statBtn} activeOpacity={0.7}>
          <Icon name={liked ? 'heartFill' : 'heart'} size={15} color={liked ? COL.primary : COL.ink3} />
          <Text style={[styles.statBtnText, liked && { color: COL.primary }]}>
            {po.likes + (liked ? 1 : 0)}
          </Text>
        </TouchableOpacity>
        <View style={styles.statItem}>
          <Icon name="comment" size={15} color={COL.ink3} stroke={1.6} />
          <Text style={styles.statItemText}>{po.comments}</Text>
        </View>
        <Text style={styles.locationLabel}>{lang === 'ko' ? '망원동' : 'Mangwon'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COL.bg },
  tabsContent: { paddingHorizontal: 12, gap: 0 },
  tabItem: { paddingHorizontal: 12, paddingVertical: 8, position: 'relative' },
  tabText: { fontSize: 14 },
  tabTextActive: { color: COL.ink, fontWeight: '700' },
  tabTextInactive: { color: COL.ink3, fontWeight: '500' },
  tabUnderline: {
    position: 'absolute', bottom: 0, left: 12, right: 12,
    height: 2.5, backgroundColor: COL.ink, borderRadius: 2,
  },
  tabDivider: { height: 1, backgroundColor: COL.lineSoft },
  feedRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  feedTabs: { flexDirection: 'row', gap: 6 },
  feedTabBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  feedTabBtnActive: { backgroundColor: COL.primarySoft },
  feedTabText: { fontSize: 13, fontWeight: '500', color: COL.ink2 },
  feedTabTextActive: { color: COL.primaryDark, fontWeight: '700' },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  filterText: { fontSize: 12.5, color: COL.ink2 },
  card: { padding: 16, paddingBottom: 14, backgroundColor: COL.bg },
  cardBorder: { borderTopWidth: 1, borderTopColor: COL.lineSoft },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  catChip: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4,
    backgroundColor: COL.primarySoft,
  },
  catText: { fontSize: 11, fontWeight: '700', color: COL.primaryDark, letterSpacing: -0.2 },
  authorText: { fontSize: 12, color: COL.ink3 },
  timeText: { fontSize: 12, color: COL.ink3 },
  cardBody: { flexDirection: 'row', gap: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COL.ink, letterSpacing: -0.3, lineHeight: 21 },
  cardBodyText: { marginTop: 6, fontSize: 13.5, color: COL.ink2, lineHeight: 20 },
  cardStats: {
    marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  statBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statBtnText: { fontSize: 12.5, color: COL.ink3 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statItemText: { fontSize: 12.5, color: COL.ink3 },
  locationLabel: { marginLeft: 'auto', fontSize: 12.5, color: COL.ink3 },
});
