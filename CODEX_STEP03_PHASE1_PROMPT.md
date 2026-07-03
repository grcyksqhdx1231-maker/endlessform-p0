# Codex Step 03 — Phase 1 Static Three.js Scene

Send the content below to Codex only after adding `MODEL_AUDIT.md` to the project root.

---

阶段一现在可以开始。

你可以修改项目文件并安装本阶段所需依赖，但必须严格停留在阶段一。

## 先读取

在开始前重新读取：

- `AGENTS.md`
- `P0_SPEC.md`
- `MODEL_AUDIT.md`
- `public/models/MODEL_NOTES.md`

## 当前仓库情况

当前没有前端框架、`package.json`、`src` 或锁文件。

请在当前项目根目录直接建立最小化的 Vite + vanilla TypeScript 项目。

不要：

- 新建第二层嵌套项目文件夹
- 删除现有 Markdown 文件
- 移动 `public/models/p0-chair.glb`
- 引入 React、Vue、Next.js 或 React Three Fiber
- 使用视觉参考图片
- 优化、压缩或重写 GLB
- 修改模型几何

## 本阶段允许安装

使用 npm。

只安装阶段一必要依赖：

- `vite`
- `typescript`
- `three`

不要安装 GSAP。GSAP 留到阶段二。

如果 Three.js 当前包已经包含类型声明，不要重复安装不必要的类型包。

## 建议工程结构

保持结构简单、可维护：

```text
src/
├─ main.ts
├─ styles.css
└─ p0/
   ├─ createRenderer.ts
   ├─ createScene.ts
   ├─ loadChair.ts
   ├─ fitCamera.ts
   ├─ createLights.ts
   ├─ createContactShadow.ts
   ├─ createDebugPanel.ts
   └─ dispose.ts
```

可以根据实际实现微调文件名，但不要把所有逻辑塞进一个文件。

## 阶段一唯一目标

在真实浏览器中完成一个纯白背景的静态 3D 椅子页面，准确确认：

- 模型是否正确
- 模型正面
- 旋转中心
- 模型比例
- 相机构图
- 灯光
- 材质
- 移动端适配

本阶段只显示完整实体椅子。

## 页面基础

页面必须：

- `width: 100vw`
- `height: 100dvh`
- `overflow: hidden`
- `background: #FFFFFF`
- 无页面滚动
- 无横向溢出
- 处理手机安全区
- Canvas 覆盖整个页面
- 适配 375×812、393×852、430×932

不要在页面中加入：

- 粒子
- 沙子
- AI 对话框
- 机器人图标
- SVG 参数标注
- 旋转提示
- 荣誉区
- 颜色切换
- 自动旋转
- 用户拖动
- GSAP

## Three.js 场景

使用真实文件：

```text
public/models/p0-chair.glb
```

要求：

1. 使用 GLTFLoader。
2. 创建外层 `chairGroup`。
3. 使用完整世界 BoundingBox 计算模型中心。
4. 将 GLB 内容移动到 `chairGroup` 原点附近。
5. 后续任何角度变化都预留给 `chairGroup.rotation.y`。
6. 不直接破坏性修改单个 Mesh 的几何。
7. 只允许整个模型等比缩放。
8. 保留原始材质和四张原始纹理。
9. 当前阶段不得修改两个材质的颜色。
10. 当前阶段不得替换 metallic、roughness 或 base-color 贴图。

## Renderer

要求：

- 纯白清屏色
- 正确处理当前 Three.js 版本的输出色彩空间
- `pixelRatio` 最大为 1.5
- 根据容器尺寸 resize
- 开启柔和阴影
- 页面隐藏时暂停动画循环
- 页面恢复时继续
- 销毁时释放 renderer、geometry、material、texture 和监听器

即使页面是静态场景，也应保留受控渲染循环或按需渲染结构，方便后续阶段扩展。

## 相机与构图

使用 PerspectiveCamera。

以 `P0_SPEC.md` 的 393×852 构图为目标：

- 椅子视觉中心约在 x=196、y=438
- 椅子投影宽度约 238–260 px
- 椅子投影高度约 400–440 px
- 椅子顶部约 y=210–230
- 椅子底部约 y=625–650

要求：

1. 根据模型 BoundingBox 或 BoundingSphere 动态适配相机距离。
2. 不使用夸张广角。
3. FOV 初值可从 28° 附近开始，但必须以真实运行结果为准。
4. 相机在阶段一保持固定。
5. 不使用 OrbitControls 作为正式交互。
6. 不允许模型因非等比缩放而变形。
7. 不要假定 GLB 的 0° 就是正确正面。

## 灯光

目标是中性、明亮、柔和的白色摄影棚光。

建议：

- 柔和环境光或 HemisphereLight
- 左上方主光
- 右前方低强度补光
- 后上方轻微轮廓光

要求：

- 背景保持纯白
- 折面层次清楚
- 不出现深黑反射斑
- 不出现强烈冷暖双色光
- 不添加彩色环境光
- 不过曝
- 不把模型照成完全平面

## 接触阴影

可以使用一个不可见的 ShadowMaterial 平面。

要求：

- 只显示非常轻的接触阴影
- 平面本身不可见
- 阴影透明度约 0.05–0.08
- 不出现灰色地板
- 不出现强烈椭圆投影

如果当前材质或灯光导致阴影明显破坏纯白画面，可以先关闭接触阴影并在报告中说明。

## 前向确认与调试模式

GLB 的正面目前未知。

请实现仅开发环境可见的轻量调试模式，建议通过：

```text
?debug=1
```

开启。

调试模式可以包含原生 HTML 控件，不要安装 GUI 库。

至少提供：

- `chairGroup.rotation.y`，以角度显示
- 模型统一 scale
- chairGroup 的 Y 偏移
- camera FOV
- camera target Y 或等效构图参数
- BoundingBox 显示开关
- 坐标轴显示开关
- “复制当前参数”按钮

正式模式中必须隐藏全部调试 UI、BoundingBox 和坐标轴。

本阶段不加入正式用户拖动交互。

## 四个方向截图

为了确认模型正面，请从真实运行页面截取以下四张 393×852 截图：

- rotation Y = 0°
- rotation Y = 90°
- rotation Y = 180°
- rotation Y = 270°

截图必须：

- 使用相同相机
- 使用相同灯光
- 使用相同缩放和位置
- 使用原始材质
- 不包含调试面板
- 不包含 BoundingBox
- 不包含坐标轴
- 不包含任何 UI、粒子或文字

另外提供一张你认为最适合作为默认正面的候选截图，并说明对应角度。

不要擅自把该候选角度写死为最终答案，等待用户确认。

## 错误状态

若 GLB 加载失败：

- 页面保持白色
- 显示简洁文字：`3D 模型暂时无法加载`
- 不生成替代椅子
- 不使用图片回退
- 控制台输出可读错误

## 验证

完成后运行：

- TypeScript 检查
- production build

如果项目中没有 lint 配置，本阶段不要为了 lint 额外引入 ESLint。

使用可用的浏览器控制能力验证真实运行页面。

至少测试：

- 375×812
- 393×852
- 430×932

## 完成后必须停止

不要进入阶段二。

完成后在回复中提供：

1. 本地启动命令
2. 本地访问地址
3. 新增和修改文件清单
4. 安装的依赖和版本
5. TypeScript 检查结果
6. production build 结果
7. 真实运行时 BoundingBox
8. 相机参数
9. chairGroup 的 position、scale 和 rotation
10. 灯光参数
11. 原始材质是否正常显示
12. 四个方向截图的位置
13. 默认正面候选角度及理由
14. 三种移动端尺寸的验证结果
15. 已知问题

同时确认以下内容没有实现：

- 粒子
- GSAP
- 拖动
- 颜色变化
- AI 框
- SVG 标注
- 荣誉区
