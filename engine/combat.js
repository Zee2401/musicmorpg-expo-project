// Turn-based combat resolution. Pure functions: given the character and an
// encounter state, return the next state plus a log entry. The Game screen
// renders whatever comes back, so all rules live here and stay testable.

import { deriveStats, enemyStatsFor } from './stats';
import { clamp, randInt, roll, round } from './random';

// Difficulty only ever changes how hard the enemy hits, never what you earn.
export const DIFFICULTY_MODIFIERS = {
  relaxed: 0.75,
  normal: 1,
  brutal: 1.3,
};

export const difficultyModifier = (difficulty) =>
  DIFFICULTY_MODIFIERS[difficulty] ?? DIFFICULTY_MODIFIERS.normal;

export const createEncounter = (character, quest, tier) => {
  const derived = deriveStats(character);
  const stats = enemyStatsFor(character, quest, tier);
  return {
    questId: quest.id,
    tierId: tier.id,
    turn: 1,
    playerHp: derived.health,
    playerHpMax: derived.maxHealth,
    enemyHp: stats.hp,
    enemyHpMax: stats.hp,
    enemy: {
      name: quest.enemy.name,
      icon: quest.enemy.icon,
      attack: stats.attack,
      defense: stats.defense,
    },
    log: [
      {
        id: 1,
        kind: 'intro',
        text: `${quest.enemy.name} steps forward in ${quest.location}.`,
      },
    ],
    status: 'active', // 'active' | 'victory' | 'defeat'
    startedAt: Date.now(),
  };
};

const pushLog = (encounter, entry) => {
  const nextId = (encounter.log[encounter.log.length - 1]?.id || 0) + 1;
  return [...encounter.log, { id: nextId, ...entry }].slice(-14);
};

const playerStrike = (derived, enemy) => {
  const crit = roll(derived.critChance);
  const base = derived.attack * (1 + derived.damageBonus);
  const mitigated = base * (1 - clamp(enemy.defense / (enemy.defense + 40), 0, 0.45));
  const damage = Math.max(1, round(mitigated * (crit ? derived.critMultiplier : 1)));
  return { damage, crit };
};

const enemyStrike = (derived, enemy, mod) => {
  const base = (enemy.attack * randInt(85, 115)) / 100;
  const mitigated = base * (1 - clamp(derived.defense / (derived.defense + 45), 0, 0.5));
  return Math.max(1, round(mitigated * (1 - derived.armor) * mod));
};

// `action` is 'strike' | 'guard' | 'ability'
export const resolveTurn = (character, encounter, action = 'strike', difficulty = 'normal') => {
  if (encounter.status !== 'active') return encounter;

  const derived = deriveStats(character);
  const mod = difficultyModifier(difficulty);
  let state = { ...encounter, log: [...encounter.log] };
  let guarded = false;

  if (action === 'strike') {
    const { damage, crit } = playerStrike(derived, state.enemy);
    state.enemyHp = Math.max(0, state.enemyHp - damage);
    state.log = pushLog(state, {
      kind: crit ? 'crit' : 'player',
      text: crit
        ? `Critical hit — ${damage} damage! The ${state.enemy.name} reels.`
        : `You strike for ${damage} damage.`,
    });
  } else if (action === 'ability') {
    const { damage } = playerStrike(derived, state.enemy);
    const boosted = round(damage * 1.55);
    state.enemyHp = Math.max(0, state.enemyHp - boosted);
    state.log = pushLog(state, {
      kind: 'ability',
      text: `You unleash ${derived.classDef.skills[0]} for ${boosted} damage.`,
    });
  } else {
    guarded = true;
    const { damage } = playerStrike(derived, state.enemy);
    const chip = Math.max(1, round(damage * 0.4));
    state.enemyHp = Math.max(0, state.enemyHp - chip);
    state.log = pushLog(state, {
      kind: 'guard',
      text: `You hold the beat and strike late for ${chip} damage. Guarding up.`,
    });
  }

  if (state.enemyHp <= 0) {
    state.log = pushLog(state, {
      kind: 'victory',
      text: `${state.enemy.name} falls out of tempo. Victory.`,
    });
    return { ...state, status: 'victory', turn: state.turn + 1 };
  }

  const raw = enemyStrike(derived, state.enemy, mod);
  const incoming = guarded ? Math.max(1, round(raw * 0.45)) : raw;
  state.playerHp = Math.max(0, state.playerHp - incoming);
  state.log = pushLog(state, {
    kind: 'enemy',
    text: guarded
      ? `${state.enemy.name} hits for ${incoming} — your guard absorbs the worst of it.`
      : `${state.enemy.name} hits back for ${incoming}.`,
  });

  if (state.playerHp <= 0) {
    state.log = pushLog(state, {
      kind: 'defeat',
      text: 'You lose the beat and the room goes quiet.',
    });
    return { ...state, status: 'defeat', turn: state.turn + 1 };
  }

  // Stalemate guard so an encounter can never run forever.
  if (state.turn >= 24) {
    const playerWinning = state.playerHp / state.playerHpMax > state.enemyHp / state.enemyHpMax;
    state.log = pushLog(state, {
      kind: playerWinning ? 'victory' : 'defeat',
      text: playerWinning
        ? 'The encounter runs long, but the opponent concedes the bar.'
        : 'The encounter runs long and you are carried out before the final bar.',
    });
    return { ...state, status: playerWinning ? 'victory' : 'defeat', turn: state.turn + 1 };
  }

  return { ...state, turn: state.turn + 1 };
};
