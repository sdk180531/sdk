import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { COL } from '@/constants/colors';
import { Icon } from './Icon';

interface FABProps {
  onPress?: () => void;
}

const shadow = Platform.select({
  web: { boxShadow: '0px 8px 12px rgba(255, 122, 85, 0.45)' } as object,
  default: {
    shadowColor: COL.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  } as object,
})!;

export function FAB({ onPress }: FABProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.fab, shadow]}
    >
      <Icon name="plus" size={26} color="#fff" stroke={2.4} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COL.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
