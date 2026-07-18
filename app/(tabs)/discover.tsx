import React, { useState, useEffect } from 'react';
import { StyleSheet, Image, TouchableOpacity, Dimensions, Animated, ActivityIndicator, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Heart, X, Sparkles, RefreshCw, Info } from 'lucide-react-native';
import { Outfit } from '@/types';
import { api } from '../../lib';
import { useAppStore } from '../../store';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 32;
const CARD_HEIGHT = height * 0.58;

const OCCASIONS = [
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
  'Gym / Workout', 'Beach / Pool Day',

  // Special
  'My Birthday', "Friend's Birthday", 'Travel Day', 'Airport / Travel Look', 'Hill Station Trip', 'Heritage City Sightseeing',
  'Graduation Day', 'Award Ceremony / Convocation', 'Anniversary Dinner'
];

export default function DiscoverScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  // why: per the hydration rule, API effects must wait for hasHydrated so the
  // JWT is restored before the first /suggestions call on a cold start.
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [activeOccasion, setActiveOccasion] = useState('Casual Outing');

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
        console.error('[KLOSET-DEBUG] [DiscoverScreen] Failed to fetch outfits:', err);
        setError(err.message || 'Failed to fetch outfits');
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) return;
    fetchCatalog(activeOccasion);
  }, [activeOccasion, hasHydrated, isAuthenticated]);

  const handleAction = (type: 'like' | 'dislike') => {
    if (currentIndex < outfits.length) {
      const currentOutfit = outfits[currentIndex];
      if (type === 'like') {
        setLikesCount(prev => prev + 1);
      } else {
        setDislikesCount(prev => prev + 1);
      }
      
      useAppStore.getState().recordSwipe(currentOutfit.id, type)
        .catch((err) => {
          console.warn('[KLOSET-DEBUG] [DiscoverScreen] Failed to record swipe:', err);
        });

      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
  };

  const hasCards = currentIndex < outfits.length;
  const currentOutfit = hasCards ? outfits[currentIndex] : null;

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
        <Text style={[styles.loadingText, { color: theme.tabIconDefault, marginTop: 12 }]}>
          Loading catalog outfits...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <X size={48} color="#EF4444" style={{ marginBottom: 16 }} />
        <Text style={[styles.errorTitle, { color: theme.text }]}>Oops!</Text>
        <Text style={[styles.errorText, { color: theme.tabIconDefault }]}>{error}</Text>
        <TouchableOpacity 
          onPress={() => fetchCatalog(activeOccasion)}
          style={[styles.retryButton, { backgroundColor: theme.tint, marginTop: 16 }]}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Mini Stats Bar */}
      <View style={styles.topBar}>
        <Text style={[styles.title, { color: theme.text }]}>Discover Looks</Text>
        <View style={styles.countsContainer}>
          <View style={[styles.countBadge, { backgroundColor: '#FEE2E2' }]}>
            <X size={12} color="#EF4444" strokeWidth={3} />
            <Text style={[styles.countText, { color: '#EF4444' }]}>{dislikesCount}</Text>
          </View>
          <View style={[styles.countBadge, { backgroundColor: '#ECFDF5', marginLeft: 8 }]}>
            <Heart size={12} color="#10B981" strokeWidth={3} fill="#10B981" />
            <Text style={[styles.countText, { color: '#10B981' }]}>{likesCount}</Text>
          </View>
        </View>
      </View>
      
      {/* Occasion Chips Filter */}
      <View style={styles.occasionsWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.occasionsContainer}
          contentContainerStyle={styles.occasionsContent}
        >
          {OCCASIONS.map((occ) => {
            const isActive = activeOccasion === occ;
            return (
              <TouchableOpacity
                key={occ}
                onPress={() => setActiveOccasion(occ)}
                style={[
                  styles.chip,
                  isActive 
                    ? { backgroundColor: theme.tint, borderColor: theme.tint }
                    : { backgroundColor: theme.card, borderColor: theme.border }
                ]}
                activeOpacity={0.7}
              >
                <Text 
                  style={[
                    styles.chipText,
                    isActive 
                      ? { color: '#FFFFFF', fontWeight: '700' }
                      : { color: theme.tabIconDefault, fontWeight: '500' }
                  ]}
                >
                  {occ}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Card area */}
      <View style={styles.cardContainer}>
        {hasCards && currentOutfit ? (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Image source={{ uri: currentOutfit.imageUrl }} style={styles.cardImage} />
            
            {currentOutfit.matchScore !== undefined && (
              <View style={[styles.matchBadge, { backgroundColor: 'rgba(15, 23, 42, 0.85)' }]}>
                <Sparkles size={12} color="#FBBF24" style={{ marginRight: 4 }} />
                <Text style={styles.matchBadgeText}>
                  {Math.round((currentOutfit.matchScore / 9) * 100)}% Match
                </Text>
              </View>
            )}
            
            {/* Info overlay */}
            <View style={styles.overlayContent}>
              <View style={styles.tagRow}>
                <View style={[styles.styleTag, { backgroundColor: theme.tint }]}>
                  <Text style={styles.tagText}>{currentOutfit.style}</Text>
                </View>
                {currentOutfit.occasions.slice(0, 2).map((occ, idx) => (
                  <View key={idx} style={[styles.occTag, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                    <Text style={styles.occText}>{occ}</Text>
                  </View>
                ))}
              </View>
              
              <Text style={styles.cardTitle}>{currentOutfit.title}</Text>
              
              {/* Extra details row */}
              <View style={styles.detailsRow}>
                <Text style={styles.detailsText}>
                  {currentOutfit.formality} • {currentOutfit.coverage} • {currentOutfit.season}
                </Text>
                <Text style={styles.paletteText}>
                  Palette: {currentOutfit.colorPalette.join(', ')}
                </Text>
              </View>

              {currentOutfit.description && (
                <Text style={styles.descriptionText}>
                  {currentOutfit.description}
                </Text>
              )}

              {currentOutfit.explanation && (
                <View style={styles.explanationBox}>
                  <Sparkles size={16} color={theme.accent} style={{ marginRight: 6, marginTop: 2 }} />
                  <Text style={styles.explanationText} numberOfLines={3}>
                    {currentOutfit.explanation}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Sparkles size={48} color={theme.tint} style={{ marginBottom: 16 }} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>All Caught Up!</Text>
            <Text style={[styles.emptySubtitle, { color: theme.tabIconDefault }]}>
              We've refined your style taste. Come back later for new curated collections.
            </Text>
            
            <TouchableOpacity 
              onPress={handleReset}
              style={[styles.resetButton, { backgroundColor: theme.tint }]}
            >
              <RefreshCw size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.resetText}>Swipe Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      {hasCards && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            onPress={() => handleAction('dislike')}
            style={[styles.actionBtn, styles.dislikeBtn, { borderColor: theme.border, backgroundColor: theme.card }]}
            activeOpacity={0.8}
          >
            <X size={28} color="#EF4444" strokeWidth={2.5} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, styles.infoBtn, { borderColor: theme.border, backgroundColor: theme.card }]}
            activeOpacity={0.8}
          >
            <Info size={22} color={theme.tabIconDefault} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => handleAction('like')}
            style={[styles.actionBtn, styles.likeBtn, { borderColor: theme.border, backgroundColor: theme.card }]}
            activeOpacity={0.8}
          >
            <Heart size={28} color="#10B981" strokeWidth={2.5} fill="#10B981" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  countsContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
  },
  overlayContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.75)', // Slightly higher opacity for extra readability of multi-line texts
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  styleTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  occTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  occText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  detailsText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  paletteText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  explanationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    padding: 10,
    marginTop: 4,
  },
  explanationText: {
    flex: 1,
    fontSize: 12,
    color: '#F1F5F9',
    lineHeight: 16,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#E2E8F0',
    marginBottom: 6,
  },
  emptyCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    borderWidth: 1,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  resetText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginVertical: 24,
    backgroundColor: 'transparent',
  },
  actionBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  dislikeBtn: {
    transform: [{ scale: 1.0 }],
  },
  likeBtn: {
    transform: [{ scale: 1.0 }],
  },
  infoBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  occasionsWrapper: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  occasionsContainer: {
    maxHeight: 44,
    backgroundColor: 'transparent',
  },
  occasionsContent: {
    paddingHorizontal: 4,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 13,
  },
  matchBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 10,
  },
  matchBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
