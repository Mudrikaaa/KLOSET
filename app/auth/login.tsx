import React, { useState } from 'react';
import {
  StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView,
  Platform, View, Text, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';
import { Crimson, Fonts } from '@/constants/Colors';
import { useAppStore } from '@/store';

// Sign in — Crimson redesign (Phone G): crimson-to-onyx gradient, blush logo
// tile with the heel mark, dark glass card, white CTA.
export default function LoginScreen() {
  const router = useRouter();
  const login = useAppStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[...Crimson.signInBg]}
        locations={[0, 0.38, 0.85]}
        start={{ x: 0.2, y: 0 }} end={{ x: 0.75, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* brand */}
          <View style={styles.brand}>
            <View style={styles.logoTile}>
              <Image source={require('../../assets/images/kloset-heel-red.png')} style={styles.logoImg} />
            </View>
            <Text style={styles.brandName}>KLOSET</Text>
            <Text style={styles.tagline}>Your AI Personal Stylist</Text>
          </View>

          {/* glass card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSub}>Sign in to your virtual wardrobe</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.inputWrap}>
              <View style={styles.iconBox}>
                <Mail size={17} color="rgba(255,255,255,0.7)" />
              </View>
              <TextInput
                placeholder="Email Address"
                placeholderTextColor="rgba(255,255,255,0.55)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
                style={styles.input}
              />
            </View>

            <View style={styles.inputWrap}>
              <View style={styles.iconBox}>
                <Lock size={17} color="rgba(255,255,255,0.7)" />
              </View>
              <TextInput
                placeholder="Password"
                placeholderTextColor="rgba(255,255,255,0.55)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!loading}
                style={styles.input}
              />
            </View>

            <TouchableOpacity style={styles.forgotBtn} disabled={loading}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.9} style={styles.signInBtn}>
              <Text style={styles.signInText}>{loading ? 'Signing In…' : 'Sign In'}</Text>
              {!loading && <ArrowRight size={17} color={Crimson.crimsonDeep} strokeWidth={2.4} />}
            </TouchableOpacity>

            <View style={styles.signupRow}>
              <Text style={styles.signupPrompt}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/signup')} disabled={loading}>
                <Text style={styles.signupAction}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#8c0a20' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingTop: 60 },
  brand: { alignItems: 'center', marginBottom: 30 },
  logoTile: {
    width: 76, height: 76, borderRadius: 24, backgroundColor: '#f3ece7',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
    shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 8,
  },
  logoImg: { width: 48, height: 34, resizeMode: 'contain' },
  brandName: { color: '#fff', fontFamily: Fonts.display, fontSize: 30, letterSpacing: 4 },
  tagline: { color: 'rgba(255,255,255,0.8)', fontFamily: Fonts.bodyMed, fontSize: 12.5, marginTop: 5 },

  card: {
    backgroundColor: 'rgba(20,8,10,0.36)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 24, padding: 22, paddingHorizontal: 20,
  },
  cardTitle: { color: '#fff', fontFamily: Fonts.display, fontSize: 21 },
  cardSub: { color: 'rgba(255,255,255,0.68)', fontFamily: Fonts.bodyMed, fontSize: 12, marginTop: 4, marginBottom: 18 },
  errorText: { color: Crimson.roseLink, fontFamily: Fonts.body, fontSize: 12.5, marginBottom: 12 },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 13, overflow: 'hidden', marginBottom: 12, height: 50,
  },
  iconBox: {
    width: 46, height: '100%', alignItems: 'center', justifyContent: 'center',
    borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.16)',
  },
  input: { flex: 1, paddingHorizontal: 12, color: '#fff', fontFamily: Fonts.bodyMed, fontSize: 13, height: '100%' },

  forgotBtn: { alignSelf: 'flex-end', marginBottom: 18 },
  forgotText: { color: Crimson.roseLink, fontFamily: Fonts.body, fontSize: 12 },

  signInBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#fff', borderRadius: 13, paddingVertical: 15,
    shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 13, shadowOffset: { width: 0, height: 10 }, elevation: 8,
  },
  signInText: { color: Crimson.crimsonDeep, fontFamily: Fonts.bodyBold, fontSize: 14 },

  signupRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  signupPrompt: { color: 'rgba(255,255,255,0.7)', fontFamily: Fonts.bodyMed, fontSize: 12 },
  signupAction: { color: '#fff', fontFamily: Fonts.bodyBold, fontSize: 12 },
});
