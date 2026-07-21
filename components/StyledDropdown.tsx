import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Modal, FlatList, Pressable } from 'react-native';
import { View, Text, useThemeColor } from './Themed';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from './useColorScheme';
import Colors from '@/constants/Colors';

interface StyledDropdownProps {
  label: string;
  value?: string;
  options: string[] | { label: string; value: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  // why: the app is pinned to the dark scheme globally, but Add Garment is
  // the design's one blush room — `light` opts a dropdown into light tokens.
  light?: boolean;
}

export default function StyledDropdown({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  light = false,
}: StyledDropdownProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const themeColors = Colors[light ? 'light' : colorScheme];

  // Map options to consistent { label, value } array
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string') {
      return { label: opt, value: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (val: string) => {
    onChange(val);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* explicit colors everywhere: Themed defaults follow the (dark) global
          scheme, which would render white-on-white in light mode */}
      <Text style={[styles.label, { color: themeColors.text }]}>{label}</Text>
      
      <TouchableOpacity
        style={[
          styles.dropdownButton,
          {
            borderColor: themeColors.border,
            backgroundColor: themeColors.card,
          },
          disabled && styles.disabledButton,
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.dropdownValue,
          { color: themeColors.text },
          !value && { color: themeColors.tabIconDefault }
        ]}>
          {displayLabel}
        </Text>
        <Ionicons name="chevron-down" size={20} color={themeColors.tabIconDefault} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setModalVisible(false)}
        >
          <View 
            style={[
              styles.modalContent,
              { backgroundColor: themeColors.background, borderTopColor: themeColors.border }
            ]}
          >
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: themeColors.text }]}>{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={themeColors.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={normalizedOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      { borderBottomColor: themeColors.border, backgroundColor: 'transparent' },
                      isSelected && { backgroundColor: themeColors.card }
                    ]}
                    onPress={() => handleSelect(item.value)}
                  >
                    <Text style={[
                      styles.optionText,
                      { color: themeColors.text },
                      isSelected && { color: themeColors.tint, fontWeight: 'bold' }
                    ]}>
                      {item.label}
                    </Text>
                    {isSelected ? (
                      <Ionicons name="checkmark-circle" size={22} color={themeColors.tint} />
                    ) : (
                      <Ionicons name="ellipse-outline" size={22} color={themeColors.tabIconDefault} />
                    )}
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={styles.listContainer}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
  },
  dropdownButton: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownValue: {
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    maxHeight: '60%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 12,
  },
  optionItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionText: {
    fontSize: 16,
  },
});
