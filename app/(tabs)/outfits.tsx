import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal,
  ActivityIndicator, View, Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, X, Check, ChevronLeft, ChevronRight, RotateCw, Sparkles } from 'lucide-react-native';
import { Crimson, Fonts } from '@/constants/Colors';
import { api } from '../../lib';
import type { WardrobeOutfit, SuggestionSpecs } from '../../lib/api';
import { useAppStore } from '../../store';
import { Outfit, CoveragePreference, StylePreference } from '../../types';

// ============================================================================
// Occasion Stylist — Crimson redesign (Phone B): full-crimson room, one look
// at a time from YOUR closet, with "ideas from outside" as an opt-in lane.
// ============================================================================

const OCCASIONS = [
  { id: 'Diwali Party (Family)', category: 'Festive & Family' },
  { id: 'Diwali Party (Friends)', category: 'Festive & Family' },
  { id: 'Holi', category: 'Festive & Family' },
  { id: 'Navratri / Garba', category: 'Festive & Family' },
  { id: 'Eid', category: 'Festive & Family' },
  { id: 'Regional Festival', category: 'Festive & Family' },
  { id: 'Pooja / Temple Visit', category: 'Festive & Family' },
  { id: 'Baby Shower / Godh Bharai', category: 'Festive & Family' },
  { id: 'Mehendi Function', category: 'Weddings & Functions' },
  { id: 'Sangeet Night', category: 'Weddings & Functions' },
  { id: 'Wedding (Close Family)', category: 'Weddings & Functions' },
  { id: 'Wedding (Guest)', category: 'Weddings & Functions' },
  { id: 'Reception', category: 'Weddings & Functions' },
  { id: 'Cocktail / Pre-wedding', category: 'Weddings & Functions' },
  { id: 'Engagement Ceremony', category: 'Weddings & Functions' },
  { id: 'Roka / Sagai', category: 'Weddings & Functions' },
  { id: 'First Day of College', category: 'College' },
  { id: 'College Farewell', category: 'College' },
  { id: 'College Fest (Day)', category: 'College' },
  { id: 'College Fest (Night)', category: 'College' },
  { id: 'College Trip', category: 'College' },
  { id: 'Internship (Startup)', category: 'College' },
  { id: 'Internship (Corporate)', category: 'College' },
  { id: 'Job Interview (Tech)', category: 'Professional' },
  { id: 'Job Interview (Corporate)', category: 'Professional' },
  { id: 'Office (Startup)', category: 'Professional' },
  { id: 'Office (Formal)', category: 'Professional' },
  { id: 'Client Meeting', category: 'Professional' },
  { id: 'WFH / Video Call', category: 'Professional' },
  { id: 'Casual Outing', category: 'Social' },
  { id: 'Mall / Shopping Day', category: 'Social' },
  { id: 'Brunch / Cafe', category: 'Social' },
  { id: 'Dinner Date', category: 'Social' },
  { id: 'First Date', category: 'Social' },
  { id: 'Night Out', category: 'Social' },
  { id: 'House Party', category: 'Social' },
  { id: 'Gym / Workout', category: 'Social' },
  { id: 'Beach / Pool Day', category: 'Social' },
  { id: 'My Birthday', category: 'Special' },
  { id: "Friend's Birthday", category: 'Special' },
  { id: 'Travel Day', category: 'Special' },
  { id: 'Airport / Travel Look', category: 'Special' },
  { id: 'Hill Station Trip', category: 'Special' },
  { id: 'Heritage City Sightseeing', category: 'Special' },
  { id: 'Graduation Day', category: 'Special' },
  { id: 'Award Ceremony / Convocation', category: 'Special' },
  { id: 'Anniversary Dinner', category: 'Special' },
];
const CATEGORY_ORDER = ['Festive & Family', 'Weddings & Functions', 'College', 'Professional', 'Social', 'Special'];
const COVERAGE_OPTIONS: (CoveragePreference | 'Any')[] = ['Any', 'Modest', 'Moderate', 'Open'];
const STYLE_OPTIONS: (StylePreference | 'Any')[] = ['Any', 'Ethnic', 'Fusion', 'Western', 'Minimal', 'Streetwear'];

export default function OutfitsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [search, setSearch] = useState('');

  const [closetOutfits, setClosetOutfits] = useState<WardrobeOutfit[]>([]);
  const [lookIndex, setLookIndex] = useState(0);
  const [wardrobeSize, setWardrobeSize] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showIdeas, setShowIdeas] = useState(false);
  const [specsVisible, setSpecsVisible] = useState(false);
  const [specCoverage, setSpecCoverage] = useState<CoveragePreference | 'Any'>('Any');
  const [specStyle, setSpecStyle] = useState<StylePreference | 'Any'>('Any');
  const [ideas, setIdeas] = useState<Outfit[]>([]);
  const [ideasLoading, setIdeasLoading] = useState(false);

  // per the hydration rule: wait for the restored JWT before the first call
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  const filteredOccasions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return OCCASIONS;
    return OCCASIONS.filter((o) => o.id.toLowerCase().includes(q) || o.category.toLowerCase().includes(q));
  }, [search]);

  const fetchCloset = (occasion: string) => {
    setLoading(true);
    setError(null);
    api.getWardrobeSuggestions(occasion)
      .then((data) => {
        setClosetOutfits(data.outfits);
        setWardrobeSize(data.wardrobeSize);
        setLookIndex(0);
        setLoading(false);
      })
      .catch((err) => {
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
      .catch(() => {})
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

  const look = closetOutfits[lookIndex];

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[...Crimson.occasionBg]}
        locations={[0, 0.3, 0.78]}
        start={{ x: 0.15, y: 0 }} end={{ x: 0.7, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* header */}
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Text style={styles.kicker}>OCCASION STYLIST</Text>
        <Text style={styles.title}>Style a look</Text>

        {/* occasion "search" bar */}
        <TouchableOpacity style={styles.searchBar} activeOpacity={0.85} onPress={() => setPickerVisible(true)}>
          <Search size={15} color="rgba(255,255,255,0.8)" />
          <Text style={[styles.searchText, !selectedOccasion && { color: Crimson.white55 }]}>
            {selectedOccasion || "What's the occasion?"}
          </Text>
          {selectedOccasion && (
            <TouchableOpacity
              style={styles.clearDot}
              onPress={() => { setSelectedOccasion(null); setClosetOutfits([]); setIdeas([]); setShowIdeas(false); }}
            >
              <X size={11} color="#fff" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {!selectedOccasion ? (
          <View style={styles.emptyBox}>
            <Sparkles size={34} color="rgba(255,255,255,0.7)" />
            <Text style={styles.emptyTitle}>Pick an occasion to begin</Text>
            <Text style={styles.emptySub}>Sangeet, brunch, interview, garba night — I'll style it from your closet first.</Text>
          </View>
        ) : (
          <>
            {/* outside ideas chip + preferences */}
            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <TouchableOpacity style={styles.outsideChip} onPress={() => setSpecsVisible(true)}>
                  <Text style={{ color: Crimson.rose, fontSize: 12 }}>✦</Text>
                  <Text style={styles.outsideChipText}>Outfit from outside your closet ›</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.prefsRow} onPress={() => setSpecsVisible(true)}>
                  <Text style={styles.prefsText}>
                    Preferences
                    <Text style={{ color: Crimson.white55 }}>
                      {'  ·  '}{specCoverage === 'Any' && specStyle === 'Any' ? 'None set' : [specCoverage !== 'Any' ? specCoverage : null, specStyle !== 'Any' ? specStyle : null].filter(Boolean).join(' · ')}
                    </Text>
                  </Text>
                  <Text style={{ color: Crimson.white70, fontSize: 11 }}>▾</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.centerBox}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Styling your closet…</Text>
              </View>
            ) : error ? (
              <View style={styles.centerBox}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={() => fetchCloset(selectedOccasion)}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : closetOutfits.length === 0 ? (
              <View style={styles.emptyBox}>
                <Sparkles size={30} color="rgba(255,255,255,0.7)" />
                <Text style={styles.emptyTitle}>
                  {wardrobeSize === 0 ? 'Your Kloset is empty' : `Nothing in your closet fits ${selectedOccasion} yet`}
                </Text>
                <Text style={styles.emptySub}>
                  {wardrobeSize === 0
                    ? 'Add a few garments and I\'ll start composing looks.'
                    : 'Add more pieces — or browse outside ideas above.'}
                </Text>
              </View>
            ) : look ? (
              <>
                {/* viewer header */}
                <View style={styles.viewerHeader}>
                  <View>
                    <Text style={styles.viewerTitle}>Look {lookIndex + 1} of {closetOutfits.length}</Text>
                    <Text style={styles.viewerSub}>From your closet · {selectedOccasion}</Text>
                  </View>
                  <TouchableOpacity style={styles.redoBtn} onPress={() => fetchCloset(selectedOccasion)}>
                    <RotateCw size={13} color="#fff" />
                    <Text style={styles.redoText}>Redo</Text>
                  </TouchableOpacity>
                </View>

                {/* match + prev/next */}
                <View style={styles.matchRow}>
                  <View style={styles.matchPill}>
                    <Text style={styles.matchPillText}>✦ {Math.min(98, 55 + look.matchScore * 3)}% Match</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 9 }}>
                    <TouchableOpacity
                      style={[styles.navCircle, lookIndex === 0 && { opacity: 0.4 }]}
                      disabled={lookIndex === 0}
                      onPress={() => setLookIndex((i) => Math.max(0, i - 1))}
                    >
                      <ChevronLeft size={19} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.navCircle, lookIndex >= closetOutfits.length - 1 && { opacity: 0.4 }]}
                      disabled={lookIndex >= closetOutfits.length - 1}
                      onPress={() => setLookIndex((i) => Math.min(closetOutfits.length - 1, i + 1))}
                    >
                      <ChevronRight size={19} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* piece badges */}
                <View style={styles.badgeRow}>
                  {look.items.map((item, idx) => (
                    <View key={item.id} style={[styles.pieceBadge, idx === 0 && styles.pieceBadgeActive]}>
                      <Text style={styles.pieceBadgeText}>{String(idx + 1).padStart(2, '0')}</Text>
                    </View>
                  ))}
                  <View style={[styles.pieceBadge, { backgroundColor: 'transparent' }]}>
                    <Text style={[styles.pieceBadgeText, { color: Crimson.white55 }]}>{look.lane}</Text>
                  </View>
                </View>

                {/* glass piece cards */}
                {look.items.map((item, idx) => (
                  <View key={item.id} style={[styles.pieceCard, idx === 0 && styles.pieceCardHero]}>
                    <Image source={{ uri: item.cutoutUrl || item.imageUrl }} style={idx === 0 ? styles.pieceImgHero : styles.pieceImg} />
                    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                      <Text style={styles.pieceMeta}>
                        {[item.fabric, item.embellishment && item.embellishment !== 'None' ? item.embellishment : null]
                          .filter(Boolean).join(' · ').toUpperCase() || item.category.toUpperCase()}
                      </Text>
                      <Text style={[styles.pieceName, idx === 0 && { fontSize: 19 }]} numberOfLines={2}>
                        {(item.colors?.[0] ? item.colors[0] + '\n' : '') + (item.subType || item.category)}
                      </Text>
                    </View>
                  </View>
                ))}

                {/* why it works */}
                <View style={styles.whyBox}>
                  <View style={styles.whyHeader}>
                    <Text style={{ color: Crimson.rose, fontSize: 12 }}>✦</Text>
                    <Text style={styles.whyLabel}>WHY IT WORKS</Text>
                  </View>
                  {/* why ~15 words: the composer writes a 4-5 line essay, but
                      the design's card carries one short editorial thought;
                      cap at 15 words with an ellipsis so it never clips mid-word */}
                  <Text style={styles.whyText}>
                    {(() => {
                      const words = look.explanation.replace(/\n/g, ' ').split(/\s+/).filter(Boolean);
                      return words.slice(0, 15).join(' ') + (words.length > 15 ? '…' : '');
                    })()}
                  </Text>
                </View>

                <TouchableOpacity activeOpacity={0.9}>
                  <LinearGradient colors={[...Crimson.cta]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.3 }} style={styles.cta}>
                    <Text style={styles.ctaText}>Plan to Wear</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : null}

            {/* outside ideas */}
            {showIdeas && (
              <View style={{ marginTop: 26 }}>
                <Text style={styles.ideasTitle}>Outside Ideas</Text>
                {ideasLoading ? (
                  <ActivityIndicator color="#fff" style={{ paddingVertical: 24 }} />
                ) : ideas.length === 0 ? (
                  <Text style={styles.emptySub}>No outside ideas match those preferences for this occasion.</Text>
                ) : (
                  ideas.map((idea: any) => (
                    <View key={idea.id} style={styles.ideaCard}>
                      {idea.imageUrl && <Image source={{ uri: idea.imageUrl }} style={styles.ideaImg} />}
                      <View style={styles.ideaChipsRow}>
                        <View style={[styles.ideaChip, { backgroundColor: Crimson.crimson }]}>
                          <Text style={styles.ideaChipText}>{idea.style}</Text>
                        </View>
                        <View style={styles.ideaChip}>
                          <Text style={styles.ideaChipText}>{idea.formality}</Text>
                        </View>
                        <View style={styles.ideaChip}>
                          <Text style={styles.ideaChipText}>{idea.coverage}</Text>
                        </View>
                      </View>
                      <Text style={styles.ideaTitle}>{idea.title}</Text>
                      <Text style={styles.ideaMeta}>
                        {idea.season} · {(idea.colorPalette || []).slice(0, 3).join(', ')}
                      </Text>
                      {idea.explanation ? <Text style={styles.ideaWhy}>{idea.explanation}</Text> : null}
                    </View>
                  ))
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* occasion picker */}
      <Modal visible={pickerVisible} animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.pickerScreen}>
          <LinearGradient colors={[...Crimson.occasionBg]} locations={[0, 0.3, 0.78]} style={StyleSheet.absoluteFill} />
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>What's the occasion?</Text>
            <TouchableOpacity style={styles.pickerClose} onPress={() => setPickerVisible(false)}>
              <X size={17} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.pickerSearch}>
            <Search size={15} color="rgba(255,255,255,0.8)" />
            <TextInput
              placeholder="Search: sangeet, brunch, garba…"
              placeholderTextColor={Crimson.white55}
              value={search}
              onChangeText={setSearch}
              autoFocus
              style={styles.pickerInput}
            />
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {CATEGORY_ORDER.map((cat) => {
              const group = filteredOccasions.filter((o) => o.category === cat);
              if (!group.length) return null;
              return (
                <View key={cat} style={{ marginBottom: 6 }}>
                  <Text style={styles.groupLabel}>{cat.toUpperCase()}</Text>
                  {group.map((occ) => (
                    <TouchableOpacity
                      key={occ.id}
                      style={[styles.occRow, selectedOccasion === occ.id && styles.occRowActive]}
                      onPress={() => pickOccasion(occ.id)}
                    >
                      <Text style={styles.occRowText}>{occ.id}</Text>
                      {selectedOccasion === occ.id && <Check size={16} color="#fff" />}
                    </TouchableOpacity>
                  ))}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </Modal>

      {/* preferences sheet */}
      <Modal visible={specsVisible} transparent animationType="fade" onRequestClose={() => setSpecsVisible(false)}>
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Any preferences?</Text>
            <Text style={styles.sheetSub}>Optional — leave on "Any" and I'll use your profile.</Text>
            <Text style={styles.sheetLabel}>Coverage</Text>
            <View style={styles.chipRow}>
              {COVERAGE_OPTIONS.map((c) => (
                <TouchableOpacity key={c} onPress={() => setSpecCoverage(c)}
                  style={[styles.sheetChip, specCoverage === c && styles.sheetChipActive]}>
                  <Text style={[styles.sheetChipText, specCoverage === c && { color: '#fff' }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.sheetLabel}>Style lane</Text>
            <View style={styles.chipRow}>
              {STYLE_OPTIONS.map((s) => (
                <TouchableOpacity key={s} onPress={() => setSpecStyle(s)}
                  style={[styles.sheetChip, specStyle === s && styles.sheetChipActive]}>
                  <Text style={[styles.sheetChipText, specStyle === s && { color: '#fff' }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                setSpecsVisible(false);
                setShowIdeas(true);
                if (selectedOccasion) fetchIdeas(selectedOccasion);
              }}>
              <LinearGradient colors={[...Crimson.cta]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.3 }} style={[styles.cta, { marginTop: 18 }]}>
                <Text style={styles.ctaText}>Show Ideas</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#b00c28' },
  header: { paddingHorizontal: 22 },
  kicker: { color: 'rgba(255,255,255,0.75)', fontFamily: Fonts.body, fontSize: 10, letterSpacing: 1.6 },
  title: { color: '#fff', fontFamily: Fonts.display, fontSize: 22, marginTop: 2 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: 14, marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.24)',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13,
  },
  searchText: { flex: 1, color: '#fff', fontFamily: Fonts.body, fontSize: 13.5 },
  clearDot: {
    width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },
  // why 26: the design insets its cards a touch more from the edges than 22
  scroll: { paddingHorizontal: 26, paddingBottom: 110 },

  outsideChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.26)',
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999,
  },
  outsideChipText: { color: '#fff', fontFamily: Fonts.body, fontSize: 11 },
  prefsRow: {
    marginTop: 11, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
  },
  prefsText: { color: '#fff', fontFamily: Fonts.body, fontSize: 11 },

  centerBox: { paddingVertical: 46, alignItems: 'center', gap: 12 },
  loadingText: { color: 'rgba(255,255,255,0.85)', fontFamily: Fonts.bodyMed, fontSize: 13 },
  errorText: { color: '#fff', fontFamily: Fonts.bodyMed, fontSize: 13, textAlign: 'center' },
  retryBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: '#fff', fontFamily: Fonts.bodyBold, fontSize: 13 },
  emptyBox: { alignItems: 'center', paddingVertical: 54, gap: 10, paddingHorizontal: 12 },
  emptyTitle: { color: '#fff', fontFamily: Fonts.display, fontSize: 16, textAlign: 'center' },
  emptySub: { color: 'rgba(255,255,255,0.7)', fontFamily: Fonts.bodyMed, fontSize: 12, textAlign: 'center', lineHeight: 17 },

  viewerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 },
  viewerTitle: { color: '#fff', fontFamily: Fonts.display, fontSize: 17 },
  viewerSub: { color: 'rgba(255,255,255,0.6)', fontFamily: Fonts.bodyMed, fontSize: 11, marginTop: 2 },
  redoBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  redoText: { color: '#fff', fontFamily: Fonts.bodyBold, fontSize: 12 },

  matchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  matchPill: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999 },
  matchPillText: { color: '#fff', fontFamily: Fonts.bodyBold, fontSize: 11 },
  navCircle: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },

  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 10, alignItems: 'center' },
  pieceBadge: {
    minWidth: 34, height: 34, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  pieceBadgeActive: { backgroundColor: Crimson.ink },
  pieceBadgeText: { color: '#fff', fontFamily: Fonts.body, fontSize: 11 },

  pieceCard: {
    flexDirection: 'row', gap: 14, borderRadius: 20, padding: 15, marginBottom: 11,
    backgroundColor: 'rgba(255,255,255,0.24)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.32)',
  },
  pieceCardHero: { backgroundColor: 'rgba(255,255,255,0.3)', padding: 17 },
  pieceImg: { width: 68, height: 68, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.2)' },
  pieceImgHero: { width: 100, height: 100, borderRadius: 15, backgroundColor: 'rgba(0,0,0,0.2)' },
  pieceMeta: { color: 'rgba(255,255,255,0.75)', fontFamily: Fonts.body, fontSize: 9, letterSpacing: 0.8 },
  pieceName: { color: '#fff', fontFamily: Fonts.display, fontSize: 16, lineHeight: 20, marginTop: 3, textTransform: 'capitalize' },

  whyBox: {
    marginTop: 6, borderRadius: 18, backgroundColor: 'rgba(20,8,10,0.42)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', padding: 16,
  },
  whyHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 6 },
  whyLabel: { color: '#fff', fontFamily: Fonts.bodyBold, fontSize: 10.5, letterSpacing: 0.9 },
  whyText: { color: 'rgba(255,255,255,0.85)', fontFamily: Fonts.bodyReg, fontSize: 11.5, lineHeight: 17 },

  // why the soft crimson shadow: the design's Plan to Wear button carries a
  // faint glow, not a hard drop shadow
  cta: {
    borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 16,
    shadowColor: Crimson.crimsonBright, shadowOpacity: 0.4, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  ctaText: { color: '#fff', fontFamily: Fonts.bodyBold, fontSize: 13.5 },

  ideasTitle: { color: '#fff', fontFamily: Fonts.display, fontSize: 17, marginBottom: 12 },
  ideaCard: {
    borderRadius: 20, backgroundColor: 'rgba(20,8,10,0.42)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)', padding: 14, marginBottom: 14,
  },
  ideaImg: { width: '100%', height: 210, borderRadius: 14, marginBottom: 11, backgroundColor: 'rgba(0,0,0,0.25)' },
  ideaChipsRow: { flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  ideaChip: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8 },
  ideaChipText: { color: '#fff', fontFamily: Fonts.bodyMed, fontSize: 9.5 },
  ideaTitle: { color: '#fff', fontFamily: Fonts.display, fontSize: 17, lineHeight: 21 },
  ideaMeta: { color: 'rgba(255,255,255,0.6)', fontFamily: Fonts.bodyMed, fontSize: 10, marginTop: 5 },
  ideaWhy: { color: 'rgba(255,255,255,0.8)', fontFamily: Fonts.bodyReg, fontSize: 11.5, lineHeight: 16, marginTop: 9 },

  pickerScreen: { flex: 1, paddingTop: 56, paddingHorizontal: 18 },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  pickerTitle: { color: '#fff', fontFamily: Fonts.display, fontSize: 20 },
  pickerClose: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  pickerSearch: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.24)',
    borderRadius: 13, paddingHorizontal: 13, marginBottom: 14,
  },
  pickerInput: { flex: 1, color: '#fff', fontFamily: Fonts.bodyMed, fontSize: 14, paddingVertical: 12 },
  groupLabel: { color: 'rgba(255,255,255,0.6)', fontFamily: Fonts.body, fontSize: 10.5, letterSpacing: 1.2, marginTop: 10, marginBottom: 6 },
  occRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 10, borderRadius: 12,
  },
  occRowActive: { backgroundColor: 'rgba(255,255,255,0.14)' },
  occRowText: { color: '#fff', fontFamily: Fonts.body, fontSize: 14 },

  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#2a0810', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', padding: 22, paddingBottom: 38,
  },
  sheetTitle: { color: '#fff', fontFamily: Fonts.display, fontSize: 18 },
  sheetSub: { color: 'rgba(255,255,255,0.6)', fontFamily: Fonts.bodyMed, fontSize: 12, marginTop: 2, marginBottom: 14 },
  sheetLabel: { color: '#fff', fontFamily: Fonts.body, fontSize: 13, marginTop: 6, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  sheetChip: {
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.24)', borderRadius: 18,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  sheetChipActive: { backgroundColor: Crimson.crimson, borderColor: Crimson.crimson },
  sheetChipText: { color: 'rgba(255,255,255,0.85)', fontFamily: Fonts.body, fontSize: 12 },
});
