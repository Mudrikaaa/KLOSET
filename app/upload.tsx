import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, KeyboardAvoidingView, Platform, View as RNView } from 'react-native';
import { Text, View, useThemeColor } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store';
import { Camera, Image as ImageIcon, X, Check, Tag, ChevronDown, ChevronUp } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import StyledDropdown from '@/components/StyledDropdown';
import ColorPalettePicker from '@/components/ColorPalettePicker';
import { COLOR_PALETTE } from '@/constants/ColorPalette';
import { 
  Category, StylePreference, Fit, Fabric, Length, Pattern, Neckline, Sleeve, Season,
  GarmentSubType, WaistPosition, Structure, Embellishment, Opacity
} from '@/types';

const CATEGORIES: Category[] = [
  'Tops', 'Bottoms', 'Dresses',
  'Kurtas & Tunics', 'Sarees', 'Lehengas', 'Suits & Sets',
  'Dupattas & Stoles', 'Ethnic Bottoms',
  'Outers', 'Shoes', 'Accessories'
];

const STYLE_CATEGORIES: StylePreference[] = ['Western', 'Ethnic', 'Fusion', 'Minimal', 'Streetwear'];

const FITS: Fit[] = ['Oversized', 'Relaxed', 'Regular', 'Slim', 'Fitted', 'Boxy'];
const FABRICS: Fabric[] = [
  'Cotton', 'Silk', 'Chiffon', 'Denim', 'Linen', 'Georgette', 'Velvet',
  'Polyester', 'Knit', 'Crepe', 'Satin', 'Organza', 'Net', 'Brocade',
  'Chanderi', 'Banarasi', 'Tussar Silk', 'Rayon', 'Lycra / Stretch',
  'Leather / Faux Leather', 'Wool', 'Fleece', 'Other'
];
const LENGTHS: Length[] = ['Crop', 'Short', 'Knee-length', 'Midi', 'Maxi', 'Full', 'Not Applicable'];
const PATTERNS: Pattern[] = ['Solid', 'Stripes', 'Floral', 'Geometric', 'Checks', 'Embroidered', 'Printed', 'Abstract'];
const NECKLINES: Neckline[] = ['Round', 'V-neck', 'Boat', 'Collar', 'Off-shoulder', 'Halter', 'High-neck', 'Not Applicable'];
const SLEEVES: Sleeve[] = ['Sleeveless', 'Half', '3/4', 'Full', 'Not Applicable'];
const SEASONS: Season[] = ['Summer', 'Winter', 'Monsoon', 'All-season'];

const WAIST_POSITIONS: WaistPosition[] = ['High-waisted', 'Mid-rise', 'Low-rise', 'Not Applicable'];
const STRUCTURES: Structure[] = ['Structured', 'Semi-structured', 'Fluid / Flowy', 'Stretchy / Bodycon'];
const OPACITIES: Opacity[] = ['Opaque', 'Semi-sheer', 'Sheer'];
const EMBELLISHMENTS: Embellishment[] = [
  'None', 'Machine Embroidery', 'Hand Embroidery', 'Zardozi', 'Mirror Work',
  'Sequin / Mukaish', 'Thread Work', 'Gota Patti', 'Beadwork',
  'Block Print', 'Bandhani', 'Kalamkari', 'Applique', 'Lace', 'Other'
];

const SUB_TYPES_BY_CATEGORY: Record<Category, string[]> = {
  'Tops': ['T-shirt', 'Shirt', 'Blouse', 'Crop Top', 'Tank Top', 'Camisole', 'Bodysuit', 'Tube Top'],
  'Bottoms': ['Jeans', 'Trousers', 'Shorts', 'Skirt', 'Culottes', 'Joggers', 'Leggings'],
  'Dresses': ['Maxi Dress', 'Midi Dress', 'Mini Dress', 'Bodycon', 'A-line Dress', 'Shift Dress', 'Wrap Dress'],
  'Kurtas & Tunics': ['Straight Kurta', 'Anarkali', 'A-line Kurta', 'Short Kurti', 'Kaftan', 'Peplum Kurta'],
  'Sarees': ['Saree', 'Pre-stitched Saree', 'Saree Blouse'],
  'Lehengas': ['Lehenga Skirt', 'Lehenga Set', 'Choli / Blouse'],
  'Suits & Sets': ['Salwar Kameez', 'Sharara Set', 'Gharara Set', 'Co-ord Set', 'Palazzo Set'],
  'Dupattas & Stoles': ['Dupatta', 'Stole', 'Scarf'],
  'Ethnic Bottoms': ['Churidar', 'Patiala', 'Palazzo', 'Dhoti Pants', 'Sharara', 'Gharara'],
  'Outers': ['Jacket', 'Blazer', 'Cardigan', 'Shrug', 'Waistcoat', 'Hoodie', 'Sweater', 'Cape'],
  'Shoes': ['Heels', 'Flats', 'Sneakers', 'Boots', 'Sandals', 'Juttis', 'Kolhapuris', 'Wedges'],
  'Accessories': ['Bag', 'Belt', 'Watch', 'Sunglasses', 'Hair Accessory', 'Other']
};

const INDIAN_OCCASIONS = [
  // Festive & Family
  'Diwali Party (Family)', 'Diwali Party (Friends)', 'Holi', 'Navratri / Garba', 'Eid', 'Regional Festival',
  'Pooja / Temple Visit', 'Baby Shower / Godh Bharai',

  // Weddings
  'Mehendi Function', 'Sangeet Night', 'Wedding (Close Family)', 'Wedding (Guest)', 'Reception', 'Cocktail / Pre-wedding',
  'Engagement Ceremony', 'Roka / Sagai',

  // College
  'First Day of College', 'College Farewell', 'College Fest (Day)', 'College Fest (Night)', 'College Trip', 'Internship (Startup)', 'Internship (Corporate)',

  // Professional
  'Job Interview (Tech)', 'Job Interview (Corporate)', 'Office (Startup)', 'Office (Formal)', 'Client Meeting', 'WFH / Video Call',

  // Social
  'Casual Outing', 'Mall / Shopping Day', 'Brunch / Cafe', 'Dinner Date', 'First Date', 'Night Out', 'House Party',

  // Special
  'My Birthday', "Friend's Birthday", 'Travel Day', 'Airport / Travel Look', 'Gym / Workout', 'Beach / Pool Day',
  'Hill Station Trip', 'Heritage City Sightseeing', 'Graduation Day', 'Award Ceremony / Convocation', 'Anniversary Dinner'
];

export default function UploadScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const router = useRouter();
  const addWardrobeItem = useAppStore((state) => state.addWardrobeItem);

  // Form States
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>('Tops');
  const [subType, setSubType] = useState<string>('T-shirt');
  const [style, setStyle] = useState<StylePreference>('Western');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);

  const [fit, setFit] = useState<Fit>('Regular');
  const [fabric, setFabric] = useState<Fabric>('Cotton');
  const [length, setLength] = useState<Length>('Short');
  const [pattern, setPattern] = useState<Pattern>('Solid');
  const [neckline, setNeckline] = useState<Neckline>('Round');
  const [sleeve, setSleeve] = useState<Sleeve>('Full');
  const [waistPosition, setWaistPosition] = useState<WaistPosition>('Not Applicable');
  const [structure, setStructure] = useState<Structure>('Semi-structured');
  const [opacity, setOpacity] = useState<Opacity>('Opaque');
  const [embellishment, setEmbellishment] = useState<Embellishment>('None');

  const [season, setSeason] = useState<Season>('All-season');
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Collapsible Section States
  const [collapsed, setCollapsed] = useState({
    details: true,
    ethnic: true,
    occasions: true
  });

  // Update context-dependent sub-type list on category change
  useEffect(() => {
    const subs = SUB_TYPES_BY_CATEGORY[category];
    if (subs && subs.length > 0) {
      setSubType(subs[0]);
    }
  }, [category]);

  const toggleSection = (section: keyof typeof collapsed) => {
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const isEthnicCategory = [
    'Kurtas & Tunics', 'Sarees', 'Lehengas', 'Suits & Sets', 'Dupattas & Stoles', 'Ethnic Bottoms'
  ].includes(category);

  const isBottomCategory = [
    'Bottoms', 'Ethnic Bottoms', 'Lehengas'
  ].includes(category);

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
    if (loading) return;
    if (!imageUri) {
      setError('Please select or take a photo of the clothing item');
      return;
    }
    if (selectedColors.length === 0) {
      setError('Please select at least 1 color for this garment');
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

      // Save to Zustand storage (which uploads to storage and database)
      await addWardrobeItem({
        imageUrl: imageUri,
        category,
        subType: subType as GarmentSubType,
        colors: selectedColors,
        style,
        tags: tags.length > 0 ? tags : [category.toLowerCase(), subType.toLowerCase()],
        fit,
        fabric,
        length,
        pattern,
        neckline,
        sleeve,
        season,
        waistPosition: isBottomCategory ? waistPosition : 'Not Applicable',
        structure,
        embellishment: isEthnicCategory ? embellishment : 'None',
        opacity,
        occasions: selectedOccasions.length > 0 ? selectedOccasions : ['Casual Outing'],
      });

      setLoading(false);
      router.back();
    } catch (err: any) {
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
        keyboardShouldPersistTaps="handled"
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

        {/* Section 1: Photo (always expanded) */}
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

        {/* Section 2: Basics (always expanded) */}
        <View style={styles.basicsContainer}>
          <StyledDropdown 
            label="Category" 
            value={category} 
            options={CATEGORIES} 
            onChange={(val) => setCategory(val as Category)}
          />

          <StyledDropdown 
            label="Sub-type" 
            value={subType} 
            options={SUB_TYPES_BY_CATEGORY[category] || []} 
            onChange={(val) => setSubType(val)}
          />

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
        </View>

        {/* Section 3: Colors (always expanded) */}
        <View style={styles.colorPickerContainer}>
          <Text style={[styles.sectionLabel, { color: theme.text }]}>Colors (Up to 3)</Text>
          
          <TouchableOpacity 
            style={[styles.swatchSelectorButton, { borderColor: theme.border, backgroundColor: theme.card }]}
            onPress={() => setColorPickerVisible(true)}
          >
            <RNView style={styles.swatchSelectorLeft}>
              {selectedColors.length > 0 ? (
                <RNView style={styles.selectedSwatchesRow}>
                  {selectedColors.map((colorName) => {
                    const swatch = COLOR_PALETTE.find((s) => s.name === colorName);
                    const isRainbow = swatch?.hex === '#RAINBOW';
                    return (
                      <RNView key={colorName} style={[styles.selectedSwatchDotPreview, isRainbow ? styles.rainbowDot : { backgroundColor: swatch?.hex || '#FFF' }]} />
                    );
                  })}
                  <Text style={[styles.swatchBtnText, { color: theme.text }]}>
                    {selectedColors.join(', ')}
                  </Text>
                </RNView>
              ) : (
                <Text style={{ color: theme.tabIconDefault }}>Select garment colors</Text>
              )}
            </RNView>
            <ChevronDown size={20} color={theme.tabIconDefault} />
          </TouchableOpacity>
        </View>

        {/* Section 4: Details (collapsed by default) */}
        <TouchableOpacity 
          style={[styles.collapsibleHeader, { borderBottomColor: theme.border }]} 
          onPress={() => toggleSection('details')}
        >
          <Text style={[styles.collapsibleTitle, { color: theme.text }]}>Garment Details</Text>
          {collapsed.details ? <ChevronDown size={20} color={theme.text} /> : <ChevronUp size={20} color={theme.text} />}
        </TouchableOpacity>

        {!collapsed.details && (
          <View style={[styles.collapsibleContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <StyledDropdown label="Fit" value={fit} options={FITS} onChange={(val) => setFit(val as Fit)} />
            <StyledDropdown label="Fabric" value={fabric} options={FABRICS} onChange={(val) => setFabric(val as Fabric)} />
            <StyledDropdown label="Length" value={length} options={LENGTHS} onChange={(val) => setLength(val as Length)} />
            <StyledDropdown label="Neckline" value={neckline} options={NECKLINES} onChange={(val) => setNeckline(val as Neckline)} />
            <StyledDropdown label="Sleeve" value={sleeve} options={SLEEVES} onChange={(val) => setSleeve(val as Sleeve)} />
            <StyledDropdown label="Structure" value={structure} options={STRUCTURES} onChange={(val) => setStructure(val as Structure)} />
            <StyledDropdown label="Opacity" value={opacity} options={OPACITIES} onChange={(val) => setOpacity(val as Opacity)} />
            
            {isBottomCategory && (
              <StyledDropdown 
                label="Waist Position" 
                value={waistPosition} 
                options={WAIST_POSITIONS} 
                onChange={(val) => setWaistPosition(val as WaistPosition)} 
              />
            )}
          </View>
        )}

        {/* Section 5: Indian Craft & Embellishment (collapsed, ethnic only) */}
        {isEthnicCategory && (
          <>
            <TouchableOpacity 
              style={[styles.collapsibleHeader, { borderBottomColor: theme.border }]} 
              onPress={() => toggleSection('ethnic')}
            >
              <Text style={[styles.collapsibleTitle, { color: theme.text }]}>Ethnic Craft & Print</Text>
              {collapsed.ethnic ? <ChevronDown size={20} color={theme.text} /> : <ChevronUp size={20} color={theme.text} />}
            </TouchableOpacity>

            {!collapsed.ethnic && (
              <View style={[styles.collapsibleContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <StyledDropdown label="Embellishment / Craft" value={embellishment} options={EMBELLISHMENTS} onChange={(val) => setEmbellishment(val as Embellishment)} />
                <StyledDropdown label="Pattern" value={pattern} options={PATTERNS} onChange={(val) => setPattern(val as Pattern)} />
              </View>
            )}
          </>
        )}

        {/* Section 6: Occasions & Season (collapsed by default) */}
        <TouchableOpacity 
          style={[styles.collapsibleHeader, { borderBottomColor: theme.border }]} 
          onPress={() => toggleSection('occasions')}
        >
          <Text style={[styles.collapsibleTitle, { color: theme.text }]}>Occasion & Season</Text>
          {collapsed.occasions ? <ChevronDown size={20} color={theme.text} /> : <ChevronUp size={20} color={theme.text} />}
        </TouchableOpacity>

        {!collapsed.occasions && (
          <View style={[styles.collapsibleContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.fieldLabel, { color: theme.text }]}>Season</Text>
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
                        backgroundColor: isSelected ? theme.tint : 'transparent',
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

            <Text style={[styles.fieldLabel, { color: theme.text, marginTop: 14 }]}>Suitable Occasions (Multi-select)</Text>
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
                        backgroundColor: isSelected ? theme.tint : 'transparent',
                        borderColor: isSelected ? theme.tint : theme.border,
                        marginBottom: 4,
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
          </View>
        )}

        {/* Section 7: Tags (always visible at bottom) */}
        <Text style={[styles.sectionLabel, { color: theme.text, marginTop: 24 }]}>Tags (Comma Separated)</Text>
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

      {/* Color Swatch Picker Modal */}
      <ColorPalettePicker 
        visible={colorPickerVisible}
        selectedColors={selectedColors}
        onChange={setSelectedColors}
        onClose={() => setColorPickerVisible(false)}
      />
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
    paddingBottom: 60,
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
  basicsContainer: {
    backgroundColor: 'transparent',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    backgroundColor: 'transparent',
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
  colorPickerContainer: {
    backgroundColor: 'transparent',
  },
  swatchSelectorButton: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  swatchSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  selectedSwatchesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    gap: 4,
  },
  selectedSwatchDotPreview: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  rainbowDot: {
    backgroundColor: 'red',
  },
  swatchBtnText: {
    fontSize: 15,
    marginLeft: 6,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    marginTop: 12,
  },
  collapsibleTitle: {
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  collapsibleContent: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 12,
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
