// Six fantasy races of the Shattered Scale. Each grants flat stat bonuses and
// one always-on racial trait that the combat engine reads by `effect` key.
export const RACES = [
  {
    id: 'human',
    name: 'Human',
    icon: '🧑',
    lore: 'Adaptable and unremarkable in every single stat, which is exactly the joke they are in on.',
    bonuses: { strength: 2, agility: 2, intellect: 2, charisma: 2, stamina: 2, resonance: 2 },
    trait: { name: 'Versatility', description: '+10% XP from all sources.', effect: 'xpBonus', value: 0.1 },
  },
  {
    id: 'elf',
    name: 'High Elf',
    icon: '🧝',
    lore: 'Immortal ears, mortal patience. They hear the harmonic that holds reality together and complain about its tuning.',
    bonuses: { intellect: 4, resonance: 4, agility: 2, charisma: 1, strength: 0, stamina: 0 },
    trait: { name: 'Perfect Ear', description: '+8% critical strike chance.', effect: 'critChance', value: 0.08 },
  },
  {
    id: 'dwarf',
    name: 'Forge Dwarf',
    icon: '🧔',
    lore: 'Built like a metronome that refuses to stop. Dwarven smiths tune anvils before they strike them.',
    bonuses: { stamina: 4, strength: 4, intellect: 1, agility: 0, charisma: 1, resonance: 0 },
    trait: { name: 'Anvil Bones', description: 'Takes 8% less damage.', effect: 'armor', value: 0.08 },
  },
  {
    id: 'orc',
    name: 'War Orc',
    icon: '👹',
    lore: 'Every orc war-drum is a family heirloom, and every family heirloom has at least one dent from a skull.',
    bonuses: { strength: 6, stamina: 3, agility: 1, intellect: 0, charisma: 0, resonance: 0 },
    trait: { name: 'War Drum', description: '+10% damage dealt.', effect: 'damageBonus', value: 0.1 },
  },
  {
    id: 'siren',
    name: 'Siren',
    icon: '🧜',
    lore: 'Born in the flooded opera house of Vell. Their voice carries underwater, which is mostly a threat.',
    bonuses: { charisma: 5, resonance: 5, agility: 1, intellect: 1, strength: 0, stamina: 0 },
    trait: { name: 'Tidal Voice', description: '+15% gold from quests.', effect: 'goldBonus', value: 0.15 },
  },
  {
    id: 'sprite',
    name: 'Clockwork Sprite',
    icon: '🧚',
    lore: 'A wind-up spirit with a brass heart. They experience a four-minute sonata as a full lifetime.',
    bonuses: { agility: 6, intellect: 3, resonance: 2, charisma: 1, strength: 0, stamina: 0 },
    trait: { name: 'Wound Spring', description: '+12% critical strike chance.', effect: 'critChance', value: 0.12 },
  },
];

export const getRace = (id) => RACES.find((r) => r.id === id) || RACES[0];

export const STAT_KEYS = ['strength', 'agility', 'intellect', 'charisma', 'stamina', 'resonance'];

export const STAT_LABELS = {
  strength: 'Strength',
  agility: 'Agility',
  intellect: 'Intellect',
  charisma: 'Charisma',
  stamina: 'Stamina',
  resonance: 'Resonance',
};

export const STAT_ICONS = {
  strength: '💪',
  agility: '🌀',
  intellect: '📖',
  charisma: '✨',
  stamina: '🛡️',
  resonance: '🎵',
};

export const STAT_DESCRIPTIONS = {
  strength: 'Raw physical force. Raises attack power.',
  agility: 'Speed and precision. Raises crit chance.',
  intellect: 'Planning and lore. Raises quest success odds.',
  charisma: 'Presence and persuasion. Raises gold rewards.',
  stamina: 'Durability. Raises max health.',
  resonance: 'Musical attunement. Raises XP gain.',
};
