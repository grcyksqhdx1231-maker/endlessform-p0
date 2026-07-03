# Codex Step 02 — Inspection Only

Copy the content below into Codex after the files from Step 02 have been added to the project.

---

现在不要编码，也不要安装依赖。

请先完成以下检查：

1. 阅读根目录 `AGENTS.md`。
2. 阅读根目录 `P0_SPEC.md`。
3. 阅读 `public/models/MODEL_NOTES.md`。
4. 检查 `public/models/p0-chair.glb` 是否存在且可以解析。
5. 不要查找、读取或依赖任何视觉参考图片。
6. 如果仓库中存在 `public/references/`，请忽略，不将其作为实现依据。
7. 检查当前仓库是否已有前端项目：
   - package.json
   - src
   - vite.config
   - next.config
   - tsconfig
   - React / Vue / vanilla TypeScript
8. 报告当前框架、包管理器、启动命令和已有依赖。
9. 检查当前环境是否支持查看可用 skills。
10. 如果支持，请列出与以下方向相关的 skills：
    - Three.js
    - WebGL
    - GSAP
    - Shader
    - frontend design
    - mobile responsive UI
    - performance
11. 如果不存在相关 skill，不得虚构，也不得因此停止。
12. 分析 GLB，报告：
    - scene node names
    - visible mesh count
    - material count and names
    - texture list
    - vertex count
    - triangle count
    - BoundingBox dimensions
    - geometric center
    - detected up axis
    - likely front direction
    - negative scales
    - suspicious normals
    - animation clips
    - which materials can safely change baseColor
13. 判断约 14 MB 的 GLB 对移动端首屏的风险，并提出：
    - 是否必须压缩
    - 是否建议 Draco / Meshopt
    - 是否需要 KTX2
    - 是否需要减面
    但此阶段不要修改模型。
14. 输出严格的三阶段开发计划：

### 阶段一
只完成：
- project setup if needed
- Three.js scene
- GLB loading
- chairGroup centering
- camera
- lighting
- pure-white background
- subtle contact shadow
- responsive framing
- static completed chair

### 阶段二
只完成：
- surface sampling
- particle assembly
- GSAP loading timeline
- solid model fade-in
- complete particle removal
- reduced-motion fallback

### 阶段三
只完成：
- horizontal pointer rotation
- five 72° states
- continuous color interpolation
- GSAP snap
- AI dialogue copy
- robot line icon
- SVG annotations
- gesture hint
- award footer
- QA and six runtime captures

先输出检查报告和计划。

在我确认之前：

- 不修改任何文件
- 不安装依赖
- 不创建替代模型
- 不创建页面
- 不生成截图
- 不读取视觉参考图片
- 不自行简化模型
- 不进入阶段一
