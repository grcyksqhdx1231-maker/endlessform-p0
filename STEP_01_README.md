# Step 01 — Prepare the project and real chair model

Do not send a development prompt to Codex yet.

## 1. Create or choose one project folder

Example:

```text
EndlessForm-P0/
```

Copy the provided files into that folder so the structure becomes:

```text
EndlessForm-P0/
├─ AGENTS.md
└─ public/
   └─ models/
      ├─ MODEL_NOTES.md
      └─ p0-chair.glb
```

## 2. Add the real model

Place your real chair model at:

```text
public/models/p0-chair.glb
```

The file name must be exactly:

```text
p0-chair.glb
```

### If the current model is `.blend`

Open it in Blender and export only the chosen P0 chair:

1. Select the chair and all of its required child objects.
2. Apply transforms: `Ctrl + A` → `All Transforms`.
3. Check normals.
4. Export: `File` → `Export` → `glTF 2.0`.
5. Format: `glTF Binary (.glb)`.
6. Include materials and textures.
7. Save as `p0-chair.glb`.

Do not decimate or reshape the model for this first step.

## 3. Verify the files

Confirm all three files exist:

```text
AGENTS.md
public/models/MODEL_NOTES.md
public/models/p0-chair.glb
```

## 4. Do not add visual references

Do not create:

```text
public/references/p0/
```

Do not give Codex any generated concept images.

The final visual target will be described later through a precise written specification.

## Completion message

After completing this step, reply:

```text
第一步完成。模型格式是___，文件大小是___MB，项目文件夹已经准备好。
```

If the model cannot be exported, reply with the current model format and the exact problem.
