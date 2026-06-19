import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Sparkles, Stars, Briefcase, GraduationCap, Heart, Gift, Check } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const OCCASIONS = [
  { id: 'Diwali Party (Family)', name: 'Diwali (Family)', category: 'Festive & Family', icon: Sparkles, color: '#F59E0B' },
  { id: 'Diwali Party (Friends)', name: 'Diwali (Friends)', category: 'Festive & Family', icon: Sparkles, color: '#F59E0B' },
  { id: 'Holi', name: 'Holi', category: 'Festive & Family', icon: Sparkles, color: '#F59E0B' },
  { id: 'Navratri / Garba', name: 'Navratri / Garba', category: 'Festive & Family', icon: Sparkles, color: '#F59E0B' },
  { id: 'Eid', name: 'Eid', category: 'Festive & Family', icon: Sparkles, color: '#F59E0B' },
  { id: 'Regional Festival', name: 'Regional Fest', category: 'Festive & Family', icon: Sparkles, color: '#F59E0B' },

  { id: 'Mehendi Function', name: 'Mehendi', category: 'Weddings & Functions', icon: Stars, color: '#EC4899' },
  { id: 'Sangeet Night', name: 'Sangeet Night', category: 'Weddings & Functions', icon: Stars, color: '#EC4899' },
  { id: 'Wedding (Close Family)', name: 'Wedding (Family)', category: 'Weddings & Functions', icon: Stars, color: '#EC4899' },
  { id: 'Wedding (Guest)', name: 'Wedding (Guest)', category: 'Weddings & Functions', icon: Stars, color: '#EC4899' },
  { id: 'Reception', name: 'Reception', category: 'Weddings & Functions', icon: Stars, color: '#EC4899' },
  { id: 'Cocktail / Pre-wedding', name: 'Cocktail Night', category: 'Weddings & Functions', icon: Stars, color: '#EC4899' },

  { id: 'First Day of College', name: 'First Day College', category: 'College', icon: GraduationCap, color: '#10B981' },
  { id: 'College Farewell', name: 'Farewell', category: 'College', icon: GraduationCap, color: '#10B981' },
  { id: 'College Fest (Day)', name: 'Fest (Day)', category: 'College', icon: GraduationCap, color: '#10B981' },
  { id: 'College Fest (Night)', name: 'Fest (Night)', category: 'College', icon: GraduationCap, color: '#10B981' },
  { id: 'College Trip', name: 'College Trip', category: 'College', icon: GraduationCap, color: '#10B981' },
  { id: 'Internship (Startup)', name: 'Intern (Startup)', category: 'College', icon: GraduationCap, color: '#10B981' },
  { id: 'Internship (Corporate)', name: 'Intern (Corp)', category: 'College', icon: GraduationCap, color: '#10B981' },

  { id: 'Job Interview (Tech)', name: 'Interview (Tech)', category: 'Professional', icon: Briefcase, color: '#6366F1' },
  { id: 'Job Interview (Corporate)', name: 'Interview (Corp)', category: 'Professional', icon: Briefcase, color: '#6366F1' },
  { id: 'Office (Startup)', name: 'Office (Startup)', category: 'Professional', icon: Briefcase, color: '#6366F1' },
  { id: 'Office (Formal)', name: 'Office (Formal)', category: 'Professional', icon: Briefcase, color: '#6366F1' },
  { id: 'Client Meeting', name: 'Client Meeting', category: 'Professional', icon: Briefcase, color: '#6366F1' },

  { id: 'Casual Outing', name: 'Casual Outing', category: 'Social', icon: Heart, color: '#3B82F6' },
  { id: 'Mall / Shopping Day', name: 'Shopping Day', category: 'Social', icon: Heart, color: '#3B82F6' },
  { id: 'Brunch / Cafe', name: 'Brunch / Cafe', category: 'Social', icon: Heart, color: '#3B82F6' },
  { id: 'Dinner Date', name: 'Dinner Date', category: 'Social', icon: Heart, color: '#3B82F6' },
  { id: 'First Date', name: 'First Date', category: 'Social', icon: Heart, color: '#3B82F6' },
  { id: 'Night Out', name: 'Night Out', category: 'Social', icon: Heart, color: '#3B82F6' },

  { id: 'My Birthday', name: 'My Birthday', category: 'Special', icon: Gift, color: '#8B5CF6' },
  { id: "Friend's Birthday", name: "Friend's Bday", category: 'Special', icon: Gift, color: '#8B5CF6' },
  { id: 'Travel Day', name: 'Travel Day', category: 'Special', icon: Gift, color: '#8B5CF6' },
];

const MOCK_MATCHES: Record<string, any[]> = {
  'Diwali Party (Family)': [
    {
      id: 'm4',
      title: 'Classic Festive Kurta Set',
      confidence: '92% Match',
      desc: 'Traditional elements matching standard modern bottom-wear. Ideal for family gatherings.',
      formality: 'Festive',
      coverage: 'Conservative',
      season: 'All-season',
      colorPalette: ['Maroon', 'Beige'],
      heights: ['Average', 'Tall'],
      bodyShapes: ['Hourglass', 'Pear', 'Apple', 'Rectangle'],
      items: [
        { name: 'Royal Kurta', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&auto=format&fit=crop&q=60' },
        { name: 'Beige Chinos', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&auto=format&fit=crop&q=60' }
      ]
    }
  ],
  'Sangeet Night': [
    {
      id: 'm2',
      title: 'Premium Handloom Sherwani Set',
      confidence: '98% Match',
      desc: 'Perfect for wedding ceremonies. Complements wheatish and dusky skin tones beautifully.',
      formality: 'Festive',
      coverage: 'Conservative',
      season: 'Winter',
      colorPalette: ['Ivory', 'Gold'],
      heights: ['Tall', 'Average'],
      bodyShapes: ['Athletic', 'Hourglass', 'Inverted Triangle'],
      items: [
        { name: 'Royal Ivory Kurta', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&auto=format&fit=crop&q=60' }
      ]
    }
  ],
  'Job Interview (Corporate)': [
    {
      id: 'm1',
      title: 'Polished Professional Outfit',
      confidence: '95% Match',
      desc: 'Optimized for formal interviews. Exudes high structure and sharp corporate fit.',
      formality: 'Formal',
      coverage: 'Conservative',
      season: 'All-season',
      colorPalette: ['Navy', 'Beige'],
      heights: ['Petite', 'Average', 'Tall'],
      bodyShapes: ['Rectangle', 'Inverted Triangle', 'Hourglass'],
      items: [
        { name: 'Navy Formal Shirt', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&auto=format&fit=crop&q=60' },
        { name: 'Relaxed Fit Chinos', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&auto=format&fit=crop&q=60' }
      ]
    }
  ],
  'Brunch / Cafe': [
    {
      id: 'm5',
      title: 'Effortless Weekend Vibe',
      confidence: '90% Match',
      desc: 'Minimal and comfortable layers for standard daily wear.',
      formality: 'Casual',
      coverage: 'Moderate',
      season: 'Summer',
      colorPalette: ['White', 'Indigo'],
      heights: ['Petite', 'Average', 'Tall'],
      bodyShapes: ['Hourglass', 'Pear', 'Apple', 'Rectangle', 'Inverted Triangle'],
      items: [
        { name: 'Linen Summer Shirt', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&auto=format&fit=crop&q=60' },
        { name: 'Indigo Jacket', image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&auto=format&fit=crop&q=60' }
      ]
    }
  ],
  'Night Out': [
    {
      id: 'm3',
      title: 'Chic Smart-Casual Look',
      confidence: '88% Match',
      desc: 'Elegant indigo blazer with clean lines. Professional yet relaxed.',
      formality: 'Party',
      coverage: 'Moderate',
      season: 'All-season',
      colorPalette: ['Indigo', 'Emerald'],
      heights: ['Average', 'Tall'],
      bodyShapes: ['Hourglass', 'Athletic', 'Rectangle'],
      items: [
        { name: 'Indigo Denim Jacket', image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&auto=format&fit=crop&q=60' },
        { name: 'Emerald Dress', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&auto=format&fit=crop&q=60' }
      ]
    }
  ]
};

export default function OutfitsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const [selectedOccasion, setSelectedOccasion] = useState('Diwali Party (Family)');

  const matches = MOCK_MATCHES[selectedOccasion] || [];

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
        
        {matches.length > 0 ? (
          matches.map((match: any) => (
            <View key={match.id} style={[styles.matchCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {/* Top header of match card */}
              <View style={styles.matchHeader}>
                <Text style={[styles.matchTitle, { color: theme.text }]}>{match.title}</Text>
                <View style={[styles.matchBadge, { backgroundColor: `${theme.accent}15` }]}>
                  <Text style={[styles.matchBadgeText, { color: theme.accent }]}>{match.confidence}</Text>
                </View>
              </View>

              {/* Description */}
              <Text style={[styles.matchDesc, { color: theme.tabIconDefault }]}>{match.desc}</Text>

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

              {/* Wardrobe Items involved */}
              <View style={styles.itemsPreviewRow}>
                {match.items.map((item: any, idx: number) => (
                  <View key={idx} style={[styles.itemPreviewCard, { borderColor: theme.border }]}>
                    <Image source={{ uri: item.image }} style={styles.itemPreviewImg} />
                    <Text style={[styles.itemPreviewName, { color: theme.text }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Action button */}
              <TouchableOpacity style={[styles.wearBtn, { backgroundColor: theme.tint }]}>
                <Text style={styles.wearBtnText}>Plan to Wear</Text>
              </TouchableOpacity>
            </View>
          ))
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
});
