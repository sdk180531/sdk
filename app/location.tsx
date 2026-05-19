import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { COL } from '@/constants/colors';
import { useLang } from '@/context/LangContext';
import { TOWNS } from '@/data';
import { Icon } from '@/components/ui/Icon';
import { supabase } from '@/lib/supabase';
import { searchDong, type SearchLocation } from '@/lib/kakao';

const dotShadow = Platform.select({
  web: { boxShadow: '0px 2px 4px rgba(255, 122, 85, 0.5)' } as object,
  default: { shadowColor: COL.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4 } as object,
})!;

const stepDotActiveShadow = Platform.select({
  web: { boxShadow: '0px 2px 4px rgba(255, 122, 85, 0.45)' } as object,
  default: { shadowColor: COL.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.45, shadowRadius: 4 } as object,
})!;

export const SELECTED_TOWN_KEY = 'selected_town_name';

export default function LocationScreen() {
  const router = useRouter();
  const { t, lang } = useLang();
  const [currentTownId, setCurrentTownId] = useState('t1');
  const [range, setRange] = useState(1);
  const [slots, setSlots] = useState<[string, string | null]>(['t1', null]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchLocation[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const isSearching = searchQuery.trim().length >= 2;
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performSearch = useCallback(async (q: string) => {
    try {
      const results = await searchDong(q);
      setSearchResults(results);
    } catch {
      // Kakao 실패 시 Supabase fallback
      const { data } = await supabase
        .from('locations')
        .select('id, name_ko, district, province')
        .ilike('name_ko', `%${q}%`)
        .order('name_ko')
        .limit(30);
      setSearchResults(data ?? []);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    searchTimeoutRef.current = setTimeout(() => performSearch(q), 300);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, performSearch]);

  async function selectTown(id: string) {
    setSlots([id, slots[1]]);
    setCurrentTownId(id);
  }

  async function selectSearchResult(loc: SearchLocation) {
    // AsyncStorage에 선택한 동네 저장
    await AsyncStorage.setItem(SELECTED_TOWN_KEY, loc.name_ko);
    setSearchQuery('');
    router.back();
  }

  const rangeLabels = t.rangeOptions;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Icon name="back" size={24} color={COL.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.locationSetting}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* 검색바 */}
      <View style={styles.searchWrap}>
        <Icon name="search" size={18} color={COL.ink3} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t.searchTown}
          placeholderTextColor={COL.ink3}
          returnKeyType="search"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 1글자 입력 시 안내 */}
      {searchQuery.trim().length === 1 && (
        <Text style={styles.searchHint}>
          {lang === 'ko' ? '2글자 이상 입력해주세요' : 'Enter at least 2 characters'}
        </Text>
      )}

      {isSearching ? (
        /* 검색 중: 전국 검색 결과 표시 */
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.searchList}>
          {searchLoading ? (
            <ActivityIndicator color={COL.primary} style={{ marginTop: 40 }} />
          ) : searchResults.length === 0 ? (
            <Text style={styles.noResult}>{t.noResult}</Text>
          ) : (
            searchResults.map(loc => (
              <TouchableOpacity
                key={loc.id}
                onPress={() => selectSearchResult(loc)}
                style={styles.townItem}
                activeOpacity={0.8}
              >
                <View style={styles.townIcon}>
                  <Icon name="pin" size={18} color={COL.ink2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.townName}>{loc.name_ko}</Text>
                  <Text style={styles.townDist}>{loc.district} · {loc.province}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      ) : (
        /* 검색 없음: 기존 전체 UI */
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Town slots */}
          <View style={styles.slotsSection}>
            <View style={styles.slotsRow}>
              {([0, 1] as const).map(i => {
                const tid = slots[i];
                const town = TOWNS.find(x => x.id === tid);
                const isActive = tid === currentTownId;
                if (town) {
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => setCurrentTownId(tid!)}
                      style={[styles.slotBtn, isActive ? styles.slotActive : styles.slotInactive]}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.slotText, isActive && styles.slotTextActive]}>
                        {lang === 'ko' ? town.nameKo : town.nameEn}
                      </Text>
                    </TouchableOpacity>
                  );
                }
                return (
                  <TouchableOpacity key={i} style={[styles.slotBtn, styles.slotEmpty]} activeOpacity={0.8}>
                    <Icon name="plus" size={16} color={COL.ink3} stroke={2} />
                    <Text style={styles.slotEmptyText}>{t.addLocation}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.slotsHint}>
              {lang === 'ko'
                ? '동네는 최대 2개까지 설정할 수 있어요. 자주 활동하는 동네를 선택해주세요.'
                : 'You can set up to 2 neighborhoods. Pick where you spend most time.'}
            </Text>
          </View>

          {/* Range card */}
          <View style={styles.rangeCard}>
            <View style={styles.rangeHeader}>
              <Text style={styles.rangeTitle}>{t.range}</Text>
              <Text style={styles.rangeValue}>{rangeLabels[range]}</Text>
            </View>

            <View style={styles.circleContainer}>
              {([3, 2, 1, 0] as const).map(i => {
                const sizes = [110, 85, 60, 40];
                const sz = sizes[i];
                const active = i <= range;
                return (
                  <View
                    key={i}
                    style={[
                      styles.circle,
                      {
                        width: sz, height: sz, borderRadius: sz / 2,
                        backgroundColor: active
                          ? `rgba(255,122,85,${0.07 + (3 - i) * 0.06})`
                          : 'rgba(0,0,0,0.03)',
                        borderWidth: 1,
                        borderColor: active
                          ? `rgba(255,122,85,${0.5 - i * 0.1})`
                          : 'rgba(0,0,0,0.08)',
                        borderStyle: active ? 'solid' : 'dashed',
                      },
                    ]}
                  />
                );
              })}
              <View style={[styles.dot, dotShadow]} />
            </View>

            <View style={styles.stepRow}>
              {([0, 1, 2, 3] as const).map(i => {
                const isActive = i === range;
                const isPast = i < range;
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setRange(i)}
                    style={styles.stepBtn}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.stepDot,
                        isActive ? styles.stepDotActive : isPast ? styles.stepDotPast : styles.stepDotInactive,
                        isActive ? stepDotActiveShadow : null,
                      ]}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.stepBar}>
              <View style={styles.stepBarBg} />
              <View style={[styles.stepBarFill, { width: `${(range / 3) * 100}%` }]} />
            </View>

            <View style={styles.stepLabels}>
              {rangeLabels.map((label, i) => (
                <Text
                  key={i}
                  style={[styles.stepLabel, i === range && styles.stepLabelActive]}
                >
                  {label}
                </Text>
              ))}
            </View>
          </View>

          {/* Nearby towns */}
          <View style={styles.nearbySection}>
            <Text style={styles.nearbyTitle}>{t.nearby}</Text>
            <Text style={styles.nearbyDescr}>{t.nearbyDescr}</Text>
          </View>

          <View style={styles.townList}>
            {TOWNS.map(town => {
              const isCurrent = town.id === currentTownId;
              return (
                <TouchableOpacity
                  key={town.id}
                  onPress={() => selectTown(town.id)}
                  style={[styles.townItem, isCurrent && styles.townItemActive]}
                  activeOpacity={0.8}
                >
                  <View style={[styles.townIcon, isCurrent && styles.townIconActive]}>
                    <Icon name="pin" size={18} color={isCurrent ? '#fff' : COL.ink2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.townName}>
                      {lang === 'ko' ? town.nameKo : town.nameEn}
                    </Text>
                    <Text style={styles.townDist}>
                      {town.distance === 0
                        ? (lang === 'ko' ? '내 위치' : 'Your area')
                        : `${town.distance} km`}
                    </Text>
                  </View>
                  {isCurrent && (
                    <Icon name="check" size={16} color={COL.primary} stroke={2.5} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COL.bg },
  header: {
    height: 52, paddingHorizontal: 8,
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: COL.line,
    backgroundColor: COL.surface,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700',
    color: COL.ink, letterSpacing: -0.3,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    margin: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COL.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COL.line,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COL.ink,
    paddingVertical: 0,
  },
  clearBtn: { padding: 4 },
  clearBtnText: { fontSize: 13, color: COL.ink3 },
  searchHint: {
    textAlign: 'center',
    fontSize: 13,
    color: COL.ink3,
    paddingVertical: 20,
  },
  searchList: { padding: 16, paddingBottom: 40 },
  noResult: {
    textAlign: 'center',
    fontSize: 15,
    color: COL.ink3,
    marginTop: 40,
  },
  slotsSection: { padding: 20, paddingBottom: 8 },
  slotsRow: { flexDirection: 'row', gap: 10 },
  slotBtn: {
    flex: 1, paddingVertical: 14, paddingHorizontal: 12,
    borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 4,
  },
  slotActive: { backgroundColor: COL.primary },
  slotInactive: { backgroundColor: COL.surface, borderWidth: 1, borderColor: COL.line },
  slotEmpty: { backgroundColor: COL.surface, borderWidth: 1, borderColor: COL.line, borderStyle: 'dashed' },
  slotText: { fontSize: 15, fontWeight: '700', color: COL.ink, letterSpacing: -0.3 },
  slotTextActive: { color: '#fff' },
  slotEmptyText: { fontSize: 14, fontWeight: '500', color: COL.ink3 },
  slotsHint: { marginTop: 10, fontSize: 12.5, color: COL.ink3, lineHeight: 18 },
  rangeCard: {
    margin: 16, padding: 20, backgroundColor: COL.surface,
    borderRadius: 12, borderWidth: 1, borderColor: COL.line,
  },
  rangeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 },
  rangeTitle: { fontSize: 14, fontWeight: '700', color: COL.ink },
  rangeValue: { fontSize: 12, fontWeight: '700', color: COL.primary },
  circleContainer: {
    height: 120, alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, backgroundColor: '#FAF7F4', borderRadius: 10,
    overflow: 'hidden',
  },
  circle: { position: 'absolute' },
  dot: {
    position: 'absolute', width: 14, height: 14, borderRadius: 7,
    backgroundColor: COL.primary, borderWidth: 3, borderColor: '#fff',
    elevation: 4,
  },
  stepRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 4, marginBottom: 0,
  },
  stepBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  stepDot: { borderRadius: 50 },
  stepDotActive: {
    width: 18, height: 18, backgroundColor: COL.primary,
    borderWidth: 3, borderColor: '#fff',
    elevation: 4,
  },
  stepDotPast: { width: 10, height: 10, backgroundColor: COL.primary },
  stepDotInactive: { width: 10, height: 10, backgroundColor: COL.surface, borderWidth: 1, borderColor: COL.line },
  stepBar: { height: 3, marginHorizontal: 4, position: 'relative', marginTop: -12 },
  stepBarBg: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: COL.line, borderRadius: 2 },
  stepBarFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: COL.primary, borderRadius: 2 },
  stepLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  stepLabel: { width: 60, textAlign: 'center', fontSize: 11, color: COL.ink3 },
  stepLabelActive: { color: COL.primary, fontWeight: '700' },
  nearbySection: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 4 },
  nearbyTitle: { fontSize: 14, fontWeight: '700', color: COL.ink, marginBottom: 4 },
  nearbyDescr: { fontSize: 12, color: COL.ink3 },
  townList: { paddingHorizontal: 16 },
  townItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 10, marginBottom: 8,
    backgroundColor: COL.surface, borderWidth: 1, borderColor: COL.line,
  },
  townItemActive: { backgroundColor: COL.primarySoft, borderColor: COL.primary },
  townIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COL.lineSoft, alignItems: 'center', justifyContent: 'center',
  },
  townIconActive: { backgroundColor: COL.primary },
  townName: { fontSize: 15, fontWeight: '700', color: COL.ink, letterSpacing: -0.3 },
  townDist: { fontSize: 12, color: COL.ink3 },
});
