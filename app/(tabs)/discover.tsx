import React, { useState, useEffect } from 'react';
import {
  StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, View, Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart, X, Bookmark, RotateCw } from 'lucide-react-native';
import { Crimson, Fonts } from '@/constants/Colors';
import { api } from '../../lib';
import { useAppStore } from '../../store';
import { Outfit } from '../../types';

// ============================================================================
// Discover — Crimson redesign (Phone D): dark room, tilted translucent deck,
// vertical glass action bar, floating details card overlapping the stack.
// ============================================================================

const OCCASION_FILTERS = [
  'Casual Outing', 'Diwali Party (Family)', 'Wedding (Guest)', 'Sangeet Night',
  'Mehendi Function', 'Cocktail / Pre-wedding', 'Reception', 'Brunch / Cafe',
  'Office (Formal)', 'Job Interview (Corporate)', 'Night Out', 'My Birthday',
  'Beach / Pool Day', 'Eid', 'Navratri / Garba', 'College Fest (Night)',
];

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeOccasion, setActiveOccasion] = useState('Casual Outing');

  // per the hydration rule: wait for the restored JWT before the first call
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  const fetchCatalog = (occasionName: string) => {
    setLoading(true);
    setError(null);
    api.getSuggestions(occasionName)
      .then((data) => {
        setOutfits(data || []);
        setCurrentIndex(0);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch outfits');
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) return;
    fetchCatalog(activeOccasion);
  }, [activeOccasion, hasHydrated, isAuthenticated]);

  const handleAction = (type: 'like' | 'dislike') => {
    if (currentIndex >= outfits.length) return;
    const currentOutfit = outfits[currentIndex];
    useAppStore.getState().recordSwipe(currentOutfit.id, type).catch(() => {});
    setCurrentIndex((prev) => prev + 1);
  };

  const hasCards = currentIndex < outfits.length;
  const current: any = hasCards ? outfits[currentIndex] : null;

  return (
    <View style={styles.screen}>
      <LinearGradient colors={[...Crimson.glow]} locations={[0, 0.6, 1]} style={styles.glow} />

      <Text style={[styles.title, { paddingTop: insets.top + 12 }]}>Looks you may like</Text>

      {/* occasion filter chips */}
      <View style={{ height: 40, marginTop: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {OCCASION_FILTERS.map((occ) => {
            const active = activeOccasion === occ;
            return (
              <TouchableOpacity
                key={occ}
                onPress={() => setActiveOccasion(occ)}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, active && { color: '#fff' }]}>{occ}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={Crimson.tabActive} />
          <Text style={styles.mutedText}>Curating looks…</Text>
        </View>
      ) : error ? (
        <View style={styles.centerBox}>
          <Text style={styles.mutedText}>{error}</Text>
          <TouchableOpacity style={styles.resetBtn} onPress={() => fetchCatalog(activeOccasion)}>
            <Text style={styles.resetBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : !hasCards ? (
        <View style={styles.centerBox}>
          <Heart size={36} color={Crimson.rose} />
          <Text style={styles.doneTitle}>You've seen every look</Text>
          <Text style={styles.mutedText}>
            {outfits.length === 0 ? 'No catalog looks for this occasion yet.' : 'Change the occasion, or run the deck again.'}
          </Text>
          {outfits.length > 0 && (
            <TouchableOpacity style={styles.resetBtn} onPress={() => setCurrentIndex(0)}>
              <RotateCw size={14} color="#fff" />
              <Text style={styles.resetBtnText}>Run it back</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <>
          {/* card stack */}
          <View style={styles.stackArea}>
            <View style={[styles.ghostCard, styles.ghostBack]} />
            <View style={[styles.ghostCard, styles.ghostFront]} />
            <View style={styles.topCard}>
              <Image source={{ uri: current.imageUrl }} style={styles.topCardImage} />
              {/* vertical action bar */}
              <View style={styles.actionBar}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction('like')}>
                  <Heart size={19} color="#fff" fill="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction('dislike')}>
                  <X size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction('like')}>
                  <Bookmark size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* floating details card — translucent crimson gradient (design:
              linear-gradient(150deg,rgba(20,10,12,.94),rgba(60,9,18,.94))),
              sits near the bottom, overlapping the card by only ~10% */}
          <LinearGradient
            colors={['rgba(20,10,12,0.9)', 'rgba(60,9,18,0.9)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.detailsCard}
          >
            <View style={styles.detailChipsRow}>
              <View style={[styles.detailChip, { backgroundColor: Crimson.crimson }]}>
                <Text style={styles.detailChipTextBold}>{current.style}</Text>
              </View>
              {(current.occasions || []).slice(0, 2).map((occ: string) => (
                <View key={occ} style={styles.detailChip}>
                  <Text style={styles.detailChipText} numberOfLines={1}>{occ}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.detailsTitle} numberOfLines={2}>{current.title}</Text>
            <Text style={styles.detailsMeta} numberOfLines={1}>
              {[current.formality, current.coverage, current.season, (current.colorPalette || []).slice(0, 2).join(', ')]
                .filter(Boolean).join(' · ')}
            </Text>
          </LinearGradient>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Crimson.darkBg },
  glow: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '66%' },
  title: { color: '#fff', fontFamily: Fonts.display, fontSize: 20, paddingHorizontal: 22 },
  chipScroll: { paddingLeft: 22, paddingRight: 30, gap: 8, alignItems: 'center' },
  filterChip: {
    backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8,
  },
  filterChipActive: { backgroundColor: Crimson.crimson, borderColor: Crimson.crimson },
  filterChipText: { color: 'rgba(255,255,255,0.75)', fontFamily: Fonts.body, fontSize: 11 },

  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40, paddingBottom: 60 },
  mutedText: { color: Crimson.white55, fontFamily: Fonts.bodyMed, fontSize: 12.5, textAlign: 'center' },
  doneTitle: { color: '#fff', fontFamily: Fonts.display, fontSize: 18 },
  resetBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 11,
  },
  resetBtnText: { color: '#fff', fontFamily: Fonts.bodyBold, fontSize: 13 },

  // why marginBottom: the card must NOT fill the screen — it ends well above
  // the nav so the details bar floats mostly below it, overlapping by ~10%
  // (matches the design's 384px centred card + bottom-floating details).
  stackArea: { flex: 1, marginHorizontal: 16, marginTop: 16, marginBottom: 92 },
  ghostCard: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    borderRadius: 26, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  ghostBack: { backgroundColor: 'rgba(168,50,74,0.22)', transform: [{ rotate: '-5deg' }], left: 26, right: 10, top: -8 },
  ghostFront: { backgroundColor: 'rgba(168,50,74,0.4)', transform: [{ rotate: '4deg' }], left: 4, right: 20, top: -2 },
  topCard: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    borderRadius: 26, overflow: 'hidden', backgroundColor: '#3c0912',
    shadowColor: '#780a1e', shadowOpacity: 0.4, shadowRadius: 22, shadowOffset: { width: 0, height: 16 }, elevation: 12,
  },
  topCardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  // why the darker pill + per-button borders: the design's white-frosted bar
  // reads because it sits over a dark card; over a real (often light) garment
  // photo it washes out, so the pill gets a dark frosted backing and each
  // button a hairline border + shadow so the icons stay legible on any image.
  actionBar: {
    position: 'absolute', right: 12, top: '50%', transform: [{ translateY: -80 }],
    padding: 5, borderRadius: 999, gap: 8,
    backgroundColor: 'rgba(20,8,10,0.42)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
  },
  actionBtn: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 5,
  },

  detailsCard: {
    position: 'absolute', left: 16, right: 16, bottom: 14, zIndex: 6,
    padding: 15, borderRadius: 22,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#780a1e', shadowOpacity: 0.55, shadowRadius: 22, shadowOffset: { width: 0, height: 14 }, elevation: 14,
  },
  detailChipsRow: { flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  detailChip: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8, maxWidth: 130 },
  detailChipText: { color: '#fff', fontFamily: Fonts.bodyMed, fontSize: 9.5 },
  detailChipTextBold: { color: '#fff', fontFamily: Fonts.bodyBold, fontSize: 9.5 },
  detailsTitle: { color: '#fff', fontFamily: Fonts.display, fontSize: 18, lineHeight: 20 },
  detailsMeta: { color: 'rgba(255,255,255,0.6)', fontFamily: Fonts.bodyMed, fontSize: 10, marginTop: 6 },
});
