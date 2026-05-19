import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image';

import { COL } from '@/constants/colors';
import { useLang } from '@/context/LangContext';
import { supabase, SUPABASE_URL, SUPABASE_KEY } from '@/lib/supabase';
import { Icon } from '@/components/ui/Icon';

// category index: 0전체 1디지털 2가구 3패션 4유아동 5뷰티 6스포츠 7식물 8도서 9취미
const EMOJI_OPTIONS: { emoji: string; bg: string; category: number }[] = [
  { emoji: '📦', bg: '#F1ECE8', category: 0 },
  { emoji: '📱', bg: '#DCEDC8', category: 1 },
  { emoji: '💻', bg: '#B3E5FC', category: 1 },
  { emoji: '👟', bg: '#C8E6C9', category: 3 },
  { emoji: '👗', bg: '#F8BBD0', category: 3 },
  { emoji: '🪑', bg: '#FFD8C8', category: 2 },
  { emoji: '🛋️', bg: '#FFE0B2', category: 2 },
  { emoji: '📚', bg: '#FFE0B2', category: 8 },
  { emoji: '🎮', bg: '#E1BEE7', category: 9 },
  { emoji: '🧸', bg: '#FFCDD2', category: 4 },
  { emoji: '🪴', bg: '#DCEDC8', category: 7 },
  { emoji: '☕', bg: '#D7CCC8', category: 9 },
  { emoji: '🚲', bg: '#B3E5FC', category: 6 },
  { emoji: '🎸', bg: '#FFE0B2', category: 9 },
  { emoji: '⚽', bg: '#C8E6C9', category: 6 },
  { emoji: '💄', bg: '#F8BBD0', category: 5 },
  { emoji: '🎒', bg: '#FFD8C8', category: 3 },
  { emoji: '🏠', bg: '#FFE0B2', category: 2 },
];

export default function CreateProductScreen() {
  const router = useRouter();
  const { t, lang } = useLang();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJI_OPTIONS[0]);
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const currentTown = lang === 'ko' ? '망원동' : 'Mangwon';

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function uploadImage(uri: string): Promise<string | null> {
    try {
      const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;

      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(filename, blob, { contentType: blob.type || 'image/jpeg', upsert: true });
        if (error || !data) return null;
        return supabase.storage.from('product-images').getPublicUrl(data.path).data.publicUrl;
      } else {
        const uploadUrl = `${SUPABASE_URL}/storage/v1/object/product-images/${filename}`;
        const result = await FileSystem.uploadAsync(uploadUrl, uri, {
          httpMethod: 'POST',
          uploadType: 0 as any, // FileSystemUploadType.BINARY_CONTENT
          headers: {
            Authorization: `Bearer ${SUPABASE_KEY}`,
            apikey: SUPABASE_KEY,
            'Content-Type': 'image/jpeg',
            'x-upsert': 'true',
          },
        });
        if (result.status < 200 || result.status >= 300) return null;
        return `${SUPABASE_URL}/storage/v1/object/public/product-images/${filename}`;
      }
    } catch (e) {
      console.error('Image upload error:', e);
      return null;
    }
  }

  async function handleSubmit() {
    if (!title.trim()) {
      Alert.alert('', t.titleRequired);
      return;
    }

    setLoading(true);

    let imageUrl: string | null = null;
    if (imageUri) {
      imageUrl = await uploadImage(imageUri);
    }

    const { error } = await supabase.from('products').insert({
      emoji: selectedEmoji.emoji,
      bg: selectedEmoji.bg,
      title_ko: title.trim(),
      price: isFree ? 0 : parseInt(price.replace(/[^0-9]/g, ''), 10) || 0,
      location: currentTown,
      status: isFree ? 'free' : 'sale',
      description: description.trim(),
      image_url: imageUrl,
      category: selectedCategory,
    });
    setLoading(false);

    if (error) {
      Alert.alert('', t.uploadFail);
    } else {
      router.replace('/(tabs)');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} activeOpacity={0.7}>
          <Icon name="back" size={24} color={COL.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.registerProduct}</Text>
        <TouchableOpacity onPress={handleSubmit} style={styles.headerBtn} activeOpacity={0.7} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={COL.primary} />
          ) : (
            <Text style={styles.submitText}>{t.submit}</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Photo picker */}
          <Text style={styles.label}>
            {t.productPhoto} <Text style={styles.optional}>{t.photoOptional}</Text>
          </Text>
          {imageUri ? (
            <View style={styles.photoPreview}>
              <Image source={{ uri: imageUri }} style={styles.previewImg} contentFit="cover" />
              <TouchableOpacity style={styles.removeBtn} onPress={() => setImageUri(null)} activeOpacity={0.8}>
                <Text style={styles.removeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.photoPlaceholder} onPress={pickImage} activeOpacity={0.8}>
              <Text style={styles.cameraEmoji}>📷</Text>
              <Text style={styles.addPhotoText}>{t.addPhoto}</Text>
            </TouchableOpacity>
          )}

          {/* Category picker - Korean text chips */}
          <Text style={styles.label}>{t.selectEmoji}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catRow}
          >
            {t.categories.slice(1).map((cat, i) => {
              const idx = i + 1;
              const on = idx === selectedCategory;
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSelectedCategory(idx)}
                  activeOpacity={0.8}
                  style={[styles.catChip, on && styles.catChipActive]}
                >
                  <Text style={[styles.catChipText, on && styles.catChipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Emoji thumbnail picker */}
          <Text style={styles.label}>{lang === 'ko' ? '대표 아이콘' : 'Icon'}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.emojiRow}
          >
            {EMOJI_OPTIONS.map((item) => {
              const selected = item.emoji === selectedEmoji.emoji;
              return (
                <TouchableOpacity
                  key={item.emoji}
                  onPress={() => setSelectedEmoji(item)}
                  activeOpacity={0.8}
                  style={[
                    styles.emojiBtn,
                    { backgroundColor: item.bg },
                    selected && styles.emojiBtnSelected,
                  ]}
                >
                  <Text style={styles.emojiText}>{item.emoji}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Title */}
          <Text style={styles.label}>{t.productTitle}</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder={t.productTitlePlaceholder}
            placeholderTextColor={COL.ink3}
            maxLength={40}
            returnKeyType="next"
          />

          {/* Price */}
          <Text style={styles.label}>{t.productPrice}</Text>
          <View style={styles.priceRow}>
            <TextInput
              style={[styles.input, styles.priceInput, isFree && styles.inputDisabled]}
              value={isFree ? '' : price}
              onChangeText={(v) => setPrice(v.replace(/[^0-9]/g, ''))}
              placeholder={isFree ? (lang === 'ko' ? '무료나눔' : 'Free') : t.pricePlaceholder}
              placeholderTextColor={isFree ? COL.primary : COL.ink3}
              keyboardType="numeric"
              editable={!isFree}
              returnKeyType="next"
            />
            <TouchableOpacity
              onPress={() => setIsFree((v) => !v)}
              activeOpacity={0.8}
              style={[styles.freeBtn, isFree && styles.freeBtnActive]}
            >
              <Text style={[styles.freeBtnText, isFree && styles.freeBtnTextActive]}>
                {t.freeShare}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text style={styles.label}>{t.productDesc}</Text>
          <TextInput
            style={[styles.input, styles.descInput]}
            value={description}
            onChangeText={setDescription}
            placeholder={t.descPlaceholder}
            placeholderTextColor={COL.ink3}
            multiline
            textAlignVertical="top"
            maxLength={500}
          />

          {/* Location */}
          <View style={styles.locationRow}>
            <Icon name="pin" size={16} color={COL.ink3} />
            <Text style={styles.locationText}>{currentTown}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COL.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COL.line,
    backgroundColor: COL.surface,
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COL.ink,
    letterSpacing: -0.4,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: COL.primary,
  },
  body: {
    padding: 20,
    gap: 8,
    paddingBottom: 40,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COL.ink2,
    marginTop: 12,
    marginBottom: 4,
  },
  optional: {
    fontSize: 12,
    fontWeight: '400',
    color: COL.ink3,
  },
  photoPlaceholder: {
    height: 110,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COL.line,
    borderStyle: 'dashed',
    backgroundColor: COL.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cameraEmoji: {
    fontSize: 30,
  },
  addPhotoText: {
    fontSize: 13,
    color: COL.ink3,
    fontWeight: '500',
  },
  photoPreview: {
    width: 110,
    height: 110,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImg: {
    width: 110,
    height: 110,
    borderRadius: 12,
  },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  catRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
    paddingRight: 8,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COL.line,
    backgroundColor: COL.surface,
  },
  catChipActive: {
    borderColor: COL.primary,
    backgroundColor: COL.primarySoft,
  },
  catChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COL.ink2,
  },
  catChipTextActive: {
    color: COL.primary,
    fontWeight: '700',
  },
  emojiRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
    paddingRight: 8,
  },
  emojiBtn: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBtnSelected: {
    borderWidth: 2.5,
    borderColor: COL.primary,
  },
  emojiText: {
    fontSize: 26,
  },
  input: {
    backgroundColor: COL.surface,
    borderWidth: 1,
    borderColor: COL.line,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COL.ink,
  },
  inputDisabled: {
    backgroundColor: COL.lineSoft,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
  },
  freeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COL.line,
    backgroundColor: COL.surface,
  },
  freeBtnActive: {
    borderColor: COL.primary,
    backgroundColor: COL.primarySoft,
  },
  freeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COL.ink2,
  },
  freeBtnTextActive: {
    color: COL.primary,
  },
  descInput: {
    height: 120,
    paddingTop: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COL.lineSoft,
  },
  locationText: {
    fontSize: 13,
    color: COL.ink3,
    fontWeight: '500',
  },
});
