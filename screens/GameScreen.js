// GameScreen — the stage. Quest board (5 tiers), turn-based encounter, level-up.
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Avatar from '../components/Avatar';
import {
  Button,
  Card,
  Divider,
  KeyValueRow,
  Pill,
  ProgressBar,
  SectionTitle,
} from '../components/ui';
import { QUEST_TIERS, QUESTS, getQuest, getTier } from '../data/quests';
import { getItem } from '../data/items';
import { questSuccessChance } from '../engine/stats';
import { createEncounter, resolveTurn } from '../engine/combat';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing, typography } from '../theme';

const MAX_WIDTH = 620;

const StatBadge = ({ icon, value, label, color }) => (
  <View style={styles.statBadge}>
    <Text style={styles.statBadgeIcon}>{icon}</Text>
    <View>
      <Text style={[styles.statBadgeValue, { color }]}>{value}</Text>
      <Text style={styles.statBadgeLabel}>{label}</Text>
    </View>
  </View>
);

const GameScreen = () => {
  const {
    character,
    derived,
    levelInfo,
    save,
    lastLevelUp,
    dismissLevelUp,
    acceptQuest,
    abandonQuest,
    finishQuest,
    restAtTavern,
    isQuestCompleted,
    isQuestActive,
  } = useGame();

  const insets = useSafeAreaInsets();
  // Start on the highest tier the player has actually unlocked, so the board is
  // never fully locked on first launch.
  const [tierId, setTierId] = useState(() => {
    const startLevel = levelInfo.level || 1;
    const unlocked = QUEST_TIERS.filter((t) => t.levelReq <= startLevel);
    return (unlocked[unlocked.length - 1] || QUEST_TIERS[0]).id;
  });
  const [encounter, setEncounter] = useState(null);
  const [outcome, setOutcome] = useState(null); // reward summary after a fight
  const [expandedQuest, setExpandedQuest] = useState(null);

  const tier = useMemo(() => getTier(tierId), [tierId]);
  const visibleQuests = useMemo(() => QUESTS.filter((q) => q.tier === tierId), [tierId]);

  if (!character || !derived) return null;

  const level = levelInfo.level;

  const startEncounter = (questId) => {
    const quest = getQuest(questId);
    if (!quest) return;
    setOutcome(null);
    setEncounter(createEncounter(character, quest, getTier(quest.tier)));
    setExpandedQuest(null);
  };

  const act = (action) => {
    if (!encounter) return;
    const next = resolveTurn(character, encounter, action, save.settings?.difficulty);
    setEncounter(next);

    if (next.status !== 'active') {
      const summary = finishQuest(encounter.questId, next.status === 'victory');
      setOutcome({
        victory: next.status === 'victory',
        quest: getQuest(encounter.questId),
        ...(summary || { xp: 0, gold: 0, items: [] }),
      });
    }
  };

  const closeEncounter = () => {
    setEncounter(null);
    setOutcome(null);
  };

  // ---------- Encounter view ----------
  if (encounter) {
    const quest = getQuest(encounter.questId);
    const finished = encounter.status !== 'active';

    return (
      <View style={styles.root}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.encounterHeader}>
              <Pill text={`${getTier(encounter.tierId).name} · Turn ${encounter.turn}`} color={getTier(encounter.tierId).color} />
              <Pressable onPress={closeEncounter} hitSlop={12}>
                <Text style={styles.closeX}>✕</Text>
              </Pressable>
            </View>

            <Text style={styles.encounterTitle}>{quest.title}</Text>
            <Text style={styles.encounterLocation}>{quest.location}</Text>

            {/* Enemy */}
            <Card style={styles.enemyCard}>
              <View style={styles.enemyTop}>
                <Text style={styles.enemyIcon}>{encounter.enemy.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.enemyName}>{encounter.enemy.name}</Text>
                  <Text style={styles.enemyMeta}>
                    ATK {encounter.enemy.attack} · DEF {encounter.enemy.defense}
                  </Text>
                </View>
              </View>
              <ProgressBar
                value={encounter.enemyHp}
                max={encounter.enemyHpMax}
                color={colors.danger}
                height={10}
                showLabel
                label="Enemy health"
              />
            </Card>

            {/* Player */}
            <Card style={styles.playerCard} tone="high">
              <View style={styles.playerTop}>
                <Avatar character={character} size={64} showBadge={false} showPet={false} />
                <View style={{ flex: 1, marginLeft: spacing(3) }}>
                  <Text style={styles.playerName}>{character.name}</Text>
                  <Text style={styles.enemyMeta}>
                    ATK {derived.attack} · DEF {derived.defense} · CRIT{' '}
                    {Math.round(derived.critChance * 100)}%
                  </Text>
                </View>
              </View>
              <ProgressBar
                value={encounter.playerHp}
                max={encounter.playerHpMax}
                color={colors.health}
                height={10}
                showLabel
                label="Your health"
              />
            </Card>

            {/* Log */}
            <SectionTitle>Combat log</SectionTitle>
            <Card style={styles.logCard}>
              {encounter.log.map((entry, index) => (
                <Text
                  key={entry.id}
                  style={[
                    styles.logLine,
                    entry.kind === 'crit' && { color: colors.gold },
                    entry.kind === 'ability' && { color: colors.accent },
                    entry.kind === 'enemy' && { color: colors.textDim },
                    entry.kind === 'victory' && { color: colors.success, fontWeight: '700' },
                    entry.kind === 'defeat' && { color: colors.danger, fontWeight: '700' },
                    index === encounter.log.length - 1 && styles.logLineLatest,
                  ]}
                >
                  {entry.text}
                </Text>
              ))}
            </Card>

            {/* Outcome */}
            {finished && outcome && (
              <Card
                style={[
                  styles.outcomeCard,
                  { borderColor: outcome.victory ? colors.success : colors.danger },
                ]}
              >
                <Text
                  style={[
                    styles.outcomeTitle,
                    { color: outcome.victory ? colors.success : colors.danger },
                  ]}
                >
                  {outcome.victory ? 'Victory' : 'Defeat'}
                </Text>
                <Text style={styles.outcomeBody}>
                  {outcome.victory
                    ? 'The room is yours. The score is closed.'
                    : 'You lose the beat. Someone carries you back to the Bellhouse.'}
                </Text>
                <Divider />
                <KeyValueRow label="XP gained" value={`+${outcome.xp}`} valueColor={colors.xp} />
                <KeyValueRow
                  label="Gold gained"
                  value={`+${outcome.gold}`}
                  valueColor={colors.gold}
                />
                {outcome.items?.length > 0 && (
                  <>
                    <Divider />
                    <Text style={styles.lootLabel}>Loot</Text>
                    {outcome.items.map((drop) => {
                      const item = getItem(drop.id);
                      return (
                        <KeyValueRow
                          key={drop.id}
                          label={`${item?.icon || '🎁'} ${item?.name || drop.id}`}
                          value={`×${drop.qty}`}
                          valueColor={colors.success}
                        />
                      );
                    })}
                  </>
                )}
                <Button
                  label="Return to the stage"
                  variant="primary"
                  onPress={closeEncounter}
                  style={{ marginTop: spacing(3) }}
                />
              </Card>
            )}

            {/* Actions */}
            {!finished && (
              <View style={styles.actions}>
                <Button
                  label="Strike"
                  icon="⚔️"
                  onPress={() => act('strike')}
                  variant="primary"
                  style={{ marginBottom: spacing(2) }}
                />
                <Button
                  label={derived.classDef.skills[0]}
                  icon="✨"
                  onPress={() => act('ability')}
                  variant="gold"
                  style={{ marginBottom: spacing(2) }}
                />
                <Button label="Guard" icon="🛡️" onPress={() => act('guard')} variant="ghost" />
              </View>
            )}

            <View style={{ height: Math.max(insets.bottom, 16) + 24 }} />
          </View>
        </ScrollView>
      </View>
    );
  }

  // ---------- Stage / quest board view ----------
  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Hero */}
          <View style={styles.heroRow}>
            <Avatar character={character} size={104} />
            <View style={styles.heroInfo}>
              <Text style={styles.heroEyebrow}>
                {derived.raceDef.name} · {derived.classDef.name}
              </Text>
              <Text style={styles.heroName} numberOfLines={2}>
                {character.name}
              </Text>
              <View style={styles.levelRow}>
                <Pill text={`Level ${level}`} color={colors.gold} filled size="sm" />
                <Pill
                  text={`${save.activeQuests.length} active`}
                  color={colors.accent}
                  size="sm"
                  style={{ marginLeft: 6 }}
                />
              </View>
            </View>
          </View>

          {/* Vitals */}
          <Card style={styles.vitalsCard}>
            <ProgressBar
              value={character.health ?? derived.maxHealth}
              max={derived.maxHealth}
              color={colors.health}
              height={9}
              showLabel
              label="Health"
            />
            <View style={{ height: spacing(3) }} />
            <ProgressBar
              value={levelInfo.xpIntoLevel}
              max={levelInfo.xpForLevel}
              color={colors.xp}
              height={9}
              showLabel
              label={`XP — level ${level}`}
            />
            <View style={styles.badgeRow}>
              <StatBadge icon="🪙" value={character.gold || 0} label="gold" color={colors.gold} />
              <StatBadge icon="⚔️" value={derived.attack} label="attack" color={colors.text} />
              <StatBadge icon="🛡️" value={derived.defense} label="defense" color={colors.text} />
              <StatBadge
                icon="🎯"
                value={`${Math.round(derived.critChance * 100)}%`}
                label="crit"
                color={colors.text}
              />
            </View>
            <Button
              label="Rest at the Bellhouse · 25g"
              variant="subtle"
              size="sm"
              onPress={restAtTavern}
              style={{ marginTop: spacing(3) }}
            />
          </Card>

          {/* Tier filter */}
          <SectionTitle>Quest board</SectionTitle>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tierRow}
          >
            {QUEST_TIERS.map((t) => {
              const locked = level < t.levelReq;
              const active = t.id === tierId;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => setTierId(t.id)}
                  style={[
                    styles.tierChip,
                    active && { borderColor: t.color, backgroundColor: 'rgba(255,255,255,0.05)' },
                  ]}
                >
                  <Text
                    style={[
                      styles.tierName,
                      { color: active ? t.color : locked ? colors.textMute : colors.textDim },
                    ]}
                  >
                    {t.name}
                  </Text>
                  <Text style={styles.tierReq}>
                    {locked ? `🔒 Lv ${t.levelReq}` : `Lv ${t.levelReq}+`}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.tierBlurb}>{tier.blurb}</Text>

          {/* Quest cards */}
          {visibleQuests.map((quest) => {
            const locked = level < tier.levelReq;
            const done = isQuestCompleted(quest.id);
            const tracking = isQuestActive(quest.id);
            const chance = questSuccessChance(character, quest, tier);
            const expanded = expandedQuest === quest.id;

            return (
              <Card key={quest.id} style={styles.questCard}>
                <Pressable onPress={() => setExpandedQuest(expanded ? null : quest.id)}>
                  <View style={styles.questTop}>
                    <Text style={styles.questIcon}>{quest.enemy.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.questTitle}>{quest.title}</Text>
                      <Text style={styles.questLocation}>{quest.location}</Text>
                    </View>
                    {done && <Pill text="Done" color={colors.success} size="sm" />}
                    {!done && tracking && <Pill text="Tracking" color={colors.accent} size="sm" />}
                  </View>

                  <Text style={styles.questHook} numberOfLines={expanded ? undefined : 2}>
                    {quest.hook}
                  </Text>

                  <View style={styles.rewardRow}>
                    <Text style={styles.rewardText}>✦ {quest.rewards.xp} XP</Text>
                    <Text style={[styles.rewardText, { color: colors.gold }]}>
                      🪙 {quest.rewards.gold}
                    </Text>
                    <Text style={[styles.rewardText, { color: colors.textMute }]}>
                      ⚔️ {quest.enemy.name}
                    </Text>
                    <Text style={[styles.rewardText, { color: colors.textMute }]}>
                      🎲 {Math.round(chance * 100)}%
                    </Text>
                  </View>
                </Pressable>

                {expanded && (
                  <View style={styles.questActions}>
                    <Button
                      label={done ? 'Replay encounter' : 'Embark'}
                      variant="gold"
                      size="sm"
                      disabled={locked}
                      onPress={() => startEncounter(quest.id)}
                      style={{ marginBottom: spacing(2) }}
                    />
                    {!done && (
                      <Button
                        label={tracking ? 'Drop from tracker' : 'Track quest'}
                        variant="ghost"
                        size="sm"
                        disabled={locked}
                        onPress={() =>
                          tracking ? abandonQuest(quest.id) : acceptQuest(quest.id)
                        }
                      />
                    )}
                    {locked && (
                      <Text style={styles.lockedNote}>
                        Reach level {tier.levelReq} to take this tier.
                      </Text>
                    )}
                  </View>
                )}
              </Card>
            );
          })}

          <View style={{ height: Math.max(insets.bottom, 16) + 24 }} />
        </View>
      </ScrollView>

      {/* Level-up modal */}
      <Modal visible={Boolean(lastLevelUp)} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalIcon}>🎉</Text>
            <Text style={styles.modalTitle}>Level {lastLevelUp?.level}</Text>
            <Text style={styles.modalBody}>
              Every stat rises, your health is restored, and the Scale takes notice. New outfits
              may have unlocked in the wardrobe.
            </Text>
            <Button label="Continue" variant="gold" onPress={dismissLevelUp} />
          </Card>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing(4), paddingTop: spacing(3) },
  content: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },

  heroRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing(4) },
  heroInfo: { flex: 1, marginLeft: spacing(3) },
  heroEyebrow: { ...typography.tiny, color: colors.textMute },
  heroName: { ...typography.display, fontSize: 24, color: colors.text, marginTop: 2 },
  levelRow: { flexDirection: 'row', marginTop: spacing(2), alignItems: 'center' },

  vitalsCard: { backgroundColor: colors.surface },
  badgeRow: { flexDirection: 'row', marginTop: spacing(4), marginHorizontal: -4 },
  statBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  statBadgeIcon: { fontSize: 15, marginRight: 5 },
  statBadgeValue: { ...typography.subtitle, fontSize: 14 },
  statBadgeLabel: { ...typography.tiny, color: colors.textMute, fontSize: 9 },

  tierRow: { paddingBottom: spacing(1), gap: 8 },
  tierChip: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: 8,
    minWidth: 82,
  },
  tierName: { ...typography.subtitle, fontSize: 14 },
  tierReq: { ...typography.tiny, color: colors.textMute, marginTop: 1, fontSize: 9 },
  tierBlurb: {
    ...typography.small,
    color: colors.textMute,
    fontStyle: 'italic',
    marginTop: spacing(2),
    marginBottom: spacing(1),
  },

  questCard: { marginTop: spacing(3), backgroundColor: colors.surface },
  questTop: { flexDirection: 'row', alignItems: 'flex-start' },
  questIcon: { fontSize: 22, marginRight: spacing(3), marginTop: 1 },
  questTitle: { ...typography.subtitle, color: colors.text },
  questLocation: { ...typography.tiny, color: colors.textMute, marginTop: 2, fontSize: 10 },
  questHook: {
    ...typography.small,
    color: colors.textDim,
    lineHeight: 18,
    marginTop: spacing(2.5),
  },
  rewardRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: spacing(2.5) },
  rewardText: { ...typography.tiny, color: colors.xp, fontSize: 10 },
  questActions: { marginTop: spacing(3) },
  lockedNote: { ...typography.small, color: colors.textMute, marginTop: spacing(2), textAlign: 'center' },

  encounterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(3),
  },
  closeX: { color: colors.textMute, fontSize: 18, fontWeight: '700' },
  encounterTitle: { ...typography.display, fontSize: 22, color: colors.text },
  encounterLocation: { ...typography.small, color: colors.textMute, marginTop: 2 },

  enemyCard: { marginTop: spacing(4), backgroundColor: colors.surface },
  enemyTop: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing(3) },
  enemyIcon: { fontSize: 30, marginRight: spacing(3) },
  enemyName: { ...typography.subtitle, color: colors.text },
  enemyMeta: { ...typography.tiny, color: colors.textMute, marginTop: 2, fontSize: 10 },

  playerCard: { marginTop: spacing(3) },
  playerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing(3) },
  playerName: { ...typography.subtitle, color: colors.text },

  logCard: { backgroundColor: colors.bgDeep, paddingVertical: spacing(3) },
  logLine: { ...typography.small, color: colors.textDim, lineHeight: 19, marginBottom: 3 },
  logLineLatest: { color: colors.text, fontWeight: '600' },

  actions: { marginTop: spacing(4) },

  outcomeCard: { marginTop: spacing(4), borderWidth: 1.5 },
  outcomeTitle: { ...typography.title, marginBottom: spacing(1) },
  outcomeBody: { ...typography.body, color: colors.textDim, lineHeight: 20 },
  lootLabel: { ...typography.tiny, color: colors.textMute, marginBottom: spacing(1) },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing(6),
  },
  modalCard: { width: '100%', maxWidth: 360, alignItems: 'center', backgroundColor: colors.surfaceAlt },
  modalIcon: { fontSize: 40, marginBottom: spacing(2) },
  modalTitle: { ...typography.display, fontSize: 24, color: colors.gold, marginBottom: spacing(2) },
  modalBody: {
    ...typography.body,
    color: colors.textDim,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing(4),
  },
});

export default GameScreen;
