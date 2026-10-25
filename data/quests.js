// Quest catalogue — 5 tiers from Easy to Hard.
// Every quest is a self-contained encounter: the player enters combat on the
// Game screen, trades blows with `enemy`, and collects `rewards` on victory.
//
// tier index 0..4 maps to TIERS below. `levelReq` gates the Embark button,
// `minTurns`/`maxTurns` bound how long the encounter can run before it is
// decided as a stalemate loss for the player.

// The five difficulty tiers, Easy -> Hard. `mult` scales the quest's base
// stats into the combat encounter so higher tiers genuinely hurt more.
export const QUEST_TIERS = [
  {
    index: 0,
    id: 'easy',
    name: 'Easy',
    color: '#4fd1a5',
    levelReq: 1,
    mult: 1.0,
    blurb: 'Streetcorner work. Good for a first coin and a first bruise.',
  },
  {
    index: 1,
    id: 'normal',
    name: 'Normal',
    color: '#5aa9f2',
    levelReq: 3,
    mult: 1.55,
    blurb: 'Real scores with real teeth. The pay finally covers strings.',
  },
  {
    index: 2,
    id: 'hard',
    name: 'Hard',
    color: '#b48cf7',
    levelReq: 6,
    mult: 2.3,
    blurb: 'Where the Scale starts to fray. Bring a full party or an empty will.',
  },
  {
    index: 3,
    id: 'expert',
    name: 'Expert',
    color: '#f28a4f',
    levelReq: 10,
    mult: 3.2,
    blurb: 'The fractured movements. Few ensembles come back in tune.',
  },
  {
    index: 4,
    id: 'master',
    name: 'Master',
    color: '#f2b544',
    levelReq: 15,
    mult: 4.4,
    blurb: 'The Last Bar. Everything the Scale was built to hold, and what it dropped.',
  },
];

export const QUESTS = [
  // ---------------- EASY ----------------
  {
    id: 'e1_rat_choir',
    tier: 'easy',
    title: 'The Rat Choir',
    location: 'Understage, Bellhouse Tavern',
    levelReq: 1,
    hook: 'Something in the crawlspace has learned to sing in four-part harmony, and the landlord wants it evicted before the evening rush.',
    enemy: { name: 'Rat Choir', icon: '🐀', hp: 34, attack: 6, defense: 2 },
    rewards: { xp: 45, gold: 32, items: [{ id: 'rosin_stone', qty: 1, chance: 0.6 }] },
  },
  {
    id: 'e2_flat_brigade',
    tier: 'easy',
    title: 'The Flat Brigade',
    location: 'Copper Lane',
    levelReq: 1,
    hook: 'A gang of tone-deaf enforcers is shaking down buskers for "protection from bad notes". They are the bad notes.',
    enemy: { name: 'Flat Brigade Bruiser', icon: '🪓', hp: 40, attack: 7, defense: 3 },
    rewards: { xp: 55, gold: 38, items: [{ id: 'health_tonic', qty: 1, chance: 0.8 }] },
  },
  {
    id: 'e3_drunk_oboist',
    tier: 'easy',
    title: 'The Drunk Oboist',
    location: 'The Gilded Rest',
    levelReq: 1,
    hook: 'He has been holding the same high C for eleven minutes and will not release it until someone can name the composer.',
    enemy: { name: 'Drunk Oboist', icon: '🍺', hp: 30, attack: 8, defense: 1 },
    rewards: { xp: 40, gold: 28, items: [{ id: 'rosin_stone', qty: 2, chance: 0.5 }] },
  },
  {
    id: 'e4_courier_crescendo',
    tier: 'easy',
    title: 'Courier of the Crescendo',
    location: 'Old Ramparts',
    levelReq: 2,
    hook: 'A sealed score must reach the north gate before the bell. The trouble is that everyone on this road wants to read it.',
    enemy: { name: 'Roadside Plucker', icon: '🗡️', hp: 44, attack: 7, defense: 2 },
    rewards: { xp: 60, gold: 45, items: [{ id: 'faded_score', qty: 1, chance: 0.4 }] },
  },
  {
    id: 'e5_tavern_brawl',
    tier: 'easy',
    title: 'Closing Time at the Bellhouse',
    location: 'Bellhouse Tavern',
    levelReq: 2,
    hook: 'Two rival string sections, one last round, and a landlord who has already started counting the furniture as losses.',
    enemy: { name: 'Brawling Cellist', icon: '🎻', hp: 48, attack: 8, defense: 3 },
    rewards: { xp: 70, gold: 52, items: [{ id: 'health_tonic', qty: 2, chance: 0.7 }] },
  },

  // ---------------- NORMAL ----------------
  {
    id: 'n1_sunken_pit',
    tier: 'normal',
    title: 'The Sunken Pit',
    location: 'Flooded Orchestra Hall, Vell',
    levelReq: 3,
    hook: 'The pit is still full of water and the drowned brass section is still playing. They take requests. They do not take no.',
    enemy: { name: 'Drowned Hornist', icon: '🌊', hp: 78, attack: 12, defense: 6 },
    rewards: {
      xp: 130,
      gold: 105,
      items: [
        { id: 'brass_reed', qty: 1, chance: 0.75 },
        { id: 'encore_syrup', qty: 1, chance: 0.35 },
      ],
    },
  },
  {
    id: 'n2_dissonant_hounds',
    tier: 'normal',
    title: 'Hounds of the Dissonance',
    location: 'Ashen Woods',
    levelReq: 3,
    hook: 'Something in the trees is barking a tritone. Livestock will not enter the woods, and the woodcutters have stopped coming home.',
    enemy: { name: 'Dissonant Hound', icon: '🐺', hp: 86, attack: 14, defense: 5 },
    rewards: { xp: 145, gold: 98, items: [{ id: 'brass_reed', qty: 2, chance: 0.5 }] },
  },
  {
    id: 'n3_broken_metronome',
    tier: 'normal',
    title: 'The Broken Metronome',
    location: 'Clocktower of Sanctum',
    levelReq: 4,
    hook: 'The city metronome has slipped a half-beat and the entire garrison is marching out of step. Fix it before someone invades by accident.',
    enemy: { name: 'Overwound Automaton', icon: '⚙️', hp: 95, attack: 13, defense: 8 },
    rewards: {
      xp: 160,
      gold: 120,
      items: [{ id: 'metronome_shard', qty: 1, chance: 0.25 }],
    },
  },
  {
    id: 'n4_choir_thief',
    tier: 'normal',
    title: 'The Choir Thief',
    location: 'Cathedral of the Ninth',
    levelReq: 4,
    hook: 'Somebody has been stealing voices. Twenty-three choristers now mouth the words with no sound at all, and the culprit is still in the loft.',
    enemy: { name: 'Voice Thief', icon: '🎭', hp: 82, attack: 16, defense: 5 },
    rewards: { xp: 175, gold: 130, items: [{ id: 'siren_scale', qty: 1, chance: 0.3 }] },
  },
  {
    id: 'n5_rust_marches',
    tier: 'normal',
    title: 'Rust Marches',
    location: 'Scrapyard of the Eighth Movement',
    levelReq: 5,
    hook: 'A harvest of broken instruments has stood up and started walking in formation. Nobody ordered a parade.',
    enemy: { name: 'Rust Marching Band', icon: '🥁', hp: 104, attack: 15, defense: 7 },
    rewards: {
      xp: 190,
      gold: 142,
      items: [{ id: 'silver_plectrum', qty: 1, chance: 0.2 }],
    },
  },

  // ---------------- HARD ----------------
  {
    id: 'h1_false_cadence',
    tier: 'hard',
    title: 'The False Cadence',
    location: 'Mirror Hall',
    levelReq: 6,
    hook: 'A hall that resolves every phrase one note early. Step out of time and it will keep a copy of you.',
    enemy: { name: 'Mirror Chorister', icon: '🪞', hp: 150, attack: 22, defense: 12 },
    rewards: {
      xp: 300,
      gold: 240,
      items: [
        { id: 'siren_scale', qty: 2, chance: 0.6 },
        { id: 'encore_syrup', qty: 2, chance: 0.6 },
      ],
    },
  },
  {
    id: 'h2_silent_warden',
    tier: 'hard',
    title: 'Warden of the Silent Bar',
    location: 'The Rest, Outer Ring',
    levelReq: 6,
    hook: 'The Rest is a bar you cannot cross if you make any sound at all — including breathing, including thinking too loudly.',
    enemy: { name: 'Silent Warden', icon: '🗿', hp: 168, attack: 24, defense: 14 },
    rewards: { xp: 330, gold: 260, items: [{ id: 'resonance_cloak', qty: 1, chance: 0.22 }] },
  },
  {
    id: 'h3_glass_aria',
    tier: 'hard',
    title: 'The Glass Aria',
    location: 'Vault of Vell',
    levelReq: 7,
    hook: 'A soprano is holding a note that is slowly turning the vault to powder. She is not doing it on purpose, which makes it worse.',
    enemy: { name: 'Shatter Soprano', icon: '💎', hp: 158, attack: 28, defense: 10 },
    rewards: {
      xp: 360,
      gold: 285,
      items: [{ id: 'metronome_shard', qty: 1, chance: 0.4 }],
    },
  },
  {
    id: 'h4_tempo_wraith',
    tier: 'hard',
    title: 'Tempo Wraith',
    location: 'Bonefields of the Sixth',
    levelReq: 8,
    hook: 'It steals your tempo mid-swing. Every strike lands late by exactly one beat, and one beat is all it needs.',
    enemy: { name: 'Tempo Wraith', icon: '💀', hp: 176, attack: 26, defense: 13 },
    rewards: { xp: 390, gold: 310, items: [{ id: 'chorus_blade', qty: 1, chance: 0.18 }] },
  },
  {
    id: 'h5_discord_titan',
    tier: 'hard',
    title: 'The Discord Titan',
    location: 'Collapsed Amphitheatre',
    levelReq: 9,
    hook: 'A giant stitched from out-of-tune instruments. It does not attack so much as arrive, and the arrival is loud.',
    enemy: { name: 'Discord Titan', icon: '👹', hp: 215, attack: 30, defense: 16 },
    rewards: { xp: 450, gold: 360, items: [{ id: 'crown_of_cadence', qty: 1, chance: 0.15 }] },
  },

  // ---------------- EXPERT ----------------
  {
    id: 'x1_reverse_mass',
    tier: 'expert',
    title: 'The Reverse Mass',
    location: 'Chapel of the Inverted Sixth',
    levelReq: 10,
    hook: 'A mass performed backwards does not undo anything. It merely invites something that was already listening.',
    enemy: { name: 'Inverted Choir', icon: '🕯️', hp: 280, attack: 38, defense: 20 },
    rewards: { xp: 620, gold: 480, items: [{ id: 'metronome_shard', qty: 2, chance: 0.7 }] },
  },
  {
    id: 'x2_harmonic_golem',
    tier: 'expert',
    title: 'Harmonic Golem',
    location: 'The Tuning Yards',
    levelReq: 11,
    hook: 'Eleven thousand tuning forks welded into one shape. It is trying to find a pitch that the whole world agrees on. It has not found it.',
    enemy: { name: 'Harmonic Golem', icon: '🗿', hp: 310, attack: 40, defense: 24 },
    rewards: { xp: 680, gold: 520, items: [{ id: 'resonance_cloak', qty: 1, chance: 0.35 }] },
  },
  {
    id: 'x3_lost_movement',
    tier: 'expert',
    title: 'The Lost Movement',
    location: 'The Fold Between Movements',
    levelReq: 12,
    hook: 'A movement nobody wrote is playing itself in a place that is not on the map. Three cartographers went in with measuring chains.',
    enemy: { name: 'Unwritten Movement', icon: '🌀', hp: 295, attack: 44, defense: 19 },
    rewards: { xp: 730, gold: 555, items: [{ id: 'chorus_blade', qty: 1, chance: 0.3 }] },
  },
  {
    id: 'x4_maestro_echo',
    tier: 'expert',
    title: 'Echo of the Last Maestro',
    location: 'Ruined Podium, First Stage',
    levelReq: 13,
    hook: 'He is still conducting. The orchestra is gone, the hall is gone, but his hands are still moving and something is still obeying.',
    enemy: { name: 'Maestro Echo', icon: '🪄', hp: 335, attack: 46, defense: 22 },
    rewards: { xp: 800, gold: 610, items: [{ id: 'crown_of_cadence', qty: 1, chance: 0.25 }] },
  },

  // ---------------- MASTER ----------------
  {
    id: 'm1_first_metronome',
    tier: 'master',
    title: 'The First Metronome',
    location: 'Core of the Shattered Scale',
    levelReq: 15,
    hook: 'The metronome that started the world. It is still ticking. According to every measure you can take, it is now half a beat behind.',
    enemy: { name: 'The First Metronome', icon: '⏳', hp: 460, attack: 58, defense: 30 },
    rewards: { xp: 1200, gold: 950, items: [{ id: 'crown_of_cadence', qty: 1, chance: 0.6 }] },
  },
  {
    id: 'm2_silence_itself',
    tier: 'master',
    title: 'Silence, Personified',
    location: 'The Bar After the Last',
    levelReq: 16,
    hook: 'It has no face and no weapon. It simply removes you from the score, and what is not in the score cannot be remembered.',
    enemy: { name: 'Silence', icon: '⬛', hp: 500, attack: 62, defense: 34 },
    rewards: { xp: 1300, gold: 1040, items: [{ id: 'metronome_shard', qty: 3, chance: 0.9 }] },
  },
  {
    id: 'm3_shattered_scale',
    tier: 'master',
    title: 'The Shattered Scale',
    location: 'Everywhere at Once',
    levelReq: 18,
    hook: 'The wound in the world, still humming. Everything you have fought was a splinter of this. Close it, or learn to live inside it.',
    enemy: { name: 'The Shattered Scale', icon: '🌌', hp: 560, attack: 68, defense: 38 },
    rewards: { xp: 1600, gold: 1300, items: [{ id: 'crown_of_cadence', qty: 1, chance: 0.8 }] },
  },
];

export const getTier = (id) => QUEST_TIERS.find((t) => t.id === id) || QUEST_TIERS[0];

export const questsByTier = (tierId) => QUESTS.filter((q) => q.tier === tierId);

export const getQuest = (id) => QUESTS.find((q) => q.id === id);

export const ACTIVE_SLOTS = 3;
