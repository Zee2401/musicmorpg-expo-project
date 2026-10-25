// SettingsScreen — gameplay/audio/accessibility preferences, save management,
// and a read-only look at the save file.
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Button,
  Card,
  Divider,
  KeyValueRow,
  Pill,
  SectionTitle,
} from '../components/ui';
import { STORAGE_KEY, useGame } from '../state/GameContext';
import { MAX_LEVEL } from '../engine/stats';
import { QUESTS } from '../data/quests';
import { colors, radius, spacing, typography } from '../theme';

const MAX_WIDTH = 620;

const SettingRow = ({ icon, label, description, value, onValueChange }) => (
  <View style={styles.settingRow}>
    <Text style={styles.settingIcon}>{icon}</Text>
    <View style={{ flex: 1 }}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingDesc}>{description}</Text>
    </View>
    <Switch
      value={Boolean(value)}
      onValueChange={onValueChange}
      trackColor={{ false: colors.surfaceHigh, true: colors.accentSoft }}
      thumbColor={value ? colors.accent : colors.textMute}
      ios_backgroundColor={colors.surfaceHigh}
    />
  </View>
);

const DifficultyOption = ({ id, name, description, active, onPress }) => (
  <Pressable onPress={onPress} style={[styles.diffOption, active && styles.diffOptionActive]}>
    <View style={styles.diffTop}>
      <Text style={[styles.diffName, active && { color: colors.accent }]}>{name}</Text>
      <View style={[styles.radio, active && { borderColor: colors.accent }]}>
        {active && <View style={styles.radioDot} />}
      </View>
    </View>
    <Text style={styles.diffDesc}>{description}</Text>
  </Pressable>
);

const SettingsScreen = () => {
  const {
    character,
    levelInfo,
    save,
    updateSetting,
    resetSave,
    renameCharacter,
  } = useGame();

  const settings = save.settings;

  const insets = useSafeAreaInsets();
  const [confirmReset, setConfirmReset] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  if (!character) return null;

  const level = levelInfo.level;

  const handleToggle = (key) => (value) => {
    updateSetting(key, value);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1200);
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.heading}>Settings</Text>
          <Text style={styles.subheading}>
            Preferences are saved automatically{savedFlash ? ' · saved' : ''}
          </Text>

          {/* Profile */}
          <SectionTitle>Profile</SectionTitle>
          <Card>
            <KeyValueRow label="Stage name" value={character.name} />
            <KeyValueRow label="Level" value={`${level} / ${MAX_LEVEL}`} valueColor={colors.gold} />
            <KeyValueRow label="Gold" value={character.gold || 0} valueColor={colors.gold} />
            <KeyValueRow
              label="Quests completed"
              value={`${save.completedQuests.length} / ${QUESTS.length}`}
            />
            <Divider />
            <Text style={styles.miniLabel}>Rename your performer</Text>
            <RenameInline value={character.name} onSave={renameCharacter} />
          </Card>

          {/* Audio & feedback */}
          <SectionTitle>Audio & feedback</SectionTitle>
          <Card>
            <SettingRow
              icon="🎵"
              label="Music"
              description="Ambient score on the stage and in encounters."
              value={settings.music}
              onValueChange={handleToggle('music')}
            />
            <Divider />
            <SettingRow
              icon="🔔"
              label="Sound effects"
              description="Strikes, crits, and level-up cues."
              value={settings.sfx}
              onValueChange={handleToggle('sfx')}
            />
            <Divider />
            <SettingRow
              icon="📳"
              label="Haptics"
              description="Vibration feedback on mobile devices."
              value={settings.haptics}
              onValueChange={handleToggle('haptics')}
            />
            <Divider />
            <SettingRow
              icon="📨"
              label="Notifications"
              description="Alerts when a tracked quest is ready."
              value={settings.notifications}
              onValueChange={handleToggle('notifications')}
            />
          </Card>

          {/* Accessibility & gameplay */}
          <SectionTitle>Gameplay</SectionTitle>
          <Card>
            <SettingRow
              icon="🌀"
              label="Reduced motion"
              description="Turns off animated transitions and scaling."
              value={settings.reducedMotion}
              onValueChange={handleToggle('reducedMotion')}
            />
            <Divider />
            <SettingRow
              icon="⚡"
              label="Auto-equip upgrades"
              description="Equip a better piece automatically when you find one."
              value={settings.autoEquip}
              onValueChange={handleToggle('autoEquip')}
            />
          </Card>

          <SectionTitle>Challenge</SectionTitle>
          <Text style={styles.hint}>
            Difficulty scales enemy health and damage. It does not affect rewards.
          </Text>
          {[
            {
              id: 'relaxed',
              name: 'Relaxed',
              description: 'Enemies deal 25% less damage. For the story.',
            },
            {
              id: 'normal',
              name: 'Normal',
              description: 'The intended balance of the Scale.',
            },
            {
              id: 'brutal',
              name: 'Brutal',
              description: 'Enemies deal 30% more damage. Every bar is a fight.',
            },
          ].map((option) => (
            <DifficultyOption
              key={option.id}
              {...option}
              active={settings.difficulty === option.id}
              onPress={() => updateSetting('difficulty', option.id)}
            />
          ))}

          {/* Save data */}
          <SectionTitle>Save data</SectionTitle>
          <Card>
            <KeyValueRow label="Storage key" value={STORAGE_KEY} />
            <KeyValueRow
              label="Active quests"
              value={`${save.activeQuests.length}`}
            />
            <KeyValueRow label="Companions" value={`${save.pets.length}`} />
            <KeyValueRow
              label="Outfits unlocked"
              value={`${save.unlockedOutfits.length}`}
            />
            <Divider />
            <Text style={styles.warnText}>
              Resetting wipes your character, inventory, quests, companions, and settings. It
              cannot be undone.
            </Text>
            <Button
              label="Reset save"
              variant="danger"
              onPress={() => setConfirmReset(true)}
              style={{ marginTop: spacing(3) }}
            />
          </Card>

          <SectionTitle>About</SectionTitle>
          <Card>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutTitle}>Music MORPG</Text>
              <Pill text="v1.0.0" color={colors.accent} size="sm" />
            </View>
            <Text style={styles.aboutBody}>
              A music-fantasy MORPG built with Expo and React Native. Runs in the browser on PC
              through Expo Web, and natively on Android and iOS from the same codebase.
            </Text>
            <Divider />
            <KeyValueRow label="Engine" value="React Native / Expo" />
            <KeyValueRow label="Storage" value="AsyncStorage" />
            <KeyValueRow label="Max level" value={MAX_LEVEL} />
          </Card>

          <View style={{ height: Math.max(insets.bottom, 16) + 32 }} />
        </View>
      </ScrollView>

      {/* Reset confirmation */}
      <Modal visible={confirmReset} transparent animationType="fade">
        <View style={styles.backdrop}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalIcon}>⚠️</Text>
            <Text style={styles.modalTitle}>Reset everything?</Text>
            <Text style={styles.modalBody}>
              {character.name} will be erased along with all progress. You will return to
              character creation.
            </Text>
            <Button
              label="Yes, wipe the stage"
              variant="danger"
              onPress={() => {
                setConfirmReset(false);
                resetSave();
              }}
            />
            <Button
              label="Keep my save"
              variant="ghost"
              onPress={() => setConfirmReset(false)}
              style={{ marginTop: spacing(2) }}
            />
          </Card>
        </View>
      </Modal>
    </View>
  );
};

// Small inline rename control (RN lacks a prompt dialog on web).
const RenameInline = ({ value, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!editing) {
    return (
      <Button
        label={`Rename from "${value}"`}
        variant="subtle"
        size="sm"
        onPress={() => {
          setDraft(value);
          setEditing(true);
        }}
        style={{ marginTop: spacing(2) }}
      />
    );
  }

  return (
    <View style={styles.renameRow}>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        style={styles.input}
        maxLength={24}
        autoFocus
        placeholderTextColor={colors.textMute}
      />
      <View style={styles.renameActions}>
        <Button
          label="Save"
          variant="primary"
          size="sm"
          fullWidth={false}
          style={{ flex: 1, marginRight: spacing(2) }}
          disabled={!draft.trim()}
          onPress={() => {
            onSave(draft);
            setEditing(false);
          }}
        />
        <Button
          label="Cancel"
          variant="ghost"
          size="sm"
          fullWidth={false}
          style={{ flex: 1 }}
          onPress={() => setEditing(false)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing(4), paddingTop: spacing(3) },
  content: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },

  heading: { ...typography.display, color: colors.text, marginBottom: spacing(1) },
  subheading: { ...typography.small, color: colors.textMute, marginBottom: spacing(1) },
  hint: { ...typography.small, color: colors.textMute, lineHeight: 18, marginBottom: spacing(1) },

  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing(2.5) },
  settingIcon: { fontSize: 18, marginRight: spacing(3), width: 24 },
  settingLabel: { ...typography.body, color: colors.text, fontWeight: '600' },
  settingDesc: { ...typography.tiny, color: colors.textMute, marginTop: 2, fontSize: 10, lineHeight: 14 },

  diffOption: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing(3),
    marginTop: spacing(2),
  },
  diffOptionActive: { borderColor: colors.accent, backgroundColor: colors.surfaceAlt },
  diffTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  diffName: { ...typography.subtitle, fontSize: 14, color: colors.text },
  diffDesc: { ...typography.tiny, color: colors.textMute, marginTop: 3, fontSize: 10, lineHeight: 14 },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 9, height: 9, borderRadius: 99, backgroundColor: colors.accent },

  miniLabel: { ...typography.tiny, color: colors.textMute, marginBottom: spacing(1) },
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
  renameRow: { marginTop: spacing(2) },
  renameActions: { flexDirection: 'row', marginTop: spacing(2) },

  warnText: { ...typography.small, color: colors.danger, lineHeight: 18 },

  aboutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  aboutTitle: { ...typography.subtitle, color: colors.text },
  aboutBody: { ...typography.small, color: colors.textMute, lineHeight: 18, marginTop: spacing(2) },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing(6),
  },
  modalCard: { width: '100%', maxWidth: 360, backgroundColor: colors.surfaceAlt, alignItems: 'center' },
  modalIcon: { fontSize: 36, marginBottom: spacing(2) },
  modalTitle: { ...typography.title, color: colors.text, marginBottom: spacing(2) },
  modalBody: {
    ...typography.body,
    color: colors.textDim,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing(4),
  },
});

export default SettingsScreen;
