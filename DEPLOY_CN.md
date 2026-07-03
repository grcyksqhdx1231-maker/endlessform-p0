# EndlessForm P0 国内访问部署说明

## 推荐方案

为了让国内手机稳定打开，建议使用以下任一国内云静态资源方案：

1. 阿里云 OSS 静态网站托管 + CDN
2. 腾讯云 COS 静态网站托管 + CDN
3. 华为云 OBS 静态网站托管 + CDN

如果使用中国内地节点和自定义域名，通常需要先完成 ICP 备案。若没有备案，可先使用中国香港节点做临时展示，但国内访问稳定性通常不如内地 CDN。

## 上传目录

上传 `dist/` 目录内的所有文件，不要上传 `dist` 文件夹本身。

入口文件：

```text
index.html
```

静态资源目录：

```text
assets/
models/
```

## 静态网站设置

默认首页：

```text
index.html
```

错误页：

```text
index.html
```

## MIME 类型

确认以下类型正确：

```text
.html  text/html
.js    application/javascript
.css   text/css
.glb   model/gltf-binary
.jpg   image/jpeg
.png   image/png
```

## 缓存建议

`index.html`：

```text
Cache-Control: no-cache
```

`assets/`、`models/`：

```text
Cache-Control: public, max-age=31536000, immutable
```

## 当前注意事项

项目包含多个 GLB 模型，部署包约 110MB。首屏会加载当前推荐 3D 模型，国内移动网络下建议使用 CDN，并开启 HTTPS。
