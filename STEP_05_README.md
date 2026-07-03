# Step 05 — Complete the P0 interaction and UI

## Phase 2 status

The Phase 2 report satisfies the technical boundaries:

- real surface sampling
- 14,000 particles
- bottom-up delay
- original solid model fade-in
- particles hidden and inactive after completion
- reduced motion supported
- typecheck and build passed

Proceed to the final P0 phase.

## 1. Add files

Copy these files into the project root:

```text
PHASE3_INTERACTION_UI_NOTES.md
CODEX_STEP05_PHASE3_FINAL_PROMPT.md
```

## 2. Send the prompt

Open:

```text
CODEX_STEP05_PHASE3_FINAL_PROMPT.md
```

Copy everything below the divider and send it to Codex.

## 3. Important material behavior

The model's original base-color textures are dark.

The prompt tells Codex not to rely on simple color multiplication.

The production interactive material should:

- allow clearly visible pastel colors;
- preserve metallic and roughness maps;
- preserve the original materials separately;
- avoid changing geometry.

## 4. Expected final result

Codex should complete:

- horizontal rotation
- five 72° color states
- continuous color interpolation
- snap animation
- AI dialogue
- SVG annotations
- gesture hint
- Fortune footer
- six runtime captures
- final testing

## 5. Return after completion

Paste Codex's complete report and the six screenshots back into the conversation.
