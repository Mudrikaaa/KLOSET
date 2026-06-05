import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { User, Shield, Info, LogOut, Check } from 'lucide-react-native';
import { useAppStore } from '../../store';
import { BodyType, SkinTone, StylePreference } from '../../types';

const BODY_TYPES: BodyType[] = ['Petite', 'Athletic', 'Curvy', 'Plus', 'Tall'];
const SKIN_TONES: SkinTone[] = ['Fair', 'Wheatish', 'Dusky', 'Deep'];
const STYLES: StylePreference[] = ['Minimal', 'Ethnic', 'Western', 'Fusion', 'Streetwear'];

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];

  // Retrieve state and handlers from Zustand store
  const profile = useAppStore((state) => state.profile);
  const saveProfile = useAppStore((state) => state.saveProfile);
  const signOut = useAppStore((state) => state.signOut);

  const name = profile?.name || 'Priya Sharma';
  const email = profile?.email || 'priya.sharma@example.com';
  const bodyType = profile?.bodyType || 'Curvy';
  const skinTone = profile?.skinTone || 'Wheatish';
  const stylePref = profile?.stylePreference || 'Fusion';

  const handleUpdateProfile = (key: 'bodyType' | 'skinTone' | 'stylePref', value: any) => {
    saveProfile({
      bodyType: key === 'bodyType' ? value : bodyType,
      skinTone: key === 'skinTone' ? value : skinTone,
      stylePreference: key === 'stylePref' ? value : stylePref,
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      {/* Profile Header Card */}
      <View style={[styles.headerCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={[styles.avatarCircle, { backgroundColor: `${theme.tint}20` }]}>
          <User size={36} color={theme.tint} />
        </View>
        <Text style={[styles.nameText, { color: theme.text }]}>{name}</Text>
        <Text style={[styles.emailText, { color: theme.tabIconDefault }]}>{email}</Text>
      </View>


      {/* Style Profile Settings */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Style Personalization</Text>
      
      {/* Body Type Selection */}
      <View style={[styles.profileSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.settingLabel, { color: theme.text }]}>Body Type</Text>
        <RNView style={styles.chipRow}>
          {BODY_TYPES.map((type) => {
            const isSelected = bodyType === type;
            return (
              <TouchableOpacity
                key={type}
                onPress={() => handleUpdateProfile('bodyType', type)}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: isSelected ? theme.tint : 'transparent',
                    borderColor: isSelected ? theme.tint : theme.border,
                  }
                ]}
              >
                {isSelected && <Check size={12} color="#FFFFFF" style={{ marginRight: 4 }} />}
                <Text style={[styles.optionText, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </RNView>
      </View>

      {/* Skin Tone Selection */}
      <View style={[styles.profileSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.settingLabel, { color: theme.text }]}>Skin Tone</Text>
        <RNView style={styles.chipRow}>
          {SKIN_TONES.map((tone) => {
            const isSelected = skinTone === tone;
            return (
              <TouchableOpacity
                key={tone}
                onPress={() => handleUpdateProfile('skinTone', tone)}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: isSelected ? theme.tint : 'transparent',
                    borderColor: isSelected ? theme.tint : theme.border,
                  }
                ]}
              >
                {isSelected && <Check size={12} color="#FFFFFF" style={{ marginRight: 4 }} />}
                <Text style={[styles.optionText, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                  {tone}
                </Text>
              </TouchableOpacity>
            );
          })}
        </RNView>
      </View>

      {/* Style Preference Selection */}
      <View style={[styles.profileSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.settingLabel, { color: theme.text }]}>Primary Style</Text>
        <RNView style={styles.chipRow}>
          {STYLES.map((style) => {
            const isSelected = stylePref === style;
            return (
              <TouchableOpacity
                key={style}
                onPress={() => handleUpdateProfile('stylePref', style)}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: isSelected ? theme.tint : 'transparent',
                    borderColor: isSelected ? theme.tint : theme.border,
                  }
                ]}
              >
                {isSelected && <Check size={12} color="#FFFFFF" style={{ marginRight: 4 }} />}
                <Text style={[styles.optionText, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                  {style}
                </Text>
              </TouchableOpacity>
            );
          })}
        </RNView>
      </View>

      {/* General Settings List */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Account</Text>
      <View style={[styles.profileSection, { backgroundColor: theme.card, borderColor: theme.border, padding: 0 }]}>
        <TouchableOpacity style={[styles.listItem, { borderBottomColor: theme.border }]}>
          <Shield size={18} color={theme.tabIconDefault} style={{ marginRight: 12 }} />
          <Text style={[styles.listItemText, { color: theme.text }]}>Security & Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.listItem, { borderBottomColor: theme.border }]}>
          <Info size={18} color={theme.tabIconDefault} style={{ marginRight: 12 }} />
          <Text style={[styles.listItemText, { color: theme.text }]}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={signOut} style={styles.listItem}>
          <LogOut size={18} color="#EF4444" style={{ marginRight: 12 }} />
          <Text style={[styles.listItemText, { color: '#EF4444' }]}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <RNView style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerCard: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 24,
    marginVertical: 16,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileSection: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  listItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
