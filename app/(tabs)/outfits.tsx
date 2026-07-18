import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal, ActivityIndicator, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Sparkles, Stars, Briefcase, GraduationCap, Heart, Gift, Check, Search, ChevronDown, X, Compass } from 'lucide-react-native';
import { api } from '../../lib';
import type { WardrobeOutfit, SuggestionSpecs } from '../../lib/api';
import { useAppStore } from '../../store';
import { Outfit, CoveragePreference, StylePreference } from '../../types';

const OCCASIONS = [
  // Festive & Family
  { id: 'Diwali Party (Family)', name: 'Diwali (Family)', category: 'Festive & Family', icon: Sparkles, color: '#F59E0B' },
  { id: 'Diwali Party (Friends)', name: 'Diwali (Friends)', category: 'Festive & Family', icon: Sparkles, color: '#F59E0B' },
  { id: 'Holi', name: 'Holi', category: 'Festive & Family', icon: Sparkles, color: '#F59E0B' },
  { id: 'Navratri / Garba', name: 'Navratri / Garba', category: 'Festive & Family', icon: Sparkles, color: '#F59E0B' },
  { id: 'Eid', name: 'Eid', category: 'Festive & Family', icon: Sparkles, color: '#F59E0B' },
  { id: 'Regional Festival', name: 'Regional Fest', category: 'Festive & Family', icon: Sparkles, color: '#F59E0B' },
  { id: 'Pooja / Temple Visit', name: 'Pooja/Temple', category: 'Festive & Family', icon: Sparkles, color: '#F59E0B' },
  { id: 'Baby Shower / Godh Bharai', name: 'Baby Shower', category: 'Festive & Family', icon: Sparkles, color: '#F59E0B' },

  // Weddings & Functions
  { id: 'Mehendi Function', name: 'Mehendi', category: 'Weddings & Functions', icon: Stars, color: '#EC4899' },
  { id: 'Sangeet Night', name: 'Sangeet Night', category: 'Weddings & Functions', icon: Stars, color: '#EC4899' },
  { id: 'Wedding (Close Family)', name: 'Wedding (Family)', category: 'Weddings & Functions', icon: Stars, color: '#EC4899' },
  { id: 'Wedding (Guest)', name: 'Wedding (Guest)', category: 'Weddings & Functions', icon: Stars, color: '#EC4899' },
  { id: 'Reception', name: 'Reception', category: 'Weddings & Functions', icon: Stars, color: '#EC4899' },
  { id: 'Cocktail / Pre-wedding', name: 'Cocktail Night', category: 'Weddings & Functions', icon: Stars, color: '#EC4899' },
  { id: 'Engagement Ceremony', name: 'Engagement', category: 'Weddings & Functions', icon: Stars, color: '#EC4899' },
  { id: 'Roka / Sagai', name: 'Roka/Sagai', category: 'Weddings & Functions', icon: Stars, color: '#EC4899' },

  // College
  { id: 'First Day of College', name: 'First Day College', category: 'College', icon: GraduationCap, color: '#10B981' },
  { id: 'College Farewell', name: 'Farewell', category: 'College', icon: GraduationCap, color: '#10B981' },
  { id: 'College Fest (Day)', name: 'Fest (Day)', category: 'College', icon: GraduationCap, color: '#10B981' },
  { id: 'College Fest (Night)', name: 'Fest (Night)', category: 'College', icon: GraduationCap, color: '#10B981' },
  { id: 'College Trip', name: 'College Trip', category: 'College', icon: GraduationCap, color: '#10B981' },
  { id: 'Internship (Startup)', name: 'Intern (Startup)', category: 'College', icon: GraduationCap, color: '#10B981' },
  { id: 'Internship (Corporate)', name: 'Intern (Corp)', category: 'College', icon: GraduationCap, color: '#10B981' },

  // Professional
  { id: 'Job Interview (Tech)', name: 'Interview (Tech)', category: 'Professional', icon: Briefcase, color: '#6366F1' },
  { id: 'Job Interview (Corporate)', name: 'Interview (Corp)', category: 'Professional', icon: Briefcase, color: '#6366F1' },
  { id: 'Office (Startup)', name: 'Office (Startup)', category: 'Professional', icon: Briefcase, color: '#6366F1' },
  { id: 'Office (Formal)', name: 'Office (Formal)', category: 'Professional', icon: Briefcase, color: '#6366F1' },
  { id: 'Client Meeting', name: 'Client Meeting', category: 'Professional', icon: Briefcase, color: '#6366F1' },
  { id: 'WFH / Video Call', name: 'WFH Call', category: 'Professional', icon: Briefcase, color: '#6366F1' },

  // Social
  { id: 'Casual Outing', name: 'Casual Outing', category: 'Social', icon: Heart, color: '#3B82F6' },
  { id: 'Mall / Shopping Day', name: 'Shopping Day', category: 'Social', icon: Heart, color: '#3B82F6' },
  { id: 'Brunch / Cafe', name: 'Brunch / Cafe', category: 'Social', icon: Heart, color: '#3B82F6' },
  { id: 'Dinner Date', name: 'Dinner Date', category: 'Social', icon: Heart, color: '#3B82F6' },
  { id: 'First Date', name: 'First Date', category: 'Social', icon: Heart, color: '#3B82F6' },
  { id: 'Night Out', name: 'Night Out', category: 'Social', icon: Heart, color: '#3B82F6' },
  { id: 'House Party', name: 'House Party', category: 'Social', icon: Heart, color: '#3B82F6' },
  { id: 'Gym / Workout', name: 'Gym/Workout', category: 'Social', icon: Heart, color: '#3B82F6' },
  { id: 'Beach / Pool Day', name: 'Beach Day', category: 'Social', icon: Heart, color: '#3B82F6' },

  // Special
  { id: 'My Birthday', name: 'My Birthday', category: 'Special', icon: Gift, color: '#8B5CF6' },
  { id: "Friend's Birthday", name: "Friend's Bday", category: 'Special', icon: Gift, color: '#8B5CF6' },
  { id: 'Travel Day', name: 'Travel Day', category: 'Special', icon: Gift, color: '#8B5CF6' },
  { id: 'Airport / Travel Look', name: 'Airport Look', category: 'Special', icon: Gift, color: '#8B5CF6' },
  { id: 'Hill Station Trip', name: 'Hill Station', category: 'Special', icon: Gift, color: '#8B5CF6' },
  { id: 'Heritage City Sightseeing', name: 'Sightseeing', category: 'Special', icon: Gift, color: '#8B5CF6' },
  { id: 'Graduation Day', name: 'Graduation', category: 'Special', icon: Gift, color: '#8B5CF6' },
  { id: 'Award Ceremony / Convocation', name: 'Convocation', category: 'Special', icon: Gift, color: '#8B5CF6' },
  { id: 'Anniversary Dinner', name: 'Anniversary', category: 'Special', icon: Gift, color: '#8B5CF6' },
];

const CATEGORY_ORDER = ['Festive & Family', 'Weddings & Functions', 'College', 'Professional', 'Social', 'Special'];
const COVERAGE_OPTIONS: (CoveragePreference | 'Any')[] = ['Any', 'Modest', 'Moderate', 'Open'];
const STYLE_OPTIONS: (StylePreference | 'Any')[] = ['Any', 'Ethnic', 'Fusion', 'Western', 'Minimal', 'Streetwear'];

export default function OutfitsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];

  // Occasion is CHOSEN, not scrolled to: null until the user picks one.
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [search, setSearch] = useState('');

  // Closet-first results
  const [closetOutfits, setClosetOutfits] = useState<WardrobeOutfit[]>([]);
  const [wardrobeSize, setWardrobeSize] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // "Ideas from outside" (catalog) — opt-in, with an optional specs sheet
  const [showIdeas, setShowIdeas] = useState(false);
  const [specsVisible, setSpecsVisible] = useState(false);
  const [specCoverage, setSpecCoverage] = useState<CoveragePreference | 'Any'>('Any');
  const [specStyle, setSpecStyle] = useState<StylePreference | 'Any'>('Any');
  const [ideas, setIdeas] = useState<Outfit[]>([]);
  const [ideasLoading, setIdeasLoading] = useState(false);

  // why: per the hydration rule, API effects must wait for hasHydrated so the
  // JWT is restored before the first call on a cold start.
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  const filteredOccasions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return OCCASIONS;
    return OCCASIONS.filter((o) => o.id.toLowerCase().includes(q) || o.name.toLowerCase().includes(q) || o.category.toLowerCase().includes(q));
  }, [search]);

  const fetchCloset = (occasion: string) => {
    setLoading(true);
    setError(null);
    api.getWardrobeSuggestions(occasion)
      .then((data) => {
        setClosetOutfits(data.outfits);
        setWardrobeSize(data.wardrobeSize);
        setLoading(false);
      })
      .catch((err) => {
        console.error('[KLOSET-DEBUG] [OutfitsScreen] Wardrobe suggestions failed:', err);
        setError(err.message || 'Failed to style your closet.');
        setLoading(false);
      });
  };

  const fetchIdeas = (occasion: string) => {
    const specs: SuggestionSpecs = {};
    if (specCoverage !== 'Any') specs.coverage = specCoverage;
    if (specStyle !== 'Any') specs.style = specStyle;
    setIdeasLoading(true);
    api.getSuggestions(occasion, specs)
      .then((data) => setIdeas(data || []))
      .catch((err) => console.error('[KLOSET-DEBUG] [OutfitsScreen] Ideas failed:', err))
      .finally(() => setIdeasLoading(false));
  };

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || !selectedOccasion) return;
    fetchCloset(selectedOccasion);
    if (showIdeas) fetchIdeas(selectedOccasion);
  }, [selectedOccasion, hasHydrated, isAuthenticated]);

  const pickOccasion = (id: string) => {
    setPickerVisible(false);
    setSearch('');
    setShowIdeas(false);
    setIdeas([]);
    setSelectedOccasion(id);
  };

  const selectedMeta = OCCASIONS.find((o) => o.id === selectedOccasion);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.heading, { color: theme.text }]}>Occasion Stylist</Text>
      <Text style={[styles.subheading, { color: theme.tabIconDefault }]}>
        Tell me the occasion — I'll style it from your closet first.
      </Text>

      {/* Occasion selector — opens a searchable picker */}
      <TouchableOpacity
        onPress={() => setPickerVisible(true)}
        style={[styles.selectorBtn, { backgroundColor: theme.card, borderColor: selectedOccasion ? theme.tint : theme.border }]}
        activeOpacity={0.8}
      >
        {selectedMeta ? (
          <RNView style={styles.selectorInner}>
            <RNView style={[styles.iconCircle, { backgroundColor: `${selectedMeta.color}15` }]}>
              <selectedMeta.icon size={18} color={selectedMeta.color} />
            </RNView>
            <Text style={[styles.selectorText, { color: theme.text }]}>{selectedMeta.id}</Text>
          </RNView>
        ) : (
          <RNView style={styles.selectorInner}>
            <Search size={18} color={theme.tabIconDefault} />
            <Text style={[styles.selectorText, { color: theme.tabIconDefault }]}>What's the occasion?</Text>
          </RNView>
        )}
        <ChevronDown size={20} color={theme.tabIconDefault} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.matchesScroll}>
        {!selectedOccasion ? (
          <View style={[styles.emptyContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Sparkles size={40} color={theme.tabIconDefault} style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyText, { color: theme.text }]}>Pick an occasion to begin</Text>
            <Text style={[styles.emptySubtext, { color: theme.tabIconDefault }]}>
              Wedding, brunch, interview, garba night — I'll build looks from what you already own.
            </Text>
          </View>
        ) : loading ? (
          <RNView style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.tint} />
            <Text style={[styles.loadingText, { color: theme.tabIconDefault, marginTop: 12 }]}>
              Styling your closet...
            </Text>
          </RNView>
        ) : error ? (
          <RNView style={styles.centerContainer}>
            <Text style={{ color: '#EF4444', textAlign: 'center', marginBottom: 12 }}>{error}</Text>
            <TouchableOpacity onPress={() => fetchCloset(selectedOccasion)} style={[styles.retryBtn, { backgroundColor: theme.tint }]}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </RNView>
        ) : (
          <>
            {/* ---------- SECTION 1: From your Kloset (priority) ---------- */}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>From Your Kloset</Text>

            {closetOutfits.length > 0 ? (
              closetOutfits.map((outfit) => (
                <View key={outfit.id} style={[styles.matchCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={styles.matchHeader}>
                    <Text style={[styles.matchTitle, { color: theme.text }]}>
                      {outfit.items.map((i) => i.subType || i.category).join(' + ')}
                    </Text>
                    <View style={[styles.matchBadge, { backgroundColor: `${theme.accent}15` }]}>
                      <Text style={[styles.matchBadgeText, { color: theme.accent }]}>{outfit.lane}</Text>
                    </View>
                  </View>

                  {/* Item thumbnails */}
                  <RNView style={styles.itemsPreviewRow}>
                    {outfit.items.map((item) => (
                      <RNView key={item.id} style={[styles.itemPreviewCard, { borderColor: theme.border }]}>
                        <Image source={{ uri: item.imageUrl }} style={styles.itemPreviewImg} />
                        <Text style={[styles.itemPreviewName, { color: theme.text }]} numberOfLines={1}>
                          {item.subType || item.category}
                        </Text>
                      </RNView>
                    ))}
                  </RNView>

                  {/* The WHY — 4-5 short lines */}
                  <View style={[styles.explanationBox, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }]}>
                    <Sparkles size={16} color={theme.accent} style={{ marginRight: 8, marginTop: 2 }} />
                    <Text style={[styles.explanationText, { color: theme.text }]}>
                      {outfit.explanation}
                    </Text>
                  </View>

                  <TouchableOpacity style={[styles.wearBtn, { backgroundColor: theme.tint }]}>
                    <Text style={styles.wearBtnText}>Plan to Wear</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={[styles.emptyContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Sparkles size={32} color={theme.tabIconDefault} style={{ marginBottom: 10 }} />
                <Text style={[styles.emptyText, { color: theme.text }]}>
                  {wardrobeSize === 0 ? 'Your Kloset is empty' : `Nothing in your closet fits ${selectedOccasion} yet`}
                </Text>
                <Text style={[styles.emptySubtext, { color: theme.tabIconDefault }]}>
                  {wardrobeSize === 0
                    ? 'Add a few garments and I\'ll start composing looks from them.'
                    : 'Add more pieces for this occasion — or browse outside ideas below.'}
                </Text>
              </View>
            )}

            {/* ---------- SECTION 2: Ideas from outside (opt-in) ---------- */}
            {!showIdeas ? (
              <TouchableOpacity
                onPress={() => { setSpecsVisible(true); }}
                style={[styles.ideasBtn, { borderColor: theme.tint }]}
                activeOpacity={0.8}
              >
                <Compass size={18} color={theme.tint} />
                <Text style={[styles.ideasBtnText, { color: theme.tint }]}>Browse ideas from outside your closet</Text>
              </TouchableOpacity>
            ) : (
              <>
                <RNView style={styles.ideasHeaderRow}>
                  <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>Outside Ideas</Text>
                  <TouchableOpacity onPress={() => setSpecsVisible(true)}>
                    <Text style={{ color: theme.tint, fontWeight: '600', fontSize: 13 }}>
                      {specCoverage === 'Any' && specStyle === 'Any' ? 'Add preferences' : `${specCoverage !== 'Any' ? specCoverage : ''}${specCoverage !== 'Any' && specStyle !== 'Any' ? ' · ' : ''}${specStyle !== 'Any' ? specStyle : ''}`}
                    </Text>
                  </TouchableOpacity>
                </RNView>

                {ideasLoading ? (
                  <RNView style={styles.centerContainer}>
                    <ActivityIndicator size="small" color={theme.tint} />
                  </RNView>
                ) : ideas.length > 0 ? (
                  ideas.map((match: any) => (
                    <View key={match.id} style={[styles.matchCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                      <View style={styles.matchHeader}>
                        <Text style={[styles.matchTitle, { color: theme.text }]}>{match.title}</Text>
                        <View style={[styles.matchBadge, { backgroundColor: `${theme.accent}15` }]}>
                          <Text style={[styles.matchBadgeText, { color: theme.accent }]}>
                            {match.matchScore !== undefined ? `${Math.round((match.matchScore / 10) * 100)}% Match` : 'Matched'}
                          </Text>
                        </View>
                      </View>

                      {match.imageUrl && (
                        <RNView style={[styles.matchImageContainer, { borderColor: theme.border }]}>
                          <Image source={{ uri: match.imageUrl }} style={styles.matchImage} />
                        </RNView>
                      )}

                      <Text style={[styles.matchDesc, { color: theme.tabIconDefault }]}>{match.description}</Text>

                      <View style={styles.metaRow}>
                        <Text style={[styles.metaText, { color: theme.tabIconDefault }]}>
                          Formality: <Text style={{ color: theme.text, fontWeight: '600' }}>{match.formality}</Text>
                        </Text>
                        <Text style={[styles.metaText, { color: theme.tabIconDefault }]}>
                          Coverage: <Text style={{ color: theme.text, fontWeight: '600' }}>{match.coverage}</Text>
                        </Text>
                      </View>

                      {match.explanation && (
                        <View style={[styles.explanationBox, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', marginTop: 10 }]}>
                          <Sparkles size={16} color={theme.accent} style={{ marginRight: 8, marginTop: 2 }} />
                          <Text style={[styles.explanationText, { color: theme.text }]} numberOfLines={4}>
                            {match.explanation}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={[styles.emptySubtext, { color: theme.tabIconDefault, textAlign: 'center', paddingVertical: 20 }]}>
                    No outside ideas match those preferences for this occasion.
                  </Text>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* ================= Occasion picker modal ================= */}
      <Modal visible={pickerVisible} animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <RNView style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>What's the occasion?</Text>
            <TouchableOpacity onPress={() => setPickerVisible(false)} style={[styles.modalClose, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <X size={18} color={theme.text} />
            </TouchableOpacity>
          </RNView>

          <RNView style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Search size={16} color={theme.tabIconDefault} style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Search: wedding, brunch, garba, interview..."
              placeholderTextColor={theme.tabIconDefault}
              value={search}
              onChangeText={setSearch}
              autoFocus
              style={[styles.searchInput, { color: theme.text }]}
            />
          </RNView>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 40 }}>
            {CATEGORY_ORDER.map((cat) => {
              const group = filteredOccasions.filter((o) => o.category === cat);
              if (group.length === 0) return null;
              return (
                <RNView key={cat} style={{ marginBottom: 8 }}>
                  <Text style={[styles.groupLabel, { color: theme.tabIconDefault }]}>{cat}</Text>
                  {group.map((occ) => {
                    const Icon = occ.icon;
                    const isSelected = selectedOccasion === occ.id;
                    return (
                      <TouchableOpacity
                        key={occ.id}
                        onPress={() => pickOccasion(occ.id)}
                        style={[styles.occasionRow, { backgroundColor: isSelected ? `${theme.tint}12` : 'transparent' }]}
                      >
                        <RNView style={[styles.iconCircle, { backgroundColor: `${occ.color}15` }]}>
                          <Icon size={18} color={occ.color} />
                        </RNView>
                        <Text style={[styles.occasionRowText, { color: theme.text }]}>{occ.id}</Text>
                        {isSelected && <Check size={18} color={theme.tint} />}
                      </TouchableOpacity>
                    );
                  })}
                </RNView>
              );
            })}
          </ScrollView>
        </View>
      </Modal>

      {/* ================= Specs sheet (outside ideas) ================= */}
      <Modal visible={specsVisible} animationType="fade" transparent onRequestClose={() => setSpecsVisible(false)}>
        <RNView style={styles.sheetBackdrop}>
          <View style={[styles.sheet, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sheetTitle, { color: theme.text }]}>Any preferences?</Text>
            <Text style={[styles.sheetSub, { color: theme.tabIconDefault }]}>
              Optional — leave on "Any" and I'll use your profile.
            </Text>

            <Text style={[styles.sheetLabel, { color: theme.text }]}>Coverage</Text>
            <RNView style={styles.chipRow}>
              {COVERAGE_OPTIONS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setSpecCoverage(c)}
                  style={[styles.chip, { backgroundColor: specCoverage === c ? theme.tint : 'transparent', borderColor: specCoverage === c ? theme.tint : theme.border }]}
                >
                  <Text style={{ color: specCoverage === c ? '#FFF' : theme.text, fontSize: 12, fontWeight: '600' }}>{c}</Text>
                </TouchableOpacity>
              ))}
            </RNView>

            <Text style={[styles.sheetLabel, { color: theme.text }]}>Style lane</Text>
            <RNView style={styles.chipRow}>
              {STYLE_OPTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setSpecStyle(s)}
                  style={[styles.chip, { backgroundColor: specStyle === s ? theme.tint : 'transparent', borderColor: specStyle === s ? theme.tint : theme.border }]}
                >
                  <Text style={{ color: specStyle === s ? '#FFF' : theme.text, fontSize: 12, fontWeight: '600' }}>{s}</Text>
                </TouchableOpacity>
              ))}
            </RNView>

            <TouchableOpacity
              onPress={() => {
                setSpecsVisible(false);
                setShowIdeas(true);
                if (selectedOccasion) fetchIdeas(selectedOccasion);
              }}
              style={[styles.wearBtn, { backgroundColor: theme.tint, marginTop: 18 }]}
            >
              <Text style={styles.wearBtnText}>Show Ideas</Text>
            </TouchableOpacity>
          </View>
        </RNView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 16,
  },
  subheading: {
    fontSize: 14,
    marginBottom: 16,
  },
  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 56,
    marginBottom: 16,
  },
  selectorInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  selectorText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchesScroll: {
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  matchCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  matchBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  matchBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  matchDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
  },
  itemsPreviewRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  itemPreviewCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  itemPreviewImg: {
    width: '100%',
    height: 110,
    resizeMode: 'cover',
  },
  itemPreviewName: {
    fontSize: 11,
    fontWeight: '600',
    padding: 6,
    textAlign: 'center',
  },
  wearBtn: {
    borderRadius: 12,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wearBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  ideasBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 14,
    borderStyle: 'dashed',
    paddingVertical: 14,
    marginTop: 4,
    marginBottom: 20,
  },
  ideasBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  ideasHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  emptyContainer: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
  centerContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  matchImageContainer: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
  },
  matchImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  explanationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  explanationText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  // Picker modal
  modalContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 56,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: 'transparent',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalClose: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    height: '100%',
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 8,
  },
  occasionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  occasionRowText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  // Specs sheet
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 22,
    paddingBottom: 38,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sheetSub: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 14,
  },
  sheetLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1.5,
  },
});
