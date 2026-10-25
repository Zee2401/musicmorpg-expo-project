// Shared presentational components. Kept in one file so every screen renders
// with identical spacing, radii, and press feedback.

import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, radius, shadow, spacing, typography } from '../theme';

export const Screen = ({ children, scroll = true, contentStyle, refreshControl }) => {
  const body = <View style={[styles.screenInner, contentStyle]}>{children}</View>;
  if (!scroll) return <View style={styles.screen}>{body}</View>;
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    >
      {body}
    </ScrollView>
  );
};

export const Card = ({ children, style, tone = 'default', ...rest }) => (
  <View
    style={[
      styles.card,
      tone === 'high' && styles.cardHigh,
      tone === 'flush' && styles.cardFlush,
      style,
    ]}
    {...rest}
  >
    {children}
  </View>
);

export const SectionTitle = ({ children, action, style }) => (
  <View style={[styles.sectionTitleRow, style]}>
    <Text style={styles.sectionTitle}>{children}</Text>
    {action}
  </View>
);

export const Button = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon,
  style,
  fullWidth = true,
}) => {
  const isDisabled = disabled;
  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        size === 'sm' && styles.buttonSm,
        size === 'lg' && styles.buttonLg,
        fullWidth && { alignSelf: 'stretch' },
        variant === 'primary' && styles.buttonPrimary,
        variant === 'gold' && styles.buttonGold,
        variant === 'ghost' && styles.buttonGhost,
        variant === 'danger' && styles.buttonDanger,
        variant === 'subtle' && styles.buttonSubtle,
        pressed && !isDisabled && styles.buttonPressed,
        isDisabled && styles.buttonDisabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.buttonLabel,
          size === 'sm' && styles.buttonLabelSm,
          variant === 'ghost' && styles.buttonLabelGhost,
          variant === 'subtle' && styles.buttonLabelSubtle,
          isDisabled && styles.buttonLabelDisabled,
        ]}
        numberOfLines={1}
      >
        {icon ? `${icon}  ${label}` : label}
      </Text>
    </Pressable>
  );
};

export const ProgressBar = ({
  value,
  max,
  color = colors.xp,
  height = 8,
  showLabel = false,
  label,
  trackColor = colors.surfaceHigh,
}) => {
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  return (
    <View>
      {showLabel && (
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>{label}</Text>
          <Text style={styles.progressValue}>
            {Math.round(value)} / {Math.round(max)}
          </Text>
        </View>
      )}
      <View style={[styles.progressTrack, { height, backgroundColor: trackColor }]}>
        <View
          style={[
            styles.progressFill,
            { width: `${pct * 100}%`, backgroundColor: color, height },
          ]}
        />
      </View>
    </View>
  );
};

export const Pill = ({ text, color = colors.accent, filled = false, style, size = 'md' }) => (
  <View
    style={[
      styles.pill,
      size === 'sm' && styles.pillSm,
      {
        borderColor: color,
        backgroundColor: filled ? color : 'transparent',
      },
      style,
    ]}
  >
    <Text
      style={[
        styles.pillText,
        size === 'sm' && styles.pillTextSm,
        { color: filled ? colors.bgDeep : color },
      ]}
      numberOfLines={1}
    >
      {text}
    </Text>
  </View>
);

export const StatChip = ({ icon, label, value, color = colors.text }) => (
  <View style={styles.statChip}>
    <Text style={styles.statChipIcon}>{icon}</Text>
    <View style={{ flex: 1 }}>
      <Text style={styles.statChipLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[styles.statChipValue, { color }]}>{value}</Text>
    </View>
  </View>
);

export const EmptyState = ({ icon = '🎼', title, body, action }) => (
  <View style={styles.empty}>
    <Text style={styles.emptyIcon}>{icon}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    {!!body && <Text style={styles.emptyBody}>{body}</Text>}
    {action ? <View style={{ marginTop: spacing(3), width: '100%' }}>{action}</View> : null}
  </View>
);

export const Divider = ({ style }) => <View style={[styles.divider, style]} />;

export const Loading = ({ label = 'Tuning the orchestra…' }) => (
  <View style={styles.loading}>
    <ActivityIndicator color={colors.gold} size="large" />
    <Text style={styles.loadingText}>{label}</Text>
  </View>
);

export const KeyValueRow = ({ label, value, valueColor = colors.text, style }) => (
  <View style={[styles.kvRow, style]}>
    <Text style={styles.kvLabel}>{label}</Text>
    <Text style={[styles.kvValue, { color: valueColor }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { paddingBottom: spacing(28) },
  screenInner: { paddingHorizontal: spacing(4), paddingTop: spacing(3) },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(4),
    ...shadow.card,
  },
  cardHigh: { backgroundColor: colors.surfaceAlt },
  cardFlush: { padding: 0, overflow: 'hidden' },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing(4),
    marginBottom: spacing(2.5),
  },
  sectionTitle: {
    ...typography.tiny,
    color: colors.textMute,
    textTransform: 'uppercase',
  },

  button: {
    minHeight: 46,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing(5),
    borderWidth: 1,
    borderColor: 'transparent',
  },
  buttonSm: { minHeight: 34, paddingHorizontal: spacing(3.5) },
  buttonLg: { minHeight: 54 },
  buttonPrimary: { backgroundColor: colors.accent },
  buttonGold: { backgroundColor: colors.gold },
  buttonGhost: { backgroundColor: 'transparent', borderColor: colors.border },
  buttonDanger: { backgroundColor: 'transparent', borderColor: colors.danger },
  buttonSubtle: { backgroundColor: colors.surfaceHigh, borderColor: colors.borderSoft },
  buttonPressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  buttonDisabled: { backgroundColor: colors.surfaceHigh, borderColor: colors.borderSoft, opacity: 0.65 },
  buttonLabel: { ...typography.subtitle, color: colors.bgDeep, fontSize: 15 },
  buttonLabelSm: { fontSize: 13 },
  buttonLabelGhost: { color: colors.textDim },
  buttonLabelSubtle: { color: colors.text },
  buttonLabelDisabled: { color: colors.textMute },

  progressTrack: { width: '100%', borderRadius: radius.pill, overflow: 'hidden' },
  progressFill: { borderRadius: radius.pill },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing(1) },
  progressLabel: { ...typography.small, color: colors.textMute },
  progressValue: { ...typography.small, color: colors.textDim },

  pill: {
    paddingHorizontal: spacing(2.5),
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  pillSm: { paddingHorizontal: spacing(2), paddingVertical: 1 },
  pillText: { ...typography.tiny, textTransform: 'uppercase' },
  pillTextSm: { fontSize: 9 },

  statChip: {
    flex: 1,
    minWidth: 96,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(2.5),
    borderWidth: 1,
    borderColor: colors.borderSoft,
    marginBottom: spacing(2),
    marginRight: spacing(2),
  },
  statChipIcon: { fontSize: 16, marginRight: spacing(2) },
  statChipLabel: { ...typography.tiny, color: colors.textMute },
  statChipValue: { ...typography.subtitle, fontSize: 15 },

  empty: {
    alignItems: 'center',
    paddingVertical: spacing(8),
    paddingHorizontal: spacing(6),
  },
  emptyIcon: { fontSize: 42, marginBottom: spacing(3) },
  emptyTitle: { ...typography.subtitle, color: colors.text, textAlign: 'center' },
  emptyBody: {
    ...typography.body,
    color: colors.textMute,
    textAlign: 'center',
    marginTop: spacing(2),
    lineHeight: 20,
  },

  divider: { height: 1, backgroundColor: colors.borderSoft, marginVertical: spacing(3) },

  loading: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...typography.body, color: colors.textMute, marginTop: spacing(4) },

  kvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing(1.75),
  },
  kvLabel: { ...typography.body, color: colors.textMute },
  kvValue: { ...typography.subtitle, fontSize: 14 },
});
