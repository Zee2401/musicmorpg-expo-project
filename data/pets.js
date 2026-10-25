// Pets are acquired by taming at certain levels, or through quest drops.
// `bonus` is applied additively to the derived stats.
export const PETS = [
  {
    id: 'metronome_mouse',
    name: 'Metronome Mouse',
    icon: '🐭',
    rarity: 'common',
    cost: 120,
    minLevel: 1,
    bonus: { agility: 1 },
    flavor: 'Ticks back and forth while you sleep. You have stopped trying to make it stop.',
  },
  {
    id: 'choir_cat',
    name: 'Choir Cat',
    icon: '🐈',
    rarity: 'uncommon',
    cost: 260,
    minLevel: 3,
    bonus: { charisma: 2 },
    flavor: 'Only meows in fifths. Refuses to perform for an audience of one.',
  },
  {
    id: 'tuning_firefly',
    name: 'Tuning Firefly',
    icon: '🪰',
    rarity: 'uncommon',
    cost: 300,
    minLevel: 4,
    bonus: { resonance: 2 },
    flavor: 'Its glow pulses at exactly 440 Hz. Scholars have written three papers.',
  },
  {
    id: 'bass_hound',
    name: 'Bass Hound',
    icon: '🐕',
    rarity: 'rare',
    cost: 620,
    minLevel: 6,
    bonus: { strength: 3, stamina: 1 },
    flavor: 'Barks in a register you feel in your ribs before you hear it.',
  },
  {
    id: 'owl_librarian',
    name: 'Owl Librarian',
    icon: '🦉',
    rarity: 'rare',
    cost: 700,
    minLevel: 8,
    bonus: { intellect: 3 },
    flavor: 'Has read every score in the archive and will remind you of that fact.',
  },
  {
    id: 'ghost_pianist',
    name: 'Ghost Pianist',
    icon: '👻',
    rarity: 'epic',
    cost: 1400,
    minLevel: 11,
    bonus: { resonance: 3, intellect: 2 },
    flavor: 'Died mid-phrase in 411 AR. Still annoyed about the unresolved cadence.',
  },
  {
    id: 'phoenix_chorister',
    name: 'Phoenix Chorister',
    icon: '🔥',
    rarity: 'legendary',
    cost: 2600,
    minLevel: 15,
    bonus: { charisma: 4, resonance: 3, stamina: 2 },
    flavor: 'Reborn every century with a slightly better range and a much worse temper.',
  },
];

export const PET_RARITY_COLORS = {
  common: '#8b93a7',
  uncommon: '#4fd1a5',
  rare: '#5aa9f2',
  epic: '#b48cf7',
  legendary: '#f2b544',
};

export const getPet = (id) => PETS.find((p) => p.id === id);
