# Phase 3 Interaction and UI Notes

## Approved baseline

Keep the current:

- Vite + vanilla TypeScript structure
- real GLB model
- Candidate B lighting
- current camera and responsive framing
- working particle assembly
- reduced-motion behavior
- debug replay controls

Do not reopen the lighting review.

## Remaining outcome

Complete the P0 experience:

1. the chair assembles from particles;
2. the completed chair is pink;
3. horizontal drag rotates the real chair;
4. one full revolution contains five 72° color states;
5. chair color changes continuously while dragging;
6. the single AI dialogue sentence follows the active color state;
7. four sparse SVG annotations surround the chair;
8. a one-time rotation gesture hint appears;
9. the Fortune China honor footer appears;
10. six runtime captures are produced.

## Critical material issue

The GLB's base-color textures are dark.

Simply applying:

```ts
material.color.set(targetColor)
```

will multiply the pastel color by the dark base-color texture and may keep the chair nearly black.

For the interactive pastel color mode:

- clone the two original PBR materials;
- keep their metalness/roughness maps and relevant physical settings;
- do not destructively edit the originals;
- use a clean tintable material treatment that can visibly reach the required pastel colors;
- do not use CSS filters or image swapping.

Production should default to a clean pastel tint mode.

A debug-only original-material comparison may remain available.
