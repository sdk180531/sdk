import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COL } from '@/constants/colors';
import { I18N } from '@/constants/i18n';
import { useLang } from '@/context/LangContext';

type Status = 'sale' | 'reserved' | 'sold' | 'free' | 'urgent';

interface StatusChipProps {
  status: Status;
}

const CONFIG: Record<Status, { bg: string; color: string; border?: string }> = {
  sale: { bg: 'transparent', color: COL.ink2, border: COL.line },
  reserved: { bg: '#3B7A57', color: '#fff' },
  sold: { bg: COL.ink2, color: '#fff' },
  free: { bg: COL.primary, color: '#fff' },
  urgent: { bg: COL.badgeRed, color: '#fff' },
};

export function StatusChip({ status }: StatusChipProps) {
  const { t } = useLang();
  const cfg = CONFIG[status];
  const label = t.chip[status as keyof typeof t.chip];
  if (!cfg || !label) return null;

  return (
    <View style={[
      styles.chip,
      { backgroundColor: cfg.bg },
      cfg.border ? { borderWidth: 1, borderColor: cfg.border } : {},
    ]}>
      <Text style={[styles.text, { color: cfg.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
