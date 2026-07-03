# P0 Chair Model Notes

## File

- Expected model file: `p0-chair.glb`
- Expected path: `public/models/p0-chair.glb`
- Purpose: EndlessForm mobile P0 interactive landing poster

## Known constraints

- Up axis: Y
- Model unit: to be detected by Codex
- Front direction: to be detected by Codex
- Default display angle: to be confirmed after the first static rendering
- Rotation pivot: should be the visual center of the full chair
- Allowed interaction: rotate the full chair group around its own Y axis

## Allowed edits

- Uniformly scale the complete model for framing
- Move the complete model for composition
- Rotate the complete model around Y
- Change the base color of materials that Codex confirms are safe to recolor
- Preserve original metalness, roughness, normal maps and textures where present

## Forbidden edits

- Rebuilding or approximating the model
- Editing mesh geometry
- Non-uniform scaling
- Changing seat, back or leg proportions
- Adding or removing chair legs
- Changing topology
- Replacing the model with an image, video or procedural substitute

## Model inspection required before coding

Codex must report:

- scene node names
- visible mesh count
- material names
- texture list
- vertex count
- triangle count
- bounding-box size
- geometric center
- detected front direction
- negative scales
- suspicious normals
- materials that can safely change base color
