# Phase 1 Lighting Diagnosis

## Observed result

The current front render has four visual problems:

1. Large black faces collapse into nearly uniform dark shapes.
2. Bright borders and bevels are much lighter than the main surfaces, producing an outlined/cartoon-like contrast.
3. The chair reads flat in the straight-on view because the central planes have little reflected environment information.
4. The ground shadow extends too far to the right and looks more like a directional cast shadow than a restrained contact shadow.

## Likely cause

This is not simply “not enough light”.

The model uses dark base-color textures and large metallic/roughness textures. PBR metallic surfaces need useful environment reflections to reveal their form. The current scene relies mainly on direct directional lights and has no neutral image-based lighting environment.

Increasing the existing directional-light intensities alone will likely make the light borders brighter while the dark panels remain visually crushed.

## Required correction

Use a neutral procedural studio environment for reflections while keeping the visible page background pure white.

Recommended Three.js approach:

- `RoomEnvironment`
- `PMREMGenerator`
- assign the generated texture to `scene.environment`
- keep `scene.background = new THREE.Color(0xffffff)`

Add restrained tone mapping:

- `renderer.outputColorSpace = THREE.SRGBColorSpace`
- `renderer.toneMapping = THREE.ACESFilmicToneMapping`
- start `renderer.toneMappingExposure` around `1.12`

Reduce dependence on strong directional lights.

## Important future color risk

The base-color textures are visibly very dark.

Multiplying a pastel color through `material.color` may not produce a true pastel result because black texture regions remain black.

Do not solve that in this lighting patch.

Add a debug-only comparison mode to distinguish:

- original textured PBR material
- neutral diagnostic material without the base-color map, while preserving roughness/metalness maps

This comparison is only for diagnosis. Do not replace production materials yet.
