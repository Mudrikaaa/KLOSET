import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store';
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react-native';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const router = useRouter();
  const login = useAppStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    // For MVP & demonstration, let's login directly
    login(email, 'Fashionista');
  };

  const handleGuestLogin = () => {
    login('guest@kloset.com', 'Guest Stylist');
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
        {/* Brand Logo Section */}
        <View style={styles.logoSection}>
          <View style={[styles.logoCircle, { backgroundColor: `${theme.tint}15` }]}>
            <Sparkles size={40} color={theme.tint} />
          </View>
          <Text style={[styles.brandName, { color: theme.text }]}>KLOSET</Text>
          <Text style={[styles.tagline, { color: theme.tabIconDefault }]}>Your AI Personal Stylist</Text>
        </View>

        {/* Card Section */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Welcome Back</Text>
          <Text style={[styles.cardSubtitle, { color: theme.tabIconDefault }]}>Sign in to your virtual wardrobe</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
              placeholder="Password"
              placeholderTextColor={theme.tabIconDefault}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              style={[styles.input, { color: theme.text }]}
            />
          </RNView>

          {/* Forget Password */}
          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={[styles.forgotText, { color: theme.tint }]}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity 
            onPress={handleLogin}
            style={[styles.loginBtn, { backgroundColor: theme.tint }]}
            activeOpacity={0.8}
          >
            <Text style={styles.loginBtnText}>Sign In</Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Sign Up Link */}
          <RNView style={styles.signupPrompt}>
            <Text style={[styles.promptText, { color: theme.tabIconDefault }]}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/signup')}>
              <Text style={[styles.promptAction, { color: theme.tint }]}>Sign Up</Text>
            </TouchableOpacity>
          </RNView>
        </View>

        {/* Divider */}
        <RNView style={styles.dividerRow}>
          <RNView style={[styles.line, { backgroundColor: theme.border }]} />
          <Text style={[styles.orText, { color: theme.tabIconDefault }]}>OR</Text>
          <RNView style={[styles.line, { backgroundColor: theme.border }]} />
        </RNView>

        {/* Guest Access Button */}
        <TouchableOpacity 
          onPress={handleGuestLogin}
          style={[styles.guestBtn, { borderColor: theme.border, backgroundColor: theme.card }]}
          activeOpacity={0.8}
        >
          <Text style={[styles.guestText, { color: theme.text }]}>Explore as Guest</Text>
        </TouchableOpacity>
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
  },
  loginBtn: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    backgroundColor: 'transparent',
  },
  line: {
    flex: 1,
    height: 1,
  },
  orText: {
    paddingHorizontal: 16,
    fontSize: 12,
    fontWeight: '700',
  },
  guestBtn: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
