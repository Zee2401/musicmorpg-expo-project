// QuestsScreen — the tracker. Shows what you are carrying, the full catalogue
// across all five tiers, a quick-resolve option, and a completion log.
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
import { ACTIVE_SLOTS, QUESTS, QUEST_TIERS, getQuest, getTier } from '../data/quests';
import { getItem } from '../data/items';
import { questSuccessChance } from '../engine/stats';
import { roll } from '../engine/random';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing, typography } from '../theme';

const MAX_WIDTH = 620;

const timeAgo = (timestamp) => {
  const diff = Math.max(0, Date.now() - timestamp);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const QuestsScreen = () => {
  const {
    character,
    levelInfo,
    save,
    acceptQuest,
    abandonQuest,
    finishQuest,
    isQuestCompleted,
    isQuestActive,
    pushToast,
  } = useGame();

  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('active'); // active | catalogue | log
  const [openTier, setOpenTier] = useState(null);
  const [resolving, setResolving] = useState(null);

  const level = levelInfo.level || 1;

  const tracked = useMemo(
    () =>
      save.activeQuests
        .map((entry) => ({ entry, quest: getQuest(entry.questId) }))
        .filter((row) => Boolean(row.quest)),
    [save.activeQuests]
  );

  const completedCount = save.completedQuests.length;
  const totalCount = QUESTS.length;

  const quickResolve = (quest) => {
    const tier = getTier(quest.tier);
    const chance = questSuccessChance(character, quest, tier);
    const won = roll(chance);
    setResolving(quest.id);
    finishQuest(quest.id, won);
    pushToast(
      won ? `${quest.title} cleared.` : `${quest.title} — you lost the beat.`,
      won ? 'success' : 'danger'
    );
    setTimeout(() => setResolving(null), 400);
  };

  if (!character) return null;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.heading}>Quests</Text>
          <Text style={styles.subheading}>
            {completedCount} of {totalCount} scores closed · {tracked.length}/{ACTIVE_SLOTS} tracked
          </Text>
          <ProgressBar
            value={completedCount}
            max={totalCount}
            color={colors.gold}
            height={6}
            showLabel
            label="Catalogue completion"
          />

          {/* Tabs */}
          <View style={styles.tabRow}>
            {[
              { id: 'active', label: `Tracked (${tracked.length})` },
              { id: 'catalogue', label: 'Catalogue' },
              { id: 'log', label: 'Log' },
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

          {/* ---------- TRACKED ---------- */}
          {tab === 'active' && (
            <>
              {tracked.length === 0 ? (
                <EmptyState
                  icon="📜"
                  title="Nothing tracked"
                  body="Open the Catalogue tab and track up to three quests, or pick them up from the Game tab's quest board."
                  action={
                    <Button
                      label="Browse the catalogue"
                      variant="primary"
                      onPress={() => setTab('catalogue')}
                    />
                  }
                />
              ) : (
                tracked.map(({ entry, quest }) => {
                  const tier = getTier(quest.tier);
                  const chance = questSuccessChance(character, quest, tier);
                  return (
                    <Card key={entry.questId} style={styles.questCard}>
                      <View style={styles.questTop}>
                        <Text style={styles.questIcon}>{quest.enemy.icon}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.questTitle}>{quest.title}</Text>
                          <Text style={styles.questLocation}>{quest.location}</Text>
                        </View>
                        <Pill text={tier.name} color={tier.color} size="sm" />
                      </View>

                      <Text style={styles.questHook}>{quest.hook}</Text>

                      <View style={styles.metaRow}>
                        <Text style={styles.metaText}>✦ {quest.rewards.xp} XP</Text>
                        <Text style={[styles.metaText, { color: colors.gold }]}>
                          🪙 {quest.rewards.gold}
                        </Text>
                        <Text style={[styles.metaText, { color: colors.textMute }]}>
                          🎲 {Math.round(chance * 100)}% odds
                        </Text>
                      </View>

                      <Divider />

                      <View style={styles.actionRow}>
                        <Button
                          label="Resolve encounter"
                          variant="gold"
                          size="sm"
                          fullWidth={false}
                          style={{ flex: 2, marginRight: spacing(2) }}
                          disabled={resolving === quest.id}
                          onPress={() => quickResolve(quest)}
                        />
                        <Button
                          label="Drop"
                          variant="ghost"
                          size="sm"
                          fullWidth={false}
                          style={{ flex: 1 }}
                          onPress={() => abandonQuest(quest.id)}
                        />
                      </View>
                      <Text style={styles.actionHint}>
                        Resolving rolls your odds now. For full turn-by-turn combat, take the quest
                        from the Game tab instead.
                      </Text>
                    </Card>
                  );
                })
              )}
            </>
          )}

          {/* ---------- CATALOGUE ---------- */}
          {tab === 'catalogue' && (
            <>
              {QUEST_TIERS.map((tier) => {
                const locked = level < tier.levelReq;
                const open = openTier === tier.id || (!openTier && tier.id === 'easy');
                const tierQuests = QUESTS.filter((q) => q.tier === tier.id);
                const cleared = tierQuests.filter((q) => isQuestCompleted(q.id)).length;
                return (
                  <Card key={tier.id} style={styles.tierCard}>
                    <Pressable
                      onPress={() => setOpenTier(openTier === tier.id ? null : tier.id)}
                      style={styles.tierHeader}
                    >
                      <View style={[styles.tierDot, { backgroundColor: tier.color }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.tierName, { color: tier.color }]}>{tier.name}</Text>
                        <Text style={styles.tierMeta}>
                          Lv {tier.levelReq}+ · {cleared}/{tierQuests.length} cleared
                        </Text>
                      </View>
                      {locked && <Pill text="Locked" color={colors.textMute} size="sm" />}
                      <Text style={styles.chevron}>{open ? '▴' : '▾'}</Text>
                    </Pressable>

                    {open && (
                      <View style={{ marginTop: spacing(2) }}>
                        <Text style={styles.tierBlurb}>{tier.blurb}</Text>
                        {tierQuests.map((quest) => {
                          const done = isQuestCompleted(quest.id);
                          const active = isQuestActive(quest.id);
                          const chance = questSuccessChance(character, quest, tier);
                          return (
                            <View key={quest.id} style={styles.catRow}>
                              <Text style={styles.catIcon}>{quest.enemy.icon}</Text>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.catTitle} numberOfLines={1}>
                                  {quest.title}
                                </Text>
                                <Text style={styles.catMeta}>
                                  ✦{quest.rewards.xp} · 🪙{quest.rewards.gold} · 🎲
                                  {Math.round(chance * 100)}%
                                </Text>
                              </View>
                              {done ? (
                                <Pill text="Done" color={colors.success} size="sm" />
                              ) : active ? (
                                <Pill text="Tracked" color={colors.accent} size="sm" />
                              ) : (
                                <Button
                                  label="Track"
                                  variant="subtle"
                                  size="sm"
                                  fullWidth={false}
                                  disabled={locked || tracked.length >= ACTIVE_SLOTS}
                                  onPress={() => acceptQuest(quest.id)}
                                />
                              )}
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </Card>
                );
              })}
            </>
          )}

          {/* ---------- LOG ---------- */}
          {tab === 'log' && (
            <>
              <SectionTitle>Recent outcomes</SectionTitle>
              {save.questLog.length === 0 ? (
                <EmptyState
                  icon="🗂️"
                  title="No history yet"
                  body="Every encounter you resolve or complete will be recorded here."
                />
              ) : (
                save.questLog.map((entry) => (
                  <Card key={entry.id} style={styles.logCard}>
                    <View style={styles.logTop}>
                      <Text style={styles.logIcon}>{entry.victory ? '✅' : '❌'}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.logTitle} numberOfLines={1}>
                          {entry.title}
                        </Text>
                        <Text style={styles.logMeta}>
                          {getTier(entry.tierId).name} · {timeAgo(entry.at)}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.logOutcome,
                          { color: entry.victory ? colors.success : colors.danger },
                        ]}
                      >
                        {entry.victory ? 'Won' : 'Lost'}
                      </Text>
                    </View>
                    <View style={[styles.metaRow, { marginTop: spacing(2) }]}>
                      <Text style={styles.metaText}>✦ {entry.xp} XP</Text>
                      <Text style={[styles.metaText, { color: colors.gold }]}>
                        🪙 {entry.gold}
                      </Text>
                      {entry.items.map((drop) => {
                        const item = getItem(drop.id);
                        return (
                          <Text key={drop.id} style={[styles.metaText, { color: colors.success }]}>
                            {item?.icon} ×{drop.qty}
                          </Text>
                        );
                      })}
                    </View>
                  </Card>
                ))
              )}

              <SectionTitle>Career totals</SectionTitle>
              <Card>
                <KeyValueRow label="Quests won" value={save.stats.questsWon} valueColor={colors.success} />
                <KeyValueRow label="Quests lost" value={save.stats.questsLost} valueColor={colors.danger} />
                <KeyValueRow label="Gold earned" value={save.stats.goldEarned} valueColor={colors.gold} />
                <KeyValueRow label="XP earned" value={save.stats.xpEarned} valueColor={colors.xp} />
                <KeyValueRow label="Items found" value={save.stats.itemsFound} />
              </Card>
            </>
          )}

          <View style={{ height: Math.max(insets.bottom, 16) + 24 }} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing(4), paddingTop: spacing(3) },
  content: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },

  heading: { ...typography.display, color: colors.text, marginBottom: spacing(1) },
  subheading: { ...typography.small, color: colors.textMute, marginBottom: spacing(3) },

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

  questCard: { marginTop: spacing(3), backgroundColor: colors.surface },
  questTop: { flexDirection: 'row', alignItems: 'flex-start' },
  questIcon: { fontSize: 22, marginRight: spacing(3) },
  questTitle: { ...typography.subtitle, color: colors.text },
  questLocation: { ...typography.tiny, color: colors.textMute, marginTop: 2, fontSize: 10 },
  questHook: { ...typography.small, color: colors.textDim, lineHeight: 18, marginTop: spacing(2.5) },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: spacing(2.5) },
  metaText: { ...typography.tiny, color: colors.xp, fontSize: 10 },
  actionRow: { flexDirection: 'row' },
  actionHint: { ...typography.tiny, color: colors.textMute, fontSize: 9, marginTop: spacing(2), lineHeight: 14 },

  tierCard: { marginTop: spacing(3), backgroundColor: colors.surface },
  tierHeader: { flexDirection: 'row', alignItems: 'center' },
  tierDot: { width: 10, height: 10, borderRadius: 99, marginRight: spacing(3) },
  tierName: { ...typography.subtitle, fontSize: 15 },
  tierMeta: { ...typography.tiny, color: colors.textMute, marginTop: 2, fontSize: 10 },
  chevron: { color: colors.textMute, marginLeft: spacing(2), fontSize: 12 },
  tierBlurb: { ...typography.small, color: colors.textMute, fontStyle: 'italic', marginBottom: spacing(2) },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing(2.5),
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  catIcon: { fontSize: 17, marginRight: spacing(3) },
  catTitle: { ...typography.body, color: colors.text, fontWeight: '600', fontSize: 13 },
  catMeta: { ...typography.tiny, color: colors.textMute, marginTop: 1, fontSize: 9 },

  logCard: { marginTop: spacing(2.5), backgroundColor: colors.surface, padding: spacing(3.5) },
  logTop: { flexDirection: 'row', alignItems: 'center' },
  logIcon: { fontSize: 16, marginRight: spacing(2.5) },
  logTitle: { ...typography.body, color: colors.text, fontWeight: '600', fontSize: 13 },
  logMeta: { ...typography.tiny, color: colors.textMute, marginTop: 1, fontSize: 9 },
  logOutcome: { ...typography.tiny, fontSize: 10, marginLeft: spacing(2) },
});

export default QuestsScreen;
