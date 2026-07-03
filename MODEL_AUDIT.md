# P0 Chair Model Audit

This file records the inspection result returned before Phase 1.

## Repository

- Project root inspected: `D:\EndlessForm-P0`
- Existing frontend framework: none
- Existing package manager lock file: none
- Existing dependencies: none
- Visual reference images: none and not required

## GLB

- Path: `public/models/p0-chair.glb`
- glTF version: 2.0
- File size: 14,633,800 bytes, approximately 14 MB
- Generator: Khronos glTF Blender I/O v5.1.18
- Animations: none
- Skins: none
- Cameras: none
- Up axis: Y
- Front direction: visually unresolved and must be confirmed in Phase 1
- Negative scales: none detected
- Suspicious normals: none detected in inspection

## Scene

Scene nodes:

- `miao`
- `屁股.004`

Visible meshes:

- `miao.005`
- `屁股.012`

Total visible mesh count:

- 2

Geometry totals:

- vertices: 574
- triangles: 322

World bounding box:

- min: `[-0.9248, 0.0648, -0.4807]`
- max: `[0.9271, 3.0930, 1.3977]`
- dimensions: `1.8519 × 3.0283 × 1.8784`
- center: `[0.0011, 1.5789, 0.4585]`

## Materials

### `材质.026`

- mesh: `miao.005`
- double-sided: true
- base-color texture: `456-04`
- metallic/roughness texture: `456-06-456-05`

### `材质.027`

- mesh: `屁股.012`
- double-sided: true
- base-color texture: `屁股｜Base color.png`
- metallic/roughness texture: `屁股｜Metallic.png-屁股｜Roughness.png`

Both materials may later be tinted through their base color only if texture detail remains acceptable.

Do not replace or flatten textures during Phase 1.

## Texture payload

- `456-04`: 179,948 bytes
- `456-06-456-05`: 6,793,990 bytes
- `屁股｜Base color.png`: 114,638 bytes
- `屁股｜Metallic.png-屁股｜Roughness.png`: 7,521,689 bytes

The mobile-load risk comes mainly from the two large metallic/roughness PNG textures, not from geometry.

## Decisions for Phase 1

- Do not decimate geometry.
- Do not compress or rewrite the GLB yet.
- Do not add Draco only for this tiny geometry.
- Do not convert textures yet.
- Load the original GLB unchanged.
- Preserve the original materials and textures.
- Confirm the correct front direction through real runtime renders.
- Confirm composition, scale, camera and lighting before any particle work.
