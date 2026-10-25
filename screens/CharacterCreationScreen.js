// Character Creation — the first-launch gate and the "new game" screen.
// Three steps: identity, race, class — then appearance is folded into step 1
// so the player is never more than three taps from the stage.
import React, { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Avatar from '../components/Avatar';
import { Button, Card, Pill, ProgressBar } from '../components/ui';
import { CLASSES } from '../data/classes';
import { RACES, STAT_ICONS, STAT_KEYS, STAT_LABELS } from '../data/races';
import {
  EYE_COLORS,
  HAIR_COLORS,
  HAIR_STYLES,
  OUTFIT_TINTS,
  SKIN_TONES,
  VOICE_TYPES,
  defaultAppearance,
} from '../data/appearance';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing, typography } from '../theme';

const MAX_WIDTH = 620;

const STEP_TITLES = ['Identity', 'Race', 'Class'];

const Swatch = ({ selected, hex, onPress, label }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    style={[styles.swatch, { backgroundColor: hex }, selected && styles.swatchSelected]}
  />
);

const OptionRow = ({ options, value, onChange, renderLabel }) => (
  <View style={styles.optionRow}>
    {options.map((option) => {
      const active = value === option.id;
      return (
        <Pressable
          key={option.id}
          onPress={() => onChange(option.id)}
          style={[styles.chip, active && styles.chipActive]}
        >
          <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
            {renderLabel ? renderLabel(option) : option.name}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

const CharacterCreationScreen = () => {
  const { createCharacter } = useGame();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [classId, setClassId] = useState(CLASSES[0].id);
  const [raceId, setRaceId] = useState(RACES[0].id);
  const [appearance, setAppearance] = useState(defaultAppearance());

  const selectedClass = useMemo(() => CLASSES.find((c) => c.id === classId), [classId]);
  const selectedRace = useMemo(() => RACES.find((r) => r.id === raceId), [raceId]);

  const previewName = name.trim() || 'Unnamed Performer';
  const preview = {
    name: previewName,
    classId,
    raceId,
    appearance,
    outfitId: 'wanderer',
  };

  const setField = (key, value) => setAppearance((prev) => ({ ...prev, [key]: value }));

  const canFinish = Boolean(classId && raceId);
  const placeholderName = `${selectedRace.name.split(' ').pop()} ${selectedClass.name}`;

  const goNext = () => {
    if (step < 2) setStep(step + 1);
    else finish();
  };

  const finish = () => {
    if (!canFinish) return;
    createCharacter({
      name: name.trim() || placeholderName,
      classId,
      raceId,
      appearance,
    });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* ---- Header ---- */}
          <Text style={styles.eyebrow}>MUSIC MORPG</Text>
          <Text style={styles.heading}>Choose your place in the Scale</Text>
          <Text style={styles.subheading}>
            Every performer in the Shattered Scale is remembered for one thing: the sound they
            made when the hall fell silent.
          </Text>

          {/* ---- Progress ---- */}
          <View style={styles.stepRow}>
            {STEP_TITLES.map((title, index) => (
              <Pressable
                key={title}
                onPress={() => setStep(index)}
                style={styles.stepItem}
                accessibilityRole="button"
              >
                <View style={[styles.stepDot, index <= step && styles.stepDotActive]}>
                  <Text style={[styles.stepNum, index <= step && styles.stepNumActive]}>
                    {index + 1}
                  </Text>
                </View>
                <Text style={[styles.stepLabel, index === step && styles.stepLabelActive]}>
                  {title}
                </Text>
              </Pressable>
            ))}
          </View>
          <ProgressBar value={step + 1} max={3} color={colors.gold} height={4} />

          {/* ---- Preview ---- */}
          <Card style={styles.previewCard}>
            <Avatar character={preview} size={126} showPet={false} />
            <View style={styles.previewInfo}>
              <Text style={styles.previewName} numberOfLines={2}>
                {previewName}
              </Text>
              <Text style={styles.previewMeta}>
                {selectedRace.icon} {selectedRace.name} · {selectedClass.icon}{' '}
                {selectedClass.name}
              </Text>
              <View style={styles.previewPills}>
                <Pill text={selectedRace.trait.name} color={colors.info} size="sm" />
                <Pill text={selectedClass.passive.name} color={selectedClass.color} size="sm" />
              </View>
            </View>
          </Card>

          {/* ---- Step 1: identity + appearance ---- */}
          {step === 0 && (
            <>
              <Text style={styles.label}>Stage name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={placeholderName}
                placeholderTextColor={colors.textMute}
                style={styles.input}
                maxLength={24}
                autoCorrect={false}
                accessibilityLabel="Stage name"
              />
              <Text style={styles.hint}>Leave blank to use the suggested name.</Text>

              <Text style={styles.label}>Hair style</Text>
              <OptionRow
                options={HAIR_STYLES}
                value={appearance.hairStyle}
                onChange={(v) => setField('hairStyle', v)}
                renderLabel={(o) => `${o.icon} ${o.name}`}
              />

              <Text style={styles.label}>Hair color</Text>
              <View style={styles.swatchRow}>
                {HAIR_COLORS.map((option) => (
                  <Swatch
                    key={option.id}
                    hex={option.hex}
                    label={option.name}
                    selected={appearance.hairColor === option.id}
                    onPress={() => setField('hairColor', option.id)}
                  />
                ))}
              </View>

              <Text style={styles.label}>Skin tone</Text>
              <View style={styles.swatchRow}>
                {SKIN_TONES.map((option) => (
                  <Swatch
                    key={option.id}
                    hex={option.hex}
                    label={option.name}
                    selected={appearance.skinTone === option.id}
                    onPress={() => setField('skinTone', option.id)}
                  />
                ))}
              </View>

              <Text style={styles.label}>Eye color</Text>
              <View style={styles.swatchRow}>
                {EYE_COLORS.map((option) => (
                  <Swatch
                    key={option.id}
                    hex={option.hex}
                    label={option.name}
                    selected={appearance.eyeColor === option.id}
                    onPress={() => setField('eyeColor', option.id)}
                  />
                ))}
              </View>

              <Text style={styles.label}>Outfit tint</Text>
              <View style={styles.swatchRow}>
                {OUTFIT_TINTS.map((option) => (
                  <Swatch
                    key={option.id}
                    hex={option.hex}
                    label={option.name}
                    selected={appearance.outfitTint === option.id}
                    onPress={() => setField('outfitTint', option.id)}
                  />
                ))}
              </View>

              <Text style={styles.label}>Voice type</Text>
              <OptionRow
                options={VOICE_TYPES}
                value={appearance.voice}
                onChange={(v) => setField('voice', v)}
                renderLabel={(o) => `${o.icon} ${o.name}`}
              />
            </>
          )}

          {/* ---- Step 2: race ---- */}
          {step === 1 && (
            <>
              <Text style={styles.hint}>
                Each race grants flat stat bonuses plus one always-on trait. Bonuses stack with
                your class.
              </Text>
              {RACES.map((race) => {
                const active = race.id === raceId;
                return (
                  <Pressable
                    key={race.id}
                    onPress={() => setRaceId(race.id)}
                    style={[styles.selectCard, active && { borderColor: race.id === raceId ? colors.accent : colors.border }]}
                  >
                    <View style={styles.selectHeader}>
                      <Text style={styles.selectIcon}>{race.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.selectTitle}>{race.name}</Text>
                        <Text style={styles.selectLore}>{race.lore}</Text>
                      </View>
                      <View style={[styles.radio, active && styles.radioActive]}>
                        {active && <View style={styles.radioDot} />}
                      </View>
                    </View>

                    <View style={styles.bonusRow}>
                      {STAT_KEYS.filter((key) => (race.bonuses[key] || 0) > 0).map((key) => (
                        <View key={key} style={styles.bonusChip}>
                          <Text style={styles.bonusText}>
                            {STAT_ICONS[key]} +{race.bonuses[key]} {STAT_LABELS[key]}
                          </Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.traitRow}>
                      <Pill text={race.trait.name} color={colors.info} size="sm" />
                      <Text style={styles.traitText}>{race.trait.description}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </>
          )}

          {/* ---- Step 3: class ---- */}
          {step === 2 && (
            <>
              <Text style={styles.hint}>
                Your class sets your starting stats, your combat skill, and a passive that
                shapes every reward you earn.
              </Text>
              {CLASSES.map((cls) => {
                const active = cls.id === classId;
                return (
                  <Pressable
                    key={cls.id}
                    onPress={() => setClassId(cls.id)}
                    style={[styles.selectCard, active && { borderColor: cls.color }]}
                  >
                    <View style={styles.selectHeader}>
                      <Text style={styles.selectIcon}>{cls.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.selectTitle}>{cls.name}</Text>
                        <Text style={styles.selectTagline}>{cls.tagline}</Text>
                      </View>
                      <View style={[styles.radio, active && { borderColor: cls.color }]}>
                        {active && <View style={[styles.radioDot, { backgroundColor: cls.color }]} />}
                      </View>
                    </View>

                    <Text style={styles.selectLore}>{cls.lore}</Text>

                    <View style={styles.bonusRow}>
                      {STAT_KEYS.filter((key) => (cls.bonuses[key] || 0) > 0).map((key) => (
                        <View key={key} style={styles.bonusChip}>
                          <Text style={styles.bonusText}>
                            {STAT_ICONS[key]} +{cls.bonuses[key]} {STAT_LABELS[key]}
                          </Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.traitRow}>
                      <Pill text={cls.passive.name} color={cls.color} size="sm" />
                      <Text style={styles.traitText}>{cls.passive.description}</Text>
                    </View>

                    <View style={styles.skillRow}>
                      {cls.skills.map((skill) => (
                        <View key={skill} style={styles.skillChip}>
                          <Text style={styles.skillText}>{skill}</Text>
                        </View>
                      ))}
                    </View>
                  </Pressable>
                );
              })}
            </>
          )}

          {/* ---- Footer actions ---- */}
          <View style={styles.footer}>
            {step > 0 && (
              <Button
                label="Back"
                variant="ghost"
                onPress={() => setStep(step - 1)}
                fullWidth={false}
                style={{ flex: 1, marginRight: spacing(2) }}
              />
            )}
            <Button
              label={step === 2 ? 'Enter the Scale' : 'Continue'}
              variant={step === 2 ? 'gold' : 'primary'}
              onPress={goNext}
              disabled={step === 2 && !canFinish}
              fullWidth={false}
              style={{ flex: 2 }}
            />
          </View>

          <View style={{ height: Math.max(insets.bottom, 16) + 12 }} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgDeep },
  scroll: { paddingHorizontal: spacing(4), paddingBottom: spacing(6) },
  content: {
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
  },
  eyebrow: { ...typography.tiny, color: colors.gold, marginBottom: spacing(2) },
  heading: { ...typography.display, color: colors.text, marginBottom: spacing(2) },
  subheading: {
    ...typography.body,
    color: colors.textMute,
    lineHeight: 20,
    marginBottom: spacing(5),
  },

  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing(3),
  },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing(1.5),
    backgroundColor: colors.surface,
  },
  stepDotActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  stepNum: { ...typography.tiny, color: colors.textMute },
  stepNumActive: { color: colors.bgDeep },
  stepLabel: { ...typography.small, color: colors.textMute },
  stepLabelActive: { color: colors.text, fontWeight: '700' },

  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing(5),
    marginBottom: spacing(2),
    backgroundColor: colors.surfaceAlt,
  },
  previewInfo: { flex: 1, marginLeft: spacing(3) },
  previewName: { ...typography.title, fontSize: 19, color: colors.text },
  previewMeta: { ...typography.small, color: colors.textDim, marginTop: 3 },
  previewPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing(2) },

  label: {
    ...typography.tiny,
    color: colors.textMute,
    textTransform: 'uppercase',
    marginTop: spacing(5),
    marginBottom: spacing(2),
  },
  hint: { ...typography.small, color: colors.textMute, lineHeight: 18 },

  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing(4),
    paddingVertical: Platform.OS === 'web' ? spacing(3.5) : spacing(3),
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    outlineStyle: 'none',
  },

  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { borderColor: colors.accent, backgroundColor: 'rgba(180,140,247,0.16)' },
  chipText: { ...typography.small, color: colors.textDim },
  chipTextActive: { color: colors.text, fontWeight: '700' },

  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  swatch: {
    width: 38,
    height: 38,
    borderRadius: 99,
    borderWidth: 2,
    borderColor: colors.border,
  },
  swatchSelected: { borderColor: colors.text, transform: [{ scale: 1.08 }] },

  selectCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing(3.5),
    marginTop: spacing(3),
  },
  selectHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  selectIcon: { fontSize: 26, marginRight: spacing(3), marginTop: 2 },
  selectTitle: { ...typography.subtitle, color: colors.text },
  selectTagline: { ...typography.small, color: colors.textDim, marginTop: 2, fontStyle: 'italic' },
  selectLore: { ...typography.small, color: colors.textMute, lineHeight: 18, marginTop: spacing(2) },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing(2),
  },
  radioActive: { borderColor: colors.accent },
  radioDot: { width: 10, height: 10, borderRadius: 99, backgroundColor: colors.accent },

  bonusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing(2.5) },
  bonusChip: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.sm,
    paddingHorizontal: spacing(2),
    paddingVertical: 3,
  },
  bonusText: { ...typography.tiny, color: colors.textDim, fontSize: 10 },

  traitRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing(2.5), flexWrap: 'wrap', gap: 6 },
  traitText: { ...typography.small, color: colors.textMute, flexShrink: 1 },

  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing(2.5) },
  skillChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing(2.5),
    paddingVertical: 3,
  },
  skillText: { ...typography.tiny, color: colors.textDim, fontSize: 9 },

  footer: { flexDirection: 'row', marginTop: spacing(6) },
});

export default CharacterCreationScreen;
