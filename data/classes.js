// Six music-themed playable classes. Every stat value is a starting bonus
// that is added on top of the base array in engine/stats.js.
export const CLASSES = [
  {
    id: 'bard',
    name: 'Bard',
    icon: '🎻',
    tagline: 'Tells the story the dungeon did not want told.',
    lore:
      'Bards wander the Shattered Scale carrying nothing but a lute and a very good memory for gossip. They fight by making the enemy the punchline of a song that everyone in the tavern already knows.',
    color: '#f2b544',
    bonuses: { charisma: 6, agility: 4, intellect: 2, strength: 0, stamina: 1, resonance: 3 },
    passive: {
      name: 'Tavern Favorite',
      description: 'Quest gold rewards are 15% higher.',
      effect: 'goldBonus',
      value: 0.15,
    },
    skills: ['Cutting Verse', 'Rousing Chorus', 'Quick Fingers'],
  },
  {
    id: 'composer',
    name: 'Composer',
    icon: '🎼',
    tagline: 'Writes the battle. Someone else has to play it.',
    lore:
      'Composers see the world as a score with a few pages missing. They plan three moves ahead, and when the plan collapses they simply transpose it into a key that still works.',
    color: '#8f7bf7',
    bonuses: { intellect: 7, resonance: 4, charisma: 2, agility: 1, stamina: 1, strength: 0 },
    passive: {
      name: 'Counterpoint',
      description: 'Gain 15% more XP from every quest.',
      effect: 'xpBonus',
      value: 0.15,
    },
    skills: ['Written Gambit', 'Modulation', 'Crescendo Mark'],
  },
  {
    id: 'instrumentalist',
    name: 'Instrumentalist',
    icon: '🪕',
    tagline: 'If it has strings, they will break it. Then fix it.',
    lore:
      'Instrumentalists treat every object as a possible instrument and every enemy as a possible drum. Practical, stubborn, and covered in rosin, they are the reason most adventuring parties survive the first night.',
    color: '#4fd1a5',
    bonuses: { agility: 6, strength: 4, stamina: 2, intellect: 1, resonance: 1, charisma: 0 },
    passive: {
      name: 'Perfect Pitch',
      description: 'Critical strikes deal 50% more damage.',
      effect: 'critBonus',
      value: 0.5,
    },
    skills: ['Chord Slam', 'Restring', 'Barre Chord'],
  },
  {
    id: 'conductor',
    name: 'Conductor',
    icon: '🪄',
    tagline: 'Commands an orchestra that only they can hear.',
    lore:
      'The Conductor does not fight. The Conductor cues. Entire battles pivot on a raised eyebrow, and the survivors swear they heard brass where there was only wind.',
    color: '#5aa9f2',
    bonuses: { charisma: 5, intellect: 4, resonance: 4, stamina: 2, agility: 1, strength: 0 },
    passive: {
      name: 'Baton Authority',
      description: 'Damage dealt is 12% higher in every encounter.',
      effect: 'damageBonus',
      value: 0.12,
    },
    skills: ['Downbeat', 'Sforzando', 'Silence the Section'],
  },
  {
    id: 'vocalist',
    name: 'Vocalist',
    icon: '🎤',
    tagline: 'A voice that opens doors. And occasionally walls.',
    lore:
      'Vocalists are living resonance chambers. They can shatter glass, calm a riot, or hold a note long enough for the rest of the party to get into position. Most of them are insufferable about it.',
    color: '#f272b6',
    bonuses: { charisma: 6, resonance: 6, stamina: 2, agility: 1, intellect: 1, strength: 0 },
    passive: {
      name: 'Standing Ovation',
      description: 'Gain 20% more XP from quests.',
      effect: 'xpBonus',
      value: 0.2,
    },
    skills: ['Sustained Note', 'Shatter', 'Encore'],
  },
  {
    id: 'rhythm_keeper',
    name: 'Rhythm Keeper',
    icon: '🥁',
    tagline: 'Keeps time for a world that is always rushing.',
    lore:
      'Rhythm Keepers guard the heartbeat of the Shattered Scale. Slow to anger, impossible to knock down, and absolutely unbribable with anything faster than a waltz.',
    color: '#f28a4f',
    bonuses: { stamina: 7, strength: 4, agility: 2, resonance: 1, intellect: 1, charisma: 0 },
    passive: {
      name: 'Steady Pulse',
      description: 'Quest failure costs 50% less health.',
      effect: 'failPenalty',
      value: 0.5,
    },
    skills: ['Metronome Guard', 'Double Time', 'Break Beat'],
  },
];

export const getClass = (id) => CLASSES.find((c) => c.id === id) || CLASSES[0];
