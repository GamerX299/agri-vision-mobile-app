---
name: Expo Doctor native modules
description: Why a native Nitro module may be excluded from Expo Doctor’s React Native Directory check.
---

`react-native-fast-tflite` is required for on-device inference and uses Nitro/JSI with the app’s New Architecture. Expo Doctor may still report it as “untested on New Architecture” because that directory metadata is incomplete; the exclusion is appropriate only when native iOS/Android bundles and the model contract validate successfully.

**Why:** The warning describes registry coverage, not a runtime incompatibility, but leaving it unresolved obscures the rest of the app health signal.

**How to apply:** Keep the exclusion paired with clean Expo exports, type checks, and a real device smoke test when hardware is available.