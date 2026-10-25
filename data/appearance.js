// Appearance options used by the Character Creation flow and the Avatar renderer.
export const HAIR_STYLES = [
  { id: 'short', name: 'Cropped', icon: '✂️' },
  { id: 'long', name: 'Flowing', icon: '💇' },
  { id: 'braid', name: 'Braided', icon: '🪢' },
  { id: 'wild', name: 'Wild', icon: '🌪️' },
  { id: 'shaved', name: 'Shaved', icon: '⚪' },
  { id: 'topknot', name: 'Topknot', icon: '🎋' },
];

export const HAIR_COLORS = [
  { id: 'black', name: 'Onyx', hex: '#22242e' },
  { id: 'brown', name: 'Chestnut', hex: '#6f4630' },
  { id: 'blonde', name: 'Goldstring', hex: '#e0b45c' },
  { id: 'red', name: 'Ember', hex: '#c2532f' },
  { id: 'silver', name: 'Silver Chord', hex: '#c3c9d6' },
  { id: 'violet', name: 'Violet Note', hex: '#8d6cf0' },
  { id: 'teal', name: 'Deep Teal', hex: '#2f8f8a' },
];

export const SKIN_TONES = [
  { id: 'porcelain', name: 'Porcelain', hex: '#f3d8c4' },
  { id: 'fair', name: 'Fair', hex: '#e6bd9c' },
  { id: 'olive', name: 'Olive', hex: '#c99a6a' },
  { id: 'bronze', name: 'Bronze', hex: '#a3713f' },
  { id: 'brown', name: 'Umber', hex: '#74472a' },
  { id: 'deep', name: 'Deep Brown', hex: '#4a2b1b' },
  { id: 'ashen', name: 'Ashen', hex: '#9aa3ad' },
];

export const EYE_COLORS = [
  { id: 'brown', name: 'Amber', hex: '#7a4a24' },
  { id: 'green', name: 'Verdant', hex: '#3f7a4a' },
  { id: 'blue', name: 'Glacier', hex: '#3a6ea5' },
  { id: 'grey', name: 'Storm', hex: '#6d7681' },
  { id: 'gold', name: 'Brass', hex: '#c79a2a' },
  { id: 'crimson', name: 'Crimson', hex: '#a8323a' },
];

export const OUTFIT_TINTS = [
  { id: 'velvet', name: 'Velvet', hex: '#7c3f6d' },
  { id: 'royal', name: 'Royal', hex: '#3d5ba8' },
  { id: 'forest', name: 'Forest', hex: '#3c6b4a' },
  { id: 'crimson', name: 'Crimson', hex: '#9b3644' },
  { id: 'sand', name: 'Sand', hex: '#b08b52' },
  { id: 'ink', name: 'Ink', hex: '#333348' },
];

export const VOICE_TYPES = [
  { id: 'soprano', name: 'Soprano', icon: '🎶' },
  { id: 'alto', name: 'Alto', icon: '🎵' },
  { id: 'tenor', name: 'Tenor', icon: '🎼' },
  { id: 'bass', name: 'Bass', icon: '🎻' },
];

export const defaultAppearance = () => ({
  hairStyle: 'short',
  hairColor: 'black',
  skinTone: 'fair',
  eyeColor: 'brown',
  outfitTint: 'velvet',
  voice: 'alto',
});

// Stable pseudo-random on an index when a field is missing, so the avatar
// never renders an undefined colour.
export const pick = (list, id, fallbackIndex = 0) =>
  list.find((item) => item.id === id) || list[fallbackIndex] || list[0];
