import React, { useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Plus, Grid, SlidersHorizontal, Shirt } from 'lucide-react-native';
import { useAppStore } from '../../store';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2;

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Dresses', 'Ethnic', 'Outers', 'Shoes'];

export default function WardrobeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const router = useRouter();
  
  // Load dynamic items list from store
  const wardrobeItems = useAppStore((state) => state.wardrobeItems);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredItems = selectedCategory === 'All' 
    ? wardrobeItems 
    : wardrobeItems.filter(item => item.category === selectedCategory);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Wardrobe Header Stats */}
      <View style={[styles.statsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.tint }]}>{wardrobeItems.length}</Text>
          <Text style={[styles.statLabel, { color: theme.tabIconDefault }]}>Total Items</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.tint }]}>6</Text>
          <Text style={[styles.statLabel, { color: theme.tabIconDefault }]}>Categories</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.accent }]}>85%</Text>
          <Text style={[styles.statLabel, { color: theme.tabIconDefault }]}>Wardrobe Fit</Text>
        </View>
      </View>

      {/* Horizontal Categories Scroll */}
      <View style={{ backgroundColor: 'transparent', height: 44, marginBottom: 16 }}>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item)}
                style={[
                  styles.categoryChip,
                  { 
                    backgroundColor: isSelected ? theme.tint : theme.card,
                    borderColor: theme.border
                  }
                ]}
              >
                <Text 
                  style={[
                    styles.categoryText, 
                    { 
                      color: isSelected ? '#FFFFFF' : theme.text,
                      fontWeight: isSelected ? '700' : '500'
                    }
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Grid Header Controls */}
      <View style={styles.controlsRow}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>My Collection</Text>
        <View style={styles.iconButtons}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Grid size={18} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.card, borderColor: theme.border, marginLeft: 8 }]}>
            <SlidersHorizontal size={18} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Items Grid */}
      {filteredItems.length > 0 ? (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContainer}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.itemCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              activeOpacity={0.9}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={[styles.itemTitle, { color: theme.text }]} numberOfLines={1}>
                  {`${item.color} ${item.category}`}
                </Text>
                <View style={styles.tagRow}>
                  <Text style={[styles.itemCategory, { color: theme.tabIconDefault }]}>
                    {item.category}
                  </Text>
                  <View style={[styles.colorDot, { backgroundColor: item.color.toLowerCase() === 'white' || item.color.toLowerCase() === 'cream' ? '#D1D5DB' : item.color.toLowerCase() }]} />
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Shirt size={48} color={theme.tabIconDefault} style={{ opacity: 0.5 }} />
          <Text style={[styles.emptyText, { color: theme.tabIconDefault }]}>No items in this shelf yet</Text>
        </View>
      )}

      {/* Add Floating Action Button */}
      <TouchableOpacity 
        onPress={() => router.push('/upload')}
        style={[styles.fab, { backgroundColor: theme.accent }]}
        activeOpacity={0.8}
      >
        <Plus size={24} color="#FFFFFF" strokeWidth={3} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 16,
    paddingVertical: 16,
    marginVertical: 16,
    borderWidth: 1,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: '60%',
  },
  categoryScroll: {
    paddingRight: 16,
    alignItems: 'center',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  iconButtons: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    paddingBottom: 90,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  itemCard: {
    width: COLUMN_WIDTH,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  itemInfo: {
    padding: 12,
    backgroundColor: 'transparent',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  itemCategory: {
    fontSize: 12,
    fontWeight: '500',
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
    backgroundColor: 'transparent',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
});

