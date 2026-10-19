# 开发说明

本仓库是可直接安装的独立 DSH 插件。`lib/` 已包含运行入口，没有额外构建步骤、第三方 npm 运行依赖或安装脚本。

## 本地检查与安装

使用 Node.js、npm 和 `tar`（macOS、Linux 及现代 Windows 通常自带），建议使用当前 DSH 支持的 Node.js 版本。在仓库根目录运行：

```bash
npm run check
npm run check:package
```

也可运行 `npm run check:release` 一次完成两类检查。无需先执行 `npm install`。离线检查覆盖语法、包身份、主题配色、中英文键、插槽注册及清理、素材引用、功德按钮，以及提示词的校验、持久化、排序和失败处理；它不能代替真实 DSH 安装与视觉检查。

开发时，在 DSH「插件」→「添加插件」中填入本仓库目录的绝对路径。不要将自己的 profile、会话或账户配置复制进本仓库，也无需手工编辑 profile 的依赖或补丁。

修改后按宿主提示刷新或重启；桌面端有时需要完全退出并重新打开，才能获得更新后的客户端模块。不要仅凭热更新判断发布包是否可用，发布前必须检查打包产物。

## 目录

```text
.
├── package.json           # 包身份、入口、DSH 清单、发布文件范围
├── cordis.patch.yml       # 选择主题行，并关闭官方装饰品牌行
├── lib/index.js           # 宿主入口：两组只读素材路由
├── lib/client.js          # 客户端入口：配色、样式、文案和组件
├── locale/                # 插件管理页的中英文标题与介绍
├── icon.svg               # 插件管理页图标
├── caishen-assets/        # 主要素材
├── caishen-extra-assets/  # 补充素材
├── tokens.json            # DSH 0.2.1-rc.2 配色参考
├── scripts/               # 离线检查
└── docs/                  # 用户截图、开发与发布说明
```

`tokens.md` 是配色参考的人类可读版本。`output/` 若存在，属于开发预览和生成过程文件，不是运行依赖；用户文档使用经挑选放入 `docs/screenshots/` 的预览图。

## 包身份与宿主入口

以下名称保持一致：

- `package.json` 的 `name`：`dsh-theme-caishen`。
- `cordis.patch.yml` 中主题行的包名：`dsh-theme-caishen`。
- `lib/client.js` 中 `window.__ModuleLoader__.load` 的 `id`：`dsh-theme-caishen`。

主题行 ID 为 `theme-caishen`，文案命名空间也为 `theme-caishen`。如需改名，还要同步检查配色层、样式标记、素材路由和持久化键；仅更改 GitHub 仓库名不会自动改变包身份。

宿主入口使用相对模块地址定位素材，注册：

- `/theme-caishen/assets/*` → `caishen-assets/`。
- `/theme-caishen/extra/*` → `caishen-extra-assets/`。

路由只处理 `GET` / `HEAD`，限制在素材目录内，并使用 `no-cache`。素材随插件一起提供，不依赖作者电脑上的文件或远程图片服务。

## 客户端结构

`lib/client.js` 使用 DSH 的模块加载包装，从宿主获取 React，不包含另一份 React，也不需要额外打包器。主要部分包括：

- `TOKENS`：浅色 / 深色的语义颜色及代码高亮 token。
- `CSS`：主题样式和响应式布局。
- `zh` / `en`：界面文案。
- 组件、功德状态和可编辑提示词库。
- `apply(ctx)`：注册配色、文案、样式与插槽，并通过 effect 回收资源。

| 插槽 | 用途 |
| --- | --- |
| `conversation.input.dock` | 空白会话首页与提示词库 |
| `conversation.hero.options` | 首页在线状态与功德按钮 |
| `conversation.hero.brand.mark` | 未选工作区时的品牌标记 |
| `sidebar.brand.mark` | 侧栏金元宝 |
| `sidebar.brand.name` | 侧栏主题名称 |
| `conversation.header.leading` | 会话标题区的印章与文案 |
| `conversation.session.header.utilities` | 会话中的在线状态与功德按钮 |
| `conversation.input.right` | 输入工具栏装饰与首页财神 |
| `settings.trigger` | 宿主设置入口的主题外观 |

空白会话的判断使用宿主摘要，以及已打开会话的消息状态，避免历史会话加载时短暂显示首页。

## 常用修改

**颜色**：修改 `TOKENS`，每项必须同时提供 `light` 和 `dark`；保持 DSH token 名称不变。主题使用 `overrideTokens` 叠加，不注册独立的主题 ID。

**文案**：修改客户端 `zh` / `en`，两份键集合必须一致。插件管理页的介绍在 `locale/zh.json` 与 `locale/en.json`。图片内的中文不随语言切换。

**布局**：首页与提示词弹窗样式使用 `.caishen-hero*`、`.caishen-library*`、`.caishen-card*`、`.caishen-editor*` 等选择器。卡片维持单行滚动；窄窗口减少装饰，编辑弹窗缩为单列表单。

**素材**：保持同名图片即可沿用现有引用；换文件名时同步修改客户端 `asset(...)` / `extra(...)` 或 CSS 地址，并确认文件包含在 `package.json.files` 中。

| 用途 | 主要文件 |
| --- | --- |
| 财神一体场景 | `caishen-assets/images/caishen-scene-lettered.webp` |
| 深浅色横幅 | `caishen-assets/images/banner-dark.webp`、`banner-light.webp` |
| 侧栏与工作区元宝 | `caishen-assets/images/gold-ingot.webp` |
| 卡片预设图标 | `caishen-assets/icons/card-*.svg` |
| 功德徽章 | `caishen-extra-assets/images/merit-badge.webp` |
| 输入框旁财神 | `caishen-extra-assets/images/caishen-cloud-mascot.webp` |
| 对话气泡 | `caishen-extra-assets/images/speech-bubble.webp` |
| 账户头像 | `caishen-extra-assets/images/caishen-avatar.webp` |
| 标题印章 | `caishen-extra-assets/images/logo-shun.webp` |

显示器与书脊上的文字属于同一张场景图，不使用电脑或书籍覆盖层。功德徽章只包含「功德」图案，`+1` 是独立文字，点击动画以该文字的位置为起点。

素材目录中仍有历史参考素材，不能把文件存在当作正在使用的依据；以客户端实际引用为准。公开来源说明见 [素材说明](ARTWORK.md)。

## 提示词数据

浏览器本地存储键：

| 键 | 数据 |
| --- | --- |
| `dsh-theme-caishen:prompt-cards:v1` | 提示词卡片及其排列顺序 |
| `dsh-theme-caishen:merit` | 功德计数 |

卡片首次读取使用当前语言的默认文案；保存后保留用户自己的文字，不因语言切换重写。卡片数据整组校验后一次写入；保存失败时保留已保存状态与弹窗草稿。空数组表示用户有意删除全部卡片，不回退为默认卡片。

卡片可选八种底色，兼容已有红 / 绿底色数据。新增默认首位；编辑默认保留原位置；排序弹窗在保存时提交，取消不修改存储。同一浏览器来源的窗口通过 `storage` 事件更新，未使用云端同步。

改变存储格式时应提供向后兼容处理，避免直接更换 key 导致旧卡片看似丢失。不要在测试中读写开发者实际的浏览器存储。

## 兼容性与验证边界

部分样式依赖宿主 CSS Module 类名片段，例如首页标题、composer 宽度、侧栏背景、输入框提示、工作区文件夹与账户区域。DSH 升级后，即使插件仍能加载，这些装饰也可能失效，需要重新核对选择器。

配色参考及适配目标为 DSH `0.2.1-rc.2`，当前 `engines.dsh` 限定此版本。不要仅依据配色参考扩大兼容范围；应按 [发布验收](RELEASING.md) 在目标版本完成真实安装验证。

停用时应关闭整个「财神打工版」组合包，而不只是其中的 `theme-caishen` 行：关闭内层行不会撤回组合包里禁用官方品牌的补丁。

现有文档截图来自独立 React 布局预览，使用插件真实组件、样式和提取的宿主 CSS。它能检查布局与局部交互，无法证明插件管理器安装、宿主插槽加载或桌面端运行成功。发布记录应分开写明离线检查、独立预览和实际 DSH 验收的结果。
