---
name: Expo theme tokens
description: Guidance for extending the scaffold's semantic color tokens with a dark palette.
---

The scaffold's color token object includes a top-level radius alongside light and dark palettes, so theme hooks should narrow the palette explicitly rather than casting the whole object to a palette record.

**Why:** A broad record cast makes TypeScript reject the radius field when a dark palette is added.

**How to apply:** Keep scheme-independent tokens outside the palette and access the dark palette through the known `colors.dark` property.