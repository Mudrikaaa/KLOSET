import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAppStore } from '@/store';
import { Sparkles, Check } from 'lucide-react-native';
import { 
  Height, BodyShape, SkinTone, Undertone, StylePreference, 
  CoveragePreference, OccasionFrequency, ColorComfort 
} from '@/types';

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

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const saveProfile = useAppStore((state) => state.saveProfile);

  // Selections
  const [height, setHeight] = useState<Height>('Average');
  const [bodyShape, setBodyShape] = useState<BodyShape>('Hourglass');
  const [skinTone, setSkinTone] = useState<SkinTone>('Wheatish');
  const [undertone, setUndertone] = useState<Undertone>('Neutral');
  const [stylePref, setStylePref] = useState<StylePreference>('Fusion');
  const [coveragePref, setCoveragePref] = useState<CoveragePreference>('Moderate');
  const [occasionFreq, setOccasionFreq] = useState<OccasionFrequency>('Mix of Everything');
  const [colorComfort, setColorComfort] = useState<ColorComfort>('Some Color');

  const handleComplete = () => {
    saveProfile({
      height,
      bodyShape,
      skinTone,
      undertone,
      stylePreference: stylePref,
      coveragePreference: coveragePref,
      occasionFrequency: occasionFreq,
      colorComfort,
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

      {/* Step 1: Height */}
      <View style={[styles.stepCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.stepLabel, { color: theme.text }]}>1. Select Height</Text>
        <RNView style={styles.chipRow}>
          {HEIGHTS.map((h) => {
            const isSelected = height === h;
            return (
              <TouchableOpacity
                key={h}
                onPress={() => setHeight(h)}
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
                  {h}
                </Text>
              </TouchableOpacity>
            );
          })}
        </RNView>
      </View>

      {/* Step 2: Body Shape */}
      <View style={[styles.stepCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.stepLabel, { color: theme.text }]}>2. Select Body Shape</Text>
        <RNView style={styles.chipRow}>
          {BODY_SHAPES.map((shape) => {
            const isSelected = bodyShape === shape;
            return (
              <TouchableOpacity
                key={shape}
                onPress={() => setBodyShape(shape)}
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
                  {shape}
                </Text>
              </TouchableOpacity>
            );
          })}
        </RNView>
      </View>

      {/* Step 3: Skin Tone */}
      <View style={[styles.stepCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.stepLabel, { color: theme.text }]}>3. Select Skin Tone</Text>
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

      {/* Step 4: Undertone */}
      <View style={[styles.stepCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.stepLabel, { color: theme.text }]}>4. Select Undertone</Text>
        <RNView style={styles.chipRow}>
          {UNDERTONES.map((u) => {
            const isSelected = undertone === u;
            return (
              <TouchableOpacity
                key={u}
                onPress={() => setUndertone(u)}
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
                  {u}
                </Text>
              </TouchableOpacity>
            );
          })}
        </RNView>
      </View>

      {/* Step 5: Style Preference */}
      <View style={[styles.stepCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.stepLabel, { color: theme.text }]}>5. Primary Fashion Style</Text>
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

      {/* Step 6: Coverage Preference */}
      <View style={[styles.stepCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.stepLabel, { color: theme.text }]}>6. Coverage Preference</Text>
        <RNView style={styles.chipRow}>
          {COVERAGE_PREFERENCES.map((c) => {
            const isSelected = coveragePref === c;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setCoveragePref(c)}
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
                  {c}
                </Text>
              </TouchableOpacity>
            );
          })}
        </RNView>
      </View>

      {/* Step 7: Occasion Frequency */}
      <View style={[styles.stepCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.stepLabel, { color: theme.text }]}>7. Occasion Frequency</Text>
        <RNView style={styles.chipRow}>
          {OCCASION_FREQUENCIES.map((occ) => {
            const isSelected = occasionFreq === occ;
            return (
              <TouchableOpacity
                key={occ}
                onPress={() => setOccasionFreq(occ)}
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
                  {occ}
                </Text>
              </TouchableOpacity>
            );
          })}
        </RNView>
      </View>

      {/* Step 8: Color Comfort */}
      <View style={[styles.stepCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.stepLabel, { color: theme.text }]}>8. Color Comfort</Text>
        <RNView style={styles.chipRow}>
          {COLOR_COMFORTS.map((col) => {
            const isSelected = colorComfort === col;
            return (
              <TouchableOpacity
                key={col}
                onPress={() => setColorComfort(col)}
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
                  {col}
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
