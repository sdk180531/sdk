import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COL } from '@/constants/colors';
import { useLang } from '@/context/LangContext';
import { Icon } from './ui/Icon';
import { IconBtn } from './ui/IconBtn';

interface AppHeaderProps {
  currentTown: string;
  onLocationPress?: () => void;
}

export function AppHeader({ currentTown, onLocationPress }: AppHeaderProps) {
  const { lang, toggleLang } = useLang();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onLocationPress} style={styles.locationBtn} activeOpacity={0.7}>
        <Text style={styles.locationText}>{currentTown}</Text>
        <Icon name="down" size={20} color={COL.ink} />
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity onPress={toggleLang} style={styles.langToggle} activeOpacity={0.7}>
          <Text style={styles.langText}>{lang === 'ko' ? 'EN' : '한'}</Text>
        </TouchableOpacity>
        <IconBtn icon="search" />
        <IconBtn icon="bell" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: COL.bg,
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 0,
  },
  locationText: {
    fontSize: 19,
    fontWeight: '800',
    color: COL.ink,
    letterSpacing: -0.5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  langToggle: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: COL.lineSoft,
    marginRight: 2,
  },
  langText: {
    fontSize: 12,
    fontWeight: '700',
    color: COL.ink2,
    letterSpacing: 0.2,
  },
});
