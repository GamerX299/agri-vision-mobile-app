---
name: Native Expo bridges
description: Platform-specific module boundaries for native-only Expo dependencies.
---

Native-only Expo dependencies such as TFLite runtimes should be imported from a native implementation file, with a web implementation that avoids the native package entirely.

**Why:** Expo web evaluates the module graph before runtime platform guards run; a direct native import can crash the browser bundle with a react-native versus react-native-web error.

**How to apply:** Expose the same small hook or function from base/native and `.web` files, and keep device-only behavior in the native implementation.