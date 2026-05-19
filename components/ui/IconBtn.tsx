import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { COL } from '@/constants/colors';
import { Icon } from './Icon';

interface IconBtnProps {
  icon: string;
  onPress?: () => void;
  badge?: boolean;
  size?: number;
  color?: string;
}

export function IconBtn({ icon, onPress, badge, size = 22, color = COL.ink }: IconBtnProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.btn} activeOpacity={0.7}>
      <Icon name={icon} size={size} color={color} />
      {badge && <View style={styles.badge} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COL.badgeRed,
  },
});
