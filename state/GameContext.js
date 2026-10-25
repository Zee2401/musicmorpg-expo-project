// Single source of app state. Every mutation goes through `commit`, which
// computes the next save synchronously (so callers can read rewards/outcomes
// immediately) and then hands the value to React for rendering.
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getClass } from '../data/classes';
import { getRace } from '../data/races';
import { defaultAppearance } from '../data/appearance';
import { getItem } from '../data/items';
import { getPet } from '../data/pets';
import { OUTFITS, getOutfit } from '../data/outfits';
import { getQuest, getTier, ACTIVE_SLOTS } from '../data/quests';
import { deriveStats, levelFromXp, xpForNextLevel } from '../engine/stats';
import { clamp, uid } from '../engine/random';

const STORAGE_KEY = '@musicmorpg/save/v1';
const SAVE_VERSION = 1;

export const DEFAULT_SETTINGS = {
  music: true,
  sfx: true,
  haptics: true,
  notifications: false,
  reducedMotion: false,
  autoEquip: true,
  difficulty: 'normal',
};

const emptySave = () => ({
  version: SAVE_VERSION,
  character: null,
  inventory: { health_tonic: 2, rosin_stone: 1 },
  pets: [],
  activePet: null,
  equipped: { weapon: null, armor: null, head: null, trinket: null },
  outfitId: 'wanderer',
  unlockedOutfits: ['wanderer'],
  activeQuests: [],
  completedQuests: [],
  questLog: [],
  settings: { ...DEFAULT_SETTINGS },
  stats: { questsWon: 0, questsLost: 0, goldEarned: 0, xpEarned: 0, itemsFound: 0 },
});

const GameContext = createContext(null);

// Which outfits the player has earned, evaluated from live character data.
const evaluateOutfitUnlocks = (save) => {
  if (!save.character) return save.unlockedOutfits || [];
  const { level } = levelFromXp(save.character.xp || 0);
  const questCount = (save.completedQuests || []).length;
  const earned = OUTFITS.filter((outfit) => {
    const req = outfit.requirement;
    if (!req) return false;
    if (req.type === 'level') return level >= req.level;
    if (req.type === 'quests') return questCount >= req.count;
    return false;
  }).map((o) => o.id);
  return Array.from(new Set([...(save.unlockedOutfits || []), ...earned]));
};

// The character view every stat/derivation needs.
const withLoadout = (save) => ({
  ...save.character,
  equipped: save.equipped,
  activePet: save.activePet,
});

export const GameProvider = ({ children }) => {
  const [save, setSave] = useState(emptySave);
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [lastLevelUp, setLastLevelUp] = useState(null);
  const hydrated = useRef(false);
  const saveRef = useRef(save);

  /**
   * Apply a mutation synchronously.
   * `updater` receives the current save and returns the next one.
   * Returns the next save so callers can read the result right away.
   */
  const commit = useCallback((updater) => {
    const next = updater(saveRef.current);
    if (next && next !== saveRef.current) {
      saveRef.current = next;
      setSave(next);
    }
    return saveRef.current;
  }, []);

  const pushToast = useCallback((text, tone = 'info') => {
    if (!text) return;
    const id = uid('toast');
    setToasts((prev) => [...prev.slice(-3), { id, text, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2600);
  }, []);

  // ---- load once ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.version === SAVE_VERSION) {
            const merged = {
              ...emptySave(),
              ...parsed,
              settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
              stats: { ...emptySave().stats, ...(parsed.stats || {}) },
              equipped: { ...emptySave().equipped, ...(parsed.equipped || {}) },
            };
            saveRef.current = merged;
            setSave(merged);
          }
        }
      } catch (error) {
        // A corrupt save must never brick the app: fall back to a fresh run.
        console.warn('[MusicMORPG] Could not read save, starting fresh.', error);
      } finally {
        if (!cancelled) {
          hydrated.current = true;
          setReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- persist on every change (after hydration) ----
  useEffect(() => {
    if (!hydrated.current || !ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(save)).catch((error) =>
      console.warn('[MusicMORPG] Save failed.', error)
    );
  }, [save, ready]);

  // ---- character creation ----
  const createCharacter = useCallback(
    ({ name, classId, raceId, appearance }) => {
      const classDef = getClass(classId);
      const raceDef = getRace(raceId);
      const draft = {
        name: (name || '').trim() || `${raceDef.name} ${classDef.name}`,
        classId: classDef.id,
        raceId: raceDef.id,
        appearance: { ...defaultAppearance(), ...(appearance || {}) },
        xp: 0,
        gold: 60,
        createdAt: Date.now(),
        outfitId: 'wanderer',
      };
      const preview = deriveStats({ ...draft, equipped: {}, activePet: null });

      commit((prev) => ({
        ...prev,
        character: { ...draft, health: preview.maxHealth },
        outfitId: 'wanderer',
        unlockedOutfits: Array.from(new Set([...(prev.unlockedOutfits || []), 'wanderer'])),
      }));
      pushToast(`${draft.name} takes the stage.`, 'success');
    },
    [commit, pushToast]
  );

  const renameCharacter = useCallback(
    (name) => {
      const clean = (name || '').trim();
      if (!clean) return;
      commit((prev) =>
        prev.character ? { ...prev, character: { ...prev.character, name: clean } } : prev
      );
    },
    [commit]
  );

  // ---- progression ----
  const grantXp = useCallback(
    (amount) => {
      const gain = Math.round(amount);
      if (!gain) return;
      let leveledTo = null;
      commit((prev) => {
        if (!prev.character) return prev;
        const before = levelFromXp(prev.character.xp || 0).level;
        const nextXp = (prev.character.xp || 0) + gain;
        const after = levelFromXp(nextXp).level;
        const next = {
          ...prev,
          character: { ...prev.character, xp: nextXp },
          stats: { ...prev.stats, xpEarned: prev.stats.xpEarned + gain },
        };
        if (after > before) {
          leveledTo = after;
          const derived = deriveStats(withLoadout(next));
          next.character = { ...next.character, health: derived.maxHealth };
        }
        return { ...next, unlockedOutfits: evaluateOutfitUnlocks(next) };
      });
      if (leveledTo) setLastLevelUp({ level: leveledTo, at: Date.now() });
    },
    [commit]
  );

  const grantGold = useCallback(
    (amount) => {
      if (!amount) return;
      commit((prev) => {
        if (!prev.character) return prev;
        return {
          ...prev,
          character: {
            ...prev.character,
            gold: Math.max(0, (prev.character.gold || 0) + Math.round(amount)),
          },
          stats:
            amount > 0
              ? { ...prev.stats, goldEarned: prev.stats.goldEarned + Math.round(amount) }
              : prev.stats,
        };
      });
    },
    [commit]
  );

  const setHealth = useCallback(
    (health) => {
      commit((prev) => {
        if (!prev.character) return prev;
        const derived = deriveStats(withLoadout(prev));
        return {
          ...prev,
          character: { ...prev.character, health: clamp(Math.round(health), 0, derived.maxHealth) },
        };
      });
    },
    [commit]
  );

  const restAtTavern = useCallback(() => {
    const cost = 25;
    let message = '';
    let tone = 'info';
    commit((prev) => {
      if (!prev.character) return prev;
      const derived = deriveStats(withLoadout(prev));
      if ((prev.character.gold || 0) < cost) {
        message = 'Not enough gold for a room.';
        tone = 'danger';
        return prev;
      }
      if ((prev.character.health ?? 0) >= derived.maxHealth) {
        message = 'Already at full health.';
        return prev;
      }
      message = 'Rested. Health fully restored.';
      tone = 'success';
      return {
        ...prev,
        character: {
          ...prev.character,
          gold: prev.character.gold - cost,
          health: derived.maxHealth,
        },
      };
    });
    pushToast(message, tone);
  }, [commit, pushToast]);

  // ---- quests ----
  const acceptQuest = useCallback(
    (questId) => {
      let message = '';
      let tone = 'info';
      commit((prev) => {
        const quest = getQuest(questId);
        if (!quest || !prev.character) return prev;
        if (prev.completedQuests.includes(questId)) {
          message = 'That score is already closed.';
          return prev;
        }
        if (prev.activeQuests.some((q) => q.questId === questId)) {
          message = 'Already tracking that one.';
          return prev;
        }
        if (prev.activeQuests.length >= ACTIVE_SLOTS) {
          message = `Only ${ACTIVE_SLOTS} quests can be tracked at once.`;
          tone = 'danger';
          return prev;
        }
        const tier = getTier(quest.tier);
        const { level } = levelFromXp(prev.character.xp || 0);
        if (level < tier.levelReq) {
          message = `Reach level ${tier.levelReq} first.`;
          tone = 'danger';
          return prev;
        }
        message = `Tracking "${quest.title}".`;
        tone = 'success';
        return {
          ...prev,
          activeQuests: [
            ...prev.activeQuests,
            { questId, tierId: quest.tier, acceptedAt: Date.now() },
          ],
        };
      });
      pushToast(message, tone);
    },
    [commit, pushToast]
  );

  const abandonQuest = useCallback(
    (questId) => {
      commit((prev) => ({
        ...prev,
        activeQuests: prev.activeQuests.filter((q) => q.questId !== questId),
      }));
      pushToast('Quest dropped.', 'info');
    },
    [commit, pushToast]
  );

  /**
   * Award the outcome of a resolved encounter.
   * Returns a reward summary the caller can display immediately.
   */
  const finishQuest = useCallback(
    (questId, victory) => {
      const quest = getQuest(questId);
      if (!quest) return null;
      const tier = getTier(quest.tier);
      const summary = { victory, xp: 0, gold: 0, items: [] };
      let leveledTo = null;

      commit((prev) => {
        if (!prev.character) return prev;
        const derived = deriveStats(withLoadout(prev));

        // Class/race reward bonuses and tier scaling.
        const xpReward = victory
          ? Math.round(quest.rewards.xp * (1 + derived.xpBonus) * (1 + tier.index * 0.05))
          : Math.round(quest.rewards.xp * 0.25);
        const goldReward = victory
          ? Math.round(quest.rewards.gold * (1 + derived.goldBonus) * (1 + tier.index * 0.05))
          : Math.round(quest.rewards.gold * 0.1);

        // Loot rolls only on victory.
        const foundItems = [];
        if (victory) {
          (quest.rewards.items || []).forEach((drop) => {
            if (Math.random() < drop.chance) {
              foundItems.push({ id: drop.id, qty: drop.qty });
            }
          });
        }

        const inventory = { ...prev.inventory };
        foundItems.forEach((drop) => {
          inventory[drop.id] = (inventory[drop.id] || 0) + drop.qty;
        });

        const hpLoss = victory
          ? 0
          : Math.round(12 * (1 - derived.failPenaltyReduction) * (1 + tier.index * 0.1));

        const beforeLevel = levelFromXp(prev.character.xp || 0).level;
        const nextXp = (prev.character.xp || 0) + xpReward;
        const afterLevel = levelFromXp(nextXp).level;

        const nextCharacter = {
          ...prev.character,
          xp: nextXp,
          gold: Math.max(0, (prev.character.gold || 0) + goldReward),
          health: Math.max(
            1,
            Math.min(derived.maxHealth, (prev.character.health ?? derived.maxHealth) - hpLoss)
          ),
        };

        const next = {
          ...prev,
          character: nextCharacter,
          inventory,
          activeQuests: prev.activeQuests.filter((q) => q.questId !== questId),
          completedQuests: victory
            ? Array.from(new Set([...prev.completedQuests, questId]))
            : prev.completedQuests,
          questLog: [
            {
              id: uid('log'),
              questId,
              title: quest.title,
              tierId: quest.tier,
              victory,
              xp: xpReward,
              gold: goldReward,
              items: foundItems,
              at: Date.now(),
            },
            ...prev.questLog,
          ].slice(0, 40),
          stats: {
            ...prev.stats,
            questsWon: prev.stats.questsWon + (victory ? 1 : 0),
            questsLost: prev.stats.questsLost + (victory ? 0 : 1),
            goldEarned: prev.stats.goldEarned + Math.max(0, goldReward),
            xpEarned: prev.stats.xpEarned + xpReward,
            itemsFound: prev.stats.itemsFound + foundItems.reduce((n, i) => n + i.qty, 0),
          },
        };

        if (afterLevel > beforeLevel) {
          leveledTo = afterLevel;
          const boosted = deriveStats({ ...next.character, equipped: next.equipped, activePet: next.activePet });
          next.character = { ...next.character, health: boosted.maxHealth };
        }

        summary.xp = xpReward;
        summary.gold = goldReward;
        summary.items = foundItems;

        return { ...next, unlockedOutfits: evaluateOutfitUnlocks(next) };
      });

      if (leveledTo) setLastLevelUp({ level: leveledTo, at: Date.now() });
      return summary;
    },
    [commit]
  );

  // ---- inventory ----
  const buyItem = useCallback(
    (itemId) => {
      const item = getItem(itemId);
      if (!item) return;
      let ok = false;
      commit((prev) => {
        if (!prev.character || (prev.character.gold || 0) < item.value) return prev;
        ok = true;
        return {
          ...prev,
          character: { ...prev.character, gold: prev.character.gold - item.value },
          inventory: { ...prev.inventory, [itemId]: (prev.inventory[itemId] || 0) + 1 },
        };
      });
      pushToast(
        ok ? `Bought ${item.name}.` : 'Not enough gold.',
        ok ? 'success' : 'danger'
      );
    },
    [commit, pushToast]
  );

  const sellItem = useCallback(
    (itemId) => {
      const item = getItem(itemId);
      if (!item) return;
      const price = Math.max(1, Math.round(item.value * 0.45));
      let ok = false;
      commit((prev) => {
        const qty = prev.inventory[itemId] || 0;
        if (qty <= 0 || !prev.character) return prev;
        ok = true;
        return {
          ...prev,
          character: { ...prev.character, gold: (prev.character.gold || 0) + price },
          inventory: { ...prev.inventory, [itemId]: qty - 1 },
        };
      });
      if (ok) pushToast(`Sold ${item.name} for ${price} gold.`, 'success');
    },
    [commit, pushToast]
  );

  const useItem = useCallback(
    (itemId) => {
      const item = getItem(itemId);
      if (!item || item.effect?.type !== 'heal') return;
      let result = 'none'; // 'none' | 'full' | 'used'
      commit((prev) => {
        const qty = prev.inventory[itemId] || 0;
        if (qty <= 0 || !prev.character) return prev;
        const derived = deriveStats(withLoadout(prev));
        if ((prev.character.health ?? 0) >= derived.maxHealth) {
          result = 'full';
          return prev;
        }
        result = 'used';
        return {
          ...prev,
          character: {
            ...prev.character,
            health: Math.min(derived.maxHealth, (prev.character.health ?? 0) + item.effect.amount),
          },
          inventory: { ...prev.inventory, [itemId]: qty - 1 },
        };
      });
      if (result === 'full') pushToast('Already at full health.', 'info');
      if (result === 'used') pushToast(`${item.name} restores ${item.effect.amount} health.`, 'success');
    },
    [commit, pushToast]
  );

  const equipItem = useCallback(
    (itemId) => {
      const item = getItem(itemId);
      if (!item || item.type !== 'equipment') return;
      let ok = false;
      commit((prev) => {
        if ((prev.inventory[itemId] || 0) <= 0) return prev;
        ok = true;
        return { ...prev, equipped: { ...prev.equipped, [item.slot]: itemId } };
      });
      if (ok) pushToast(`${item.name} equipped.`, 'success');
    },
    [commit, pushToast]
  );

  const unequipSlot = useCallback(
    (slot) => {
      commit((prev) => ({ ...prev, equipped: { ...prev.equipped, [slot]: null } }));
      pushToast('Unequipped.', 'info');
    },
    [commit, pushToast]
  );

  // ---- pets ----
  const adoptPet = useCallback(
    (petId, name) => {
      const pet = getPet(petId);
      if (!pet) return;
      let message = '';
      let tone = 'success';
      commit((prev) => {
        if (!prev.character) return prev;
        const { level } = levelFromXp(prev.character.xp || 0);
        if (level < pet.minLevel) {
          message = `${pet.name} needs level ${pet.minLevel}.`;
          tone = 'danger';
          return prev;
        }
        if (prev.pets.some((p) => p.id === petId)) {
          message = 'You already have that companion.';
          tone = 'info';
          return prev;
        }
        if ((prev.character.gold || 0) < pet.cost) {
          message = 'Not enough gold to tame.';
          tone = 'danger';
          return prev;
        }
        const petName = (name || '').trim() || pet.name;
        message = `${petName} joins you.`;
        return {
          ...prev,
          character: { ...prev.character, gold: prev.character.gold - pet.cost },
          pets: [...prev.pets, { id: petId, name: petName, adoptedAt: Date.now() }],
          activePet: prev.activePet || petId,
        };
      });
      pushToast(message, tone);
    },
    [commit, pushToast]
  );

  const renamePet = useCallback(
    (petId, name) => {
      const clean = (name || '').trim();
      if (!clean) return;
      commit((prev) => ({
        ...prev,
        pets: prev.pets.map((p) => (p.id === petId ? { ...p, name: clean } : p)),
      }));
      pushToast('Companion renamed.', 'info');
    },
    [commit, pushToast]
  );

  const setActivePet = useCallback(
    (petId) => {
      commit((prev) => ({
        ...prev,
        activePet: prev.activePet === petId ? null : petId,
      }));
    },
    [commit]
  );

  // ---- outfits ----
  const setOutfit = useCallback(
    (outfitId) => {
      let ok = false;
      commit((prev) => {
        if (!prev.unlockedOutfits.includes(outfitId)) return prev;
        ok = true;
        return {
          ...prev,
          outfitId,
          character: prev.character ? { ...prev.character, outfitId } : prev.character,
        };
      });
      pushToast(
        ok ? `${getOutfit(outfitId).name} equipped.` : 'That outfit is still locked.',
        ok ? 'success' : 'danger'
      );
    },
    [commit, pushToast]
  );

  // ---- settings ----
  const updateSetting = useCallback(
    (key, value) => {
      commit((prev) => ({ ...prev, settings: { ...prev.settings, [key]: value } }));
    },
    [commit]
  );

  const resetSave = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('[MusicMORPG] Could not clear save.', error);
    }
    const fresh = emptySave();
    saveRef.current = fresh;
    setSave(fresh);
    setLastLevelUp(null);
    pushToast('Save wiped. A new stage awaits.', 'danger');
  }, [pushToast]);

  const dismissLevelUp = useCallback(() => setLastLevelUp(null), []);
  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ---- derived views ----
  const character = save.character;
  const derived = useMemo(
    () => (character ? deriveStats({ ...character, equipped: save.equipped, activePet: save.activePet }) : null),
    [character, save.equipped, save.activePet]
  );

  const levelInfo = useMemo(() => {
    if (!character) return { level: 1, xpIntoLevel: 0, xpForLevel: xpForNextLevel(1) };
    return levelFromXp(character.xp || 0);
  }, [character]);

  const value = useMemo(
    () => ({
      ready,
      save,
      settings: save.settings,
      character,
      derived,
      levelInfo,
      toasts,
      lastLevelUp,
      createCharacter,
      renameCharacter,
      grantXp,
      grantGold,
      setHealth,
      restAtTavern,
      acceptQuest,
      abandonQuest,
      finishQuest,
      buyItem,
      sellItem,
      useItem,
      equipItem,
      unequipSlot,
      adoptPet,
      renamePet,
      setActivePet,
      setOutfit,
      updateSetting,
      resetSave,
      dismissLevelUp,
      dismissToast,
      pushToast,
      isQuestCompleted: (id) => save.completedQuests.includes(id),
      isQuestActive: (id) => save.activeQuests.some((q) => q.questId === id),
      itemCount: (id) => save.inventory[id] || 0,
      ownedPet: (id) => save.pets.find((p) => p.id === id) || null,
      outfitUnlocked: (id) => save.unlockedOutfits.includes(id),
    }),
    [
      ready,
      save,
      character,
      derived,
      levelInfo,
      toasts,
      lastLevelUp,
      createCharacter,
      renameCharacter,
      grantXp,
      grantGold,
      setHealth,
      restAtTavern,
      acceptQuest,
      abandonQuest,
      finishQuest,
      buyItem,
      sellItem,
      useItem,
      equipItem,
      unequipSlot,
      adoptPet,
      renamePet,
      setActivePet,
      setOutfit,
      updateSetting,
      resetSave,
      dismissLevelUp,
      dismissToast,
      pushToast,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>');
  return ctx;
};

export { STORAGE_KEY, SAVE_VERSION };
