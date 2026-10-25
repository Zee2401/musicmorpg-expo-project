// InventoryScreen — bag, consumables, equipment, materials, and the merchant.
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
  SectionTitle,
} from '../components/ui';
import { ITEMS, ITEM_TYPES, RARITY_COLORS, getItem } from '../data/items';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing, typography } from '../theme';

const MAX_WIDTH = 620;

const InventoryScreen = () => {
  const {
    character,
    derived,
    save,
    useItem,
    equipItem,
    unequipSlot,
    sellItem,
    buyItem,
  } = useGame();

  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState('all'); // all | consumable | equipment | material
  const [expanded, setExpanded] = useState(null);
  const [shopOpen, setShopOpen] = useState(false);

  const owned = useMemo(
    () =>
      Object.entries(save.inventory)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => ({ item: getItem(id), qty }))
        .filter((row) => Boolean(row.item)),
    [save.inventory]
  );

  const visible = useMemo(
    () => (filter === 'all' ? owned : owned.filter((row) => row.item.type === filter)),
    [owned, filter]
  );

  const totalItems = owned.reduce((sum, row) => sum + row.qty, 0);
  const totalValue = owned.reduce((sum, row) => sum + row.qty * row.item.value, 0);
  const equippedIds = Object.values(save.equipped).filter(Boolean);

  if (!character) return null;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.heading}>Inventory</Text>
          <Text style={styles.subheading}>
            {totalItems} items · estimated value {totalValue} gold
          </Text>

          <Card style={styles.summaryCard}>
            <KeyValueRow label="Gold on hand" value={character.gold || 0} valueColor={colors.gold} />
            <KeyValueRow
              label="Health"
              value={`${character.health ?? derived.maxHealth} / ${derived.maxHealth}`}
              valueColor={colors.health}
            />
            <KeyValueRow
              label="Equipped pieces"
              value={`${equippedIds.length} / 4`}
              valueColor={colors.accent}
            />
            <Button
              label={shopOpen ? 'Close merchant' : 'Visit the merchant'}
              variant={shopOpen ? 'ghost' : 'gold'}
              onPress={() => setShopOpen(!shopOpen)}
              style={{ marginTop: spacing(3) }}
            />
          </Card>

          {/* Merchant */}
          {shopOpen && (
            <>
              <SectionTitle>Merchant's cart</SectionTitle>
              <Text style={styles.hint}>
                Prices are fixed. Selling back to the merchant returns 45% of an item's value.
              </Text>
              {ITEMS.map((item) => {
                const affordable = (character.gold || 0) >= item.value;
                return (
                  <Card key={item.id} style={styles.shopCard}>
                    <View style={styles.itemTop}>
                      <Text style={styles.itemIcon}>{item.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <View style={styles.itemMetaRow}>
                          <Pill
                            text={item.rarity}
                            color={RARITY_COLORS[item.rarity]}
                            size="sm"
                          />
                          <Text style={styles.itemType}>{item.type}</Text>
                        </View>
                      </View>
                      <Text style={[styles.price, { color: affordable ? colors.gold : colors.danger }]}>
                        🪙 {item.value}
                      </Text>
                    </View>
                    <Button
                      label={affordable ? 'Buy' : 'Not enough gold'}
                      variant="subtle"
                      size="sm"
                      disabled={!affordable}
                      onPress={() => buyItem(item.id)}
                      style={{ marginTop: spacing(2) }}
                    />
                  </Card>
                );
              })}
            </>
          )}

          {/* Filter */}
          <SectionTitle>Your bag</SectionTitle>
          <View style={styles.filterRow}>
            <Pressable
              onPress={() => setFilter('all')}
              style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                All ({owned.length})
              </Text>
            </Pressable>
            {ITEM_TYPES.map((type) => {
              const count = owned.filter((row) => row.item.type === type.id).length;
              return (
                <Pressable
                  key={type.id}
                  onPress={() => setFilter(type.id)}
                  style={[styles.filterChip, filter === type.id && styles.filterChipActive]}
                >
                  <Text
                    style={[styles.filterText, filter === type.id && styles.filterTextActive]}
                  >
                    {type.icon} {count}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {visible.length === 0 ? (
            <EmptyState
              icon="🎒"
              title="Nothing in this pouch"
              body={
                owned.length === 0
                  ? 'Your bag is empty. Buy supplies from the merchant, or complete quests to find loot.'
                  : 'Try a different filter — or clear out quests for more loot.'
              }
              action={
                <Button
                  label="Visit the merchant"
                  variant="primary"
                  onPress={() => setShopOpen(true)}
                />
              }
            />
          ) : (
            visible.map(({ item, qty }) => {
              const isOpen = expanded === item.id;
              const equipped = equippedIds.includes(item.id);
              const canUse = item.type === 'consumable' && item.effect?.type === 'heal';
              const canEquip = item.type === 'equipment';

              return (
                <Card key={item.id} style={styles.itemCard}>
                  <Pressable onPress={() => setExpanded(isOpen ? null : item.id)}>
                    <View style={styles.itemTop}>
                      <Text style={styles.itemIcon}>{item.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <View style={styles.itemMetaRow}>
                          <Pill text={item.rarity} color={RARITY_COLORS[item.rarity]} size="sm" />
                          {equipped && <Pill text="Equipped" color={colors.success} size="sm" style={{ marginLeft: 6 }} />}
                        </View>
                      </View>
                      <Text style={styles.qty}>×{qty}</Text>
                    </View>

                    {isOpen && (
                      <>
                        <Text style={styles.itemDesc}>{item.description}</Text>
                        <Divider />
                        <KeyValueRow label="Type" value={item.type} />
                        <KeyValueRow label="Unit value" value={`${item.value} gold`} valueColor={colors.gold} />
                        <KeyValueRow
                          label="Sell price"
                          value={`${Math.max(1, Math.round(item.value * 0.45))} gold`}
                        />
                        {item.slot && <KeyValueRow label="Slot" value={item.slot} />}
                      </>
                    )}
                  </Pressable>

                  {isOpen && (
                    <View style={styles.itemActions}>
                      {canUse && (
                        <Button
                          label="Use"
                          variant="primary"
                          size="sm"
                          fullWidth={false}
                          style={{ flex: 1, marginRight: spacing(2) }}
                          onPress={() => useItem(item.id)}
                        />
                      )}
                      {canEquip && (
                        <Button
                          label={equipped ? 'Unequip' : 'Equip'}
                          variant={equipped ? 'ghost' : 'primary'}
                          size="sm"
                          fullWidth={false}
                          style={{ flex: 1, marginRight: spacing(2) }}
                          onPress={() =>
                            equipped ? unequipSlot(item.slot) : equipItem(item.id)
                          }
                        />
                      )}
                      <Button
                        label="Sell 1"
                        variant="ghost"
                        size="sm"
                        fullWidth={false}
                        style={{ flex: 1 }}
                        onPress={() => sellItem(item.id)}
                      />
                    </View>
                  )}
                </Card>
              );
            })
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
  subheading: { ...typography.small, color: colors.textMute, marginBottom: spacing(4) },

  summaryCard: { backgroundColor: colors.surface },
  hint: { ...typography.small, color: colors.textMute, lineHeight: 18, marginBottom: spacing(2) },

  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing(1) },
  filterChip: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  filterText: { ...typography.small, color: colors.textDim, fontSize: 12 },
  filterTextActive: { color: colors.bgDeep, fontWeight: '700' },

  itemCard: { marginTop: spacing(2.5), backgroundColor: colors.surface },
  itemTop: { flexDirection: 'row', alignItems: 'center' },
  itemIcon: { fontSize: 24, marginRight: spacing(3) },
  itemName: { ...typography.subtitle, fontSize: 14, color: colors.text },
  itemMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3, flexWrap: 'wrap' },
  itemType: { ...typography.tiny, color: colors.textMute, fontSize: 9, marginLeft: 8 },
  qty: { ...typography.subtitle, color: colors.textDim, marginLeft: spacing(2) },
  itemDesc: { ...typography.small, color: colors.textMute, lineHeight: 18, marginTop: spacing(2.5) },
  itemActions: { flexDirection: 'row', marginTop: spacing(3) },

  shopCard: { marginTop: spacing(2.5), backgroundColor: colors.surface },
  price: { ...typography.subtitle, fontSize: 13 },
});

export default InventoryScreen;
