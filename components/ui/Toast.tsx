import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { COL } from '@/constants/colors';

interface ToastProps {
  message: string;
  visible: boolean;
  type?: 'success' | 'error';
}

export function Toast({ message, visible, type = 'success' }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -20, duration: 300, useNativeDriver: true }),
        ]).start();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: type === 'success' ? COL.good : COL.badgeRed },
        { opacity, transform: [{ translateY }] },
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
