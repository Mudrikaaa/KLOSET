import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View as RNView, Image } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { User, Shield, Info, LogOut, Check, Heart } from 'lucide-react-native';
import { useAppStore } from '../../store';
import { 
  Height, BodyShape, SkinTone, Undertone, StylePreference, 
  CoveragePreference, OccasionFrequency, ColorComfort 
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

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];

  // Retrieve state and handlers from Zustand store
  const profile = useAppStore((state) => state.profile);
  const saveProfile = useAppStore((state) => state.saveProfile);
  const signOut = useAppStore((state) => state.signOut);
  const swipeHistory = useAppStore((state) => state.swipeHistory);
  const likedOutfits = swipeHistory.filter((item) => item.direction === 'like');

  const name = profile?.name || 'Priya Sharma';
  const email = profile?.email || 'priya.sharma@example.com';
  const height = profile?.height || 'Average';
  const bodyShape = profile?.bodyShape || 'Hourglass';
  const skinTone = profile?.skinTone || 'Wheatish';
  const undertone = profile?.undertone || 'Neutral';
  const stylePref = profile?.stylePreference || 'Fusion';
  const coveragePref = profile?.coveragePreference || 'Moderate';
  const occasionFreq = profile?.occasionFrequency || 'Mix of Everything';
  const colorComfort = profile?.colorComfort || 'Some Color';

  const handleUpdateProfile = (key: string, value: any) => {
    saveProfile({
      height: key === 'height' ? value : height,
      bodyShape: key === 'bodyShape' ? value : bodyShape,
      skinTone: key === 'skinTone' ? value : skinTone,
      undertone: key === 'undertone' ? value : undertone,
      stylePreference: key === 'stylePref' ? value : stylePref,
      coveragePreference: key === 'coveragePref' ? value : coveragePref,
      occasionFrequency: key === 'occasionFreq' ? value : occasionFreq,
      colorComfort: key === 'colorComfort' ? value : colorComfort,
    });
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

      {/* Style Profile Settings */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Style Personalization</Text>
      
      {/* Height Selection */}
      <View style={[styles.profileSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.settingLabel, { color: theme.text }]}>Height</Text>
        <RNView style={styles.chipRow}>
          {HEIGHTS.map((h) => {
            const isSelected = height === h;
            return (
              <TouchableOpacity
                key={h}
                onPress={() => handleUpdateProfile('height', h)}
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
                  {h}
                </Text>
              </TouchableOpacity>
            );
          })}
        </RNView>
      </View>

      {/* Body Shape Selection */}
      <View style={[styles.profileSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.settingLabel, { color: theme.text }]}>Body Shape</Text>
        <RNView style={styles.chipRow}>
          {BODY_SHAPES.map((shape) => {
            const isSelected = bodyShape === shape;
            return (
              <TouchableOpacity
                key={shape}
                onPress={() => handleUpdateProfile('bodyShape', shape)}
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
                  {shape}
                </Text>
              </TouchableOpacity>
            );
          })}
        </RNView>
      </View>

      {/* Skin Tone Selection */}
      <View style={[styles.profileSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.settingLabel, { color: theme.text }]}>Skin Tone</Text>
        <RNView style={styles.chipRow}>
          {SKIN_TONES.map((tone) => {
            const isSelected = skinTone === tone;
            return (
              <TouchableOpacity
                key={tone}
                onPress={() => handleUpdateProfile('skinTone', tone)}
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
                  {tone}
                </Text>
              </TouchableOpacity>
            );
          })}
        </RNView>
      </View>

      {/* Undertone Selection */}
      <View style={[styles.profileSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.settingLabel, { color: theme.text }]}>Skin Undertone</Text>
        <RNView style={styles.chipRow}>
          {UNDERTONES.map((u) => {
            const isSelected = undertone === u;
            return (
              <TouchableOpacity
                key={u}
                onPress={() => handleUpdateProfile('undertone', u)}
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
                  {u}
                </Text>
              </TouchableOpacity>
            );
          })}
        </RNView>
      </View>

      {/* Style Preference Selection */}
      <View style={[styles.profileSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.settingLabel, { color: theme.text }]}>Primary Style</Text>
        <RNView style={styles.chipRow}>
          {STYLES.map((style) => {
            const isSelected = stylePref === style;
            return (
              <TouchableOpacity
                key={style}
                onPress={() => handleUpdateProfile('stylePref', style)}
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
                  {style}
                </Text>
              </TouchableOpacity>
            );
          })}
        </RNView>
      </View>

      {/* Coverage Preference Selection */}
      <View style={[styles.profileSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.settingLabel, { color: theme.text }]}>Coverage Preference</Text>
        <RNView style={styles.chipRow}>
          {COVERAGE_PREFERENCES.map((c) => {
            const isSelected = coveragePref === c;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => handleUpdateProfile('coveragePref', c)}
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
                  {c}
                </Text>
              </TouchableOpacity>
            );
          })}
        </RNView>
      </View>

      {/* Occasion Frequency Selection */}
      <View style={[styles.profileSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.settingLabel, { color: theme.text }]}>Occasion Frequency</Text>
        <RNView style={styles.chipRow}>
          {OCCASION_FREQUENCIES.map((occ) => {
            const isSelected = occasionFreq === occ;
            return (
              <TouchableOpacity
                key={occ}
                onPress={() => handleUpdateProfile('occasionFreq', occ)}
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
                  {occ}
                </Text>
              </TouchableOpacity>
            );
          })}
        </RNView>
      </View>

      {/* Color Comfort Selection */}
      <View style={[styles.profileSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.settingLabel, { color: theme.text }]}>Color Comfort</Text>
        <RNView style={styles.chipRow}>
          {COLOR_COMFORTS.map((col) => {
            const isSelected = colorComfort === col;
            return (
              <TouchableOpacity
                key={col}
                onPress={() => handleUpdateProfile('colorComfort', col)}
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
                  {col}
                </Text>
              </TouchableOpacity>
            );
          })}
        </RNView>
      </View>

      {/* Liked Looks Section */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Liked Looks</Text>
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
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Account</Text>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileSection: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
