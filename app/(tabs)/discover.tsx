import React, { useState } from 'react';
import { StyleSheet, Image, TouchableOpacity, Dimensions, Animated, PanResponder } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Heart, X, Sparkles, RefreshCw, Info } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 32;
const CARD_HEIGHT = height * 0.55;

const MOCK_OUTFITS = [
  {
    id: 'o1',
    title: 'Contemporary Indigo fusion',
    style: 'Fusion Wear',
    image: 'https://images.unsplash.com/photo-1595959183075-c1d09e519826?w=600&auto=format&fit=crop&q=80',
    occasion: ['Office Party', 'Casual Outing'],
    explanation: 'A blend of traditional block print kurta paired with classic denim. Perfect for wheatish skin tones.',
  },
  {
    id: 'o2',
    title: 'Sleek Corporate Power Suit',
    style: 'Western Formal',
    image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=600&auto=format&fit=crop&q=80',
    occasion: ['Interview', 'Office'],
    explanation: 'Well-tailored grey blazer matching slate trousers. Exudes confidence and structure.',
  },
  {
    id: 'o3',
    title: 'Royal Ivory Sherwani Set',
    style: 'Indian Traditional',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    occasion: ['Wedding', 'Family Function'],
    explanation: 'Rich silk handloom sherwani with gold accents. Extremely premium look for festive events.',
  },
];

export default function DiscoverScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);

  // Simple state animation triggers for visual swipe effect
  const handleAction = (type: 'like' | 'dislike') => {
    if (currentIndex < MOCK_OUTFITS.length) {
      if (type === 'like') {
        setLikesCount(prev => prev + 1);
      } else {
        setDislikesCount(prev => prev + 1);
      }
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
  };

  const hasCards = currentIndex < MOCK_OUTFITS.length;
  const currentOutfit = hasCards ? MOCK_OUTFITS[currentIndex] : null;

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

      {/* Card area */}
      <View style={styles.cardContainer}>
        {hasCards && currentOutfit ? (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Image source={{ uri: currentOutfit.image }} style={styles.cardImage} />
            
            {/* Info overlay */}
            <View style={styles.overlayContent}>
              <View style={styles.tagRow}>
                <View style={[styles.styleTag, { backgroundColor: theme.tint }]}>
                  <Text style={styles.tagText}>{currentOutfit.style}</Text>
                </View>
                {currentOutfit.occasion.map((occ, idx) => (
                  <View key={idx} style={[styles.occTag, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                    <Text style={styles.occText}>{occ}</Text>
                  </View>
                ))}
              </View>
              
              <Text style={styles.cardTitle}>{currentOutfit.title}</Text>
              
              <View style={styles.explanationBox}>
                <Sparkles size={16} color={theme.accent} style={{ marginRight: 6 }} />
                <Text style={styles.explanationText} numberOfLines={2}>
                  {currentOutfit.explanation}
                </Text>
              </View>
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)', // Sleek backdrop for readability
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
    marginBottom: 8,
  },
  explanationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    padding: 8,
    marginTop: 4,
  },
  explanationText: {
    flex: 1,
    fontSize: 12,
    color: '#F1F5F9',
    lineHeight: 16,
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
});
