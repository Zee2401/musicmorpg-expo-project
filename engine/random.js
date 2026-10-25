// Small, dependency-free helpers. Everything the game needs is deterministic
// given a seed so a saved run can be replayed in tests.

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const rand = (min, max) => min + Math.random() * (max - min);

export const randInt = (min, max) => Math.floor(rand(min, max + 1));

export const roll = (chance) => Math.random() < chance;

export const pickOne = (list) => list[randInt(0, list.length - 1)];

// A weighted picker: entries are [value, weight].
export const pickWeighted = (entries) => {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let cursor = rand(0, total);
  for (const [value, weight] of entries) {
    cursor -= weight;
    if (cursor <= 0) return value;
  }
  return entries[entries.length - 1][0];
};

export const round = (value) => Math.round(value);

export const uid = (prefix = 'id') =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const titleCase = (value) =>
  String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
