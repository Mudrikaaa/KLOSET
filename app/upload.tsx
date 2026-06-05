import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, KeyboardAvoidingView, Platform, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store';
import { Camera, Image as ImageIcon, X, Check, Tag } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Category, StylePreference } from '@/types';

const CATEGORIES: Category[] = ['Tops', 'Bottoms', 'Dresses', 'Ethnic', 'Outers', 'Shoes'];
const STYLE_CATEGORIES: StylePreference[] = ['Western', 'Ethnic', 'Fusion', 'Minimal', 'Streetwear'];
const COLORS = ['White', 'Black', 'Grey', 'Beige', 'Blue', 'Indigo', 'Maroon', 'Emerald', 'Pink', 'Yellow'];

export default function UploadScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const router = useRouter();
  const addWardrobeItem = useAppStore((state) => state.addWardrobeItem);

  // Form States
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>('Tops');
  const [style, setStyle] = useState<StylePreference>('Western');
  const [color, setColor] = useState('White');
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState('');

  // Image Picker Logic
  const handlePickImage = async (useCamera: boolean) => {
    try {
      const permissionResult = useCamera 
        ? await ImagePicker.requestCameraPermissionsAsync() 
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        setError(`Permission to access ${useCamera ? 'camera' : 'gallery'} is required!`);
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setError('');
      }
    } catch (err) {
      setError('Could not access image. Please try again.');
    }
  };

  const handleUpload = () => {
    if (!imageUri) {
      setError('Please select or take a photo of the clothing item');
      return;
    }
    setError('');

    // Parse comma separated tags
    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0);

    // Save to Zustand storage
    addWardrobeItem({
      imageUrl: imageUri,
      category,
      color,
      style,
      tags: tags.length > 0 ? tags : [category.toLowerCase()],
    });

    // Return to wardrobe tab
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1 }}
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Close Row */}
        <RNView style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.text }]}>Add New Item</Text>
          <TouchableOpacity onPress={() => router.back()} style={[styles.closeBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <X size={20} color={theme.text} />
          </TouchableOpacity>
        </RNView>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Image Selection Area */}
        <RNView style={[styles.imageArea, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {imageUri ? (
            <RNView style={styles.previewContainer}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <TouchableOpacity 
                onPress={() => setImageUri(null)}
                style={styles.removeImageBtn}
              >
                <X size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </RNView>
          ) : (
            <RNView style={styles.imageSelectorRow}>
              <TouchableOpacity 
                onPress={() => handlePickImage(true)}
                style={[styles.pickerBtn, { borderColor: theme.border }]}
              >
                <Camera size={28} color={theme.tint} />
                <Text style={[styles.pickerBtnText, { color: theme.text }]}>Camera</Text>
              </TouchableOpacity>
              <RNView style={[styles.pickerDivider, { backgroundColor: theme.border }]} />
              <TouchableOpacity 
                onPress={() => handlePickImage(false)}
                style={[styles.pickerBtn, { borderColor: theme.border }]}
              >
                <ImageIcon size={28} color={theme.tint} />
                <Text style={[styles.pickerBtnText, { color: theme.text }]}>Gallery</Text>
              </TouchableOpacity>
            </RNView>
          )}
        </RNView>

        {/* Input: Category */}
        <Text style={[styles.sectionLabel, { color: theme.text }]}>Category</Text>
        <RNView style={styles.chipRow}>
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: isSelected ? theme.tint : theme.card,
                    borderColor: isSelected ? theme.tint : theme.border,
                  }
                ]}
              >
                {isSelected && <Check size={12} color="#FFFFFF" style={{ marginRight: 4 }} />}
                <Text style={[styles.optionText, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </RNView>

        {/* Input: Style */}
        <Text style={[styles.sectionLabel, { color: theme.text }]}>Style Tag</Text>
        <RNView style={styles.chipRow}>
          {STYLE_CATEGORIES.map((st) => {
            const isSelected = style === st;
            return (
              <TouchableOpacity
                key={st}
                onPress={() => setStyle(st)}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: isSelected ? theme.tint : theme.card,
                    borderColor: isSelected ? theme.tint : theme.border,
                  }
                ]}
              >
                {isSelected && <Check size={12} color="#FFFFFF" style={{ marginRight: 4 }} />}
                <Text style={[styles.optionText, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                  {st}
                </Text>
              </TouchableOpacity>
            );
          })}
        </RNView>

        {/* Input: Color */}
        <Text style={[styles.sectionLabel, { color: theme.text }]}>Color</Text>
        <RNView style={styles.chipRow}>
          {COLORS.map((col) => {
            const isSelected = color === col;
            return (
              <TouchableOpacity
                key={col}
                onPress={() => setColor(col)}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: isSelected ? theme.tint : theme.card,
                    borderColor: isSelected ? theme.tint : theme.border,
                  }
                ]}
              >
                <RNView style={[styles.colorIndicator, { backgroundColor: col.toLowerCase() === 'white' ? '#E2E8F0' : col.toLowerCase() }]} />
                <Text style={[styles.optionText, { color: isSelected ? '#FFFFFF' : theme.text, marginLeft: 6 }]}>
                  {col}
                </Text>
              </TouchableOpacity>
            );
          })}
        </RNView>

        {/* Input: Tags */}
        <Text style={[styles.sectionLabel, { color: theme.text }]}>Tags (Comma Separated)</Text>
        <RNView style={[styles.tagsInputWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Tag size={16} color={theme.tabIconDefault} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="cotton, summer, formal, floral..."
            placeholderTextColor={theme.tabIconDefault}
            value={tagsInput}
            onChangeText={setTagsInput}
            style={[styles.textInput, { color: theme.text }]}
          />
        </RNView>

        {/* Submit Button */}
        <TouchableOpacity 
          onPress={handleUpload}
          style={[styles.submitBtn, { backgroundColor: theme.accent }]}
          activeOpacity={0.8}
        >
          <Text style={styles.submitBtnText}>Add to Closet</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 16,
  },
  imageArea: {
    height: 180,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  previewContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  pickerBtn: {
    flex: 1,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerBtnText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  pickerDivider: {
    width: 1,
    height: 60,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  tagsInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    fontWeight: '500',
  },
  submitBtn: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
