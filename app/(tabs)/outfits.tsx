import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Sparkles, Stars, Briefcase, GraduationCap, Heart, Gift, Check } from 'lucide-react-native';
import { api } from '../../lib';
import { Outfit } from '../../types';

const { width } = Dimensions.get('window');

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

export default function OutfitsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const [selectedOccasion, setSelectedOccasion] = useState('Diwali Party (Family)');
  const [suggestions, setSuggestions] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getSuggestions(selectedOccasion)
      .then((data) => {
        setSuggestions(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('[KLOSET-DEBUG] [OutfitsScreen] Failed to fetch suggestions:', err);
        setError(err.message || 'Failed to fetch suggestions.');
        setLoading(false);
      });
  }, [selectedOccasion]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.heading, { color: theme.text }]}>Occasion Stylist</Text>
      <Text style={[styles.subheading, { color: theme.tabIconDefault }]}>
        Select an event to match items from your wardrobe.
      </Text>

      {/* Occasions Picker horizontal scroll */}
      <View style={{ backgroundColor: 'transparent', height: 100, marginBottom: 20 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.occasionsScroll}
        >
          {OCCASIONS.map((occ) => {
            const isSelected = selectedOccasion === occ.id;
            const Icon = occ.icon;
            return (
              <TouchableOpacity
                key={occ.id}
                onPress={() => setSelectedOccasion(occ.id)}
                style={[
                  styles.occasionCard,
                  {
                    backgroundColor: isSelected ? theme.tint : theme.card,
                    borderColor: isSelected ? theme.tint : theme.border,
                  }
                ]}
              >
                <View style={[styles.iconCircle, { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : `${occ.color}15` }]}>
                  <Icon size={20} color={isSelected ? '#FFFFFF' : occ.color} />
                </View>
                <Text style={[styles.occasionName, { color: isSelected ? '#FFFFFF' : theme.text }]} numberOfLines={1}>
                  {occ.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Matches suggestions section */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.matchesScroll}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>AI Recommendations</Text>
        
        {loading ? (
          <RNView style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.tint} />
            <Text style={[styles.loadingText, { color: theme.tabIconDefault, marginTop: 12 }]}>
              Finding outfits in your closet...
            </Text>
          </RNView>
        ) : error ? (
          <RNView style={styles.centerContainer}>
            <Text style={{ color: '#EF4444', textAlign: 'center', marginBottom: 12 }}>{error}</Text>
            <TouchableOpacity 
              onPress={() => {
                setLoading(true);
                api.getSuggestions(selectedOccasion).then(setSuggestions).catch(err => setError(err.message)).finally(() => setLoading(false));
              }}
              style={[styles.retryBtn, { backgroundColor: theme.tint }]}
            >
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </RNView>
        ) : suggestions.length > 0 ? (
          suggestions.map((match: any) => {
            const confidence = match.matchScore !== undefined 
              ? `${Math.round((match.matchScore / 10) * 100)}% Match` 
              : 'Matched';
            
            return (
              <View key={match.id} style={[styles.matchCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {/* Top header of match card */}
                <View style={styles.matchHeader}>
                  <Text style={[styles.matchTitle, { color: theme.text }]}>{match.title}</Text>
                  <View style={[styles.matchBadge, { backgroundColor: `${theme.accent}15` }]}>
                    <Text style={[styles.matchBadgeText, { color: theme.accent }]}>{confidence}</Text>
                  </View>
                </View>

                {/* Main styled preview image */}
                {match.imageUrl && (
                  <RNView style={[styles.matchImageContainer, { borderColor: theme.border }]}>
                    <Image source={{ uri: match.imageUrl }} style={styles.matchImage} />
                  </RNView>
                )}

                {/* Description */}
                <Text style={[styles.matchDesc, { color: theme.tabIconDefault }]}>{match.description}</Text>

                {/* Metadata row */}
                <View style={styles.metaRow}>
                  <Text style={[styles.metaText, { color: theme.tabIconDefault }]}>
                    Formality: <Text style={{ color: theme.text, fontWeight: '600' }}>{match.formality}</Text>
                  </Text>
                  <Text style={[styles.metaText, { color: theme.tabIconDefault }]}>
                    Coverage: <Text style={{ color: theme.text, fontWeight: '600' }}>{match.coverage}</Text>
                  </Text>
                </View>
                <View style={[styles.metaRow, { marginBottom: 12 }]}>
                  <Text style={[styles.metaText, { color: theme.tabIconDefault }]}>
                    Season: <Text style={{ color: theme.text, fontWeight: '600' }}>{match.season}</Text>
                  </Text>
                  <Text style={[styles.metaText, { color: theme.tabIconDefault }]}>
                    Colors: <Text style={{ color: theme.text, fontWeight: '600' }}>{match.colorPalette.join(', ')}</Text>
                  </Text>
                </View>

                {match.explanation && (
                  <View style={styles.explanationBox}>
                    <Sparkles size={16} color={theme.accent} style={{ marginRight: 8, marginTop: 2 }} />
                    <Text style={styles.explanationText} numberOfLines={4}>
                      {match.explanation}
                    </Text>
                  </View>
                )}

                {/* Action button */}
                <TouchableOpacity style={[styles.wearBtn, { backgroundColor: theme.tint }]}>
                  <Text style={styles.wearBtnText}>Plan to Wear</Text>
                </TouchableOpacity>
              </View>
            );
          })
        ) : (
          <View style={[styles.emptyContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Sparkles size={40} color={theme.tabIconDefault} style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyText, { color: theme.text }]}>No matched outfits yet</Text>
            <Text style={[styles.emptySubtext, { color: theme.tabIconDefault }]}>
              Try uploading more garments or choosing another occasion.
            </Text>
          </View>
        )}
      </ScrollView>
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
  occasionsScroll: {
    gap: 12,
    paddingRight: 16,
    alignItems: 'center',
  },
  occasionCard: {
    width: 110,
    height: 84,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  occasionName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
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
    marginBottom: 6,
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
    gap: 12,
    marginBottom: 16,
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
  emptyContainer: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    textAlign: 'center',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  explanationText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
