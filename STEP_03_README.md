# Step 03 — Build only the static Three.js chair scene

## What was learned from inspection

- There is no existing frontend project.
- The GLB is valid.
- Geometry is extremely light.
- The approximately 14 MB size is caused mainly by two large metallic/roughness PNG textures.
- The correct front direction is still unknown.
- Do not optimize the model before the first real render.

## 1. Add the new file

Copy this file into the project root:

```text
MODEL_AUDIT.md
```

Your project should now include:

```text
EndlessForm-P0/
├─ AGENTS.md
├─ P0_SPEC.md
├─ MODEL_AUDIT.md
├─ CODEX_STEP02_INSPECTION_PROMPT.md
├─ CODEX_STEP03_PHASE1_PROMPT.md
└─ public/
   └─ models/
      ├─ MODEL_NOTES.md
      └─ p0-chair.glb
```

`STEP_03_README.md` may also remain in the root.

## 2. Send the Phase 1 prompt

Open:

```text
CODEX_STEP03_PHASE1_PROMPT.md
```

Copy everything below its divider into Codex.

Codex is now allowed to create the frontend project and install only:

```text
vite
typescript
three
```

Codex must not install GSAP or start particles yet.

## 3. What Codex should produce

The result should be:

- a real Vite + vanilla TypeScript project
- pure white full-screen page
- the real GLB rendered with original materials
- fixed camera and neutral studio lighting
- subtle or disabled contact shadow
- a hidden debug mode
- four screenshots at 0°, 90°, 180°, 270°
- one suggested default-front candidate

## 4. What you do after Codex finishes

Do not ask Codex to continue.

Open the local page and check:

- whether the model is the correct chair
- whether its texture looks correct
- whether it is too large or too small
- which of the four angles is the correct front
- whether the lighting is too dark, too flat or too reflective

Then paste Codex's full Phase 1 report and screenshot paths back into the conversation.
