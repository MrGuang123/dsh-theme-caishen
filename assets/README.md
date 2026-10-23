# 财神主题素材

运行素材、原图、历史参考、应用图标和预览统一保存在此目录，按用途分开。原有图片只迁移位置，没有重新编码、压缩或删去原图。旧路径到新路径的完整映射、字节数和 SHA-256 见[仓库素材清单](https://github.com/MrGuang123/dsh-theme-caishen/blob/main/assets/manifest.json)。

| 目录 | 内容 | 是否为页面运行依赖 |
| --- | --- | --- |
| `runtime/images/` | 10 张当前及兼容 WebP 场景、横幅和装饰图片 | 是 |
| `runtime/icons/` | 兼容已有卡片的 4 张 SVG 图标 | 是 |
| `runtime/decor/` | 金币 SVG 与纸纹 PNG | 是 |
| `source/images/` | 17 张 PNG 原图及历史切分图 | 否 |
| `source/provenance/primary/` | 原主要素材包的说明及生成元数据 | 否 |
| `source/provenance/extra/` | 原补充素材包的说明及生成元数据 | 否 |
| `archive/images/`、`archive/icons/`、`archive/decor/` | 当前未使用的 WebP 与 SVG，留作参考 | 否 |
| `application/plugin/` | 插件管理页使用的自包含 `icon.svg` | 插件元数据依赖 |
| `application/dock/` | 可手动使用的 macOS Dock 图标及说明 | 否 |
| `previews/documentation/` | README 与文档使用的精选截图 | 否 |
| `previews/development/` | 从 `output/preview/` 迁移的本地布局检查截图、说明和测量数据 | 否；由 Git 忽略 |

配色参考移至仓库的 [reference/](https://github.com/MrGuang123/dsh-theme-caishen/blob/main/reference/tokens.md)。生成方式及素材质量边界见[素材说明](https://github.com/MrGuang123/dsh-theme-caishen/blob/main/docs/ARTWORK.md)和[生成记录](https://github.com/MrGuang123/dsh-theme-caishen/blob/main/docs/ARTWORK-PROMPTS.md)。这些链接指向完整仓库；安装包只包含运行素材、插件图标与必要说明。

## 运行素材与地址

页面素材统一使用 `/theme-caishen/assets/{images,icons,decor}/...`。其中历史 `/theme-caishen/extra/...` 地址对应的素材已迁至同一运行目录，宿主提供旧地址别名兼容；路径对应关系记录在清单的 `legacyUrls` 中。

`runtime/` 包含 16 个当前及兼容文件。第四阶段将无字场景 `caishen-scene.webp` 从归档转为运行素材，原图字节未改变；带字场景、功德底图、KPI 气泡和小财神旧地址保留兼容。新增运行素材时同步更新客户端引用、清单与打包检查。源图、归档、开发预览和文档截图不应混入运行素材目录；其中纸纹 `runtime/decor/paper-texture.png` 本身就是运行文件，不额外迁为源图。

当前首页恢复原带字场景与手绘气泡，中文功德恢复原红金底图及实时 +1；输入卡片右侧恢复祥云财神。图片内的中文、书名、显示器示例数据和 KPI 文案均为静态装饰，不随会话或账户数据变化；无字场景继续保留兼容路径。卡片 SVG 使用真实矢量路径；插件图标使用内嵌头像位图，均不依赖远程服务或外部字体。

## 迁移范围与保留资料

清单中的 `path` 和 `oldPath` 均相对仓库根目录。`role` 区分 `runtime`、`source`、`provenance`、`archive`、`application`、`preview` 和 `reference`。运行条目额外记录 `runtimeUrl`，保留的 HTTP 旧地址记录为 `legacyUrls`。

本地开发预览没有加入 Git，也没有逐文件列入可复验清单；清单只记录其迁移位置和本次迁移统计。原 `output/releases/dsh-theme-caishen-0.1.0.tgz` 和 `output/imagegen/prompts.md` 保留原位，继续由现有 `output/` 规则忽略。没有把旧安装包或未明确用途的资料当作垃圾删除。
