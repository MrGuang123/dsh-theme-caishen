# 财神打工版 · UI 素材包

此处保留原 `caishen-assets/` 素材包的来源说明与生成元数据。文件已按用途迁至 `assets/runtime/`、`assets/source/images/` 和 `assets/archive/`；完整旧路径映射见 [总清单](../../../manifest.json)。PNG 用于保留原图，页面使用对应 WebP；图片中的中文属于素材内容，不随界面语言切换。

## 文件

- [caishen-scene-lettered.png](../../images/caishen-scene-lettered.png) / [运行 WebP](../../../runtime/images/caishen-scene-lettered.webp) — 1330×1182，当前 Hero 场景；在原插画的显示器与书脊上直接补入数据和书名，完整场景作为单张图片渲染。
- [gold-ingot.png](../../images/gold-ingot.png) / [运行 WebP](../../../runtime/images/gold-ingot.webp) — 1484×1060，透明金色立体元宝，用于侧栏品牌和工作区图标。
- [caishen-scene.png](../../images/caishen-scene.png) / [历史 WebP](../../../archive/images/caishen-scene.webp) — 1800×1600，旧版透明完整场景，保留作参考。
- [caishen-character.png](../../images/caishen-character.png) — 1200×1200，透明独立人物，可用于轻微漂浮动效。
- [caishen-desk.png](../../images/caishen-desk.png) — 1600×900，透明独立桌面对象，可局部叠加 UI 数字。
- [banner-light.png](../../images/banner-light.png)、[banner-dark.png](../../images/banner-dark.png) — 2400×900，不透明，两套横幅背景；对应 WebP 位于 [运行图片目录](../../../runtime/images/)。
- [card-cost.svg](../../../runtime/icons/card-cost.svg)、[card-debt.svg](../../../runtime/icons/card-debt.svg)、[card-report.svg](../../../runtime/icons/card-report.svg)、[card-merge.svg](../../../runtime/icons/card-merge.svg) — 512 viewBox 真正的可缩放 SVG，透明背景。
- [logo-caishen.svg](../../../archive/icons/logo-caishen.svg) + [logo-caishen.png](../../images/logo-caishen.png) — 保留的矢量头像标记；[插件图标](../../../application/plugin/icon.svg)使用补充素材中的 `caishen-avatar.webp` 内嵌图片，与当前财神头像一致。
- [运行装饰](../../../runtime/decor/)包含金币 SVG 与纸纹 PNG；元宝、红包和祥云 SVG 位于[历史装饰](../../../archive/decor/)。旧版 `decor-ingot.svg` 已由立体元宝替代。

## 重要说明

1. `caishen-scene-lettered` 和 `gold-ingot` 是重新生成的图片；生成提示与参考图记录见 [素材说明与生成记录](../../../../docs/ARTWORK.md)。场景文字直接绘在原物体上，页面不叠加单独的显示器或书堆。
2. 旧版人物/桌面及横幅装饰是从模型生成的合集画面进行切分、蒙版清理、重新排版和高质量放大，**并非 1800px 原生绘制的独立原画**。原始有效宽度约为人物 370px、桌面 495px、完整场景 760px。人物与桌面不是从完整场景逐像素分层，无法保证与完整场景重叠时完全一致；放大后的像素尺寸不代表同等级原生细节。
3. 横幅是基于生成装饰重新排布为 2400×900，少量装饰和细纹在上下过渡区可能略有差异。文字和内容请通过 HTML/CSS 覆盖。
4. 原素材包的卡片图标、Logo 与装饰 SVG 属于真实矢量路径；`assets/application/plugin/icon.svg` 为内嵌头像位图的自包含 SVG。均不依赖外部字体或网络资源。
5. 未提供 `display-font`：没有附带可核验的商用字体授权，不应捏造授权信息。

## 快速用法

```jsx
<div className="hero">
  <h1>今天先把项目搞赚钱</h1>
  <img src="/theme-caishen/assets/images/caishen-scene-lettered.webp" alt="财神开发者" />
</div>
```

```css
.hero { position: relative; background: url('/theme-caishen/assets/images/banner-light.webp') center/cover; }
.hero > img { position: absolute; right: 0; bottom: 0; width: min(44%, 520px); height: auto; }
```

当前显示器中的 ¥68,888.00、+88.8% 和书名均为静态插画文案，属于主题彩蛋数据。
