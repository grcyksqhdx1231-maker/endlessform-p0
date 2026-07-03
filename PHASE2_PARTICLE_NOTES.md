# Phase 2 Particle Assembly Notes

## Current approved baseline

Phase 1 has already established:

- Vite + vanilla TypeScript
- Three.js scene
- real GLB loading
- `chairGroup`
- fixed camera
- white background
- responsive mobile framing
- original PBR materials
- phase-1 lighting setup

The lighting patch may finish immediately before this phase.

Do not spend another review cycle on lighting.

Keep the best current lighting result and continue.

## Model facts

- Model path: `public/models/p0-chair.glb`
- Visible meshes: 2
- Total vertices: 574
- Total triangles: 322
- Materials:
  - `材质.026`
  - `材质.027`
- Geometry is already very light.
- Do not decimate.
- Do not rewrite the GLB.
- Texture optimization is postponed.

## Phase 2 visual goal

The first page moment should read as:

```text
fine particles rise from below
→ gather onto the real chair surface
→ the solid chair becomes visible
→ every particle disappears
→ only the complete chair remains
```

The completed chair must have:

- no sand
- no particle floor
- no floating dust
- no residual points
- no looping particle animation

## Space rule

Store particle start and target positions in `chairGroup` local space.

When sampling a Mesh:

1. update world matrices;
2. sample a point in the Mesh's local geometry;
3. transform it through `mesh.matrixWorld`;
4. convert the world point back into `chairGroup` local space.

This keeps particles aligned with the chair when later phases rotate `chairGroup`.
