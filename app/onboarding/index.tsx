import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAppStore } from '@/store';
import { Sparkles, Check } from 'lucide-react-native';
import { BodyType, SkinTone, StylePreference } from '@/types';

const BODY_TYPES: BodyType[] = ['Petite', 'Athletic', 'Curvy', 'Plus', 'Tall'];
const SKIN_TONES: SkinTone[] = ['Fair', 'Wheatish', 'Dusky', 'Deep'];
const STYLES: StylePreference[] = ['Minimal', 'Ethnic', 'Western', 'Fusion', 'Streetwear'];

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const saveProfile = useAppStore((state) => state.saveProfile);

  // Selections
  const [bodyType, setBodyType] = useState<BodyType>('Curvy');
  const [skinTone, setSkinTone] = useState<SkinTone>('Wheatish');
  const [stylePref, setStylePref] = useState<StylePreference>('Fusion');

  const handleComplete = () => {
    saveProfile({
      bodyType,
      skinTone,
      stylePreference: stylePref,
    });
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: `${theme.tint}15` }]}>
          <Sparkles size={32} color={theme.tint} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Personalize Kloset</Text>
        <Text style={[styles.subtitle, { color: theme.tabIconDefault }]}>
          We customize suggestions based on your body shape, skin tone, and style preference.
        </Text>
      </View>

      {/* Step 1: Body Type */}
      <View style={[styles.stepCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.stepLabel, { color: theme.text }]}>1. Select Body Type</Text>
        <RNView style={styles.chipRow}>
          {BODY_TYPES.map((type) => {
            const isSelected = bodyType === type;
            return (
              <TouchableOpacity
                key={type}
                onPress={() => setBodyType(type)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? theme.tint : 'transparent',
                    borderColor: isSelected ? theme.tint : theme.border,
                  }
                ]}
              >
                {isSelected && <Check size={12} color="#FFFFFF" style={{ marginRight: 4 }} />}
                <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </RNView>
      </View>

      {/* Step 2: Skin Tone */}
      <View style={[styles.stepCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.stepLabel, { color: theme.text }]}>2. Select Skin Tone</Text>
        <RNView style={styles.chipRow}>
          {SKIN_TONES.map((tone) => {
            const isSelected = skinTone === tone;
            return (
              <TouchableOpacity
                key={tone}
                onPress={() => setSkinTone(tone)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? theme.tint : 'transparent',
                    borderColor: isSelected ? theme.tint : theme.border,
                  }
                ]}
              >
                {isSelected && <Check size={12} color="#FFFFFF" style={{ marginRight: 4 }} />}
                <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                  {tone}
                </Text>
              </TouchableOpacity>
            );
          })}
        </RNView>
      </View>

      {/* Step 3: Style Preference */}
      <View style={[styles.stepCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.stepLabel, { color: theme.text }]}>3. Primary Fashion Style</Text>
        <RNView style={styles.chipRow}>
          {STYLES.map((style) => {
            const isSelected = stylePref === style;
            return (
              <TouchableOpacity
                key={style}
                onPress={() => setStylePref(style)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? theme.tint : 'transparent',
                    borderColor: isSelected ? theme.tint : theme.border,
                  }
                ]}
              >
                {isSelected && <Check size={12} color="#FFFFFF" style={{ marginRight: 4 }} />}
                <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                  {style}
                </Text>
              </TouchableOpacity>
            );
          })}
        </RNView>
      </View>

      {/* Final Button */}
      <TouchableOpacity 
        onPress={handleComplete}
        style={[styles.btn, { backgroundColor: theme.accent }]}
        activeOpacity={0.8}
      >
        <Text style={styles.btnText}>Complete Profile Setup</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
    backgroundColor: 'transparent',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  stepCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  stepLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  btn: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
