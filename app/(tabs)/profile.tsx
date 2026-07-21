import React, { useState } from 'react';
import {
  StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, View, Text, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, LogOut, ChevronDown, ChevronRight, X, Check } from 'lucide-react-native';
import { Crimson, Fonts } from '@/constants/Colors';
import { useAppStore } from '../../store';
import {
  Height, BodyShape, SkinTone, Undertone, StylePreference,
  CoveragePreference, OccasionFrequency, ColorComfort,
  AgeRange, TopSize, BottomSize, BraSize, ShoeSize, ComfortZone,
  City, BudgetTier, JewelryType, UserStyleProfile,
} from '../../types';

// ============================================================================
// Profile — Crimson redesign (Phone F), matched to the design exactly:
// a crimson band at the TOP (header + avatar + glass stat cards) over a blush
// body, with WHITE section cards and blush "Label · Value" chips. Tapping a
// chip opens an option sheet; the save path (saveProfile) is unchanged.
// ============================================================================

const OPTIONS = {
  ageRange: ['16-21', '22-27', '28-35', '36-45', '45+'] as AgeRange[],
  height: ['Petite', 'Average', 'Tall'] as Height[],
  bodyShape: ['Hourglass', 'Pear', 'Apple', 'Rectangle', 'Inverted Triangle'] as BodyShape[],
  topSize: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'] as TopSize[],
  bottomSize: ['24', '26', '28', '30', '32', '34', '36', '38', '40'] as BottomSize[],
  braSize: [
    '28B', '28C', '28D', '30B', '30C', '30D', '30DD', '32B', '32C', '32D', '32DD',
    '34B', '34C', '34D', '34DD', '36B', '36C', '36D', '36DD', '38C', '38D', '38DD', '40C', '40D', '40DD',
  ] as BraSize[],
  shoeSize: ['3', '4', '5', '6', '7', '8', '9', '10', '11'] as ShoeSize[],
  comfortZones: ['Arms', 'Midsection', 'Thighs', 'Hips', 'None'] as ComfortZone[],
  skinTone: ['Fair', 'Wheatish', 'Dusky', 'Deep'] as SkinTone[],
  undertone: ['Warm', 'Cool', 'Neutral'] as Undertone[],
  colorComfort: ['Neutrals Only', 'Some Color', 'Bold and Colorful'] as ColorComfort[],
  stylePreference: ['Minimal', 'Ethnic', 'Western', 'Fusion', 'Streetwear'] as StylePreference[],
  coveragePreference: ['Modest', 'Moderate', 'Open'] as CoveragePreference[],
  occasionFrequency: [
    'Mostly Casual', 'Mix of Everything', 'Lots of Functions and Events', 'Professional Environment Daily',
  ] as OccasionFrequency[],
  budgetTier: ['Budget-friendly', 'Mid-range', 'Premium', 'Luxury'] as BudgetTier[],
  jewelryTypes: [
    'Earrings', 'Necklace / Chain', 'Bangles / Bracelets', 'Rings',
    'Anklets', 'Maang Tikka', 'Nose Pin / Nath', 'Brooch',
    'Watch', 'Waist Chain / Kamarband', 'None',
  ] as JewelryType[],
  city: [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata',
    'Hyderabad', 'Pune', 'Jaipur', 'Ahmedabad', 'Lucknow',
    'Chandigarh', 'Goa', 'Other',
  ] as City[],
};

type FieldKey = keyof typeof OPTIONS;

const SECTIONS: { key: string; title: string; fields: { field: FieldKey; label: string; multi?: boolean }[] }[] = [
  {
    key: 'body', title: 'BODY PROFILE',
    fields: [
      { field: 'height', label: 'Height' },
      { field: 'bodyShape', label: 'Shape' },
      { field: 'ageRange', label: 'Age' },
      { field: 'topSize', label: 'Top' },
      { field: 'bottomSize', label: 'Bottom' },
      { field: 'braSize', label: 'Bra' },
      { field: 'shoeSize', label: 'Shoe' },
      { field: 'comfortZones', label: 'Comfort', multi: true },
    ],
  },
  {
    key: 'color', title: 'COLOUR & TONE',
    fields: [
      { field: 'skinTone', label: 'Skin' },
      { field: 'undertone', label: 'Undertone' },
      { field: 'colorComfort', label: 'Colour' },
    ],
  },
  {
    key: 'style', title: 'STYLE & LIFESTYLE',
    fields: [
      { field: 'stylePreference', label: 'Style' },
      { field: 'coveragePreference', label: 'Coverage' },
      { field: 'occasionFrequency', label: 'Occasions' },
      { field: 'budgetTier', label: 'Budget' },
      { field: 'jewelryTypes', label: 'Jewellery', multi: true },
    ],
  },
  {
    key: 'location', title: 'LOCATION',
    fields: [{ field: 'city', label: 'City' }],
  },
];

// design tokens for this (light/blush) screen
const INK = '#140a0c';
const ROSE = '#8a2a38';
const MUTED = '#9b6c74';
const CARD_BORDER = '#f0d3d8';
const CHIP_BG = '#fbe7ea';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const profile = useAppStore((state) => state.profile);
  const saveProfile = useAppStore((state) => state.saveProfile);
  const signOut = useAppStore((state) => state.signOut);
  const swipeHistory = useAppStore((state) => state.swipeHistory);
  const wardrobeItems = useAppStore((state) => state.wardrobeItems);

  const likedCount = swipeHistory.filter((i) => i.direction === 'like').length;
  const occasionsCovered = new Set(wardrobeItems.flatMap((i) => i.occasions || [])).size;

  const [open, setOpen] = useState<Record<string, boolean>>({ body: true });
  const [editing, setEditing] = useState<{ field: FieldKey; label: string; multi?: boolean } | null>(null);
  const [avoidInput, setAvoidInput] = useState('');

  const name = profile?.name || 'Stylist';
  const identity = [
    profile?.skinTone,
    profile?.undertone ? `${profile.undertone} undertone` : null,
    profile?.stylePreference,
  ].filter(Boolean).join(' · ');

  const valueOf = (field: FieldKey): string => {
    const v = (profile as any)?.[field];
    if (Array.isArray(v)) return v.length ? (v.length > 2 ? `${v.slice(0, 2).join(', ')} +${v.length - 2}` : v.join(', ')) : '—';
    return v || '—';
  };

  const isSelected = (field: FieldKey, option: string): boolean => {
    const v = (profile as any)?.[field];
    return Array.isArray(v) ? v.includes(option) : v === option;
  };

  const pickOption = (field: FieldKey, option: string, multi?: boolean) => {
    if (!multi) {
      saveProfile({ [field]: option } as Partial<UserStyleProfile>);
      setEditing(null);
      return;
    }
    const current: string[] = ((profile as any)?.[field] || []).filter(Boolean);
    let next: string[];
    if (option === 'None') next = ['None'];
    else {
      const withoutNone = current.filter((x) => x !== 'None');
      next = withoutNone.includes(option) ? withoutNone.filter((x) => x !== option) : [...withoutNone, option];
      if (next.length === 0) next = ['None'];
    }
    saveProfile({ [field]: next } as Partial<UserStyleProfile>);
  };

  const addAvoidTag = () => {
    const trimmed = avoidInput.trim().toLowerCase();
    const current = profile?.avoidList || [];
    if (trimmed && !current.includes(trimmed)) {
      saveProfile({ avoidList: [...current, trimmed] });
    }
    setAvoidInput('');
  };

  const removeAvoidTag = (tag: string) => {
    saveProfile({ avoidList: (profile?.avoidList || []).filter((t) => t !== tag) });
  };

  const confirmSignOut = () => {
    Alert.alert('Sign out?', 'You can sign back in any time.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const Section = ({ section }: { section: typeof SECTIONS[number] }) => {
    const expanded = !!open[section.key];
    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => setOpen((o) => ({ ...o, [section.key]: !o[section.key] }))}
        >
          <Text style={styles.cardTitle}>{section.title}</Text>
          {expanded ? <ChevronDown size={16} color={Crimson.crimsonDeep} /> : <ChevronRight size={16} color={Crimson.crimsonDeep} />}
        </TouchableOpacity>
        {expanded && (
          <>
            <View style={styles.cardRule} />
            <View style={styles.chipWrap}>
              {section.fields.map((f) => (
                <TouchableOpacity key={f.field} style={styles.chip} onPress={() => setEditing(f)}>
                  <Text style={styles.chipLabel}>{f.label} · </Text>
                  <Text style={styles.chipValue}>{valueOf(f.field)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      {/* FIXED crimson header — the band CONTAINS title, identity and stats
          (design: stats live fully inside the band with padding below, and
          none of this scrolls; only the white cards below do) */}
      <LinearGradient
        colors={[...Crimson.profileBand]}
        locations={[0, 0.46, 1]}
        start={{ x: 0.1, y: 0 }} end={{ x: 0.8, y: 1 }}
        style={{ paddingTop: insets.top + 14, paddingBottom: 24 }}
      >
        <View style={styles.headerRow}>
          <Text style={styles.kicker}>MY PROFILE</Text>
          <TouchableOpacity style={styles.gearBtn} onPress={confirmSignOut}>
            <LogOut size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* identity */}
        <View style={styles.identityRow}>
          <View style={styles.avatarTile}>
            <User size={30} color="#fff" />
          </View>
          <View style={styles.identityText}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.identityMeta}>{identity || profile?.email || ''}</Text>
          </View>
        </View>

        {/* glass stat cards — fully inside the band */}
        <View style={styles.statsRow}>
          {[
            { n: wardrobeItems.length, label: 'Garments' },
            { n: likedCount, label: 'Loved looks' },
            { n: occasionsCovered, label: 'Occasions' },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statNum}>{s.n}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* SCROLLABLE: white section cards on blush */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48, paddingTop: 2 }}>
        {/* white section cards on blush */}
        {SECTIONS.map((section) => <Section key={section.key} section={section} />)}

        {/* avoid list */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.cardHeader} onPress={() => setOpen((o) => ({ ...o, avoid: !o.avoid }))}>
            <Text style={styles.cardTitle}>AVOID LIST</Text>
            {open.avoid ? <ChevronDown size={16} color={Crimson.crimsonDeep} /> : <ChevronRight size={16} color={Crimson.crimsonDeep} />}
          </TouchableOpacity>
          {open.avoid && (
            <>
              <View style={styles.cardRule} />
              <Text style={styles.avoidHint}>Fabrics, fits or items to keep out of suggestions</Text>
              <View style={styles.avoidInputRow}>
                <TextInput
                  value={avoidInput}
                  onChangeText={setAvoidInput}
                  onSubmitEditing={addAvoidTag}
                  placeholder="e.g. sleeveless, polyester"
                  placeholderTextColor={MUTED}
                  style={styles.avoidInput}
                />
                <TouchableOpacity style={styles.avoidAdd} onPress={addAvoidTag}>
                  <Text style={styles.avoidAddText}>Add</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.chipWrap}>
                {(profile?.avoidList || []).map((tag) => (
                  <TouchableOpacity key={tag} style={styles.chip} onPress={() => removeAvoidTag(tag)}>
                    <Text style={styles.chipValue}>{tag}  ✕</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* option sheet (light) */}
      <Modal visible={!!editing} transparent animationType="fade" onRequestClose={() => setEditing(null)}>
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{editing?.label}</Text>
              <TouchableOpacity style={styles.sheetClose} onPress={() => setEditing(null)}>
                <X size={15} color={INK} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 340 }}>
              <View style={[styles.chipWrap, { paddingTop: 4 }]}>
                {editing && OPTIONS[editing.field].map((option) => {
                  const on = isSelected(editing.field, option);
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[styles.optionChip, on && styles.optionChipOn]}
                      onPress={() => pickOption(editing.field, option, editing.multi)}
                    >
                      {on && <Check size={12} color="#fff" style={{ marginRight: 5 }} />}
                      <Text style={[styles.optionChipText, on && { color: '#fff' }]}>{option}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
            {editing?.multi && (
              <TouchableOpacity activeOpacity={0.9} onPress={() => setEditing(null)}>
                <LinearGradient colors={[...Crimson.cta]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.3 }} style={styles.sheetDone}>
                  <Text style={styles.sheetDoneText}>Done</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Crimson.blushBg },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 22,
  },
  kicker: { color: 'rgba(255,255,255,0.75)', fontFamily: Fonts.body, fontSize: 11, letterSpacing: 1.6 },
  gearBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center', justifyContent: 'center',
  },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 22, marginTop: 16 },
  avatarTile: {
    width: 66, height: 66, borderRadius: 22, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center',
  },
  identityText: { flex: 1, flexShrink: 1 },
  name: { color: '#fff', fontFamily: Fonts.display, fontSize: 24, lineHeight: 27 },
  identityMeta: { color: 'rgba(255,255,255,0.75)', fontFamily: Fonts.bodyMed, fontSize: 11.5, marginTop: 3, lineHeight: 16 },

  statsRow: { flexDirection: 'row', gap: 11, paddingHorizontal: 22, marginTop: 20 },
  statCard: {
    flex: 1, borderRadius: 18, padding: 14,
    backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.32)',
  },
  statNum: { color: '#fff', fontFamily: Fonts.display, fontSize: 24, lineHeight: 26 },
  statLabel: { color: 'rgba(255,255,255,0.85)', fontFamily: Fonts.body, fontSize: 10, marginTop: 3 },

  // white cards on blush (design: bg #fff, border #f0d3d8)
  card: {
    marginHorizontal: 22, marginTop: 14, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1, borderColor: CARD_BORDER,
    paddingHorizontal: 16, paddingVertical: 15,
    shadowColor: '#7c1220', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: INK, fontFamily: Fonts.display, fontSize: 13, letterSpacing: 0.6 },
  cardRule: { height: 1, backgroundColor: '#f4dde1', marginTop: 13, marginBottom: 1 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 13 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: CHIP_BG, borderRadius: 10, paddingHorizontal: 11, paddingVertical: 7,
  },
  chipLabel: { color: MUTED, fontFamily: Fonts.bodyMed, fontSize: 11 },
  chipValue: { color: INK, fontFamily: Fonts.body, fontSize: 11 },

  avoidHint: { color: MUTED, fontFamily: Fonts.bodyMed, fontSize: 11, marginTop: 12 },
  avoidInputRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  avoidInput: {
    flex: 1, backgroundColor: CHIP_BG, borderWidth: 1, borderColor: CARD_BORDER,
    borderRadius: 12, color: INK, fontFamily: Fonts.bodyMed, fontSize: 12.5, paddingHorizontal: 12, paddingVertical: 10,
  },
  avoidAdd: { backgroundColor: Crimson.crimson, borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' },
  avoidAddText: { color: '#fff', fontFamily: Fonts.bodyBold, fontSize: 13 },

  // light option sheet
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(20,8,10,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 34,
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sheetTitle: { color: INK, fontFamily: Fonts.display, fontSize: 17 },
  sheetClose: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: CHIP_BG,
    alignItems: 'center', justifyContent: 'center',
  },
  optionChip: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: CARD_BORDER, borderRadius: 18,
    paddingHorizontal: 13, paddingVertical: 8, backgroundColor: '#fff',
  },
  optionChipOn: { backgroundColor: Crimson.crimson, borderColor: Crimson.crimson },
  optionChipText: { color: ROSE, fontFamily: Fonts.body, fontSize: 12.5 },
  sheetDone: { borderRadius: 13, paddingVertical: 13, alignItems: 'center', marginTop: 16 },
  sheetDoneText: { color: '#fff', fontFamily: Fonts.bodyBold, fontSize: 13.5 },
});
