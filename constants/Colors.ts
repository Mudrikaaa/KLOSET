const tintColorLight = '#6366F1'; // Indigo
const tintColorDark = '#818CF8';  // Pastel Indigo

export default {
  light: {
    text: '#0F172A',         // Slate 900
    background: '#F8FAFC',   // Slate 50
    card: '#FFFFFF',
    border: '#E2E8F0',       // Slate 200
    tint: tintColorLight,
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorLight,
    accent: '#EC4899',       // Pink
  },
  dark: {
    text: '#F8FAFC',         // Slate 50
    background: '#0F172A',   // Slate 900
    card: '#1E293B',         // Slate 800
    border: '#334155',       // Slate 700
    tint: tintColorDark,
    tabIconDefault: '#64748B',
    tabIconSelected: tintColorDark,
    accent: '#F472B6',       // Pastel Pink
  },
};

