import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Briefcase, HeartHandshake, Sparkles, MapPin, Coffee, Stars } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const OCCASIONS = [
  { id: 'interview', name: 'Interview', icon: Briefcase, color: '#6366F1' },
  { id: 'wedding', name: 'Wedding', icon: Stars, color: '#F59E0B' },
  { id: 'office_party', name: 'Office Party', icon: Sparkles, color: '#EC4899' },
  { id: 'family_fn', name: 'Family Function', icon: HeartHandshake, color: '#10B981' },
  { id: 'casual', name: 'Casual', icon: Coffee, color: '#3B82F6' },
];

const MOCK_MATCHES = {
  interview: [
    {
      id: 'm1',
      title: 'Polished Professional Outfit',
      confidence: '95% Match',
      desc: 'Optimized for formal interviews. Exudes high structure and sharp corporate fit.',
      items: [
        { name: 'Navy Formal Shirt', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&auto=format&fit=crop&q=60' },
        { name: 'Relaxed Fit Chinos', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&auto=format&fit=crop&q=60' }
      ]
    }
  ],
  wedding: [
    {
      id: 'm2',
      title: 'Premium Handloom Sherwani Set',
      confidence: '98% Match',
      desc: 'Perfect for wedding ceremonies. Complements wheatish and dusky skin tones beautifully.',
      items: [
        { name: 'Royal Ivory Kurta', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&auto=format&fit=crop&q=60' }
      ]
    }
  ],
  office_party: [
    {
      id: 'm3',
      title: 'Chic Smart-Casual Look',
      confidence: '88% Match',
      desc: 'Elegant indigo blazer with clean lines. Professional yet relaxed.',
      items: [
        { name: 'Indigo Denim Jacket', image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&auto=format&fit=crop&q=60' },
        { name: 'Linen Summer Shirt', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&auto=format&fit=crop&q=60' }
      ]
    }
  ],
  family_fn: [
    {
      id: 'm4',
      title: 'Classic Ethnic Fusion',
      confidence: '92% Match',
      desc: 'Traditional elements matching standard modern bottom-wear. Ideal for family gatherings.',
      items: [
        { name: 'Ethnic Cotton Kurta', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&auto=format&fit=crop&q=60' },
        { name: 'Relaxed Fit Chinos', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&auto=format&fit=crop&q=60' }
      ]
    }
  ],
  casual: [
    {
      id: 'm5',
      title: 'Effortless Weekend Vibe',
      confidence: '90% Match',
      desc: 'Minimal and comfortable layers for standard daily wear.',
      items: [
        { name: 'Linen Summer Shirt', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&auto=format&fit=crop&q=60' },
        { name: 'Vintage Sneakers', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&auto=format&fit=crop&q=60' }
      ]
    }
  ],
};

export default function OutfitsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const [selectedOccasion, setSelectedOccasion] = useState('interview');

  // @ts-ignore
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
                <Text style={[styles.occasionName, { color: isSelected ? '#FFFFFF' : theme.text }]}>
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
        
        {matches.map((match: any) => (
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
        ))}
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
    width: 96,
    height: 84,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
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
    fontSize: 12,
    fontWeight: '600',
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
    marginBottom: 16,
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
});
