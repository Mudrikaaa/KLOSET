import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View as RNView, Image, TextInput } from 'react-native';
import { Text, View, useThemeColor } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { User, Shield, Info, LogOut, Check, Heart, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useAppStore } from '../../store';
import StyledDropdown from '@/components/StyledDropdown';
import { 
  Height, BodyShape, SkinTone, Undertone, StylePreference, 
  CoveragePreference, OccasionFrequency, ColorComfort,
  AgeRange, TopSize, BottomSize, BraSize, ShoeSize, ComfortZone,
  City, BudgetTier, JewelryType, UserStyleProfile
} from '../../types';

const HEIGHTS: Height[] = ['Petite', 'Average', 'Tall'];
const BODY_SHAPES: BodyShape[] = ['Hourglass', 'Pear', 'Apple', 'Rectangle', 'Inverted Triangle'];
const SKIN_TONES: SkinTone[] = ['Fair', 'Wheatish', 'Dusky', 'Deep'];
const UNDERTONES: Undertone[] = ['Warm', 'Cool', 'Neutral'];
const STYLES: StylePreference[] = ['Minimal', 'Ethnic', 'Western', 'Fusion', 'Streetwear'];
const COVERAGE_PREFERENCES: CoveragePreference[] = ['Modest', 'Moderate', 'Open'];
const OCCASION_FREQUENCIES: OccasionFrequency[] = [
  'Mostly Casual', 'Mix of Everything', 'Lots of Functions and Events', 'Professional Environment Daily'
];
const COLOR_COMFORTS: ColorComfort[] = ['Neutrals Only', 'Some Color', 'Bold and Colorful'];
const AGE_RANGES: AgeRange[] = ['16-21', '22-27', '28-35', '36-45', '45+'];

const TOP_SIZES: TopSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const BOTTOM_SIZES: BottomSize[] = ['24', '26', '28', '30', '32', '34', '36', '38', '40'];
const BRA_SIZES: BraSize[] = [
  '28B', '28C', '28D', '30B', '30C', '30D', '30DD', '32B', '32C', '32D', '32DD',
  '34B', '34C', '34D', '34DD', '36B', '36C', '36D', '36DD', '38C', '38D', '38DD', '40C', '40D', '40DD'
];
const SHOE_SIZES: ShoeSize[] = ['3', '4', '5', '6', '7', '8', '9', '10', '11'];
const COMFORT_ZONES: ComfortZone[] = ['Arms', 'Midsection', 'Thighs', 'Hips', 'None'];
const JEWELRY_TYPES: JewelryType[] = [
  'Earrings', 'Necklace / Chain', 'Bangles / Bracelets', 'Rings',
  'Anklets', 'Maang Tikka', 'Nose Pin / Nath', 'Brooch',
  'Watch', 'Waist Chain / Kamarband', 'None'
];
const CITIES: City[] = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata',
  'Hyderabad', 'Pune', 'Jaipur', 'Ahmedabad', 'Lucknow',
  'Chandigarh', 'Goa', 'Other'
];
const BUDGET_TIERS: BudgetTier[] = ['Budget-friendly', 'Mid-range', 'Premium', 'Luxury'];

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];

  // Retrieve state and handlers from Zustand store
  const profile = useAppStore((state) => state.profile);
  const saveProfile = useAppStore((state) => state.saveProfile);
  const signOut = useAppStore((state) => state.signOut);
  const swipeHistory = useAppStore((state) => state.swipeHistory);
  const likedOutfits = swipeHistory.filter((item) => item.direction === 'like');

  const [sections, setSections] = useState({
    body: true,
    color: false,
    style: false,
    location: false,
    avoid: false,
  });

  const [avoidInput, setAvoidInput] = useState('');

  const toggleSection = (sectionKey: keyof typeof sections) => {
    setSections({
      ...sections,
      [sectionKey]: !sections[sectionKey],
    });
  };

  const name = profile?.name || 'Priya Sharma';
  const email = profile?.email || 'priya.sharma@example.com';

  const handleUpdate = (updatedFields: Partial<UserStyleProfile>) => {
    saveProfile(updatedFields);
  };

  const handleComfortZoneToggle = (zone: ComfortZone) => {
    const currentZones = profile?.comfortZones || ['None'];
    if (zone === 'None') {
      handleUpdate({ comfortZones: ['None'] });
    } else {
      const filtered = currentZones.filter((z) => z !== 'None');
      if (filtered.includes(zone)) {
        const next = filtered.filter((z) => z !== zone);
        handleUpdate({ comfortZones: next.length === 0 ? ['None'] : next });
      } else {
        handleUpdate({ comfortZones: [...filtered, zone] });
      }
    }
  };

  const handleJewelryToggle = (jewelry: JewelryType) => {
    const currentJewelry = profile?.jewelryTypes || ['None'];
    if (jewelry === 'None') {
      handleUpdate({ jewelryTypes: ['None'] });
    } else {
      const filtered = currentJewelry.filter((j) => j !== 'None');
      if (filtered.includes(jewelry)) {
        const next = filtered.filter((j) => j !== jewelry);
        handleUpdate({ jewelryTypes: next.length === 0 ? ['None'] : next });
      } else {
        handleUpdate({ jewelryTypes: [...filtered, jewelry] });
      }
    }
  };

  const addAvoidTag = () => {
    const trimmed = avoidInput.trim().toLowerCase();
    const currentAvoid = profile?.avoidList || [];
    if (trimmed && !currentAvoid.includes(trimmed)) {
      handleUpdate({ avoidList: [...currentAvoid, trimmed] });
    }
    setAvoidInput('');
  };

  const removeAvoidTag = (tag: string) => {
    const currentAvoid = profile?.avoidList || [];
    handleUpdate({ avoidList: currentAvoid.filter((t) => t !== tag) });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      {/* Profile Header Card */}
      <View style={[styles.headerCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={[styles.avatarCircle, { backgroundColor: `${theme.tint}20` }]}>
          <User size={36} color={theme.tint} />
        </View>
        <Text style={[styles.nameText, { color: theme.text }]}>{name}</Text>
        <Text style={[styles.emailText, { color: theme.tabIconDefault }]}>{email}</Text>
      </View>

      {/* 1. Body Profile Section */}
      <TouchableOpacity 
        style={[styles.sectionHeader, { borderBottomColor: theme.border }]} 
        onPress={() => toggleSection('body')}
      >
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Body Profile</Text>
        {sections.body ? <ChevronUp size={20} color={theme.text} /> : <ChevronDown size={20} color={theme.text} />}
      </TouchableOpacity>
      
      {sections.body && (
        <View style={[styles.profileSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <StyledDropdown 
            label="Age Range" 
            value={profile?.ageRange} 
            options={AGE_RANGES} 
            onChange={(val) => handleUpdate({ ageRange: val as AgeRange })}
          />

          <StyledDropdown 
            label="Height" 
            value={profile?.height} 
            options={HEIGHTS} 
            onChange={(val) => handleUpdate({ height: val as Height })}
          />

          <StyledDropdown 
            label="Body Shape" 
            value={profile?.bodyShape} 
            options={BODY_SHAPES} 
            onChange={(val) => handleUpdate({ bodyShape: val as BodyShape })}
          />

          <RNView style={styles.sizesRow}>
            <RNView style={{ flex: 1 }}>
              <StyledDropdown 
                label="Top Size" 
                value={profile?.topSize} 
                options={TOP_SIZES} 
                placeholder="Top (XS-3XL)"
                onChange={(val) => handleUpdate({ topSize: val as TopSize })}
              />
            </RNView>
            <RNView style={{ width: 12 }} />
            <RNView style={{ flex: 1 }}>
              <StyledDropdown 
                label="Bottom Size" 
                value={profile?.bottomSize} 
                options={BOTTOM_SIZES} 
                placeholder="Waist (24-40)"
                onChange={(val) => handleUpdate({ bottomSize: val as BottomSize })}
              />
            </RNView>
          </RNView>

          <RNView style={styles.sizesRow}>
            <RNView style={{ flex: 1 }}>
              <StyledDropdown 
                label="Bra Size" 
                value={profile?.braSize} 
                options={BRA_SIZES} 
                placeholder="Bra size"
                onChange={(val) => handleUpdate({ braSize: val as BraSize })}
              />
            </RNView>
            <RNView style={{ width: 12 }} />
            <RNView style={{ flex: 1 }}>
              <StyledDropdown 
                label="Shoe Size" 
                value={profile?.shoeSize} 
                options={SHOE_SIZES} 
                placeholder="Shoe size"
                onChange={(val) => handleUpdate({ shoeSize: val as ShoeSize })}
              />
            </RNView>
          </RNView>

          <Text style={styles.fieldLabel}>Comfort Zones (Areas you prefer to de-emphasize)</Text>
          <RNView style={styles.chipRow}>
            {COMFORT_ZONES.map((zone) => {
              const isSelected = (profile?.comfortZones || ['None']).includes(zone);
              return (
                <TouchableOpacity
                  key={zone}
                  onPress={() => handleComfortZoneToggle(zone)}
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
                    {zone}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </RNView>
        </View>
      )}

      {/* 2. Color & Tone Section */}
      <TouchableOpacity 
        style={[styles.sectionHeader, { borderBottomColor: theme.border }]} 
        onPress={() => toggleSection('color')}
      >
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Color & Tone</Text>
        {sections.color ? <ChevronUp size={20} color={theme.text} /> : <ChevronDown size={20} color={theme.text} />}
      </TouchableOpacity>

      {sections.color && (
        <View style={[styles.profileSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <StyledDropdown 
            label="Skin Tone" 
            value={profile?.skinTone} 
            options={SKIN_TONES} 
            onChange={(val) => handleUpdate({ skinTone: val as SkinTone })}
          />

          <StyledDropdown 
            label="Undertone" 
            value={profile?.undertone} 
            options={UNDERTONES} 
            onChange={(val) => handleUpdate({ undertone: val as Undertone })}
          />

          <StyledDropdown 
            label="Color Comfort" 
            value={profile?.colorComfort} 
            options={COLOR_COMFORTS} 
            onChange={(val) => handleUpdate({ colorComfort: val as ColorComfort })}
          />
        </View>
      )}

      {/* 3. Style & Lifestyle Section */}
      <TouchableOpacity 
        style={[styles.sectionHeader, { borderBottomColor: theme.border }]} 
        onPress={() => toggleSection('style')}
      >
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Style & Lifestyle</Text>
        {sections.style ? <ChevronUp size={20} color={theme.text} /> : <ChevronDown size={20} color={theme.text} />}
      </TouchableOpacity>

      {sections.style && (
        <View style={[styles.profileSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <StyledDropdown 
            label="Primary Style Preference" 
            value={profile?.stylePreference} 
            options={STYLES} 
            onChange={(val) => handleUpdate({ stylePreference: val as StylePreference })}
          />

          <StyledDropdown 
            label="Coverage Preference" 
            value={profile?.coveragePreference} 
            options={COVERAGE_PREFERENCES} 
            onChange={(val) => handleUpdate({ coveragePreference: val as CoveragePreference })}
          />

          <StyledDropdown 
            label="Preferred Budget Tier" 
            value={profile?.budgetTier} 
            options={BUDGET_TIERS} 
            placeholder="Select budget preference"
            onChange={(val) => handleUpdate({ budgetTier: val as BudgetTier })}
          />

          <StyledDropdown 
            label="Occasion Frequency" 
            value={profile?.occasionFrequency} 
            options={OCCASION_FREQUENCIES} 
            onChange={(val) => handleUpdate({ occasionFrequency: val as OccasionFrequency })}
          />

          <Text style={styles.fieldLabel}>Jewelry Types You Wear</Text>
          <RNView style={styles.chipRow}>
            {JEWELRY_TYPES.map((j) => {
              const isSelected = (profile?.jewelryTypes || ['None']).includes(j);
              return (
                <TouchableOpacity
                  key={j}
                  onPress={() => handleJewelryToggle(j)}
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
                    {j}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </RNView>
        </View>
      )}

      {/* 4. Location Section */}
      <TouchableOpacity 
        style={[styles.sectionHeader, { borderBottomColor: theme.border }]} 
        onPress={() => toggleSection('location')}
      >
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Location</Text>
        {sections.location ? <ChevronUp size={20} color={theme.text} /> : <ChevronDown size={20} color={theme.text} />}
      </TouchableOpacity>

      {sections.location && (
        <View style={[styles.profileSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <StyledDropdown 
            label="City" 
            value={profile?.city} 
            options={CITIES} 
            placeholder="Select your city"
            onChange={(val) => handleUpdate({ city: val as City })}
          />
        </View>
      )}

      {/* 5. Avoid List Section */}
      <TouchableOpacity 
        style={[styles.sectionHeader, { borderBottomColor: theme.border }]} 
        onPress={() => toggleSection('avoid')}
      >
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Avoid List</Text>
        {sections.avoid ? <ChevronUp size={20} color={theme.text} /> : <ChevronDown size={20} color={theme.text} />}
      </TouchableOpacity>

      {sections.avoid && (
        <View style={[styles.profileSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={styles.fieldLabel}>Fabrics, fits, or items to ignore in suggestions</Text>
          <RNView style={styles.inputRow}>
            <TextInput
              style={[styles.textInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.card }]}
              placeholder="e.g. ruffles, silk, bodycon"
              placeholderTextColor={theme.tabIconDefault}
              value={avoidInput}
              onChangeText={setAvoidInput}
              onSubmitEditing={addAvoidTag}
            />
            <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.tint }]} onPress={addAvoidTag}>
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </RNView>

          <RNView style={styles.avoidChipsRow}>
            {(profile?.avoidList || []).map((tag) => (
              <RNView key={tag} style={[styles.avoidChip, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={styles.avoidChipText}>{tag}</Text>
                <TouchableOpacity onPress={() => removeAvoidTag(tag)} style={styles.avoidRemove}>
                  <Text style={{ color: theme.accent, fontWeight: 'bold' }}>×</Text>
                </TouchableOpacity>
              </RNView>
            ))}
          </RNView>
        </View>
      )}

      {/* Liked Looks Section */}
      <RNView style={styles.sectionHeaderLiked}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Liked Looks</Text>
      </RNView>
      {likedOutfits.length > 0 ? (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.likedOutfitsScroll}
          style={styles.likedOutfitsContainer}
        >
          {likedOutfits.map((item) => (
            <RNView 
              key={item.id} 
              style={[styles.likedCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <Image source={{ uri: item.outfit.imageUrl }} style={styles.likedImage} />
              <RNView style={styles.likedInfo}>
                <Text style={[styles.likedTitle, { color: theme.text }]} numberOfLines={1}>
                  {item.outfit.title}
                </Text>
                <Text style={[styles.likedStyle, { color: theme.tint }]}>
                  {item.outfit.style}
                </Text>
              </RNView>
            </RNView>
          ))}
        </ScrollView>
      ) : (
        <View style={[styles.profileSection, styles.emptyHistoryBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Heart size={24} color={theme.tabIconDefault} style={{ marginBottom: 8 }} />
          <Text style={[styles.emptyHistoryText, { color: theme.tabIconDefault }]}>
            Outfits you like in Discover will show up here!
          </Text>
        </View>
      )}

      {/* General Settings List */}
      <RNView style={styles.sectionHeaderLiked}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Account</Text>
      </RNView>
      <View style={[styles.profileSection, { backgroundColor: theme.card, borderColor: theme.border, padding: 0 }]}>
        <TouchableOpacity style={[styles.listItem, { borderBottomColor: theme.border }]}>
          <Shield size={18} color={theme.tabIconDefault} style={{ marginRight: 12 }} />
          <Text style={[styles.listItemText, { color: theme.text }]}>Security & Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.listItem, { borderBottomColor: theme.border }]}>
          <Info size={18} color={theme.tabIconDefault} style={{ marginRight: 12 }} />
          <Text style={[styles.listItemText, { color: theme.text }]}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={signOut} style={styles.listItem}>
          <LogOut size={18} color="#EF4444" style={{ marginRight: 12 }} />
          <Text style={[styles.listItemText, { color: '#EF4444' }]}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <RNView style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerCard: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 24,
    marginVertical: 16,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  sectionHeaderLiked: {
    paddingVertical: 14,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileSection: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
    marginTop: 10,
  },
  sizesRow: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: 'transparent',
    marginTop: 4,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'transparent',
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  addBtn: {
    height: 48,
    width: 70,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  avoidChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: 'transparent',
  },
  avoidChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  avoidChipText: {
    fontSize: 13,
  },
  avoidRemove: {
    marginLeft: 6,
    padding: 2,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  listItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
  likedOutfitsScroll: {
    gap: 12,
    paddingRight: 16,
  },
  likedOutfitsContainer: {
    marginBottom: 20,
  },
  likedCard: {
    width: 140,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  likedImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  likedInfo: {
    padding: 8,
    backgroundColor: 'transparent',
  },
  likedTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  likedStyle: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyHistoryBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyHistoryText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
