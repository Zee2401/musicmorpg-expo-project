# Music MORPG

A music-fantasy MORPG that runs on PC in the browser through **Expo Web**. Create a
character from six music-themed classes and six fantasy races, take quests across five
difficulty tiers, fight turn-based encounters, tame companions, unlock outfits, and
level up — with your save persisted locally on the device.

Everything is built with React Native + Expo, so the same codebase runs on web,
Android, and iOS.

---

## 1. Requirements

| Tool | Version | Notes |
|---|---|---|
| Node.js | 20 LTS or newer | https://nodejs.org — pick the LTS installer |
| npm | ships with Node.js | `npm -v` should print 10.x or higher |
| A modern browser | Chrome / Edge / Firefox | Chrome recommended |

Check your install:

```bash
node -v
npm -v
```

---

## 2. Get the project on your PC

You asked for the exact steps, so here are both paths.

### Option A — use the project folder you were given

Copy the `MusicMORPG` folder anywhere on your PC (for example `C:\dev\MusicMORPG` or
`~/dev/MusicMORPG`), then open a terminal **inside that folder**:

```bash
cd MusicMORPG
npm install
```

### Option B — start from a fresh Expo app and drop the files in

```bash
npx create-expo-app@latest MusicMORPG --template blank
cd MusicMORPG
```

Delete the generated `App.js`, then copy in this project's `App.js`, `index.js`,
`babel.config.js`, `app.json`, `package.json`, `eas.json`, and the `screens/`,
`components/`, `data/`, `engine/`, `state/`, `theme/` folders.

---

## 3. Install the dependencies

The dependency list is already in `package.json`. From inside the `MusicMORPG` folder:

```bash
npm install
```

If you prefer to install them explicitly (this is what `npm install` resolves to):

```bash
npm install expo@~58.0.17 expo-status-bar@~58.0.4 react@19.3.1 react-dom@19.3.1 react-native@0.88.0 react-native-web@^0.21.4 @expo/metro-runtime@~58.0.15 @react-navigation/native@^7.5.1 @react-navigation/bottom-tabs@^7.21.0 react-native-screens@4.30.0 react-native-safe-area-context@5.10.1 @react-native-async-storage/async-storage@3.1.1
```

> If Expo prints a version-mismatch warning, run:
>
> ```bash
> npx expo install --fix
> ```

---

## 4. Run it on PC (web)

```bash
npx expo start --web
```

This bundles the app with Metro, then opens `http://localhost:8081` in your browser.
If it does not open automatically, visit that URL yourself.

You can also run:

```bash
npm run web
```

which is the same command.

### Optional: production web build

```bash
npx expo export --platform web
```

The static site is written to `dist/`. Serve it with any static file server, e.g.
`npx serve dist`.

### Optional: phone testing

```bash
npx expo start
```

Then scan the QR code with **Expo Go** (Android/iOS). The app is portrait-first and
looks best on a phone or a narrow browser window.

---

## 5. Building an Android APK

`eas.json` ships a `preview` profile configured for a directly installable **APK**:

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

Before your first build, run `eas init` and replace the placeholder `projectId` in
`app.json` (`expo.extra.eas.projectId`) with the real one EAS gives you.

The `production` profile builds an `.aab` (Play Store format) instead.

---

## 6. How to play

1. **Character Creation** appears automatically on first launch. Pick a name, a race,
   a class, and customize hair, skin, eyes, outfit tint, and voice type.
2. **Game** tab — the stage. Shows your hero, health, level, gold, and the quest board.
   Accept a quest, then fight it turn by turn with **Strike**, **Class Skill**, or
   **Guard**. Each tier leans on a different stat, so class and race choices matter.
3. **Quests** tab — everything you are tracking, the full catalogue across five tiers
   (Easy → Master), your completion log, and each quest's requirements.
4. **Character** tab — full stat sheet with a breakdown of where every point comes from,
   the companion stable (tame and rename pets), the outfit wardrobe, and your loadout.
5. **Inventory** tab — consumables, equipment, and materials. Use, equip, sell, or buy.
6. **Settings** tab — audio/haptics/accessibility toggles, and **Reset save** to wipe
   progress and return to character creation.

### Progression

- XP levels you up to 30; each level grants stats, health, and new outfits.
- Five quest tiers unlock at levels 1 / 3 / 6 / 10 / 15.
- Gold buys gear, consumables, and companion taming.
- Class passives and racial traits modify XP, gold, crit, damage, and damage taken —
  all visible in the Character tab stat breakdown.

---

## 7. Project structure

```
MusicMORPG/
├── App.js                        # Entry: provider + 5-tab shell + creation gate
├── index.js                      # Expo root registration
├── app.json                      # Expo config (web: metro bundler)
├── eas.json                      # EAS build profiles (preview = APK)
├── babel.config.js               # babel-preset-expo
├── package.json
├── assets/                       # (optional) add icon/splash here
├── components/
│   ├── Avatar.js                 # Pure-View character portrait (no image assets)
│   └── ui.js                     # Screen, Card, Button, ProgressBar, Pill, …
├── data/
│   ├── appearance.js             # Hair, skin, eyes, tints, voices
│   ├── classes.js                # 6 music classes + passives
│   ├── races.js                  # 6 races + stat bonuses + traits
│   ├── items.js                  # Inventory catalogue
│   ├── outfits.js                # Cosmetic unlocks + requirements
│   ├── pets.js                   # Companions + bonuses
│   └── quests.js                 # 5 tiers, 22 quests
├── engine/
│   ├── combat.js                 # Turn resolution (pure functions)
│   ├── random.js                 # RNG helpers
│   └── stats.js                  # Derived stats, XP curve, level math
├── screens/
│   ├── CharacterCreationScreen.js
│   ├── GameScreen.js
│   ├── CharacterScreen.js
│   ├── QuestsScreen.js
│   ├── InventoryScreen.js
│   └── SettingsScreen.js
├── state/
│   └── GameContext.js            # Single store + AsyncStorage persistence
└── theme/
    └── index.js                  # Colors, spacing, radius, typography
```

### Persistence

The whole save object is written to `@musicmorpg/save/v1` through
`@react-native-async-storage/async-storage` on every state change:

- On **web** this maps to `localStorage` (per browser, per origin).
- On **Android/iOS** it maps to native key-value storage.
- A corrupt or legacy save is discarded safely rather than crashing the app.
- **Settings → Reset save** clears the key and returns to character creation.

---

## 8. Troubleshooting

| Symptom | Fix |
|---|---|
| `npx expo start --web` says it needs web dependencies | `npx expo install react-dom react-native-web @expo/metro-runtime` |
| Port 8081 already in use | `npx expo start --web --port 8082` |
| Version mismatch warnings | `npx expo install --fix` |
| Blank white page | Hard-reload (Ctrl+Shift+R) and check the terminal for a bundling error |
| Save looks stuck | Settings → Reset save, or clear the site's localStorage |
| Slow first load on web | Normal — Metro compiles the bundle on first request |

---

## 9. Notes

- No external image assets are required; the avatar is drawn entirely with React
  Native `View`s, so there are no 404s and nothing to download.
- All game content lives in `data/` and all rules in `engine/`. Adding a quest is a
  single object in `data/quests.js`; adding a class is a single object in
  `data/classes.js`.
- The app is designed portrait-first; on a wide monitor the content is centered and
  capped at a comfortable reading width.
