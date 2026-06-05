import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store';
import { Sparkles, Mail, Lock, User, ArrowRight } from 'lucide-react-native';

export default function SignupScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const router = useRouter();
  const signup = useAppStore((state) => state.signup);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    // Save credentials in our Zustand state store
    signup(email, name);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={[styles.scrollContainer, { backgroundColor: theme.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header brand details */}
        <View style={styles.logoSection}>
          <View style={[styles.logoCircle, { backgroundColor: `${theme.tint}15` }]}>
            <Sparkles size={40} color={theme.tint} />
          </View>
          <Text style={[styles.brandName, { color: theme.text }]}>KLOSET</Text>
          <Text style={[styles.tagline, { color: theme.tabIconDefault }]}>Create your style account</Text>
        </View>

        {/* Form Details Card */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Join Kloset</Text>
          <Text style={[styles.cardSubtitle, { color: theme.tabIconDefault }]}>Get suggested outfits for any event</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Name Input */}
          <RNView style={styles.inputWrapper}>
            <RNView style={[styles.iconBox, { borderRightColor: theme.border }]}>
              <User size={18} color={theme.tabIconDefault} />
            </RNView>
            <TextInput
              placeholder="Full Name"
              placeholderTextColor={theme.tabIconDefault}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              style={[styles.input, { color: theme.text }]}
            />
          </RNView>

          {/* Email Input */}
          <RNView style={styles.inputWrapper}>
            <RNView style={[styles.iconBox, { borderRightColor: theme.border }]}>
              <Mail size={18} color={theme.tabIconDefault} />
            </RNView>
            <TextInput
              placeholder="Email Address"
              placeholderTextColor={theme.tabIconDefault}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, { color: theme.text }]}
            />
          </RNView>

          {/* Password Input */}
          <RNView style={styles.inputWrapper}>
            <RNView style={[styles.iconBox, { borderRightColor: theme.border }]}>
              <Lock size={18} color={theme.tabIconDefault} />
            </RNView>
            <TextInput
              placeholder="Password (min 6 chars)"
              placeholderTextColor={theme.tabIconDefault}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              style={[styles.input, { color: theme.text }]}
            />
          </RNView>

          {/* Signup Button */}
          <TouchableOpacity 
            onPress={handleSignup}
            style={[styles.loginBtn, { backgroundColor: theme.tint }]}
            activeOpacity={0.8}
          >
            <Text style={styles.loginBtnText}>Register Account</Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Redirect to Login */}
          <RNView style={styles.signupPrompt}>
            <Text style={[styles.promptText, { color: theme.tabIconDefault }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/auth/login')}>
              <Text style={[styles.promptAction, { color: theme.tint }]}>Sign In</Text>
            </TouchableOpacity>
          </RNView>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: 'transparent',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginBottom: 14,
    height: 52,
    overflow: 'hidden',
  },
  iconBox: {
    width: 46,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  loginBtn: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  signupPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: 'transparent',
  },
  promptText: {
    fontSize: 13,
    fontWeight: '500',
  },
  promptAction: {
    fontSize: 13,
    fontWeight: '700',
  },
});
