# Step 02 — Add the written specification and ask Codex to inspect

## What this step does

This step gives Codex a precise text-only target.

No generated concept images are provided.

Codex will inspect:

- the repository
- the real GLB model
- the existing framework
- the expected interaction specification

Codex must not code yet.

## 1. Copy the files

Copy these two files into the root of the same project prepared in Step 01:

```text
P0_SPEC.md
CODEX_STEP02_INSPECTION_PROMPT.md
```

The project should now contain:

```text
EndlessForm-P0/
├─ AGENTS.md
├─ P0_SPEC.md
├─ CODEX_STEP02_INSPECTION_PROMPT.md
└─ public/
   └─ models/
      ├─ MODEL_NOTES.md
      └─ p0-chair.glb
```

## 2. Check the model file size

Your current model is approximately:

```text
14,291 KB
```

This is acceptable for inspection.

Do not compress or modify it before Codex reports:

- geometry complexity
- textures
- material count
- mobile-load risks

## 3. Open the project in Codex

Open the full `EndlessForm-P0` folder, not an individual Markdown file.

## 4. Send only the Step 02 prompt

Open:

```text
CODEX_STEP02_INSPECTION_PROMPT.md
```

Copy everything under the divider into Codex.

Do not send additional development instructions.

## 5. Expected Codex response

Codex should report:

- whether a frontend project already exists
- current framework and package manager
- whether the model can be parsed
- model nodes, meshes, materials, textures and geometry scale
- which material can change color
- whether 14 MB needs later optimization
- a three-stage implementation plan

Codex should not change files.

## Completion message

After Codex replies, paste its full response back into the conversation.

Do not approve Stage 1 on your own yet.
