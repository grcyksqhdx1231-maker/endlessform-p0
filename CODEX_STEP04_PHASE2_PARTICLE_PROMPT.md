# Codex Step 04 — Phase 2 Particle Assembly

Send everything below the divider to Codex after the lighting patch has completed.

---

当前灯光修正版结束后，不需要再等待视觉确认，直接进入阶段二。

保留当前最优的灯光、相机、模型位置、模型缩放和纯白背景。不要继续花时间制作更多灯光候选。

## 开始前读取

重新读取：

- `AGENTS.md`
- `P0_SPEC.md`
- `MODEL_AUDIT.md`
- `PHASE2_PARTICLE_NOTES.md`
- `public/models/MODEL_NOTES.md`

如果 `PHASE1_LIGHTING_DIAGNOSIS.md` 存在，也读取它，但不要重新开启灯光评审。

## 本阶段允许

- 修改现有项目文件
- 安装 `gsap`
- 使用 Three.js 自带的 `MeshSurfaceSampler`
- 新增 Shader、粒子系统和 GSAP 时间线
- 新增 debug-only 粒子控制面板

## 本阶段禁止

- 不做正式拖动旋转
- 不做五色状态
- 不做 AI 对话框
- 不做机器人图标
- 不做 SVG 标注
- 不做旋转提示
- 不做荣誉区
- 不优化或压缩 GLB
- 不转换 KTX2
- 不修改模型几何
- 不添加沙丘、粒子地面或长期漂浮灰尘
- 不使用视频、GIF、图片序列或 Canvas 2D 冒充粒子生成

## 安装依赖

使用 npm 安装：

```text
gsap
```

不要安装额外粒子库、噪声库或 React 相关依赖。

`MeshSurfaceSampler` 从当前 Three.js addons 导入。

## 代码结构

在现有结构基础上新增或调整为清晰模块，建议：

```text
src/p0/
├─ particles/
│  ├─ createParticleAssembly.ts
│  ├─ sampleChairSurface.ts
│  ├─ particleShaders.ts
│  ├─ particleQuality.ts
│  └─ disposeParticleAssembly.ts
├─ createLoadingTimeline.ts
└─ reducedMotion.ts
```

允许根据现有代码结构微调，但不要把所有逻辑塞进 `main.ts`。

## 一、真实模型表面采样

粒子终点必须来自真实 GLB 的两个可见 Mesh 表面。

使用：

```ts
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
```

要求：

1. 遍历 `chairGroup` 内所有可见 `THREE.Mesh`。
2. 排除：
   - 不可见 Mesh
   - 无 position attribute 的几何
   - 面积为 0 的几何
3. 计算每个 Mesh 的世界表面积。
4. 按表面积比例分配粒子数。
5. 每个 Mesh 至少分配少量粒子，避免小部件完全缺失。
6. 用固定 seed 的伪随机数，保证调试截图可复现。
7. 采样点最终存储在 `chairGroup` local space。

坐标转换必须正确：

```text
sample point in mesh local space
→ apply mesh.matrixWorld
→ chairGroup.worldToLocal
```

在采样前调用：

```ts
chairGroup.updateMatrixWorld(true);
```

不要只对模型 BoundingBox 随机取点。

不要把粒子目标点写成模型外部近似轮廓。

## 二、粒子数量与质量档

默认基准：

```text
393×852 mobile: 14,000 particles
```

实现三个档：

```text
low: 8,000
medium: 14,000
high: 20,000
```

自动判断可参考：

- `navigator.hardwareConcurrency`
- `navigator.deviceMemory`，存在时使用
- viewport 面积
- reduced motion

默认手机使用 medium。

低性能设备使用 low。

高性能桌面调试可以使用 high。

通过 debug query 或 debug panel 可以手动切换质量档并 Replay。

不要让粒子数量随着每一帧变化。

## 三、起始位置分布

所有起始位置位于椅子最低点以下。

基于 chair local BoundingBox：

```text
width = box.max.x - box.min.x
height = box.max.y - box.min.y
depth = box.max.z - box.min.z
bottomY = box.min.y
```

推荐分布：

```text
startX:
以目标点 X 为基础加入随机扩散
总范围约为椅宽的 ±0.65

startY:
bottomY - random(0.10 × height, 1.20 × height)

startZ:
以目标点 Z 为基础加入随机扩散
总范围约为椅深的 ±0.40
```

视觉要求：

- 粒子从下向上移动
- 初始状态像从下方空气中汇聚
- 不生成明显的地面沙丘
- 不生成厚重沙浪
- 不出现从上向下坠落
- 不像爆炸
- 不像烟雾
- 不从椅子向外散开

## 四、从下到上的形成顺序

椅子必须有明显的“下部先形成、上部后形成”的感觉。

为每个粒子创建：

```text
aStartPosition
aTargetPosition
aDelay
aRandom
```

`aDelay` 主要由目标点归一化 Y 决定：

```text
lower target Y → smaller delay
higher target Y → larger delay
```

建议：

```glsl
normalizedTargetY = clamp((targetY - minY) / height, 0.0, 1.0);
delay = normalizedTargetY * 0.42 + randomJitter * 0.10;
```

局部进度：

```glsl
localProgress = clamp(
  (uProgress - delay) / max(0.0001, 1.0 - delay),
  0.0,
  1.0
);
```

使用平滑 easing。

形成顺序需要可读，但不要像机械扫描线。

## 五、Shader

使用：

- `THREE.Points`
- `THREE.BufferGeometry`
- `THREE.ShaderMaterial`

Attributes 至少包含：

```text
aStartPosition
aTargetPosition
aDelay
aRandom
```

Uniforms 至少包含：

```text
uProgress
uTime
uOpacity
uPointSize
uPixelRatio
uColor
```

顶点核心逻辑：

```glsl
vec3 basePosition = mix(
  aStartPosition,
  aTargetPosition,
  easedLocalProgress
);
```

允许加入少量横向扰动或旋流，但必须：

```text
noise strength ∝ (1.0 - easedLocalProgress)
```

粒子越接近目标，噪声越弱。

在完成时，粒子必须准确落在真实椅子表面。

粒子颜色：

```text
#D7D0C8
```

可加入很小的亮度随机差，但整体保持浅灰米色。

Fragment Shader：

- 使用 `gl_PointCoord`
- 粒子为柔和圆点
- 圆外 discard
- 边缘轻微软化
- 不使用方形像素块
- 不使用发光 additive blending

建议：

```text
transparent: true
depthWrite: false
depthTest: true
blending: NormalBlending
```

避免 AdditiveBlending 造成发光灰雾。

## 六、粒子尺寸

移动端视觉目标：

- 粒子细小
- 能看见聚合过程
- 不遮住模型整体轮廓
- 不像粗砂砾

初始 `uPointSize` 建议从：

```text
1.4–2.1 CSS px
```

范围调试。

根据透视距离做合理尺寸衰减。

`uPixelRatio` 最大使用 1.5，与 renderer 保持一致。

## 七、实体模型淡入

必须保留原始两个 PBR 材质和纹理。

为了阶段二淡入：

1. 保存每个原始材质的：
   - opacity
   - transparent
   - depthWrite
2. 在时间线开始前：
   - 设置临时 `transparent = true`
   - opacity = 0
3. GSAP 淡入 opacity。
4. 完成后恢复：
   - 原始 transparent
   - opacity = 原始值
   - depthWrite = 原始值
   - needsUpdate = true

不得：

- 用替代材质淡入
- 删除贴图
- 修改颜色
- 修改 roughness/metalness
- 将模型整体切换成 MeshBasicMaterial

同一个材质若被多个 Mesh 共享，不要重复破坏状态。

## 八、GSAP 加载时间线

安装并使用 GSAP。

建立可重放的独立 timeline。

时间线目标：

```text
0.00–0.15 s
场景稳定，实体椅子 opacity = 0

0.15–1.70 s
uProgress: 0 → 1

1.15–1.90 s
实体模型 opacity: 0 → 1

1.65–2.10 s
uOpacity: 1 → 0

2.10 s
彻底停用粒子

2.15 s
标记 assemblyComplete = true
为阶段三预留 enableInteraction() hook
```

建议 easing：

```text
particle progress: power2.inOut
solid fade: power2.out
particle fade: power2.out
```

在完成回调必须执行：

```ts
particlePoints.visible = false;
particleAssembly.setActive(false);
```

渲染循环中：

```text
只有 particleAssembly.active === true 时才更新 uTime
```

完整状态不再更新粒子 Shader。

不要只把 opacity 设为 0 后继续每帧计算。

## 九、最终完整状态

2.10 秒以后必须满足：

- 椅子是完整实体模型
- 原始材质恢复
- 粒子不可见
- 无地面粒子
- 无脚边沙子
- 无空中漂浮粒子
- 无循环噪声
- 无粒子更新
- 页面仍然纯白
- 保留当前相机和当前最优灯光

## 十、Reduced Motion

检测：

```css
prefers-reduced-motion: reduce
```

若开启：

- 不创建或不播放聚沙时间线
- 直接显示完整实体椅子
- 粒子保持不可见
- 预留阶段三的旋转能力
- 不自动循环任何动画

## 十一、页面隐藏与恢复

使用 `visibilitychange`。

页面隐藏时：

- 暂停 GSAP timeline
- 暂停 requestAnimationFrame 或现有渲染循环
- 不继续推进粒子动画

页面恢复时：

- 从原时间点继续
- 不重新开始，除非用户点击 Replay

## 十二、Debug-only 控制

在 `?debug=1` 下加入轻量原生 HTML 控制，不安装 GUI 库。

至少包含：

- Replay assembly
- Pause / Resume
- Timeline progress slider
- Particle quality：low / medium / high
- Particle count 显示
- `uPointSize`
- 当前 `uProgress`
- 当前 `uOpacity`
- `particles.visible`
- `particles.active`
- `assemblyComplete`

增加调试 URL 状态：

```text
?debug=1&capture=assembly
```

行为：

- 加载完成后将 timeline 设置到能表现 K1 的时间点
- 建议时间约 0.85 s
- 暂停 timeline
- 保持真实运行状态供截图

```text
?debug=1&capture=complete
```

行为：

- 直接进入 2.20 s 后完整状态
- 粒子 visible=false
- 粒子 active=false

普通用户 URL 不显示 debug UI。

## 十三、运行时截图

输出来自真实网页的 393×852 截图：

1. `phase2-assembly-early.png`
   - 约 0.45 s
   - 粒子开始上升
   - 椅子形成较少

2. `phase2-assembly-keyframe.png`
   - 约 0.85 s
   - 椅子约形成 35–45%
   - 下部比上部更完整

3. `phase2-assembly-late.png`
   - 约 1.55 s
   - 大部分模型已形成
   - 实体模型正在淡入

4. `phase2-complete.png`
   - 2.20 s 以后
   - 完整实体椅子
   - 完全无粒子、无沙子、无灰尘

截图要求：

- 393×852
- 纯白背景
- 不显示 debug 面板
- 不显示阶段三 UI
- 使用同一相机、灯光和模型角度

## 十四、性能信息

报告：

- 实际粒子数量
- BufferGeometry attributes 内存估算
- 平均 FPS，至少在当前测试设备上
- 粒子阶段结束后 FPS / CPU 是否恢复
- 是否出现明显 GC 抖动
- 是否停止 `uTime` 更新

暂时不要求 Lighthouse。

## 十五、验证

运行：

```text
npm run typecheck
npm run build
```

使用可用浏览器控制验证：

- 375×812
- 393×852
- 430×932
- normal motion
- reduced motion
- visibility pause/resume
- Replay
- complete state zero-particle check

如果没有 lint 配置，不新增 ESLint。

## 十六、完成后立即停止

本轮完成后不要进入阶段三。

回复必须包含：

1. 修改文件清单
2. 安装的 GSAP 版本
3. 表面采样实现方式
4. 每个 Mesh 分配的粒子数
5. 粒子起点分布
6. Shader attributes 与 uniforms
7. GSAP timeline 完整时间参数
8. 粒子彻底停止的代码位置
9. reduced-motion 实现
10. 四张截图路径
11. 三种 viewport 验证
12. 性能信息
13. typecheck 结果
14. build 结果
15. 已知问题

同时确认未实现：

- 用户拖动
- 五色状态
- AI 对话框
- 机器人图标
- SVG 标注
- 手势提示
- 荣誉区
