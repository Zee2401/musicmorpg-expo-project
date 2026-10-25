// CharacterScreen — the full sheet: stats with source breakdown, companion
// stable (tame + rename), outfit wardrobe, and equipment loadout.
import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Avatar from '../components/Avatar';
import {
  Button,
  Card,
  Divider,
  EmptyState,
  KeyValueRow,
  Pill,
  ProgressBar,
  SectionTitle,
} from '../components/ui';
import { PETS, PET_RARITY_COLORS, getPet } from '../data/pets';
import { OUTFITS } from '../data/outfits';
import { getItem } from '../data/items';
import { STAT_DESCRIPTIONS, STAT_ICONS, STAT_KEYS, STAT_LABELS, getRace } from '../data/races';
import { getClass } from '../data/classes';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing, typography } from '../theme';

const MAX_WIDTH = 620;
const SLOTS = [
  { key: 'weapon', label: 'Weapon', icon: '⚔️' },
  { key: 'armor', label: 'Armor', icon: '🧥' },
  { key: 'head', label: 'Head', icon: '👑' },
  { key: 'trinket', label: 'Trinket', icon: '🎯' },
];

// ---------- Tame pet modal ----------
const TameModal = ({ visible, pet, onClose, onConfirm, gold, level }) => {
  const [name, setName] = useState('');

  React.useEffect(() => {
    if (visible && pet) setName(pet.name);
  }, [visible, pet]);

  if (!pet) return null;

  const tooLowLevel = level < pet.minLevel;
  const tooPoor = gold < pet.cost;
  const blocked = tooLowLevel || tooPoor;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Card style={styles.modalCard}>
          <Text style={styles.modalPetIcon}>{pet.icon}</Text>
          <Text style={styles.modalTitle}>{pet.name}</Text>
          <Pill
            text={`${pet.rarity} companion`}
            color={PET_RARITY_COLORS[pet.rarity]}
            size="sm"
            style={{ alignSelf: 'center', marginTop: 4 }}
          />
          <Text style={styles.modalFlavor}>{pet.flavor}</Text>

          <Divider />

          <KeyValueRow
            label="Taming cost"
            value={`${pet.cost} gold`}
            valueColor={tooPoor ? colors.danger : colors.gold}
          />
          <KeyValueRow
            label="Level required"
            value={`${pet.minLevel}`}
            valueColor={tooLowLevel ? colors.danger : colors.text}
          />
          <KeyValueRow
            label="Bonus"
            value={Object.entries(pet.bonus)
              .map(([k, v]) => `+${v} ${STAT_LABELS[k]}`)
              .join(', ')}
            valueColor={colors.success}
          />

          <Text style={styles.modalInputLabel}>Name your companion</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={pet.name}
            placeholderTextColor={colors.textMute}
            style={styles.input}
            maxLength={20}
          />

          <Button
            label={blocked ? (tooLowLevel ? `Requires level ${pet.minLevel}` : 'Not enough gold') : 'Tame'}
            variant="gold"
            disabled={blocked}
            onPress={() => {
              onConfirm(pet.id, name);
              onClose();
            }}
            style={{ marginTop: spacing(3) }}
          />
          <Button
            label="Cancel"
            variant="ghost"
            onPress={onClose}
            style={{ marginTop: spacing(2) }}
          />
        </Card>
      </View>
    </Modal>
  );
};

// ---------- Rename modal (works for pets) ----------
const RenameModal = ({ visible, initial, title, onClose, onConfirm }) => {
  const [value, setValue] = useState(initial || '');

  React.useEffect(() => {
    if (visible) setValue(initial || '');
  }, [visible, initial]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Card style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            style={styles.input}
            maxLength={20}
            autoFocus
            placeholderTextColor={colors.textMute}
          />
          <Button
            label="Save"
            variant="primary"
            disabled={!value.trim()}
            onPress={() => {
              onConfirm(value.trim());
              onClose();
            }}
            style={{ marginTop: spacing(3) }}
          />
          <Button label="Cancel" variant="ghost" onPress={onClose} style={{ marginTop: spacing(2) }} />
        </Card>
      </View>
    </Modal>
  );
};

const CharacterScreen = () => {
  const {
    character,
    derived,
    levelInfo,
    save,
    adoptPet,
    renamePet,
    setActivePet,
    setOutfit,
    equipItem,
    unequipSlot,
    outfitUnlocked,
    ownedPet,
  } = useGame();

  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('stats'); // stats | pets | wardrobe | loadout
  const [tameTarget, setTameTarget] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);

  if (!character || !derived) return null;

  const level = levelInfo.level;
  const classDef = getClass(character.classId);
  const raceDef = getRace(character.raceId);
  const activePetData = save.activePet ? getPet(save.activePet) : null;
  const activePetRecord = save.activePet ? ownedPet(save.activePet) : null;

  // Where each stat point comes from — makes class/race choices readable.
  const statSources = (key) => {
    const base = 4;
    const fromClass = classDef.bonuses[key] || 0;
    const fromRace = raceDef.bonuses[key] || 0;
    const fromLevel = Math.floor((level - 1) / 2);
    const total = derived.stats[key] || 0;
    const fromGear = Math.max(0, total - base - fromClass - fromRace - fromLevel);
    return [
      { label: 'Base', value: base },
      { label: classDef.name, value: fromClass },
      { label: raceDef.name, value: fromRace },
      { label: 'Levels', value: fromLevel },
      { label: 'Gear & pet', value: fromGear },
    ].filter((s) => s.value > 0);
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Hero card */}
          <Card style={styles.heroCard} tone="high">
            <View style={styles.heroTop}>
              <Avatar character={character} size={118} />
              <View style={styles.heroInfo}>
                <Text style={styles.heroName} numberOfLines={2}>
                  {character.name}
                </Text>
                <Text style={styles.heroMeta}>
                  {raceDef.icon} {raceDef.name}
                </Text>
                <Text style={styles.heroMeta}>
                  {classDef.icon} {classDef.name}
                </Text>
                <View style={styles.pills}>
                  <Pill text={`Lv ${level}`} color={colors.gold} filled size="sm" />
                  <Pill text={raceDef.trait.name} color={colors.info} size="sm" style={{ marginLeft: 6 }} />
                </View>
              </View>
            </View>

            <View style={{ marginTop: spacing(4) }}>
              <ProgressBar
                value={character.health ?? derived.maxHealth}
                max={derived.maxHealth}
                color={colors.health}
                height={8}
                showLabel
                label="Health"
              />
              <View style={{ height: spacing(2.5) }} />
              <ProgressBar
                value={levelInfo.xpIntoLevel}
                max={levelInfo.xpForLevel}
                color={colors.xp}
                height={8}
                showLabel
                label="Experience"
              />
            </View>

            <View style={styles.goldRow}>
              <Text style={styles.goldText}>🪙 {character.gold || 0} gold</Text>
              {activePetRecord && (
                <Text style={styles.petInline}>
                  {activePetData?.icon} {activePetRecord.name}
                </Text>
              )}
            </View>
          </Card>

          {/* Tabs */}
          <View style={styles.tabRow}>
            {[
              { id: 'stats', label: 'Stats' },
              { id: 'pets', label: 'Pets' },
              { id: 'wardrobe', label: 'Wardrobe' },
              { id: 'loadout', label: 'Loadout' },
            ].map((t) => (
              <Pressable
                key={t.id}
                onPress={() => setTab(t.id)}
                style={[styles.tabChip, tab === t.id && styles.tabChipActive]}
              >
                <Text style={[styles.tabText, tab === t.id && styles.tabTextActive]}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* ---------- STATS ---------- */}
          {tab === 'stats' && (
            <>
              <SectionTitle>Attributes</SectionTitle>
              {STAT_KEYS.map((key) => (
                <Card key={key} style={styles.statCard}>
                  <View style={styles.statTop}>
                    <Text style={styles.statIcon}>{STAT_ICONS[key]}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.statName}>{STAT_LABELS[key]}</Text>
                      <Text style={styles.statDesc}>{STAT_DESCRIPTIONS[key]}</Text>
                    </View>
                    <View style={styles.statValueWrap}>
                      <Text style={styles.statValue}>{derived.stats[key]}</Text>
                    </View>
                  </View>
                  <View style={styles.sourceRow}>
                    {statSources(key).map((source) => (
                      <Text key={source.label} style={styles.sourceText}>
                        {source.label} +{source.value}
                      </Text>
                    ))}
                  </View>
                </Card>
              ))}

              <SectionTitle>Combat</SectionTitle>
              <Card>
                <KeyValueRow label="Attack" value={derived.attack} />
                <KeyValueRow label="Defense" value={derived.defense} />
                <KeyValueRow
                  label="Crit chance"
                  value={`${Math.round(derived.critChance * 100)}%`}
                  valueColor={colors.gold}
                />
                <KeyValueRow label="Crit multiplier" value={`×${derived.critMultiplier.toFixed(2)}`} />
                <KeyValueRow
                  label="Damage bonus"
                  value={`+${Math.round(derived.damageBonus * 100)}%`}
                />
                <KeyValueRow
                  label="Damage reduction"
                  value={`${Math.round(derived.armor * 100)}%`}
                />
                <KeyValueRow label="Max health" value={derived.maxHealth} valueColor={colors.health} />
                <KeyValueRow label="XP bonus" value={`+${Math.round(derived.xpBonus * 100)}%`} />
                <KeyValueRow label="Gold bonus" value={`+${Math.round(derived.goldBonus * 100)}%`} />
              </Card>

              <SectionTitle>Passives</SectionTitle>
              <Card>
                <View style={styles.passiveRow}>
                  <Pill text={classDef.passive.name} color={classDef.color} size="sm" />
                  <Text style={styles.passiveText}>{classDef.passive.description}</Text>
                </View>
                <Divider />
                <View style={styles.passiveRow}>
                  <Pill text={raceDef.trait.name} color={colors.info} size="sm" />
                  <Text style={styles.passiveText}>{raceDef.trait.description}</Text>
                </View>
                <Divider />
                <View style={styles.skillWrap}>
                  {classDef.skills.map((skill) => (
                    <View key={skill} style={styles.skillChip}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            </>
          )}

          {/* ---------- PETS ---------- */}
          {tab === 'pets' && (
            <>
              <SectionTitle>Your companions ({save.pets.length})</SectionTitle>
              {save.pets.length === 0 ? (
                <EmptyState
                  icon="🐾"
                  title="No companions yet"
                  body="Tame one below. Companions add permanent stat bonuses and follow you into every encounter."
                />
              ) : (
                save.pets.map((owned) => {
                  const pet = getPet(owned.id);
                  const isActive = save.activePet === owned.id;
                  return (
                    <Card key={owned.id} style={[styles.petCard, isActive && { borderColor: colors.success }]}>
                      <View style={styles.petTop}>
                        <Text style={styles.petIcon}>{pet?.icon}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.petName}>{owned.name}</Text>
                          <Text style={styles.petMeta}>
                            {pet?.name} · {pet?.rarity}
                          </Text>
                        </View>
                        {isActive && <Pill text="Active" color={colors.success} size="sm" />}
                      </View>
                      <Text style={styles.petFlavor}>{pet?.flavor}</Text>
                      <View style={styles.petBonusRow}>
                        {Object.entries(pet?.bonus || {}).map(([k, v]) => (
                          <Text key={k} style={styles.petBonus}>
                            +{v} {STAT_LABELS[k]}
                          </Text>
                        ))}
                      </View>
                      <View style={styles.petActions}>
                        <Button
                          label={isActive ? 'Stand down' : 'Set active'}
                          variant={isActive ? 'ghost' : 'subtle'}
                          size="sm"
                          fullWidth={false}
                          style={{ flex: 1, marginRight: spacing(2) }}
                          onPress={() => setActivePet(owned.id)}
                        />
                        <Button
                          label="Rename"
                          variant="ghost"
                          size="sm"
                          fullWidth={false}
                          style={{ flex: 1 }}
                          onPress={() => setRenameTarget({ id: owned.id, name: owned.name })}
                        />
                      </View>
                    </Card>
                  );
                })
              )}

              <SectionTitle>Companion stable</SectionTitle>
              {PETS.map((pet) => {
                const owned = save.pets.some((p) => p.id === pet.id);
                const tooLow = level < pet.minLevel;
                return (
                  <Card key={pet.id} style={styles.petCard}>
                    <View style={styles.petTop}>
                      <Text style={[styles.petIcon, !owned && { opacity: 0.5 }]}>{pet.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.petName}>{pet.name}</Text>
                        <Text style={styles.petMeta}>
                          {pet.rarity} · Lv {pet.minLevel}+ · 🪙 {pet.cost}
                        </Text>
                      </View>
                      {owned ? (
                        <Pill text="Tamed" color={colors.success} size="sm" />
                      ) : (
                        <Pill
                          text={tooLow ? `Lv ${pet.minLevel}` : 'Available'}
                          color={tooLow ? colors.textMute : PET_RARITY_COLORS[pet.rarity]}
                          size="sm"
                        />
                      )}
                    </View>
                    <Text style={styles.petFlavor}>{pet.flavor}</Text>
                    {!owned && (
                      <Button
                        label={tooLow ? `Requires level ${pet.minLevel}` : `Tame · ${pet.cost}g`}
                        variant="subtle"
                        size="sm"
                        disabled={tooLow}
                        onPress={() => setTameTarget(pet)}
                        style={{ marginTop: spacing(2) }}
                      />
                    )}
                  </Card>
                );
              })}
            </>
          )}

          {/* ---------- WARDROBE ---------- */}
          {tab === 'wardrobe' && (
            <>
              <Text style={styles.sectionHint}>
                Outfits are earned by leveling and completing quests. Equipping one is purely
                cosmetic, but the wardrobe remembers.
              </Text>
              {OUTFITS.map((outfit) => {
                const unlocked = outfitUnlocked(outfit.id);
                const equipped = (character.outfitId || save.outfitId) === outfit.id;
                const req = outfit.requirement;
                const reqText =
                  req.type === 'level' ? `Reach level ${req.level}` : `Complete ${req.count} quests`;
                return (
                  <Card
                    key={outfit.id}
                    style={[styles.outfitCard, equipped && { borderColor: colors.gold }]}
                  >
                    <View style={styles.outfitTop}>
                      <View style={[styles.outfitSwatch, { backgroundColor: outfit.tint }]}>
                        <Text style={styles.outfitIcon}>{outfit.icon}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.outfitName}>{outfit.name}</Text>
                        <Text style={styles.outfitReq}>
                          {unlocked ? 'Unlocked' : `🔒 ${reqText}`}
                        </Text>
                      </View>
                      {equipped && <Pill text="Worn" color={colors.gold} filled size="sm" />}
                    </View>
                    <Text style={styles.outfitDesc}>{outfit.description}</Text>
                    <Button
                      label={equipped ? 'Currently worn' : unlocked ? 'Wear this' : 'Locked'}
                      variant={equipped ? 'ghost' : 'subtle'}
                      size="sm"
                      disabled={!unlocked || equipped}
                      onPress={() => setOutfit(outfit.id)}
                      style={{ marginTop: spacing(2) }}
                    />
                  </Card>
                );
              })}
            </>
          )}

          {/* ---------- LOADOUT ---------- */}
          {tab === 'loadout' && (
            <>
              <SectionTitle>Equipped</SectionTitle>
              <Card>
                {SLOTS.map((slot) => {
                  const itemId = save.equipped[slot.key];
                  const item = itemId ? getItem(itemId) : null;
                  return (
                    <View key={slot.key} style={styles.slotRow}>
                      <Text style={styles.slotIcon}>{slot.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.slotLabel}>{slot.label}</Text>
                        <Text style={styles.slotValue}>{item ? item.name : '— empty —'}</Text>
                      </View>
                      {item && (
                        <Pressable onPress={() => unequipSlot(slot.key)} hitSlop={10}>
                          <Text style={styles.removeText}>Remove</Text>
                        </Pressable>
                      )}
                    </View>
                  );
                })}
              </Card>

              <SectionTitle>Available gear</SectionTitle>
              {Object.entries(save.inventory).filter(
                ([id, qty]) => qty > 0 && getItem(id)?.type === 'equipment'
              ).length === 0 ? (
                <EmptyState
                  icon="⚔️"
                  title="No equipment owned"
                  body="Buy gear from the Inventory tab, or win it from higher-tier quests."
                />
              ) : (
                Object.entries(save.inventory)
                  .filter(([id, qty]) => qty > 0 && getItem(id)?.type === 'equipment')
                  .map(([id, qty]) => {
                    const item = getItem(id);
                    const equipped = Object.values(save.equipped).includes(id);
                    return (
                      <Card key={id} style={styles.gearCard}>
                        <View style={styles.gearTop}>
                          <Text style={styles.gearIcon}>{item.icon}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.gearName}>{item.name}</Text>
                            <Text style={styles.gearSlot}>
                              {item.slot} · ×{qty}
                            </Text>
                          </View>
                          {equipped && <Pill text="On" color={colors.success} size="sm" />}
                        </View>
                        <Text style={styles.gearDesc}>{item.description}</Text>
                        <Button
                          label={equipped ? 'Equipped' : 'Equip'}
                          variant={equipped ? 'ghost' : 'subtle'}
                          size="sm"
                          disabled={equipped}
                          onPress={() => equipItem(id)}
                          style={{ marginTop: spacing(2) }}
                        />
                      </Card>
                    );
                  })
              )}
            </>
          )}

          <View style={{ height: Math.max(insets.bottom, 16) + 24 }} />
        </View>
      </ScrollView>

      <TameModal
        visible={Boolean(tameTarget)}
        pet={tameTarget}
        level={level}
        gold={character.gold || 0}
        onClose={() => setTameTarget(null)}
        onConfirm={adoptPet}
      />

      <RenameModal
        visible={Boolean(renameTarget)}
        initial={renameTarget?.name}
        title="Rename companion"
        onClose={() => setRenameTarget(null)}
        onConfirm={(value) => renameTarget && renamePet(renameTarget.id, value)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing(4), paddingTop: spacing(3) },
  content: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },

  heroCard: {},
  heroTop: { flexDirection: 'row', alignItems: 'center' },
  heroInfo: { flex: 1, marginLeft: spacing(3) },
  heroName: { ...typography.title, color: colors.text },
  heroMeta: { ...typography.small, color: colors.textDim, marginTop: 3 },
  pills: { flexDirection: 'row', alignItems: 'center', marginTop: spacing(2), flexWrap: 'wrap' },
  goldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing(3),
  },
  goldText: { ...typography.small, color: colors.gold, fontWeight: '700' },
  petInline: { ...typography.small, color: colors.textDim },

  tabRow: { flexDirection: 'row', marginTop: spacing(5), gap: 6 },
  tabChip: {
    flex: 1,
    paddingVertical: spacing(2),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  tabChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  tabText: { ...typography.small, color: colors.textDim, fontSize: 11, fontWeight: '700' },
  tabTextActive: { color: colors.bgDeep },

  statCard: { marginBottom: spacing(2.5), padding: spacing(3.5) },
  statTop: { flexDirection: 'row', alignItems: 'center' },
  statIcon: { fontSize: 20, marginRight: spacing(3) },
  statName: { ...typography.subtitle, fontSize: 14, color: colors.text },
  statDesc: { ...typography.tiny, color: colors.textMute, marginTop: 1, fontSize: 10 },
  statValue: { ...typography.title, fontSize: 20, color: colors.gold },
  statValueWrap: {
    minWidth: 44,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing(2),
  },
  sourceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing(2) },
  sourceText: { ...typography.tiny, color: colors.textDim, fontSize: 10 },

  passiveRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  passiveText: { ...typography.small, color: colors.textDim, flexShrink: 1, lineHeight: 18 },
  skillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  skillChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing(2.5),
    paddingVertical: 3,
  },
  skillText: { ...typography.tiny, color: colors.textDim, fontSize: 9 },

  petCard: { marginTop: spacing(3), backgroundColor: colors.surface },
  petTop: { flexDirection: 'row', alignItems: 'center' },
  petIcon: { fontSize: 28, marginRight: spacing(3) },
  petName: { ...typography.subtitle, color: colors.text },
  petMeta: { ...typography.tiny, color: colors.textMute, marginTop: 2, fontSize: 10 },
  petFlavor: { ...typography.small, color: colors.textMute, lineHeight: 18, marginTop: spacing(2), fontStyle: 'italic' },
  petBonusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing(2) },
  petBonus: { ...typography.tiny, color: colors.success, fontSize: 10 },
  petActions: { flexDirection: 'row', marginTop: spacing(3) },

  sectionHint: {
    ...typography.small,
    color: colors.textMute,
    lineHeight: 18,
    marginTop: spacing(4),
  },
  outfitCard: { marginTop: spacing(3), backgroundColor: colors.surface },
  outfitTop: { flexDirection: 'row', alignItems: 'center' },
  outfitSwatch: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing(3),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  outfitIcon: { fontSize: 20 },
  outfitName: { ...typography.subtitle, color: colors.text },
  outfitReq: { ...typography.tiny, color: colors.textMute, marginTop: 2, fontSize: 10 },
  outfitDesc: { ...typography.small, color: colors.textMute, lineHeight: 18, marginTop: spacing(2) },

  slotRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing(2.5) },
  slotIcon: { fontSize: 18, marginRight: spacing(3), width: 24 },
  slotLabel: { ...typography.tiny, color: colors.textMute, fontSize: 9 },
  slotValue: { ...typography.body, color: colors.text, fontWeight: '600' },
  removeText: { ...typography.tiny, color: colors.danger, fontSize: 10 },

  gearCard: { marginTop: spacing(2.5), backgroundColor: colors.surface },
  gearTop: { flexDirection: 'row', alignItems: 'center' },
  gearIcon: { fontSize: 22, marginRight: spacing(3) },
  gearName: { ...typography.subtitle, fontSize: 14, color: colors.text },
  gearSlot: { ...typography.tiny, color: colors.textMute, marginTop: 1, fontSize: 10 },
  gearDesc: { ...typography.small, color: colors.textMute, marginTop: spacing(2), lineHeight: 18 },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing(6),
  },
  modalCard: { width: '100%', maxWidth: 360, backgroundColor: colors.surfaceAlt },
  modalPetIcon: { fontSize: 42, textAlign: 'center', marginBottom: spacing(2) },
  modalTitle: { ...typography.title, color: colors.text, textAlign: 'center' },
  modalFlavor: {
    ...typography.small,
    color: colors.textMute,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: spacing(2),
  },
  modalInputLabel: {
    ...typography.tiny,
    color: colors.textMute,
    marginTop: spacing(4),
    marginBottom: spacing(1.5),
  },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2.5),
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    outlineStyle: 'none',
  },
});

export default CharacterScreen;
