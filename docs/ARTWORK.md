# 素材说明

本主题的财神、元宝、横幅与装饰图片包含 AI 生成及后续裁切、透明背景处理和格式转换的素材；卡片与装饰 SVG 以矢量路径保存。插件管理页的 `assets/application/plugin/icon.svg` 内嵌现有财神头像 WebP，以保持头像一致且无需外部资源，文件小于 DSH 的 256 KiB 限制。仓库中的素材随项目采用 [MIT 许可证](../LICENSE)。未附带字体文件。

页面优先使用 WebP；PNG 原稿和旧版素材保留在仓库中，供修改时参考。图片上的中文为插画内容，不随界面语言切换。

## 素材目录与迁移

统一索引见 [assets/README.md](../assets/README.md)，逐文件记录见 [assets/manifest.json](../assets/manifest.json)。清单记录旧路径、新路径、用途、字节数、哈希，以及运行文件的当前 URL 和旧 URL；目录迁移保留图片原始内容，不将文件改名视为重新生成。

| 目录 | 职责 | 是否进入运行包 |
| --- | --- | --- |
| `assets/runtime/` | 十六项当前及兼容 WebP、SVG 与纸纹 PNG | 是 |
| `assets/source/` | PNG 原稿及两批素材的来源说明和原始清单 | 否 |
| `assets/archive/` | 未使用的历史版本、备选切分图和 SVG | 否 |
| `assets/application/` | 插件管理页图标与可选 Dock PNG / ICNS | 仅 `plugin/icon.svg` |
| `assets/previews/` | 精选文档截图与本地开发预览 | 否 |
| `reference/` | 配色参考资料，运行配色另在客户端源码中维护 | 仅 `tokens.json` |

运行包同时保留 npm 自动纳入的 `assets/README.md` 目录索引。原稿、归档、截图和 Dock 图标可从仓库单独取得，无需随每次安装重复分发。插件素材统一通过 `/theme-caishen/assets/` 提供，原 `/theme-caishen/extra/` 保留兼容别名；文件系统目录调整不要求用户更换访问地址。

## 当前页面素材

| 素材 | 用途 |
| --- | --- |
| `assets/runtime/images/caishen-scene.webp` | 当前无字办公场景，界面文字独立翻译 |
| `assets/runtime/images/caishen-scene-lettered.webp` | 旧版带示例数据场景，保留 URL 兼容 |
| `assets/runtime/images/gold-ingot.webp` | 侧栏与工作区使用的金元宝 |
| `assets/runtime/images/banner-light.webp`、`banner-dark.webp` | 首页浅色与深色横幅背景 |
| `assets/runtime/icons/card-*.svg` | 四种预设卡片图标，继续兼容旧版卡片；新的研发默认卡片使用 emoji |
| `assets/runtime/decor/paper-texture.png`、`decor-coin.svg` | 纸纹与金币装饰 |
| `assets/runtime/images/merit-badge.webp` | 旧版功德按钮底图，当前标签和 `+1` 均为界面文字 |
| `assets/runtime/images/logo-shun.webp` | 顶部“顺”字印章 |
| `assets/runtime/images/caishen-avatar.webp` | 账户区域的装饰头像 |
| `assets/runtime/images/caishen-cloud-mascot.webp` | 旧版输入区装饰，保留兼容且不再占据输入空间 |
| `assets/runtime/images/speech-bubble.webp` | 旧版 KPI 气泡，当前使用可翻译的界面文字 |

显示器中的金额、效率百分比与书名属于静态插画彩蛋，没有读取实际项目统计。

## 原稿与生成记录

功德徽章、办公场景与金元宝的生成描述保存在 [ARTWORK-PROMPTS.md](ARTWORK-PROMPTS.md)。PNG 原稿位于 `assets/source/images/`，参考场景与旧版切分图位于 `assets/archive/`；两批素材原始来源说明归入 `assets/source/provenance/primary/` 和 `extra/`。第四阶段把已有无字场景从归档转入运行目录，没有重新生成或重编码图片。

部分旧素材由生成的合集画面裁切、蒙版处理并放大，输出像素尺寸不代表原生细节；独立人物和桌面也并非完整场景的逐像素分层。当前主题用完整场景图呈现电脑、显示器和书本。

## 文档预览

`assets/previews/documentation/` 的图片来自独立布局预览。首页配色图保留较早的卡片布局，编辑和排序图展示提示词管理界面。它们用于说明外观，不代表所有 DSH 版本都已经通过实机验收。`assets/previews/development/` 是忽略提交的本地开发预览，不是安装依赖；验证情况见 [验证记录](VALIDATION.md)。

## 视觉恢复说明

根据用户反馈，当前首页已恢复原 `caishen-scene-lettered.webp` 的书籍/电脑文字、`speech-bubble.webp` 原气泡、`merit-badge.webp` 功德底图，以及 `caishen-cloud-mascot.webp` 输入卡片右侧财神。以上均复用原字节，不生成替代图。第四阶段的无字场景留作兼容资源；当前图片中的金额、效率和书名均是原插画内容，不连接实际业务数据。图文对齐与透明留白由独立 CSS 处理。最新真实安装图见 [截图索引](../assets/previews/documentation/README.md)。
