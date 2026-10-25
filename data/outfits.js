// Outfits are cosmetic unlocks tied to level milestones and quest completions.
// `tint` overrides the free-form outfit tint in the Avatar renderer.
export const OUTFITS = [
  {
    id: 'wanderer',
    name: "Wanderer's Cloth",
    icon: '🧥',
    tint: '#7c3f6d',
    requirement: { type: 'level', level: 1 },
    description: 'Standard issue for anyone who has slept in a hedge on purpose.',
  },
  {
    id: 'apprentice',
    name: 'Conservatory Apprentice',
    icon: '🎽',
    tint: '#3d5ba8',
    requirement: { type: 'level', level: 3 },
    description: 'The sash is mandatory. The attitude is optional but strongly encouraged.',
  },
  {
    id: 'troubadour',
    name: 'Troubadour Coat',
    icon: '🧣',
    tint: '#3c6b4a',
    requirement: { type: 'quests', count: 3 },
    description: 'Thirty-two pockets, none of which contain money.',
  },
  {
    id: 'virtuoso',
    name: 'Virtuoso Regalia',
    icon: '🥻',
    tint: '#9b3644',
    requirement: { type: 'level', level: 8 },
    description: 'Only allowed to be worn by someone who has actually finished the piece.',
  },
  {
    id: 'conductor_black',
    name: 'Conductor Black',
    icon: '🕴️',
    tint: '#333348',
    requirement: { type: 'quests', count: 8 },
    description: 'Absorbs stage light, arguments, and the occasional knife.',
  },
  {
    id: 'maestro',
    name: 'Maestro of the Scale',
    icon: '👘',
    tint: '#b08b52',
    requirement: { type: 'level', level: 15 },
    description: 'Woven from a score that was never performed. Threads still hum.',
  },
  {
    id: 'first_chair',
    name: 'First Chair',
    icon: '🎩',
    tint: '#c9a227',
    requirement: { type: 'quests', count: 15 },
    description: 'A hat that has outlived four orchestras and one monarchy.',
  },
];

export const getOutfit = (id) => OUTFITS.find((o) => o.id === id) || OUTFITS[0];
