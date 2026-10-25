// MusicMORPG — app entry.
// Renders the Character Creation flow on first launch, then the five-tab shell.
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { GameProvider, useGame } from './state/GameContext';
import { Loading } from './components/ui';
import { colors, radius } from './theme';

import CharacterCreationScreen from './screens/CharacterCreationScreen';
import GameScreen from './screens/GameScreen';
import CharacterScreen from './screens/CharacterScreen';
import QuestsScreen from './screens/QuestsScreen';
import InventoryScreen from './screens/InventoryScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Game', label: 'Game', icon: '🗺️', component: GameScreen },
  { name: 'Character', label: 'Character', icon: '🎭', component: CharacterScreen },
  { name: 'Quests', label: 'Quests', icon: '📜', component: QuestsScreen },
  { name: 'Inventory', label: 'Inventory', icon: '🎒', component: InventoryScreen },
  { name: 'Settings', label: 'Settings', icon: '⚙️', component: SettingsScreen },
];

// A bespoke tab bar keeps the app's stage-light look instead of the default
// Material bar, and behaves identically on web (Pressable, not raw View
// responders — those do not fire on react-native-web).
const StageTabBar = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const tab = TABS.find((t) => t.name === route.name) || TABS[0];
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={tab.label}
            style={({ pressed }) => [styles.tabItemWrap, pressed && styles.tabItemPressed]}
          >
            <View style={[styles.tabItem, focused && styles.tabItemActive]}>
              <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]} numberOfLines={1}>
                {tab.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.accent,
  },
};

const Shell = () => {
  const { ready, character, toasts } = useGame();

  if (!ready) return <Loading />;
  if (!character) return <CharacterCreationScreen />;

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        tabBar={(props) => <StageTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          lazy: true,
          sceneStyle: { backgroundColor: colors.bg },
        }}
      >
        {TABS.map((tab) => (
          <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
        ))}
      </Tab.Navigator>

      {/* Global toast stack sits above every screen. */}
      <View pointerEvents="none" style={styles.toastLayer}>
        {toasts.map((toast) => (
          <View
            key={toast.id}
            style={[
              styles.toast,
              toast.tone === 'success' && { borderColor: colors.success },
              toast.tone === 'danger' && { borderColor: colors.danger },
            ]}
          >
            <Text style={styles.toastText}>{toast.text}</Text>
          </View>
        ))}
      </View>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <GameProvider>
        <View style={styles.root}>
          <Shell />
        </View>
      </GameProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgDeep },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingHorizontal: 6,
    ...(Platform.OS === 'web' ? { boxShadow: '0 -8px 24px rgba(0,0,0,0.45)' } : {}),
  },
  tabItemWrap: { flex: 1, alignItems: 'center' },
  tabItemPressed: { opacity: 0.7 },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    minWidth: 58,
  },
  tabItemActive: { backgroundColor: 'rgba(180,140,247,0.14)' },
  tabIcon: { fontSize: 19, opacity: 0.55, marginBottom: 2 },
  tabIconActive: { opacity: 1 },
  tabLabel: { fontSize: 10, fontWeight: '700', color: colors.textMute, letterSpacing: 0.3 },
  tabLabelActive: { color: colors.accent },
  toastLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 92,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  toast: {
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: 9,
    paddingHorizontal: 18,
    marginTop: 8,
    maxWidth: 520,
    width: '100%',
    alignItems: 'center',
  },
  toastText: { color: colors.text, fontSize: 13, fontWeight: '600', textAlign: 'center' },
});
