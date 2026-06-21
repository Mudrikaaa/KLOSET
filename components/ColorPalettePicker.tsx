import React, { useState, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, Pressable, View as RNView } from 'react-native';
import { View, Text, useThemeColor } from './Themed';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from './useColorScheme';
import Colors from '@/constants/Colors';
import { COLOR_PALETTE, ColorSwatch } from '@/constants/ColorPalette';

interface ColorPalettePickerProps {
  visible: boolean;
  selectedColors: string[];
  onChange: (colors: string[]) => void;
  onClose: () => void;
}

export default function ColorPalettePicker({
  visible,
  selectedColors,
  onChange,
  onClose,
}: ColorPalettePickerProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];
  
  const [searchQuery, setSearchQuery] = useState('');

  // Filter swatches by search
  const filteredSwatches = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return COLOR_PALETTE;
    return COLOR_PALETTE.filter(
      (swatch) =>
        swatch.name.toLowerCase().includes(query) ||
        swatch.family.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Group swatches by family
  const groupedSwatches = useMemo(() => {
    const groups: Record<string, ColorSwatch[]> = {};
    filteredSwatches.forEach((swatch) => {
      if (!groups[swatch.family]) {
        groups[swatch.family] = [];
      }
      groups[swatch.family].push(swatch);
    });
    return groups;
  }, [filteredSwatches]);

  const handleSelectSwatch = (swatchName: string) => {
    if (selectedColors.includes(swatchName)) {
      // Remove
      onChange(selectedColors.filter((name) => name !== swatchName));
    } else {
      // Add if under max 3 limit
      if (selectedColors.length < 3) {
        onChange([...selectedColors, swatchName]);
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable 
          style={[
            styles.modalContent,
            { backgroundColor: themeColors.background, borderTopColor: themeColors.border }
          ]}
        >
          <View style={styles.header}>
            <RNView>
              <Text style={styles.headerTitle}>Select Colors</Text>
              <Text style={styles.headerSubtitle}>Up to 3 colors, primary first</Text>
            </RNView>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={26} color={themeColors.text} />
            </TouchableOpacity>
          </View>

          {/* Selected Swatches Preview */}
          {selectedColors.length > 0 && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>Selected ({selectedColors.length}/3):</Text>
              <RNView style={styles.previewRow}>
                {selectedColors.map((name, index) => {
                  const swatch = COLOR_PALETTE.find((s) => s.name === name);
                  const isRainbow = swatch?.hex === '#RAINBOW';
                  return (
                    <RNView 
                      key={name} 
                      style={[
                        styles.previewChip,
                        { borderColor: themeColors.border, backgroundColor: themeColors.card }
                      ]}
                    >
                      {isRainbow ? (
                        <RNView style={[styles.rainbowCircle, styles.previewColorCircle]} />
                      ) : (
                        <RNView 
                          style={[
                            styles.previewColorCircle, 
                            { backgroundColor: swatch?.hex || '#ccc' }
                          ]} 
                        />
                      )}
                      <Text style={styles.previewChipText}>
                        {index === 0 ? `${name} (1st)` : name}
                      </Text>
                      <TouchableOpacity 
                        style={styles.previewChipRemove} 
                        onPress={() => handleSelectSwatch(name)}
                      >
                        <Ionicons name="close-circle" size={16} color={themeColors.accent} />
                      </TouchableOpacity>
                    </RNView>
                  );
                })}
              </RNView>
            </View>
          )}

          {/* Search bar */}
          <View style={styles.searchContainer}>
            <RNView style={[styles.searchBox, { borderColor: themeColors.border, backgroundColor: themeColors.card }]}>
              <Ionicons name="search" size={18} color={themeColors.tabIconDefault} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.searchInput, { color: themeColors.text }]}
                placeholder="Search colors..."
                placeholderTextColor={themeColors.tabIconDefault}
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
              />
            </RNView>
          </View>

          {/* Scrollable grid */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {Object.keys(groupedSwatches).length === 0 ? (
              <RNView style={styles.emptyContainer}>
                <Text style={{ color: themeColors.tabIconDefault }}>No matching colors found.</Text>
              </RNView>
            ) : (
              Object.entries(groupedSwatches).map(([family, swatches]) => (
                <RNView key={family} style={styles.familySection}>
                  <Text style={[styles.familyTitle, { color: themeColors.tabIconDefault }]}>
                    {family}
                  </Text>
                  <RNView style={styles.swatchGrid}>
                    {swatches.map((swatch) => {
                      const isSelected = selectedColors.includes(swatch.name);
                      const selectIndex = selectedColors.indexOf(swatch.name);
                      const isRainbow = swatch.hex === '#RAINBOW';

                      return (
                        <TouchableOpacity
                          key={swatch.name}
                          style={[
                            styles.swatchCard,
                            isSelected && { borderColor: themeColors.tint }
                          ]}
                          onPress={() => handleSelectSwatch(swatch.name)}
                          activeOpacity={0.7}
                        >
                          <RNView style={styles.swatchCircleContainer}>
                            {isRainbow ? (
                              <RNView style={[styles.rainbowCircle, styles.swatchCircle]} />
                            ) : (
                              <RNView 
                                style={[
                                  styles.swatchCircle, 
                                  { backgroundColor: swatch.hex },
                                  swatch.name === 'White' && { borderWidth: 1, borderColor: '#ddd' }
                                ]} 
                              />
                            )}
                            {isSelected && (
                              <RNView style={[styles.checkmarkOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
                                <Ionicons name="checkmark" size={20} color="#FFF" />
                                {selectIndex === 0 && (
                                  <RNView style={[styles.orderIndicator, { backgroundColor: themeColors.tint }]}>
                                    <Text style={styles.orderText}>1</Text>
                                  </RNView>
                                )}
                              </RNView>
                            )}
                          </RNView>
                          <Text 
                            style={[
                              styles.swatchName, 
                              { color: themeColors.text },
                              isSelected && { fontWeight: '700', color: themeColors.tint }
                            ]}
                            numberOfLines={1}
                          >
                            {swatch.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </RNView>
                </RNView>
              ))
            )}
          </ScrollView>

          {/* Confirm Button */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.confirmBtn, { backgroundColor: themeColors.tint }]} 
              onPress={onClose}
            >
              <Text style={styles.confirmBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    height: '80%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 12,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 2,
  },
  previewContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  previewLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.7,
  },
  previewRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  previewChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  previewColorCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 6,
  },
  previewChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  previewChipRemove: {
    marginLeft: 6,
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  familySection: {
    marginVertical: 12,
  },
  familyTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  swatchCard: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 8,
  },
  swatchCircleContainer: {
    position: 'relative',
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  swatchCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  rainbowCircle: {
    // A nice gradient background for multi-color
    backgroundColor: 'red',
    // Fallback if no real gradient is available
  },
  checkmarkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  swatchName: {
    fontSize: 11,
    textAlign: 'center',
    width: '100%',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: 'transparent',
  },
  confirmBtn: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
