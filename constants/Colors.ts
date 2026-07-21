// ============================================================================
// KLOSET Crimson Redesign — design tokens.
// Source of truth: "KLOSET Crimson Redesign.dc.html" (claude.ai/design).
// Crimson-to-onyx gradients, frosted glass, blush light surfaces.
// ============================================================================

// The crimson family
const crimson = '#e8163b';        // primary crimson (headers, chips, rings)
const crimsonDeep = '#c00e2c';    // deep crimson (CTA gradient end, light-bg accents)
const crimsonBright = '#f4234a';  // CTA gradient start
const tabActive = '#f9314f';      // active tab / dark-bg tint

export const Crimson = {
  // core
  crimson,
  crimsonDeep,
  crimsonBright,
  tabActive,
  ink: '#140a0c',                 // near-black ink on light surfaces
  // dark screens (Wardrobe, Discover)
  darkBg: '#0e0507',
  glow: ['#0e0507', '#4a0715', '#8c0a20'] as const,        // bottom glow gradient
  // crimson screens (Occasions, Sign in)
  occasionBg: ['#e8163b', '#b00c28', '#3c0510'] as const,  // 160deg
  signInBg: ['#e8163b', '#8c0a20', '#2a0510'] as const,    // 165deg
  headerBand: ['#e8163b', '#8c0a20'] as const,             // Add Garment top band
  profileBand: ['#e8163b', '#b00c28', '#4a0714'] as const, // Profile header
  cta: ['#f4234a', '#c00e2c'] as const,                    // gradient CTA
  // light (blush) screens (Add Garment, Profile)
  blushBg: '#fbe7ea',
  blushChipBg: '#fbe7ea',
  blushChipText: '#8a2a38',
  blushBorder: '#f0d3d8',
  chipBorder: '#f0c9cf',
  mutedOnLight: '#9b6c74',
  // glass on dark/crimson
  glassBg: 'rgba(255,255,255,0.14)',
  glassBgStrong: 'rgba(255,255,255,0.22)',
  glassBorder: 'rgba(255,255,255,0.22)',
  glassCard: 'rgba(255,255,255,0.08)',
  navBg: 'rgba(14,5,7,0.94)',
  // text on dark
  white: '#ffffff',
  white80: 'rgba(255,255,255,0.8)',
  white70: 'rgba(255,255,255,0.7)',
  white55: 'rgba(255,255,255,0.55)',
  white45: 'rgba(255,255,255,0.45)',
  white35: 'rgba(255,255,255,0.35)',
  rose: '#f79fae',                // soft rose accent (sparkles, links on dark)
  roseLink: '#f9b4bf',
};

// Typography — Sora for display, Manrope for body (loaded in app/_layout.tsx)
export const Fonts = {
  display: 'Sora_800ExtraBold',
  displaySemi: 'Sora_700Bold',
  bodyBold: 'Manrope_800ExtraBold',
  body: 'Manrope_700Bold',
  bodyMed: 'Manrope_600SemiBold',
  bodyReg: 'Manrope_500Medium',
};

// Legacy theme shape kept so non-redesigned screens (onboarding, signup,
// pickers) inherit the crimson family without individual rewrites.
export default {
  light: {
    text: Crimson.ink,
    background: Crimson.blushBg,
    card: '#FFFFFF',
    border: Crimson.blushBorder,
    tint: crimsonDeep,
    tabIconDefault: Crimson.mutedOnLight,
    tabIconSelected: crimsonDeep,
    accent: crimson,
  },
  dark: {
    text: '#FFFFFF',
    background: Crimson.darkBg,
    // why soft maroon-dark + translucent border: the design uses frosted
    // cards, never hard black boxes or heavy solid borders
    card: '#241014',
    border: 'rgba(255,255,255,0.14)',
    tint: tabActive,
    tabIconDefault: 'rgba(255,255,255,0.5)',
    tabIconSelected: tabActive,
    accent: Crimson.rose,
  },
};
