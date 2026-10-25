// Derived-stat engine. All numbers the UI shows come from here so that class,
// race, level, equipment, and pet bonuses can never drift apart.
//
// Encounter sizing also lives here (see `enemyStatsFor`) because combat and the
// displayed win odds must agree: both are computed from the same numbers.

import { getClass } from '../data/classes';
import { getRace, STAT_KEYS } from '../data/races';
import { getItem } from '../data/items';
import { getPet } from '../data/pets';
import { QUESTS, QUEST_TIERS } from '../data/quests';
import { clamp, round } from './random';

export const MAX_LEVEL = 30;

// Base array before any modifiers. Deliberately low so bonuses matter.
const BASE_STATS = {
  strength: 4,
  agility: 4,
  intellect: 4,
  charisma: 4,
  stamina: 4,
  resonance: 4,
};

// XP needed to go from `level` to `level + 1`.
export const xpForNextLevel = (level) => round(80 * Math.pow(level, 1.42));

export const levelFromXp = (xp) => {
  let level = 1;
  let remaining = Math.max(0, xp || 0);
  while (level < MAX_LEVEL && remaining >= xpForNextLevel(level)) {
    remaining -= xpForNextLevel(level);
    level += 1;
  }
  return { level, xpIntoLevel: remaining, xpForLevel: xpForNextLevel(level) };
};

// Aggregate every passive/trait that shares an `effect` key.
const collectEffects = (classDef, raceDef) => {
  const effects = {};
  [classDef?.passive, raceDef?.trait].forEach((entry) => {
    if (!entry?.effect) return;
    effects[entry.effect] = (effects[entry.effect] || 0) + entry.value;
  });
  return effects;
};

export const getEquipmentBonuses = (equipped = {}) => {
  const bonuses = {};
  Object.values(equipped).forEach((itemId) => {
    const item = itemId ? getItem(itemId) : null;
    if (!item?.effect) return;
    if (item.effect.type === 'stat') {
      bonuses[item.effect.stat] = (bonuses[item.effect.stat] || 0) + item.effect.amount;
    }
    if (item.effect.type === 'multiStat') {
      Object.entries(item.effect.stats).forEach(([stat, amount]) => {
        bonuses[stat] = (bonuses[stat] || 0) + amount;
      });
    }
  });
  return bonuses;
};

/**
 * The single source of truth for player combat numbers.
 * `character` is the persisted character object.
 */
export const deriveStats = (character) => {
  if (!character) return null;

  const classDef = getClass(character.classId);
  const raceDef = getRace(character.raceId);
  const { level } = levelFromXp(character.xp || 0);
  const effects = collectEffects(classDef, raceDef);

  // Level grants +1 to every stat per 2 levels, rounded down.
  const levelBonus = Math.floor((level - 1) / 2);

  const stats = {};
  STAT_KEYS.forEach((key) => {
    stats[key] =
      BASE_STATS[key] + (classDef.bonuses[key] || 0) + (raceDef.bonuses[key] || 0) + levelBonus;
  });

  const equipment = getEquipmentBonuses(character.equipped);
  Object.entries(equipment).forEach(([key, amount]) => {
    stats[key] = (stats[key] || 0) + amount;
  });

  const pet = character.activePet ? getPet(character.activePet) : null;
  if (pet?.bonus) {
    Object.entries(pet.bonus).forEach(([key, amount]) => {
      stats[key] = (stats[key] || 0) + amount;
    });
  }

  const maxHealth = 60 + stats.stamina * 8 + level * 4;

  return {
    level,
    stats,
    classDef,
    raceDef,
    pet,
    effects,
    maxHealth,
    attack: round(6 + stats.strength * 1.7 + stats.resonance * 0.8),
    defense: round(2 + stats.stamina * 0.9 + stats.agility * 0.4),
    critChance: clamp(0.05 + stats.agility * 0.012 + (effects.critChance || 0), 0, 0.75),
    critMultiplier: 1.6 + (effects.critBonus || 0),
    damageBonus: effects.damageBonus || 0,
    armor: clamp(effects.armor || 0, 0, 0.6),
    xpBonus: effects.xpBonus || 0,
    goldBonus: effects.goldBonus || 0,
    failPenaltyReduction: effects.failPenalty || 0,
    health: clamp(character.health ?? maxHealth, 0, maxHealth),
  };
};

// ---------------------------------------------------------------------------
// Encounter sizing
// ---------------------------------------------------------------------------
// Enemy stats are NOT taken literally from the quest data. The authored
// `hp/attack/defense` values are a *threat profile*: their ratio to the tier
// average says how nasty a given quest is inside its own tier. The absolute
// numbers are generated from a reference performer at the tier's unlock level,
// so:
//   - a freshly-unlocked tier is a fair, tense fight,
//   - levels and gear above the requirement make it progressively easier,
//   - higher tiers are still harder than lower ones.
// This keeps a level-18 character from trivialising Expert while preventing a
// level-15 character from facing a numerically impossible Master quest.

// A neutral performer (average class + race bonuses) at a given level.
const referenceCombatant = (level) => {
  const levelBonus = Math.floor((level - 1) / 2);
  const strength = BASE_STATS.strength + 3 + 3 + levelBonus;
  const resonance = BASE_STATS.resonance + 3 + 3 + levelBonus;
  const stamina = BASE_STATS.stamina + 3 + 3 + levelBonus;
  const agility = BASE_STATS.agility + 3 + 3 + levelBonus;
  return {
    attack: 6 + strength * 1.7 + resonance * 0.8,
    maxHealth: 60 + stamina * 8 + level * 4,
    defense: 2 + stamina * 0.9 + agility * 0.4,
    critChance: 0.05 + agility * 0.012,
  };
};

// Average authored HP per tier, used to derive each quest's relative threat.
const tierAverageHp = QUEST_TIERS.reduce((acc, tier) => {
  const pool = QUESTS.filter((q) => q.tier === tier.id);
  acc[tier.id] = pool.length
    ? pool.reduce((sum, q) => sum + q.enemy.hp, 0) / pool.length
    : 1;
  return acc;
}, {});

/**
 * Absolute enemy numbers for one encounter.
 * Returns { hp, attack, defense, threat }.
 */
export const enemyStatsFor = (character, quest, tier) => {
  const derived = deriveStats(character);
  const ref = referenceCombatant(tier.levelReq || 1);

  // How many turns the reference performer should need, and how many it can
  // survive: both tighten as the tier rises, but gently enough that a character
  // who just unlocked the tier wins more often than not. Levels and gear above
  // the requirement are what make the higher tiers comfortable.
  const turnsToKill = 4.1 + tier.index * 0.42;
  const turnsToSurvive = 9.6 - tier.index * 0.62;

  const average = tierAverageHp[quest.tier] || 1;
  const threat = clamp(quest.enemy.hp / average, 0.68, 1.45);

  const hp = Math.max(12, round(ref.attack * turnsToKill * 0.85 * threat));
  // `attack` is pre-mitigation: resolveTurn then halves it with player defense,
  // so divide by the reference mitigation to hit `turnsToSurvive` exactly.
  const refMitigation = 1 - clamp(ref.defense / (ref.defense + 45), 0, 0.5);
  const attack = Math.max(2, round(ref.maxHealth / turnsToSurvive / Math.max(0.4, refMitigation)));
  const defense = Math.max(1, round(ref.attack * (0.12 + tier.index * 0.035)));

  // `derived` is unused for sizing on purpose (enemies do not scale to the
  // player), but keeping it here documents that sizing is tier-relative.
  void derived;

  return { hp, attack, defense, threat };
};

/**
 * Displayed odds for the quick-resolve path. Derived from the same numbers the
 * turn-based encounter uses, so the shown percentage is honest.
 */
export const questSuccessChance = (character, quest, tier) => {
  const derived = deriveStats(character);
  if (!derived) return 0.5;

  const enemy = enemyStatsFor(character, quest, tier);
  const enemyMitigation = clamp(enemy.defense / (enemy.defense + 40), 0, 0.55);
  const dps =
    derived.attack *
    (1 + derived.damageBonus) *
    (1 + derived.critChance * (derived.critMultiplier - 1)) *
    (1 - enemyMitigation);
  const killTurns = enemy.hp / Math.max(1, dps);

  const enemyDamage =
    enemy.attack *
    (1 - clamp(derived.defense / (derived.defense + 45), 0, 0.5)) *
    (1 - derived.armor);
  const surviveTurns = derived.maxHealth / Math.max(1, enemyDamage);

  const margin = (surviveTurns - killTurns) / Math.max(1, surviveTurns + killTurns);
  return clamp(0.55 + margin * 0.55, 0.2, 0.95);
};
