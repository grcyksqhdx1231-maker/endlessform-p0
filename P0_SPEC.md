# EndlessForm P0 Interactive Poster Specification

## 1. Purpose

Build the mobile P0 entry experience for EndlessForm.

This is not a normal loading screen and not a product detail page. It is a real-time interactive digital poster that communicates:

1. the chair is computationally generated;
2. AI can control the chair through natural-language intent;
3. the user can rotate the chair with a finger;
4. rotation changes both chair color and the AI sentence;
5. EndlessForm was selected for FORTUNE CHINA BEST DESIGNS 2022.

The page must use the real GLB model at:

```text
public/models/p0-chair.glb
```

The page must be implemented with real browser rendering and interaction.

Do not use a full-screen image, generated concept image, video, GIF or image sequence to fake the page.

---

## 2. Technical split

Use:

- Three.js for:
  - GLB loading
  - camera
  - lighting
  - shadows
  - particles
  - chair rotation
  - material color updates

- GSAP for:
  - loading timeline
  - model fade-in
  - particle fade-out
  - snap-to-angle animation
  - AI copy transition
  - first-interaction hint transition

- HTML/CSS/SVG for:
  - AI dialogue box
  - robot line icon
  - dotted annotations
  - gesture hint
  - award badge
  - all Chinese text

Do not render Chinese UI text into a canvas texture.

Prefer TypeScript.

Preserve the existing framework if one already exists.

---

## 3. Viewport and page shell

Design baseline:

```text
393 × 852 px
```

Required responsive checks:

```text
375 × 812
393 × 852
430 × 932
```

Page shell:

```css
width: 100vw;
height: 100dvh;
position: relative;
overflow: hidden;
background: #FFFFFF;
touch-action: none;
user-select: none;
overscroll-behavior: none;
```

Respect:

```text
env(safe-area-inset-top)
env(safe-area-inset-bottom)
```

The page must not scroll.

The page must not create horizontal overflow.

---

## 4. Visual language

Keywords:

- pure white
- restrained
- premium
- spacious
- product-centered
- scientific diagram feeling
- thin gray-black linework
- no decorative background
- no heavy glassmorphism
- no large colored UI blocks

Colors:

```text
Page background: #FFFFFF
Primary text: #292929
Secondary text: #686868
AI border: rgba(41, 41, 41, 0.28)
Annotation lines: rgba(41, 41, 41, 0.28)
Annotation text: rgba(41, 41, 41, 0.78)
Award text and laurels: #383838
Soft contact shadow: rgba(0, 0, 0, 0.08)
```

Do not use:

- beige page background
- gray page background
- black page background
- gold award text
- large gradients
- strong glow
- large heavy shadows
- persistent sand or dust after generation

---

## 5. Layer order

Bottom to top:

1. white background
2. Three.js canvas
3. SVG annotation overlay
4. AI dialogue box
5. first-interaction gesture hint
6. award footer

Suggested DOM:

```html
<main class="p0-page">
  <canvas class="p0-canvas"></canvas>

  <svg class="annotation-overlay"></svg>

  <section class="ai-dialogue">
    <svg class="robot-icon"></svg>
    <div class="dialogue-divider"></div>
    <div class="dialogue-copy"></div>
  </section>

  <div class="rotation-hint"></div>

  <footer class="fortune-award"></footer>
</main>
```

---

## 6. AI dialogue box

Position at 393 × 852 baseline:

```text
top: safe-area + 28 px
right: 18 px
width: 268 px
height: 58 px
```

Style:

```text
border-radius: 29 px
border: 1 px solid rgba(41,41,41,0.28)
background: #FFFFFF
```

Internal layout:

```text
display: flex
align-items: center
padding-inline: 18 px
gap: 14 px
```

Robot icon:

```text
22 × 22 px
stroke: #4B4B4B
fill: none
stroke-width: 1.4 px
```

Robot icon must be a simple line icon containing only:

- rounded-square head
- two eyes
- short antenna
- small side ears

Do not use:

- colored robot
- full robot body
- mascot illustration
- gradient
- emoji

Divider:

```text
width: 1 px
height: 24 px
background: rgba(41,41,41,0.16)
```

Dialogue text:

```text
font-size: 16 px
line-height: 24 px
font-weight: 400
color: #292929
single line
no input caret
```

The AI region must contain only one dialogue box.

Never show:

- “AI生成中”
- AI title
- chat history
- multiple stacked cards
- prompt carousel
- send button
- thinking state
- three-dot menu
- colored progress strip

---

## 7. Chair framing

Canvas fills the page.

Target chair projection at 393 × 852:

```text
visual center:
x ≈ 196 px
y ≈ 438 px

projected width:
238–260 px

projected height:
400–440 px

top:
y ≈ 210–230 px

bottom:
y ≈ 625–650 px
```

The chair is the primary visual object.

It must not overlap:

- AI dialogue box
- award footer
- annotation labels

Camera:

- use PerspectiveCamera
- initial FOV around 26–30
- fit dynamically from BoundingBox
- camera remains fixed during user interaction
- rotate `chairGroup.rotation.y`, not the camera

Create an outer `chairGroup`.

Recenter the model around the visual center of its complete bounding box.

Apply rotation to the group, not to individual meshes.

Only uniform scaling is allowed.

---

## 8. Lighting and material treatment

Goal:

```text
neutral bright white studio lighting
```

Recommended lighting:

1. soft hemisphere or ambient light
2. upper-left key light
3. low-intensity front-right fill
4. subtle upper-back rim light

Requirements:

- no dramatic warm/cool split lighting
- no deep black reflection patches
- preserve visible faceted structure
- avoid exaggerated mirror reflections
- shadows must remain subtle

Optional invisible shadow catcher:

- plane itself must not be visible
- only a very light contact shadow is allowed
- do not show a gray floor

Material rules:

- preserve original roughness
- preserve original metalness
- preserve normal maps
- preserve roughness maps
- preserve metalness maps
- tween only the base color of materials confirmed safe to recolor
- do not flatten all materials into one unless inspection confirms the model truly has one recolorable material
- do not use opacity changes to fake color transitions

---

## 9. Six reproducible key states

### K1 — particle assembly in progress

Target capture time:

```text
approximately 0.85 s
```

State:

- chair visually formed around 35–45%
- upper silhouette and part of the seat/back are visible
- most legs remain particle-based
- particles rise from below toward the chair surface
- particle color: #D7D0C8
- AI dialogue:
  “我想要一把粉色的椅子”

Only this state may visibly contain particles.

### K2 — complete pink chair

State:

- complete solid chair
- no visible particles
- no sand
- no dust
- no debris
- no floating particles
- chair color: #E8B7BE
- rotation: 0°
- AI dialogue:
  “我想要一把粉色的椅子”

### K3 — complete blue chair

State:

- no particles
- chair color: #A9C3DF
- rotation: 72°
- AI dialogue:
  “我想要一把蓝色的椅子”

### K4 — complete purple chair

State:

- no particles
- chair color: #BBA6D6
- rotation: 144°
- AI dialogue:
  “我想要一把紫色的椅子”

### K5 — complete red chair

State:

- no particles
- chair color: #E65349
- rotation: 216°
- AI dialogue:
  “我想要一把红色的椅子”

### K6 — complete green chair

State:

- no particles
- chair color: #A8BE98
- rotation: 288°
- AI dialogue:
  “我想要一把绿色的椅子”

At 360°, return to the pink state.

The five complete states are spaced by:

```text
72°
2π / 5
```

Do not use a four-state 90° system.

---

## 10. Particle assembly

Particles must be sampled from the real model surface.

Recommended tools:

- THREE.Points
- THREE.BufferGeometry
- THREE.ShaderMaterial
- MeshSurfaceSampler

Target positions:

- sample all visible model meshes
- allocate samples approximately by visible surface area
- do not sample only the overall bounding box

Default mobile particle count:

```text
14,000
```

Adaptive range:

```text
low-end: 8,000
high-end maximum: 20,000
```

Starting positions:

- below the chair's lowest point
- X spread approximately ±0.65 of model width
- Y spread from 1.2 model-heights below the chair to 0.1 model-heights below
- Z spread approximately ±0.4 of model depth

Visual direction:

- particles rise upward
- particles gather into the chair
- not an explosion
- not smoke
- not outward dispersal
- not falling sand

Shader uniforms:

```text
uProgress
uTime
uOpacity
uPointSize
```

Position interpolation:

```glsl
finalPosition = mix(startPosition, targetPosition, easedProgress);
```

Noise is allowed only in small amounts.

Noise must approach zero as `uProgress` approaches 1.

Suggested timeline:

```text
0.00–0.15 s  scene stabilizes
0.15–1.70 s  particles rise and gather
1.15–1.90 s  solid model fades in
1.65–2.10 s  particles fade out
2.10 s       particlePoints.visible = false
2.10 s+      stop particle shader updates
2.15 s       enable drag interaction
```

Final complete state must satisfy all:

- `particlePoints.visible === false`
- particle updates removed or bypassed
- no particle floor
- no sand mound
- no residue at chair feet
- no floating particles
- no persistent particle texture

---

## 11. Drag rotation

Only horizontal drag rotation is allowed.

Do not allow:

- zoom
- pan
- vertical orbit
- two-finger zoom
- camera orbit
- vertical drag rotation

Use Pointer Events.

On pointerdown, store:

- pointerId
- start X
- current `chairGroup.rotation.y`
- timestamp

On pointermove:

```text
deltaX = currentX - startX
```

Initial sensitivity:

```text
0.008 radians per px
```

Ignore gestures dominated by vertical movement.

On pointerup:

- find nearest 72° state
- use GSAP to snap
- use shortest rotation path
- correctly handle the 360°/0° boundary

Snap duration:

```text
0.42–0.52 s
```

Snap easing:

```text
power3.out
```

During drag:

- chair rotates continuously
- material color continuously interpolates between adjacent states
- do not wait until pointerup to suddenly change color

After pointerup:

- chair lands exactly on nearest key angle
- material lands exactly on target color
- AI sentence lands on matching sentence

---

## 12. Continuous color interpolation

Color order:

1. pink #E8B7BE
2. blue #A9C3DF
3. purple #BBA6D6
4. red #E65349
5. green #A8BE98
6. back to pink

Based on normalized Y rotation:

- identify previous color state
- identify next color state
- compute local ratio
- interpolate material color

This interpolation must form a loop.

Do not:

- switch color instantly
- apply a CSS filter to the canvas
- swap product images
- reduce model opacity to fake color change

---

## 13. AI copy transitions

Dialogue text changes only when a new color sector is firmly entered.

Use hysteresis:

```text
approximately 6–8°
```

Purpose:

- prevent copy from flickering near sector boundaries

Text transition:

1. old text fades from opacity 1 to 0
2. old text moves from translateY 0 to -4 px
3. replace copy
4. new text starts at translateY 4 px
5. new text fades to opacity 1
6. new text moves to translateY 0

Total duration:

```text
280–360 ms
```

Color may change continuously.

Copy changes once per state transition.

---

## 14. SVG annotations

Use a viewport SVG:

```html
<svg viewBox="0 0 393 852">
```

Use exactly four annotation nodes:

- 形态生成
- 结构变化
- 颜色映射
- 参数演化

Baseline positions:

```text
left upper:
center x 58, y 292
copy: 形态生成

left lower:
center x 54, y 505
copy: 结构变化

right upper:
center x 335, y 325
copy: 颜色映射

right lower:
center x 334, y 535
copy: 参数演化
```

Node style:

```text
diameter: 46–50 px
fill: none
stroke: rgba(41,41,41,0.34)
stroke-width: 1 px
stroke-dasharray: 2 4
```

Text:

```text
font-size: 12 px
line-height: 17 px
text-align: center
color: rgba(41,41,41,0.78)
```

Use thin curved paths from nodes toward the chair's surrounding space.

Requirements:

- do not cross the AI dialogue box
- do not cross the award footer
- do not cover important chair surfaces
- paths do not need to attach to real mesh vertices
- annotations remain screen-space UI
- annotations do not rotate with the chair
- no numbering
- no dense parameter list

Optional subtle breathing:

```text
opacity 0.55–0.80
duration 3.5–4.5 s
no scaling
no blinking
```

---

## 15. First interaction hint

Show only after particle assembly completes.

Position:

- below chair
- above award footer
- horizontally centered

Content:

- simple line-art finger icon
- subtle horizontal curved arrows
- copy:
  “左右滑动旋转”

Style:

```text
color: rgba(41,41,41,0.38)
font-size: 12 px
```

Behavior:

- fade in after particles disappear
- fade out on the first pointerdown
- do not show again in the current session
- sessionStorage may be used

Do not use:

- solid black hand
- colored animation
- large tutorial overlay

---

## 16. Award footer

Baseline at 393 × 852:

```text
centered horizontally
bottom: safe-area + 24–30 px
total width: approximately 270 px
total height: approximately 72 px
```

Structure:

- thin-line left laurel
- three centered text lines
- thin-line right laurel

Exact copy:

```text
FORTUNE CHINA
BEST DESIGNS 2022
入选《财富》中国最佳设计榜
```

Color:

```text
#383838
```

English:

```text
restrained serif or system serif
line 1: 14 px
line 2: 15 px
```

Chinese:

```text
12 px
sans-serif
color: #4A4A4A
```

Laurels:

- SVG linework and simple leaves
- no image asset
- no gold
- no heavy solid shapes

Never use:

- WINNER
- BEST PICTURE
- BEST DIRECTOR
- BEST CINEMATOGRAPHY
- film-festival wording
- any other award wording

---

## 17. Entry behavior

First entry:

1. load GLB
2. prepare particles
3. play assembly
4. remove all particles
5. show complete pink state
6. enable drag interaction

While GLB loads:

- keep background white
- a very small neutral loading dot is allowed
- no large Loading title
- no percentage
- no “AI生成中”

Provide a future hook:

```ts
onP0Complete()
```

Do not auto-navigate in the first implementation.

---

## 18. Performance and cleanup

Renderer:

```ts
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
```

Requirements:

- update camera and renderer on resize
- pause animation loop when document is hidden
- resume when visible
- stop particle updates after assembly
- adapt particle count for low-end devices

Cleanup:

- geometry.dispose()
- material.dispose()
- texture.dispose()
- renderer.dispose()
- remove event listeners
- cancel requestAnimationFrame
- kill GSAP timelines and tweens

Reduced motion:

If `prefers-reduced-motion: reduce`:

- skip particle animation
- show complete pink chair immediately
- keep manual drag rotation
- shorten or remove copy vertical movement

WebGL failure:

- show a simple text state:
  “3D 模型暂时无法加载”
- do not invent a fallback chair
- do not use generated chair images as the official fallback

---

## 19. Acceptance criteria

### Model

- real `p0-chair.glb` is used
- geometry is unchanged
- proportions are unchanged
- no stretching
- pivot is correct

### Particles

- rise from below
- form the real chair surface
- disappear fully after assembly
- no sand around completed chair
- stop updating after completion

### Interaction

- horizontal rotation only
- no zoom
- no vertical orbit
- five states at 72° intervals
- correct snap
- continuous color interpolation
- no copy flicker

### Visual

- pure white background
- gray-black text
- exactly one AI dialogue box
- no “AI生成中”
- no multi-card AI area
- four restrained annotations
- exact award copy
- no gold award treatment
- no unrelated award copy

### Output captures

The final running page must produce real browser screenshots for:

1. K1 particle assembly in progress
2. K2 complete pink
3. K3 complete blue
4. K4 complete purple
5. K5 complete red
6. K6 complete green

These captures must come from the running implementation, not from image generation.
