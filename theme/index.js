// Central design tokens. Every screen imports from here so the whole app can be
// re-skinned from one file.

export const colors = {
  bg: '#0e0b14',
  bgDeep: '#08060d',
  surface: '#17121f',
  surfaceAlt: '#1f1829',
  surfaceHigh: '#271f34',
  border: '#332a42',
  borderSoft: '#251e31',

  text: '#f4eefb',
  textDim: '#b6a9c7',
  textMute: '#7d7192',

  gold: '#f2b544',
  xp: '#8f7bf7',
  health: '#e0566b',
  energy: '#4fd1a5',
  accent: '#b48cf7',
  accentSoft: '#6d4fb0',
  danger: '#e0566b',
  success: '#4fd1a5',
  info: '#5aa9f2',
};

export const gradients = {
  hero: ['#2a1b3d', '#120d1a'],
  card: ['#241a33', '#171220'],
  gold: ['#f2b544', '#d98b2b'],
};

export const spacing = (n) => n * 4;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 26,
  pill: 999,
};

export const typography = {
  display: { fontSize: 30, fontWeight: '800', letterSpacing: 0.4 },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: 0.2 },
  subtitle: { fontSize: 16, fontWeight: '700' },
  body: { fontSize: 14, fontWeight: '500' },
  small: { fontSize: 12, fontWeight: '500' },
  tiny: { fontSize: 10, fontWeight: '700', letterSpacing: 1.1 },
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
};
