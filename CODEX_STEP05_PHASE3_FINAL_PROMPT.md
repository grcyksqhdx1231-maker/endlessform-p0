# Codex Step 05 — Phase 3 Final Interaction, UI and QA

Send everything below the divider to Codex.

---

阶段二通过。现在开始阶段三，并在本轮完成 P0 页面剩余交互、UI 和最终 QA。

保留当前：

- Candidate B 灯光
- 相机
- 模型位置和缩放
- 纯白背景
- 粒子汇聚
- reduced-motion
- debug Replay

不要重新开启灯光评审，也不要优化或压缩 GLB。

## 开始前读取

重新读取：

- `AGENTS.md`
- `P0_SPEC.md`
- `MODEL_AUDIT.md`
- `PHASE2_PARTICLE_NOTES.md`
- `PHASE3_INTERACTION_UI_NOTES.md`
- `public/models/MODEL_NOTES.md`

## 本阶段目标

完成：

1. 实体椅子的可变色 PBR 材质；
2. 横向 Pointer Events 旋转；
3. 五个 72° 状态；
4. 拖动中的连续颜色插值；
5. GSAP 松手吸附；
6. 单一 AI 对话框及文字过渡；
7. 线框机器人图标；
8. 四个 SVG 虚线标注；
9. 首次旋转手势提示；
10. Fortune China 荣誉区；
11. 进入、Replay 和 reduced-motion 状态整合；
12. 最终 QA；
13. 六张真实运行关键帧截图。

## 仍然禁止

- 修改模型几何
- 非等比缩放模型
- 使用 OrbitControls 作为正式交互
- 允许缩放、平移或上下翻转
- 接入真实 LLM API
- 使用生成图、商品图或视频冒充 UI
- 使用 CSS filter 给 Canvas 变色
- 通过切换图片实现椅子颜色
- 显示多个 AI 卡片或聊天历史
- 显示“AI生成中”
- 使用金色荣誉文字
- 添加新的装饰性背景
- 进入其他首页页面

# 一、整理代码结构

在现有模块基础上增加清晰文件，建议：

```text
src/p0/
├─ interaction/
│  ├─ createChairRotationController.ts
│  ├─ chairStates.ts
│  └─ angleMath.ts
├─ materials/
│  ├─ createInteractiveMaterials.ts
│  └─ materialColorController.ts
├─ ui/
│  ├─ createP0Overlay.ts
│  ├─ createRobotIcon.ts
│  ├─ createAnnotations.ts
│  ├─ createAwardFooter.ts
│  ├─ createRotationHint.ts
│  └─ animateDialogueCopy.ts
├─ createP0StateController.ts
└─ captureState.ts
```

可根据现有结构微调，但不要把所有功能堆进 `main.ts`。

# 二、创建可变色 PBR 材质

## 2.1 不能直接使用深色 baseColor 贴图相乘

当前两个原始材质的 baseColor 贴图整体偏黑。

不要只执行：

```ts
material.color.set(targetColor);
```

因为深色贴图与 pastel color 相乘后仍会接近黑色。

## 2.2 创建非破坏性的 interactive material clones

对 `材质.026` 和 `材质.027`：

1. 保留原始材质引用，不能破坏；
2. 创建 interactive clone；
3. 保留：
   - metalness
   - roughness
   - metalnessMap
   - roughnessMap
   - normalMap
   - normalScale
   - aoMap
   - alphaMap
   - side
   - depthWrite
   - depthTest
   - envMapIntensity
4. interactive clone 的生产默认：
   - 不让深色 baseColor map 主导最终颜色；
   - 允许输出清晰的粉、蓝、紫、红、绿；
   - 材质仍是 PBR `MeshStandardMaterial` 或等效标准材质；
   - 不使用 `MeshBasicMaterial`；
   - 不使用 emissive 假装变亮。

最稳妥的生产方案：

```text
interactive clone:
map = null
color = current chair color
保留 metallic/roughness maps
```

这样保留金属度和粗糙度变化，同时允许准确的 pastel base color。

如果 baseColor map 中有必须保留的细节，可实现一个轻量 `onBeforeCompile` luminance-detail 模式，但不得让黑色纹理把椅子再次压黑。

不要因为保留纹理而牺牲五种颜色的可读性。

## 2.3 Debug-only 材质模式

`?debug=1` 中可保留：

```text
Material mode:
- Interactive pastel
- Original textured
```

正式页面始终使用：

```text
Interactive pastel
```

在 Replay 和正常首屏完成后，实体椅子应显示粉色 interactive material。

## 2.4 粒子时间线整合

在粒子生成开始前，实体 Mesh 已使用 interactive materials，但 opacity = 0。

实体淡入后应直接成为完整粉色椅子。

不要先显示黑色椅子，再突然跳成粉色。

Replay 时：

- 禁用正式旋转；
- rotation.y 回到 0°；
- 状态回到 pink；
- interactive color 回到 #E8B7BE；
- AI 文字回到粉色句子；
- 播放粒子动画；
- 完成后重新启用交互。

# 三、五个椅子状态

创建单一数据源：

```ts
const CHAIR_STATES = [
  {
    id: 'pink',
    angle: 0,
    color: '#E8B7BE',
    copy: '我想要一把粉色的椅子',
  },
  {
    id: 'blue',
    angle: 72,
    color: '#A9C3DF',
    copy: '我想要一把蓝色的椅子',
  },
  {
    id: 'purple',
    angle: 144,
    color: '#BBA6D6',
    copy: '我想要一把紫色的椅子',
  },
  {
    id: 'red',
    angle: 216,
    color: '#E65349',
    copy: '我想要一把红色的椅子',
  },
  {
    id: 'green',
    angle: 288,
    color: '#A8BE98',
    copy: '我想要一把绿色的椅子',
  },
] as const;
```

角度换算为弧度统一处理。

状态间隔必须是：

```text
72°
2π / 5
```

不要改成四个 90° 状态。

# 四、角度数学

允许 `chairGroup.rotation.y` 在拖动过程中连续增加或减少，不必强行限制在 0–2π。

实现：

```text
normalizeAngle(angle) → 0 到 2π
nearestStateIndex(angle)
stateBlend(angle)
nearestUnwrappedSnapAngle(angle)
```

`nearestUnwrappedSnapAngle` 必须选择当前连续角度附近最近的 72° 倍数，确保跨 0°/360° 时走最短路径，而不是反向旋转一整圈。

状态顺序：

```text
rotation.y 增加：
pink → blue → purple → red → green → pink
```

# 五、Pointer Events 横向旋转

绑定在 Canvas 或覆盖整个页面的交互层。

CSS：

```css
touch-action: none;
user-select: none;
-webkit-user-select: none;
```

## pointerdown

要求：

- 只有 `assemblyComplete === true` 才响应；
- `setPointerCapture(pointerId)`；
- 记录：
  - pointerId
  - startX
  - startY
  - startRotationY
  - startTime
- kill 当前未完成的 snap tween；
- 第一次 pointerdown 时关闭旋转提示。

## pointermove

计算：

```text
deltaX = currentX - startX
deltaY = currentY - startY
```

仅横向为主时旋转。

如果：

```text
abs(deltaY) > abs(deltaX) × 1.25
```

则不将该移动视为明显旋转意图。

初始敏感度：

```text
0.008 radians / px
```

建议：

```ts
chairGroup.rotation.y = startRotationY + deltaX * sensitivity;
```

实际正负方向可根据视觉直觉调整，但状态顺序必须保持一致并在报告中说明。

拖动过程中每次更新：

- chair rotation；
- 连续颜色；
- 当前逻辑状态；
- 必要时 AI 句子。

不要通过创建大量 GSAP tweens 处理每次 pointermove。

pointermove 中直接设置角度和颜色，或使用单一复用更新机制。

## pointerup / pointercancel

- 释放 pointer capture；
- 找到最近的 unwrapped 72° snap angle；
- 使用 GSAP tween `chairGroup.rotation.y`；
- duration 0.46s；
- ease `power3.out`；
- tween 的 `onUpdate` 继续更新颜色；
- 完成后精确设为目标状态颜色和文字。

不允许：

- 相机旋转
- 缩放
- 平移
- 垂直旋转
- 双指缩放
- 惯性无限旋转

# 六、连续颜色插值

拖动中的颜色必须连续变化。

根据 normalized rotation：

1. 找到前一个 72° 状态；
2. 找到后一个状态；
3. 计算 localT；
4. 使用 `THREE.Color.lerpColors()` 或等效方法；
5. 同时更新两个 interactive materials。

闭环：

```text
green → pink
```

必须同样连续。

不要等到松手后突然换色。

不要对 renderer、Canvas 或页面使用 CSS filter。

# 七、AI 文字状态与迟滞

颜色连续变化，但 AI 句子不应在边界反复闪烁。

使用约：

```text
7°
```

迟滞。

策略：

- 保存 activeCopyStateIndex；
- 只有旋转明确越过目标扇区中心边界并超过迟滞范围时才改变；
- 同一状态不重复播放文字动画。

文字动画使用 GSAP：

```text
旧文字：
opacity 1 → 0
translateY 0 → -4px

替换内容

新文字：
opacity 0 → 1
translateY 4px → 0
```

总时长：

```text
0.30–0.34s
```

若 reduced motion：

- 直接替换文字；
- 或只做 0.12s opacity；
- 不做位移动画。

# 八、创建单一 AI 对话框

使用 HTML/CSS/SVG，不在 Three.js Canvas 中绘制。

393×852 基准：

```text
top: safe-area + 28px
right: 18px
width: 268px
height: 58px
```

样式：

```text
background: #FFFFFF
border: 1px solid rgba(41,41,41,0.28)
border-radius: 29px
padding-inline: 18px
display: flex
align-items: center
gap: 14px
```

机器人图标：

```text
22×22px
stroke: #4B4B4B
stroke-width: 1.4
fill: none
```

图标只包含：

- 圆角方形头部
- 两只圆点眼睛
- 短天线
- 两侧小耳部

不要：

- 机器人身体
- 填充色
- 渐变
- emoji
- 卡通表情

机器人和句子之间：

```text
1px 垂直分割线
24px 高
rgba(41,41,41,0.16)
```

句子：

```text
font-size: 16px
line-height: 24px
font-weight: 400
color: #292929
white-space: nowrap
```

AI 区域只能有这一个对话框。

禁止：

- AI生成中
- 标题
- 发送按钮
- 输入光标
- 多卡片
- 历史消息
- 三点菜单
- 彩色进度条

为对话框增加：

```text
aria-live="polite"
```

不要让频繁颜色插值触发频繁 aria 更新，只在文案状态变化时更新。

# 九、四个 SVG 虚线标注

创建全屏覆盖 SVG：

```html
<svg viewBox="0 0 393 852" preserveAspectRatio="none">
```

SVG 本身：

```css
pointer-events: none;
```

只显示四个节点：

```text
左上：
中心 58, 292
形态
生成

左下：
中心 54, 505
结构
变化

右上：
中心 335, 325
颜色
映射

右下：
中心 334, 535
参数
演化
```

节点：

```text
直径 48px
fill none
stroke rgba(41,41,41,0.34)
stroke-width 1
stroke-dasharray 2 4
```

文字：

```text
12px
17px line-height
rgba(41,41,41,0.78)
```

连接曲线终点初值：

```text
左上 → 约 (145, 318)
左下 → 约 (132, 500)
右上 → 约 (258, 340)
右下 → 约 (260, 525)
```

使用细 Bezier 曲线。

要求：

- 不穿过 AI 框；
- 不穿过荣誉区；
- 不遮挡椅子主要折面；
- 不跟随椅子旋转；
- 不显示数字；
- 不增加更多参数；
- 不在节点后加白色卡片。

可做非常轻的 opacity 呼吸：

```text
0.58 ↔ 0.78
4s 左右
```

不要缩放和闪烁。

如果不同屏幕比例导致节点与模型冲突，使用 CSS clamp 或基于 393×852 的等比定位微调，但必须保持布局克制。

# 十、旋转提示

粒子彻底消失、交互启用后显示。

位置：

```text
模型下方
荣誉区上方
水平居中
```

包含：

- 线框手指图标；
- 左右弧形箭头；
- “左右滑动旋转”。

样式：

```text
color: rgba(41,41,41,0.38)
font-size: 12px
```

进入：

```text
opacity 0 → 1
duration 0.45s
```

第一次 pointerdown 后：

```text
opacity → 0
duration 0.25s
```

之后：

```text
display: none
```

使用 sessionStorage：

```text
endlessform-p0-rotation-hint-seen
```

Replay 不应在同一会话中重复显示提示。

Debug 中允许清除该 sessionStorage 状态。

# 十一、荣誉区

使用 HTML + 内联 SVG。

393×852 基准：

```text
bottom: safe-area + 24px
centered
width: 270px
height: approximately 72px
```

结构：

```text
左侧细线桂冠
中间三行文字
右侧细线桂冠
```

文案必须完全准确：

```text
FORTUNE CHINA
BEST DESIGNS 2022
入选《财富》中国最佳设计榜
```

颜色：

```text
#383838
```

英文字体：

- 系统 serif 或克制衬线字体；
- 第一行 14px；
- 第二行 15px；
- letter-spacing 适度，不要电影海报式夸张字距。

中文：

```text
12px
sans-serif
#4A4A4A
```

桂冠：

- 内联 SVG；
- 细线茎与少量叶片；
- 灰黑色；
- 不使用图片；
- 不使用金色；
- 不使用粗实心徽章。

绝对禁止出现：

- WINNER
- BEST PICTURE
- BEST DIRECTOR
- BEST CINEMATOGRAPHY
- INTERNATIONAL FILM FESTIVAL
- FILM CRITICS WEEK
- 任何其他虚构奖项

# 十二、层级与交互区域

最终层级：

```text
background
Three.js Canvas
SVG annotations
AI dialogue
rotation hint
award footer
debug UI
```

要求：

- AI 对话框和荣誉区不阻止用户在椅子区域拖动；
- SVG annotations `pointer-events:none`；
- AI 对话框保留正常选择禁用，避免拖动时选中文字；
- Canvas 或页面交互层接收主要 Pointer Events。

# 十三、响应式

基准：

```text
393×852
```

必须验证：

```text
375×812
430×932
```

要求：

- AI 框不出屏；
- 荣誉区不与椅脚重叠；
- 旋转提示不与荣誉区重叠；
- 四个标注不被裁切；
- 模型仍保持当前构图范围；
- 不出现滚动；
- 不出现文字换行；
- safe area 生效。

可使用：

```css
clamp()
calc()
env(safe-area-inset-top)
env(safe-area-inset-bottom)
```

# 十四、Keyboard 和无障碍

桌面调试和无障碍支持：

- 页面交互区域可获得焦点；
- ArrowRight：进入下一个 72° 状态；
- ArrowLeft：进入上一个 72° 状态；
- 使用与 pointerup 相同的 GSAP snap；
- 添加可理解的 aria-label：
  “旋转椅子以切换颜色”。

不要添加可见的桌面按钮。

reduced motion 下键盘切换仍可用。

# 十五、状态整合

建立统一 P0 state controller。

至少管理：

```text
assemblyComplete
interactionEnabled
isDragging
activeStateIndex
activeCopyStateIndex
currentUnwrappedAngle
reducedMotion
materialMode
```

避免粒子、旋转、文字和颜色各自维护冲突状态。

## 初次加载

```text
GLB ready
→ interactive material pink
→ particles play
→ solid pink fades in
→ particles disabled
→ interaction enabled
→ AI/SVG/award already visible or softly enter
→ rotation hint appears
```

UI 进入建议：

- AI 对话框可在粒子中后段淡入；
- annotations 在粒子中后段淡入；
- award footer 在粒子中后段淡入；
- 不要让全部 UI 突然同时跳出；
- 动画必须克制，总体不超过粒子完成时间太多。

## Replay

Replay：

- kill snap tween；
- 禁用 pointer interaction；
- rotation.y 回到 0；
- material color 回到 pink；
- AI copy 回到 pink；
- 保留 UI；
- 重播粒子；
- 完成后重新启用交互。

# 十六、Debug 与 capture 状态

扩展 `?debug=1` 面板：

显示：

- current unwrapped angle
- normalized angle
- active state
- active copy state
- interaction enabled
- is dragging
- current interpolated hex color
- material mode
- clear rotation-hint session state
- snap to each of five states
- replay assembly

支持：

```text
?capture=k1
?capture=k2
?capture=k3
?capture=k4
?capture=k5
?capture=k6
```

行为：

### k1

- 393×852 capture 目标；
- particle timeline 约 0.85s；
- timeline paused；
- interaction disabled；
- UI 可按最终设计状态显示；
- AI copy 为粉色句子。

### k2

- complete；
- rotation 0°；
- pink；
- no particles。

### k3

- complete；
- rotation 72°；
- blue；
- no particles。

### k4

- complete；
- rotation 144°；
- purple；
- no particles。

### k5

- complete；
- rotation 216°；
- red；
- no particles。

### k6

- complete；
- rotation 288°；
- green；
- no particles。

capture 模式不显示 debug panel。

# 十七、最终截图

使用 production preview 的真实运行页面，在 393×852 输出：

```text
p0-k1-assembly.png
p0-k2-pink.png
p0-k3-blue.png
p0-k4-purple.png
p0-k5-red.png
p0-k6-green.png
```

要求：

- 不是重新生成图片；
- 来自真实 Three.js 网页；
- K2–K6 完全无粒子；
- 五张完整状态使用同一相机、模型比例和 UI 布局；
- 角度、颜色、AI 文案一一对应；
- 荣誉文案准确；
- 无 debug 面板；
- 无浏览器滚动条。

另录制或报告一次真实交互验证：

```text
pointer drag
→ continuous rotation
→ continuous color interpolation
→ copy state changes
→ release
→ GSAP snap
```

若当前浏览器控制工具能录制短视频，可输出一个简短 MP4/WebM；若不能，不必引入录屏依赖，只报告交互验证。

# 十八、性能与警告

保持：

```ts
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
```

交互完成状态：

- 粒子 inactive；
- 不更新 uTime；
- 不因为文字状态创建无限 tween；
- pointermove 不创建大量未清理 tween；
- 所有 snap tween 可 kill；
- UI 呼吸动画在页面 hidden 时暂停或整体 GSAP 暂停。

处理控制台警告：

- 检查当前 `PCFSoftShadowMap` 弃用 warning；
- 如果当前 Three r185 可安全替换为受支持的阴影类型且视觉不明显变差，则修复；
- 如果替换会明显破坏已确认灯光，不得为消除 warning 牺牲视觉，在报告中记录。

不要在本阶段做：

- KTX2
- Draco
- GLB 重导出
- 大规模 bundle 架构重写

Vite chunk warning 可记录为后续优化，不应阻塞交付。

# 十九、测试

运行：

```text
npm run typecheck
npm run build
```

验证：

- 375×812
- 393×852
- 430×932
- mouse drag
- touch/pointer drag
- pointercancel
- cross-boundary green→pink
- repeated full revolutions
- snap shortest path
- copy hysteresis
- keyboard left/right
- Replay
- reduced motion
- visibility pause/resume
- K2–K6 zero-particle state
- WebGL error fallback still works

如果没有 lint 配置，不新增 ESLint。

# 二十、完成后停止并汇报

最终回复必须包含：

1. 修改文件清单；
2. interactive material 的实现方式；
3. 是否移除深色 baseColor map，以及保留了哪些 PBR map；
4. 五状态数据源；
5. Pointer Events 实现；
6. 角度归一化与最短路径吸附实现；
7. 连续颜色插值实现；
8. copy hysteresis 实现；
9. AI 对话框结构；
10. SVG annotation 实现；
11. rotation hint 与 sessionStorage；
12. award footer 的准确文案确认；
13. 六张截图路径；
14. 三种 viewport 验证结果；
15. reduced-motion 结果；
16. performance 与 console warning；
17. typecheck 结果；
18. build 结果；
19. 已知限制；
20. 本地启动命令和访问地址。

同时明确确认：

- 没有修改模型几何；
- 没有接入真实 LLM；
- 没有使用参考图片；
- 没有在完成状态保留粒子；
- 没有进入其他页面开发。
