---
name: Expo Go TFLite guard
description: Why Expo Go must never initialize the native TFLite Nitro runtime
---

Expo Go can resolve the JavaScript package for a native Nitro TFLite module even though its binary does not contain that native implementation. Treat Expo Go/store-client as fallback-only before requiring or calling the native module; a try/catch around the native call is not sufficient protection against native initialization failures.

**Why:** The Diagnosis screen can white-screen the app when a native TFLite module is touched from Expo Go, even if JavaScript error handling exists around the call.

**How to apply:** Use the Expo execution environment to bypass native model loading in Expo Go and keep the deterministic local evaluator available. Native loading remains appropriate only for a development build or standalone binary.