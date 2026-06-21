import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, TextInput, View as RNView } from 'react-native';
import { Text, View, useThemeColor } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAppStore } from '@/store';
import { Sparkles, Check, ChevronRight, ChevronLeft } from 'lucide-react-native';
import StyledDropdown from '@/components/StyledDropdown';
import { 
  Height, BodyShape, SkinTone, Undertone, StylePreference, 
  CoveragePreference, OccasionFrequency, ColorComfort,
  AgeRange, TopSize, BottomSize, BraSize, ShoeSize, ComfortZone,
  City, BudgetTier, JewelryType
} from '@/types';

const AGE_RANGES: AgeRange[] = ['16-21', '22-27', '28-35', '36-45', '45+'];
const HEIGHTS: Height[] = ['Petite', 'Average', 'Tall'];
const BODY_SHAPES: BodyShape[] = ['Hourglass', 'Pear', 'Apple', 'Rectangle', 'Inverted Triangle'];
const TOP_SIZES: TopSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const BOTTOM_SIZES: BottomSize[] = ['24', '26', '28', '30', '32', '34', '36', '38', '40'];
const BRA_SIZES: BraSize[] = [
  '28B', '28C', '28D',
  '30B', '30C', '30D', '30DD',
  '32B', '32C', '32D', '32DD',
  '34B', '34C', '34D', '34DD',
  '36B', '36C', '36D', '36DD',
  '38C', '38D', '38DD',
  '40C', '40D', '40DD'
];
const SHOE_SIZES: ShoeSize[] = ['3', '4', '5', '6', '7', '8', '9', '10', '11'];
const SKIN_TONES: SkinTone[] = ['Fair', 'Wheatish', 'Dusky', 'Deep'];
const UNDERTONES: Undertone[] = ['Warm', 'Cool', 'Neutral'];
const COVERAGE_PREFERENCES: CoveragePreference[] = ['Modest', 'Moderate', 'Open'];
const COMFORT_ZONES: ComfortZone[] = ['Arms', 'Midsection', 'Thighs', 'Hips', 'None'];
const STYLES: StylePreference[] = ['Minimal', 'Ethnic', 'Western', 'Fusion', 'Streetwear'];
const COLOR_COMFORTS: ColorComfort[] = ['Neutrals Only', 'Some Color', 'Bold and Colorful'];
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
const OCCASION_FREQUENCIES: OccasionFrequency[] = [
  'Mostly Casual', 'Mix of Everything', 'Lots of Functions and Events', 'Professional Environment Daily'
];

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const saveProfile = useAppStore((state) => state.saveProfile);

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 11; // 10 core steps + 1 additional optional step

  // Selections
  const [ageRange, setAgeRange] = useState<AgeRange>('22-27');
  const [height, setHeight] = useState<Height>('Average');
  const [bodyShape, setBodyShape] = useState<BodyShape>('Hourglass');
  
  // Sizes
  const [topSize, setTopSize] = useState<TopSize | undefined>(undefined);
  const [bottomSize, setBottomSize] = useState<BottomSize | undefined>(undefined);
  const [braSize, setBraSize] = useState<BraSize | undefined>(undefined);
  const [shoeSize, setShoeSize] = useState<ShoeSize | undefined>(undefined);

  // Tones
  const [skinTone, setSkinTone] = useState<SkinTone>('Wheatish');
  const [undertone, setUndertone] = useState<Undertone>('Neutral');

  // Preferences
  const [coveragePref, setCoveragePref] = useState<CoveragePreference>('Moderate');
  const [comfortZones, setComfortZones] = useState<ComfortZone[]>(['None']);
  const [stylePref, setStylePref] = useState<StylePreference>('Fusion');
  const [colorComfort, setColorComfort] = useState<ColorComfort>('Some Color');
  const [jewelryTypes, setJewelryTypes] = useState<JewelryType[]>(['None']);

  // Optional step 11 fields
  const [city, setCity] = useState<City | undefined>(undefined);
  const [budgetTier, setBudgetTier] = useState<BudgetTier | undefined>(undefined);
  const [occasionFreq, setOccasionFreq] = useState<OccasionFrequency>('Mix of Everything');
  const [avoidInput, setAvoidInput] = useState('');
  const [avoidList, setAvoidList] = useState<string[]>([]);

  const handleComfortZoneToggle = (zone: ComfortZone) => {
    if (zone === 'None') {
      setComfortZones(['None']);
    } else {
      const filtered = comfortZones.filter((z) => z !== 'None');
      if (filtered.includes(zone)) {
        const next = filtered.filter((z) => z !== zone);
        setComfortZones(next.length === 0 ? ['None'] : next);
      } else {
        setComfortZones([...filtered, zone]);
      }
    }
  };

  const handleJewelryToggle = (jewelry: JewelryType) => {
    if (jewelry === 'None') {
      setJewelryTypes(['None']);
    } else {
      const filtered = jewelryTypes.filter((j) => j !== 'None');
      if (filtered.includes(jewelry)) {
        const next = filtered.filter((j) => j !== jewelry);
        setJewelryTypes(next.length === 0 ? ['None'] : next);
      } else {
        setJewelryTypes([...filtered, jewelry]);
      }
    }
  };

  const addAvoidTag = () => {
    const trimmed = avoidInput.trim().toLowerCase();
    if (trimmed && !avoidList.includes(trimmed)) {
      setAvoidList([...avoidList, trimmed]);
    }
    setAvoidInput('');
  };

  const removeAvoidTag = (tag: string) => {
    setAvoidList(avoidList.filter((t) => t !== tag));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    saveProfile({
      ageRange,
      height,
      bodyShape,
      topSize,
      bottomSize,
      braSize,
      shoeSize,
      skinTone,
      undertone,
      coveragePreference: coveragePref,
      comfortZones,
      stylePreference: stylePref,
      colorComfort,
      jewelryTypes,
      city,
      budgetTier,
      occasionFrequency: occasionFreq,
      avoidList,
    });
  };

  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Progress Bar Header */}
      <View style={styles.progressHeader}>
        <View style={styles.progressBarBackground}>
          <RNView style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: theme.tint }]} />
        </View>
        <RNView style={styles.progressTextRow}>
          <TouchableOpacity onPress={handleBack} disabled={currentStep === 1} style={{ opacity: currentStep === 1 ? 0.3 : 1 }}>
            <ChevronLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.progressText}>Step {currentStep} of {totalSteps}</Text>
          <TouchableOpacity 
            onPress={handleNext} 
            disabled={currentStep === totalSteps} 
            style={{ opacity: currentStep === totalSteps ? 0.3 : 1 }}
          >
            <ChevronRight size={24} color={theme.text} />
          </TouchableOpacity>
        </RNView>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {currentStep === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What's your age range?</Text>
            <Text style={styles.stepDesc}>Helps us curate age-appropriate, trending outfits.</Text>
            <StyledDropdown 
              label="Age Range" 
              value={ageRange} 
              options={AGE_RANGES} 
              onChange={(val) => setAgeRange(val as AgeRange)}
            />
          </View>
        )}

        {currentStep === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>How tall are you?</Text>
            <Text style={styles.stepDesc}>Proportions are key to perfect silhouettes and draping.</Text>
            <StyledDropdown 
              label="Height Class" 
              value={height} 
              options={HEIGHTS} 
              onChange={(val) => setHeight(val as Height)}
            />
          </View>
        )}

        {currentStep === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Select your body shape</Text>
            <Text style={styles.stepDesc}>Every shape is beautiful. We use this to balance proportions.</Text>
            <StyledDropdown 
              label="Body Shape" 
              value={bodyShape} 
              options={[
                { label: 'Hourglass (Balanced bust & hips, defined waist)', value: 'Hourglass' },
                { label: 'Pear (Hips wider than bust & shoulders)', value: 'Pear' },
                { label: 'Apple (Fuller midsection, slender limbs)', value: 'Apple' },
                { label: 'Rectangle (Even bust, waist & hips)', value: 'Rectangle' },
                { label: 'Inverted Triangle (Shoulders/bust wider than hips)', value: 'Inverted Triangle' },
              ]} 
              onChange={(val) => setBodyShape(val as BodyShape)}
            />
          </View>
        )}

        {currentStep === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Your sizes</Text>
            <Text style={styles.stepDesc}>Real shopping sizes help us ensure perfect outfit recommendations.</Text>
            
            <StyledDropdown 
              label="Top Size" 
              value={topSize} 
              options={TOP_SIZES} 
              placeholder="Select Top Size (XS-3XL)"
              onChange={(val) => setTopSize(val as TopSize)}
            />
            
            <StyledDropdown 
              label="Bottom Size (Waist in inches)" 
              value={bottomSize} 
              options={BOTTOM_SIZES} 
              placeholder="Select Waist Size (24-40)"
              onChange={(val) => setBottomSize(val as BottomSize)}
            />

            <StyledDropdown 
              label="Bra Size" 
              value={braSize} 
              options={BRA_SIZES} 
              placeholder="Select Bra Size (e.g., 32C)"
              onChange={(val) => setBraSize(val as BraSize)}
            />

            <StyledDropdown 
              label="Shoe Size (UK/India)" 
              value={shoeSize} 
              options={SHOE_SIZES} 
              placeholder="Select Shoe Size (3-11)"
              onChange={(val) => setShoeSize(val as ShoeSize)}
            />
          </View>
        )}

        {currentStep === 5 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Skin Tone & Undertone</Text>
            <Text style={styles.stepDesc}>Colors look completely different depending on your unique complexion.</Text>
            
            <StyledDropdown 
              label="Skin Tone" 
              value={skinTone} 
              options={SKIN_TONES} 
              onChange={(val) => setSkinTone(val as SkinTone)}
            />

            <StyledDropdown 
              label="Undertone" 
              value={undertone} 
              options={UNDERTONES} 
              onChange={(val) => setUndertone(val as Undertone)}
            />

            <View style={[styles.infoBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Sparkles size={16} color={theme.tint} style={{ marginRight: 8, marginTop: 2 }} />
              <RNView style={{ flex: 1 }}>
                <Text style={styles.infoBoxTitle}>Quick Undertone Wrist Test:</Text>
                <Text style={styles.infoBoxText}>
                  • Greenish veins = Warm undertone.
                </Text>
                <Text style={styles.infoBoxText}>
                  • Blueish/Purple veins = Cool undertone.
                </Text>
                <Text style={styles.infoBoxText}>
                  • Mix of green and blue = Neutral.
                </Text>
              </RNView>
            </View>
          </View>
        )}

        {currentStep === 6 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What's your coverage comfort?</Text>
            <Text style={styles.stepDesc}>Filters outfits based on how modest or open you prefer garments to be.</Text>
            
            <RNView style={styles.chipColumn}>
              {COVERAGE_PREFERENCES.map((pref) => {
                const isSelected = coveragePref === pref;
                return (
                  <TouchableOpacity
                    key={pref}
                    style={[
                      styles.preferenceCard,
                      { borderColor: isSelected ? theme.tint : theme.border, backgroundColor: theme.card }
                    ]}
                    onPress={() => setCoveragePref(pref)}
                  >
                    <RNView style={styles.preferenceHeader}>
                      <Text style={[styles.preferenceTitle, isSelected && { color: theme.tint }]}>
                        {pref}
                      </Text>
                      {isSelected ? (
                        <Check size={20} color={theme.tint} />
                      ) : (
                        <RNView style={[styles.radioCircle, { borderColor: theme.tabIconDefault }]} />
                      )}
                    </RNView>
                    <Text style={styles.preferenceDesc}>
                      {pref === 'Modest' && 'Prefers full coverage, higher necklines, and longer sleeves.'}
                      {pref === 'Moderate' && 'Comfortable with standard cuts, medium necklines, and shorter sleeves.'}
                      {pref === 'Open' && 'Comfortable with sleeveless, backless, cropped, and deeper necklines.'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </RNView>
          </View>
        )}

        {currentStep === 7 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Any areas you prefer to de-emphasize?</Text>
            <Text style={styles.stepDesc}>We select styling cuts and drapes that comfortably cover these spots.</Text>
            
            <RNView style={styles.chipRow}>
              {COMFORT_ZONES.map((zone) => {
                const isSelected = comfortZones.includes(zone);
                return (
                  <TouchableOpacity
                    key={zone}
                    onPress={() => handleComfortZoneToggle(zone)}
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
                      {zone}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </RNView>
          </View>
        )}

        {currentStep === 8 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Your primary fashion style</Text>
            <Text style={styles.stepDesc}>Helps us prioritize suggestions aligning with your style vibe.</Text>
            
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
        )}

        {currentStep === 9 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What's your comfort with color?</Text>
            <Text style={styles.stepDesc}>Controls whether we suggest bold combinations or clean neutrals.</Text>
            
            <RNView style={styles.chipColumn}>
              {COLOR_COMFORTS.map((col) => {
                const isSelected = colorComfort === col;
                return (
                  <TouchableOpacity
                    key={col}
                    style={[
                      styles.preferenceCard,
                      { borderColor: isSelected ? theme.tint : theme.border, backgroundColor: theme.card }
                    ]}
                    onPress={() => setColorComfort(col)}
                  >
                    <RNView style={styles.preferenceHeader}>
                      <Text style={[styles.preferenceTitle, isSelected && { color: theme.tint }]}>
                        {col}
                      </Text>
                      {isSelected ? (
                        <Check size={20} color={theme.tint} />
                      ) : (
                        <RNView style={[styles.radioCircle, { borderColor: theme.tabIconDefault }]} />
                      )}
                    </RNView>
                    <Text style={styles.preferenceDesc}>
                      {col === 'Neutrals Only' && 'Whites, black, grey, beige, khaki, tans.'}
                      {col === 'Some Color' && 'Mix of neutrals and colored items. Balanced styling.'}
                      {col === 'Bold and Colorful' && 'Vibrant shades, contrasting ethnic colors, pop colors.'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </RNView>
          </View>
        )}

        {currentStep === 10 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Jewelry you wear</Text>
            <Text style={styles.stepDesc}>We match accessory and jewelry suggestions with your preferences.</Text>
            
            <RNView style={styles.chipRow}>
              {JEWELRY_TYPES.map((j) => {
                const isSelected = jewelryTypes.includes(j);
                return (
                  <TouchableOpacity
                    key={j}
                    onPress={() => handleJewelryToggle(j)}
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
                      {j}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </RNView>
          </View>
        )}

        {currentStep === 11 && (
          <View style={styles.stepContainer}>
            <RNView style={styles.optionalHeaderRow}>
              <Text style={styles.stepTitle}>Tell us more</Text>
              <TouchableOpacity 
                style={[styles.skipBtn, { borderColor: theme.border }]} 
                onPress={handleComplete}
              >
                <Text style={[styles.skipBtnText, { color: theme.tabIconDefault }]}>Skip & Complete</Text>
              </TouchableOpacity>
            </RNView>
            <Text style={styles.stepDesc}>Optional details to make Kloset feel incredibly smart.</Text>

            <StyledDropdown 
              label="City" 
              value={city} 
              options={CITIES} 
              placeholder="Select your city (for local weather)"
              onChange={(val) => setCity(val as City)}
            />

            <StyledDropdown 
              label="Preferred Budget Tier" 
              value={budgetTier} 
              options={BUDGET_TIERS} 
              placeholder="Select budget preference"
              onChange={(val) => setBudgetTier(val as BudgetTier)}
            />

            <StyledDropdown 
              label="Occasion Frequency" 
              value={occasionFreq} 
              options={OCCASION_FREQUENCIES} 
              onChange={(val) => setOccasionFreq(val as OccasionFrequency)}
            />

            <Text style={styles.fieldLabel}>Avoid List (fabrics, patterns, fits to ignore)</Text>
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
              {avoidList.map((tag) => (
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

        {/* Wizard Navigation Action */}
        <RNView style={styles.navigationRow}>
          {currentStep > 1 && (
            <TouchableOpacity 
              onPress={handleBack}
              style={[styles.navBtn, styles.backBtn, { borderColor: theme.border }]}
              activeOpacity={0.8}
            >
              <Text style={[styles.navBtnText, { color: theme.text }]}>Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            onPress={handleNext}
            style={[
              styles.navBtn, 
              styles.nextBtn, 
              { backgroundColor: theme.accent },
              currentStep === 1 && { width: '100%' }
            ]}
            activeOpacity={0.8}
          >
            <Text style={styles.nextBtnText}>
              {currentStep === totalSteps ? 'Complete Profile Setup' : 'Next Step'}
            </Text>
          </TouchableOpacity>
        </RNView>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressHeader: {
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.6,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  stepContainer: {
    minHeight: 380,
    backgroundColor: 'transparent',
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  stepDesc: {
    fontSize: 14,
    opacity: 0.6,
    lineHeight: 20,
    marginBottom: 24,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: 'transparent',
  },
  chipColumn: {
    flexDirection: 'column',
    gap: 12,
    backgroundColor: 'transparent',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  preferenceCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  preferenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    backgroundColor: 'transparent',
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  preferenceDesc: {
    fontSize: 13,
    opacity: 0.7,
    lineHeight: 18,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  infoBox: {
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
  },
  infoBoxTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  infoBoxText: {
    fontSize: 13,
    opacity: 0.8,
    lineHeight: 18,
  },
  optionalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    backgroundColor: 'transparent',
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  skipBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
    marginTop: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'transparent',
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  addBtn: {
    height: 52,
    width: 70,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
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
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    gap: 12,
    backgroundColor: 'transparent',
  },
  navBtn: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtn: {
    flex: 1,
    borderWidth: 1,
  },
  nextBtn: {
    flex: 2,
  },
  navBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
