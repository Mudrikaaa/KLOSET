import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, KeyboardAvoidingView, Platform, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store';
import { Camera, Image as ImageIcon, X, Check, Tag } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { 
  Category, StylePreference, Color, Fit, Fabric, Length, Pattern, Neckline, Sleeve, Season 
} from '@/types';

const CATEGORIES: Category[] = ['Tops', 'Bottoms', 'Dresses', 'Ethnic', 'Outers', 'Shoes'];
const STYLE_CATEGORIES: StylePreference[] = ['Western', 'Ethnic', 'Fusion', 'Minimal', 'Streetwear'];

const COLORS: Color[] = [
  'White', 'Black', 'Grey', 'Beige', 'Navy', 'Blue', 'Light Blue', 'Indigo', 
  'Maroon', 'Burgundy', 'Red', 'Pink', 'Lavender', 'Purple', 'Emerald', 'Green', 
  'Olive', 'Teal', 'Yellow', 'Mustard', 'Orange', 'Rust', 'Coral', 'Peach', 
  'Brown', 'Chocolate', 'Gold', 'Silver'
];

const FITS: Fit[] = ['Oversized', 'Relaxed', 'Regular', 'Slim', 'Fitted', 'Boxy'];
const FABRICS: Fabric[] = ['Cotton', 'Silk', 'Chiffon', 'Denim', 'Linen', 'Georgette', 'Velvet', 'Polyester', 'Knit', 'Other'];
const LENGTHS: Length[] = ['Crop', 'Short', 'Knee-length', 'Midi', 'Maxi', 'Full', 'Not Applicable'];
const PATTERNS: Pattern[] = ['Solid', 'Stripes', 'Floral', 'Geometric', 'Checks', 'Embroidered', 'Printed', 'Abstract'];
const NECKLINES: Neckline[] = ['Round', 'V-neck', 'Boat', 'Collar', 'Off-shoulder', 'Halter', 'High-neck', 'Not Applicable'];
const SLEEVES: Sleeve[] = ['Sleeveless', 'Half', '3/4', 'Full', 'Not Applicable'];
const SEASONS: Season[] = ['Summer', 'Winter', 'Monsoon', 'All-season'];

const INDIAN_OCCASIONS = [
  'Diwali Party (Family)', 'Diwali Party (Friends)', 'Holi', 'Navratri / Garba', 'Eid', 'Regional Festival',
  'Mehendi Function', 'Sangeet Night', 'Wedding (Close Family)', 'Wedding (Guest)', 'Reception', 'Cocktail / Pre-wedding',
  'First Day of College', 'College Farewell', 'College Fest (Day)', 'College Fest (Night)', 'College Trip', 'Internship (Startup)', 'Internship (Corporate)',
  'Job Interview (Tech)', 'Job Interview (Corporate)', 'Office (Startup)', 'Office (Formal)', 'Client Meeting',
  'Casual Outing', 'Mall / Shopping Day', 'Brunch / Cafe', 'Dinner Date', 'First Date', 'Night Out',
  'My Birthday', "Friend's Birthday", 'Travel Day'
];

const COLOR_MAP: Record<string, string> = {
  'White': '#FFFFFF',
  'Black': '#000000',
  'Grey': '#808080',
  'Beige': '#F5F5DC',
  'Navy': '#000080',
  'Blue': '#0000FF',
  'Light Blue': '#ADD8E6',
  'Indigo': '#4B0082',
  'Maroon': '#800000',
  'Burgundy': '#800020',
  'Red': '#FF0000',
  'Pink': '#FFC0CB',
  'Lavender': '#E6E6FA',
  'Purple': '#800080',
  'Emerald': '#50C878',
  'Green': '#008000',
  'Olive': '#808000',
  'Teal': '#008080',
  'Yellow': '#FFFF00',
  'Mustard': '#FFDB58',
  'Orange': '#FFA500',
  'Rust': '#B7410E',
  'Coral': '#FF7F50',
  'Peach': '#FFDAB9',
  'Brown': '#A52A2A',
  'Chocolate': '#7B3F00',
  'Gold': '#FFD700',
  'Silver': '#C0C0C0'
};

export default function UploadScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const router = useRouter();
  const addWardrobeItem = useAppStore((state) => state.addWardrobeItem);

  // Form States
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>('Tops');
  const [style, setStyle] = useState<StylePreference>('Western');
  const [color, setColor] = useState<Color>('White');
  const [fit, setFit] = useState<Fit>('Regular');
  const [fabric, setFabric] = useState<Fabric>('Cotton');
  const [length, setLength] = useState<Length>('Full');
  const [pattern, setPattern] = useState<Pattern>('Solid');
  const [neckline, setNeckline] = useState<Neckline>('Round');
  const [sleeve, setSleeve] = useState<Sleeve>('Full');
  const [season, setSeason] = useState<Season>('All-season');
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Image Picker Logic
  const handlePickImage = async (useCamera: boolean) => {
    if (loading) return;
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

  const toggleOccasion = (occ: string) => {
    if (loading) return;
    if (selectedOccasions.includes(occ)) {
      setSelectedOccasions(selectedOccasions.filter(o => o !== occ));
    } else {
      setSelectedOccasions([...selectedOccasions, occ]);
    }
  };

  const handleUpload = async () => {
    console.log('[KLOSET-DEBUG] handleUpload button pressed. imageUri:', imageUri ? imageUri.substring(0, 100) : 'null');
    if (loading) {
      console.log('[KLOSET-DEBUG] handleUpload aborted: already loading');
      return;
    }
    if (!imageUri) {
      console.log('[KLOSET-DEBUG] handleUpload aborted: no image selected');
      setError('Please select or take a photo of the clothing item');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Parse comma separated tags
      const tags = tagsInput
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length > 0);

      console.log('[KLOSET-DEBUG] Preparing to call addWardrobeItem...');
      // Save to Zustand storage (which uploads to storage and database)
      await addWardrobeItem({
        imageUrl: imageUri,
        category,
        color,
        style,
        tags: tags.length > 0 ? tags : [category.toLowerCase()],
        fit,
        fabric,
        length,
        pattern,
        neckline,
        sleeve,
        season,
        occasions: selectedOccasions.length > 0 ? selectedOccasions : ['Casual Outing'],
      });

      console.log('[KLOSET-DEBUG] addWardrobeItem succeeded! Navigating back...');
      setLoading(false);
      // Return to wardrobe tab
      router.back();
    } catch (err: any) {
      console.error('[KLOSET-DEBUG] handleUpload caught error:', err);
      setError(err.message || 'An error occurred during save');
      setLoading(false);
    }
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
          <TouchableOpacity 
            onPress={() => router.back()} 
            disabled={loading}
            style={[styles.closeBtn, { backgroundColor: theme.card, borderColor: theme.border, opacity: loading ? 0.5 : 1 }]}
          >
            <X size={20} color={theme.text} />
          </TouchableOpacity>
        </RNView>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Image Selection Area */}
        <RNView style={[styles.imageArea, { backgroundColor: theme.card, borderColor: theme.border }]} pointerEvents={loading ? 'none' : 'auto'}>
          {imageUri ? (
            <RNView style={styles.previewContainer}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <TouchableOpacity 
                onPress={() => setImageUri(null)}
                disabled={loading}
                style={[styles.removeImageBtn, { opacity: loading ? 0.5 : 1 }]}
              >
                <X size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </RNView>
          ) : (
            <RNView style={styles.imageSelectorRow}>
              <TouchableOpacity 
                onPress={() => handlePickImage(true)}
                disabled={loading}
                style={[styles.pickerBtn, { borderColor: theme.border }]}
              >
                <Camera size={28} color={theme.tint} />
                <Text style={[styles.pickerBtnText, { color: theme.text }]}>Camera</Text>
              </TouchableOpacity>
              <RNView style={[styles.pickerDivider, { backgroundColor: theme.border }]} />
              <TouchableOpacity 
                onPress={() => handlePickImage(false)}
                disabled={loading}
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
            const dotColor = COLOR_MAP[col] || '#FFFFFF';
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
                <RNView style={[
                  styles.colorIndicator, 
                  { 
                    backgroundColor: dotColor, 
                    borderWidth: col === 'White' ? 1 : 0, 
                    borderColor: theme.border 
                  }
                ]} />
                <Text style={[styles.optionText, { color: isSelected ? '#FFFFFF' : theme.text, marginLeft: 6 }]}>
                  {col}
                </Text>
              </TouchableOpacity>
            );
          })}
        </RNView>

        {/* Input: Fit */}
        <Text style={[styles.sectionLabel, { color: theme.text }]}>Fit</Text>
        <RNView style={styles.chipRow}>
          {FITS.map((f) => {
            const isSelected = fit === f;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setFit(f)}
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
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </RNView>

        {/* Input: Fabric */}
        <Text style={[styles.sectionLabel, { color: theme.text }]}>Fabric</Text>
        <RNView style={styles.chipRow}>
          {FABRICS.map((f) => {
            const isSelected = fabric === f;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setFabric(f)}
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
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </RNView>

        {/* Input: Length */}
        <Text style={[styles.sectionLabel, { color: theme.text }]}>Length</Text>
        <RNView style={styles.chipRow}>
          {LENGTHS.map((l) => {
            const isSelected = length === l;
            return (
              <TouchableOpacity
                key={l}
                onPress={() => setLength(l)}
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
                  {l}
                </Text>
              </TouchableOpacity>
            );
          })}
        </RNView>

        {/* Input: Pattern */}
        <Text style={[styles.sectionLabel, { color: theme.text }]}>Pattern</Text>
        <RNView style={styles.chipRow}>
          {PATTERNS.map((p) => {
            const isSelected = pattern === p;
            return (
              <TouchableOpacity
                key={p}
                onPress={() => setPattern(p)}
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
                  {p}
                </Text>
              </TouchableOpacity>
            );
          })}
        </RNView>

        {/* Input: Neckline */}
        <Text style={[styles.sectionLabel, { color: theme.text }]}>Neckline</Text>
        <RNView style={styles.chipRow}>
          {NECKLINES.map((n) => {
            const isSelected = neckline === n;
            return (
              <TouchableOpacity
                key={n}
                onPress={() => setNeckline(n)}
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
                  {n}
                </Text>
              </TouchableOpacity>
            );
          })}
        </RNView>

        {/* Input: Sleeve */}
        <Text style={[styles.sectionLabel, { color: theme.text }]}>Sleeve</Text>
        <RNView style={styles.chipRow}>
          {SLEEVES.map((s) => {
            const isSelected = sleeve === s;
            return (
              <TouchableOpacity
                key={s}
                onPress={() => setSleeve(s)}
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
                  {s}
                </Text>
              </TouchableOpacity>
            );
          })}
        </RNView>

        {/* Input: Season */}
        <Text style={[styles.sectionLabel, { color: theme.text }]}>Season</Text>
        <RNView style={styles.chipRow}>
          {SEASONS.map((s) => {
            const isSelected = season === s;
            return (
              <TouchableOpacity
                key={s}
                onPress={() => setSeason(s)}
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
                  {s}
                </Text>
              </TouchableOpacity>
            );
          })}
        </RNView>

        {/* Input: Occasions (Multi-select) */}
        <Text style={[styles.sectionLabel, { color: theme.text }]}>Occasions (Multi-select)</Text>
        <RNView style={styles.chipRow}>
          {INDIAN_OCCASIONS.map((occ) => {
            const isSelected = selectedOccasions.includes(occ);
            return (
              <TouchableOpacity
                key={occ}
                onPress={() => toggleOccasion(occ)}
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
                  {occ}
                </Text>
              </TouchableOpacity>
            );
          })}
        </RNView>

        {/* Input: Tags */}
        <Text style={[styles.sectionLabel, { color: theme.text }]}>Tags (Comma Separated)</Text>
        <RNView style={[styles.tagsInputWrapper, { backgroundColor: theme.card, borderColor: theme.border, opacity: loading ? 0.6 : 1 }]}>
          <Tag size={16} color={theme.tabIconDefault} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="cotton, summer, formal, floral..."
            placeholderTextColor={theme.tabIconDefault}
            value={tagsInput}
            onChangeText={setTagsInput}
            editable={!loading}
            style={[styles.textInput, { color: theme.text }]}
          />
        </RNView>

        {/* Submit Button */}
        <TouchableOpacity 
          onPress={handleUpload}
          disabled={loading}
          style={[styles.submitBtn, { backgroundColor: loading ? theme.tabIconDefault : theme.accent }]}
          activeOpacity={0.8}
        >
          <Text style={styles.submitBtnText}>{loading ? 'Saving & Uploading...' : 'Add to Closet'}</Text>
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
