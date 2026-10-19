# 素材说明

本主题的财神、元宝、横幅与装饰图片包含 AI 生成及后续裁切、透明背景处理和格式转换的素材；卡片与装饰 SVG 以矢量路径保存。插件管理页的 `icon.svg` 内嵌现有财神头像 WebP，以保持头像一致且无需外部资源，文件小于 DSH 的 256 KiB 限制。仓库中的素材随项目采用 [MIT 许可证](../LICENSE)。未附带字体文件。

页面优先使用 WebP；PNG 原稿和旧版素材保留在仓库中，供修改时参考。图片上的中文为插画内容，不随界面语言切换。

## 当前页面素材

| 素材 | 用途 |
| --- | --- |
| `caishen-assets/images/caishen-scene-lettered.webp` | 单张财神办公场景，显示器数据、电脑标记和书名在同一张图中 |
| `caishen-assets/images/gold-ingot.webp` | 侧栏与工作区使用的金元宝 |
| `caishen-assets/images/banner-light.webp`、`banner-dark.webp` | 首页浅色与深色横幅背景 |
| `caishen-assets/icons/card-*.svg` | 四种默认卡片图标 |
| `caishen-assets/decor/paper-texture.png`、`decor-coin.svg` | 纸纹与金币装饰 |
| `caishen-extra-assets/images/merit-badge.webp` | 仅含“功德”的按钮底图，`+1` 由页面文字渲染 |
| `caishen-extra-assets/images/logo-shun.webp` | 顶部“顺”字印章 |
| `caishen-extra-assets/images/caishen-avatar.webp` | 账户区域的装饰头像 |
| `caishen-extra-assets/images/caishen-cloud-mascot.webp` | 输入框右侧持“多写代码 / 多发红包”卷轴的财神 |
| `caishen-extra-assets/images/speech-bubble.webp` | 财神左侧的 KPI 气泡 |

显示器中的金额、效率百分比与书名属于静态插画彩蛋，没有读取实际项目统计。

## 原稿与生成记录

本次重绘的功德徽章、办公场景与金元宝的生成描述保存在 [ARTWORK-PROMPTS.md](ARTWORK-PROMPTS.md)。图片所用参考场景与旧版切分素材保留在两个素材目录中。

部分旧素材由生成的合集画面裁切、蒙版处理并放大，输出像素尺寸不代表原生细节；独立人物和桌面也并非完整场景的逐像素分层。当前主题用完整场景图呈现电脑、显示器和书本。

## 文档预览

`docs/screenshots/` 的图片来自独立布局预览。首页配色图保留较早的卡片布局，编辑和排序图展示提示词管理界面。它们用于说明外观，不代表所有 DSH 版本都已经通过实机验收。
