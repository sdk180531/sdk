import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

interface ImageBlockProps {
  emoji: string;
  bg: string;
  imageUrl?: string;
  size?: number;
  radius?: number;
  fontSize?: number;
}

export function ImageBlock({ emoji, bg, imageUrl, size = 100, radius = 12, fontSize }: ImageBlockProps) {
  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={{ width: size, height: size, borderRadius: radius }}
        contentFit="cover"
      />
    );
  }

  const fs = fontSize ?? size * 0.45;
  return (
    <View style={[styles.block, { width: size, height: size, backgroundColor: bg, borderRadius: radius }]}>
      <Text style={{ fontSize: fs, lineHeight: fs * 1.2 }}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
