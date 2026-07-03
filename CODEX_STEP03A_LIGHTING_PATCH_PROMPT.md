# Codex Step 03A — Lighting Correction Patch

Send everything below the divider to Codex.

---

阶段一的模型加载与工程结构通过，但当前灯光表现不通过。仍然停留在阶段一，不得进入粒子或交互阶段。

## 先读取

重新读取：

- `AGENTS.md`
- `P0_SPEC.md`
- `MODEL_AUDIT.md`
- `PHASE1_LIGHTING_DIAGNOSIS.md`

## 当前视觉问题

当前 0° 正面截图中：

1. 大面积黑色面板几乎糊成一整块，折面层级不可读。
2. 银白色边框和高光过亮，与黑色主体形成生硬描边感。
3. 正面中央区域缺乏柔和环境反射，体积感偏平。
4. 地面阴影向右拖得过长，不像克制的接触阴影。
5. 不能通过继续提高现有 DirectionalLight 强度来解决，否则边缘会更亮、黑面仍然过暗。

## 本轮唯一目标

修正阶段一的：

- PBR 环境反射
- 曝光
- 直射光比例
- 接触阴影
- 折面可读性

不得实现：

- 粒子
- GSAP
- 拖动
- 颜色状态
- AI 框
- SVG 标注
- 荣誉区
- 模型优化
- 纹理压缩
- 正式材质替换

## 1. 加入中性程序化 IBL

使用 Three.js 自带的：

```ts
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
```

使用 `PMREMGenerator` 将 RoomEnvironment 转为 PBR 环境贴图。

要求：

```ts
scene.background = new THREE.Color(0xffffff);
scene.environment = generatedRoomEnvironmentTexture;
```

只将 RoomEnvironment 用作材质反射与间接光。

不要把 RoomEnvironment 设置为可见背景。

页面背景始终必须是纯白色。

初始化完成后正确释放：

- 临时 RoomEnvironment
- PMREMGenerator
- 不再需要的 render target

但在场景使用期间不要提前 dispose 正在被 `scene.environment` 使用的纹理。

## 2. Renderer 色彩与曝光

明确设置：

```ts
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
```

将以下参数加入 `?debug=1` 的原生调试面板：

- toneMappingExposure：0.85–1.35
- scene.environmentIntensity：0.40–1.40
- scene.environmentRotation.y：-180°–180°

正式模式隐藏调试面板。

## 3. 重做灯光比例

不要保留当前四盏灯的高强度组合。

采用“环境反射为主、直射光塑形为辅”。

初始参数使用：

```text
scene.environmentIntensity: 0.95

HemisphereLight:
sky: #FFFFFF
ground: #F2F2F2
intensity: 0.35

Key DirectionalLight:
position: [-3.5, 6.0, 4.8]
intensity: 1.15

Fill DirectionalLight:
position: [4.2, 3.2, 4.6]
intensity: 0.38

Rim DirectionalLight:
position: [-2.5, 4.8, -4.0]
intensity: 0.48
```

要求：

- Key 负责折面方向。
- Fill 只抬起暗部，不得抹平结构。
- Rim 只分离轮廓，不得形成白色描边。
- 只有 Key 可以 castShadow。
- Fill、Rim、Hemisphere 不 castShadow。
- 所有光保持中性白，不使用蓝光或暖黄光。

将这些强度加入 debug 面板，以便运行时微调。

## 4. 材质规则

生产显示模式继续使用 GLB 原始材质和原始纹理。

不得：

- 删除 baseColor map
- 删除 metallicRoughness map
- 覆盖 roughness
- 覆盖 metalness
- 修改 production material.color
- 将材质换成 MeshBasicMaterial
- 增加 emissive 来假装提亮

可以对两个原始 `MeshStandardMaterial` 设置合理的环境反射强度。

优先通过：

```ts
scene.environmentIntensity
```

统一控制。

如果需要材质级微调，`envMapIntensity` 保持在 0.75–1.10 范围内，并记录最终值。

## 5. 增加 debug-only 材质诊断开关

仅在 `?debug=1` 模式增加：

```text
Material preview:
- Original textured PBR
- Neutral diagnostic PBR
```

Neutral diagnostic PBR 规则：

- 克隆材质，不修改原始材质
- 临时取消 baseColor map
- color 使用中性灰：`#B8BABD`
- 保留 metallicRoughness map
- 保留 normal map（若存在）
- 保留 roughness / metalness 数值
- 仅用于判断“暗”来自灯光还是 base-color texture
- 正式模式永远使用 Original textured PBR

切换回 Original 时必须恢复原始材质引用。

不要把 Neutral diagnostic 模式作为最终页面方案。

## 6. 接触阴影

当前阴影向右拖得过长，需要改为更接近椅脚的柔和接触阴影。

要求：

- 只有 Key castShadow
- 使用 `THREE.PCFSoftShadowMap`
- ShadowMaterial opacity 初值：0.045
- 阴影颜色：#000000
- 阴影主体集中在椅脚下方
- 不出现明显长方向阴影
- 不出现可见灰色地板
- 不出现椭圆贴图式假阴影

优先调整 Key 的高度与方向，使阴影缩短。

可调范围：

```text
ShadowMaterial opacity: 0.025–0.065
Key position Y: 5.0–8.0
```

如果真实阴影仍然破坏纯白画面，允许关闭 castShadow，仅保留非常轻的接触暗部，但必须在报告中说明。

## 7. 输出三套真实运行灯光候选

使用同一个：

- 393×852 viewport
- 0° rotation
- 相机
- 模型 position
- 模型 scale
- 原始 production material
- 纯白背景

只改变灯光/曝光参数，输出：

### Candidate A — Balanced

目标：

- 黑色面板仍然保持黑色材质特征
- 面板之间可以区分
- 边框不过曝
- 阴影很轻

初始建议：

```text
exposure: 1.08
environmentIntensity: 0.85
key: 1.15
fill: 0.34
rim: 0.42
shadow opacity: 0.04
```

### Candidate B — Brighter Product

目标：

- 暗面更容易辨认
- 仍保持材质真实
- 不洗白纹理

初始建议：

```text
exposure: 1.16
environmentIntensity: 1.08
key: 1.05
fill: 0.46
rim: 0.44
shadow opacity: 0.035
```

### Candidate C — Soft Gallery

目标：

- 光线更柔和
- 反射过渡平滑
- 轮廓最克制

初始建议：

```text
exposure: 1.10
environmentIntensity: 0.98
key: 0.88
fill: 0.42
rim: 0.30
shadow opacity: 0.03
```

这些参数可以在小范围内微调，但三套候选必须明显有区别。

## 8. 额外诊断截图

另外输出两张，仅用于诊断：

1. `original-material-best-light.png`
   - 选三套中最优灯光
   - 原始材质

2. `neutral-diagnostic-same-light.png`
   - 完全相同的相机、角度和灯光
   - 仅切换 Neutral diagnostic PBR

通过这两张说明：

- 当前暗部主要来自灯光
- 还是主要来自 baseColor texture
- 或两者共同造成

## 9. 可选三分之四视角检查

灯光修正后，再使用最优灯光输出一张：

```text
rotation.y = 20°
```

文件名：

```text
best-light-rotation-20.png
```

它只用于判断轻微三分之四视角是否比完全正面更适合 P0。

不要把 20° 写死为最终默认角度。

## 10. 验证与停止

运行：

- `npm run typecheck`
- `npm run build`

完成后停止，不进入阶段二。

回复必须包含：

1. 修改文件清单
2. RoomEnvironment / PMREM 的实现位置
3. renderer 最终色彩设置
4. 三套候选的完整参数
5. 三套候选截图路径
6. 原始材质与 Neutral diagnostic 对比截图路径
7. 对黑面问题根因的判断
8. 最优候选建议与理由
9. 20°截图路径
10. 阴影最终参数
11. typecheck 与 build 结果

同时确认未实现：

- 粒子
- GSAP
- 拖动
- 颜色切换
- AI UI
- SVG 标注
- 荣誉区
