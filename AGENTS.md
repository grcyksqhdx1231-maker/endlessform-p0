# EndlessForm P0 — Codex Project Rules

## Project goal

Build the EndlessForm mobile P0 interactive landing poster with a real 3D chair model.

The final implementation must be a real browser experience using Three.js, GSAP, HTML, CSS and SVG. It must not be a screenshot recreation.

## Hard rules

- Use the real model file at `public/models/p0-chair.glb`.
- Do not rebuild, approximate or replace the chair geometry with code.
- Do not change the chair geometry, proportions, leg count, topology or silhouette.
- Uniform scaling of the whole model is allowed only for framing.
- The page background must be pure white: `#FFFFFF`.
- Interface text and lines must use gray-black tones.
- The AI area must contain only one dialogue box.
- The AI dialogue box must use a simple line-art robot icon.
- Do not display “AI生成中”.
- Do not display chat history, stacked cards, carousels or multiple prompts at once.
- Particle effects are allowed only during the initial chair-assembly animation.
- After the chair has finished assembling, all particles must be fully hidden and must stop updating.
- Do not leave sand, dust, debris or floating particles around the completed chair.
- Do not use a video, GIF, sequence of images or full-screen image to fake the Three.js interaction.
- All Chinese UI text must be HTML or SVG text, not baked into image textures.
- Do not read or depend on generated visual reference images.
- Do not invent product names, prices, dimensions, materials, series names or brand stories.

## Required honor copy

The only honor text allowed is:

- FORTUNE CHINA
- BEST DESIGNS 2022
- 入选《财富》中国最佳设计榜

Do not use:

- WINNER
- BEST PICTURE
- BEST DIRECTOR
- BEST CINEMATOGRAPHY
- film festival wording
- any unrelated award copy

## Technical ownership

- Three.js: model loading, camera, lighting, shadows, particles and chair rotation.
- GSAP: loading timeline, snapping, color transitions and text transitions.
- HTML/CSS/SVG: AI dialogue, robot icon, annotations, gesture hint and honor badge.
- Design baseline: 393 × 852 px.
- The implementation must remain responsive on common mobile viewport sizes.
- Prefer TypeScript.
- Preserve the existing project framework unless there is a clear technical reason not to.
- Do not add libraries that are not necessary.

## Workflow

- Before editing, inspect the repository and report the current framework and dependencies.
- Before implementation, inspect the GLB model and report its scene nodes, meshes, materials, textures, bounding box and safe-to-edit color materials.
- Work in stages.
- Stop at the end of each requested stage and report:
  - changed files
  - commands run
  - test/build results
  - known limitations
- Do not continue into a later stage without user confirmation.
