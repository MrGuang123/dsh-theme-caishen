# 开发说明

本仓库是可直接安装的独立 DSH 插件。开发时维护 `src/`，通过零依赖构建生成并提交 `lib/`；从 Git 或安装包使用插件时，无需构建、运行 `npm install` 或执行安装脚本。不要直接修改 `lib/` 中的生成文件。

## 本地构建、检查与安装

使用 Node.js、npm 和 `tar`（macOS、Linux 及现代 Windows 通常自带），建议使用当前 DSH 支持的 Node.js 版本。修改源码后，在仓库根目录运行：

```bash
npm run build
npm run check:release
```

`npm run build` 生成客户端 JS、独立 CSS、宿主模块和入口；`npm run check:build` 只检查生成文件是否与源码一致，不写入文件。`npm run check` 先检查产物一致性，再执行离线检查；`npm run check:package` 检查实际安装包；`npm run check:release` 串联后二者，不会偷偷重建产物。无需先执行 `npm install`。

仓库通过 `.gitattributes` 固定源码与样式的 LF 换行，避免不同操作系统的检出设置改变构建字节；提交时保留这一约定。

离线检查覆盖语法、包身份、主题配色、中英文键、插槽注册及清理、素材引用、功德按钮，以及提示词的校验、持久化、排序和失败处理。打包检查核对运行文件范围、包体预算及重定位后的素材与 CSS 路由。它们不能代替真实 DSH 安装与视觉检查，实际结果记录在 [验证记录](VALIDATION.md)。

开发时，在 DSH「插件」→「添加插件」中填入本仓库目录的绝对路径。不要将自己的 profile、会话或账户配置复制进本仓库，也无需手工编辑 profile 的依赖或补丁。

修改后先构建，再按宿主提示刷新或重启；桌面端有时需要完全退出并重新打开，才能获得更新后的客户端模块。不要仅凭热更新判断发布包是否可用，发布前必须检查打包产物。

## 目录

```text
.
├── package.json            # 包身份、入口、DSH 清单、发布文件范围
├── cordis.patch.yml        # 选择主题行，并关闭官方装饰品牌行
├── src/client/             # CommonJS 客户端源码，入口 index.cjs
│   ├── components/         # 首页、品牌、提示词卡片与弹窗等组件
│   ├── adapter/            # 宿主插槽、输入 DOM 标记及项目身份契约
│   ├── state/              # 提示词与功德状态
│   ├── theme/              # 实际运行的主题 token
│   ├── locales/            # 客户端中英文文案
│   ├── utils/              # 展示辅助函数
│   └── styles/             # 十七份 CSS 源文件及样式加载模块
├── src/host/               # ESM 宿主源码：路由注册与只读文件处理
├── lib/                    # 已提交的构建产物，禁止直接编辑
│   ├── index.js            # 薄导出入口，转发 lib/host/index.js
│   ├── host/               # 宿主源码的构建副本
│   ├── client.js           # DSH loader 单入口，内部包装客户端模块图
│   └── client.css          # 按固定顺序合并的独立样式
├── locale/                 # 插件管理页的中英文标题与介绍
├── assets/
│   ├── runtime/            # 十六项当前及兼容浏览器素材
│   ├── source/             # PNG 原稿和来源说明
│   ├── archive/            # 历史与备选素材
│   ├── application/        # 插件图标与可选 Dock 图标
│   ├── previews/           # 文档截图和本地开发预览
│   └── manifest.json       # 素材用途、旧新路径、哈希及运行 URL
├── reference/              # DSH 配色参考 JSON 与 Markdown
├── scripts/                # 构建、离线和打包检查
└── docs/                   # 需求、计划、开发、素材、发布与验证说明
```

`reference/tokens.md` 是配色参考的人类可读版本，实际运行配色以 `src/client/theme/tokens.cjs` 为基础，强调配色由 `theme/presets.cjs` 覆盖。`assets/previews/documentation/` 保存经筛选的公开截图；`assets/previews/development/` 为忽略提交的本地开发预览。`output/` 若存在，仅保留历史发布包或生成记录，不是运行依赖。

需求边界与优先级见 [需求清单](REQUIREMENTS.md)，分阶段步骤见 [实施计划](IMPLEMENTATION-PLAN.md)。结构整理不代表后续功能已经实现。

## 包身份与宿主入口

以下名称保持一致：

- `package.json` 的 `name`：`dsh-theme-caishen`。
- `cordis.patch.yml` 中主题行的包名：`dsh-theme-caishen`。
- 构建生成的 `lib/client.js` 中 `window.__ModuleLoader__.load` 的 `id`：`dsh-theme-caishen`。

主题行 ID 为 `theme-caishen`，文案命名空间也为 `theme-caishen`。如需改名，还要同步检查配色层、样式标记、素材路由和持久化键；仅更改 GitHub 仓库名不会自动改变包身份。

宿主源码位于 `src/host/`。构建复制为 `lib/host/`，由 `lib/index.js` 转发导出。运行时通过相对模块地址定位资源，注册：

- `/theme-caishen/assets/*` → `assets/runtime/`，为当前统一素材路径。
- `/theme-caishen/extra/*` → `assets/runtime/`，兼容旧版补充素材 URL。
- `/theme-caishen/styles/client.css` → `lib/client.css`，该路由只允许读取此 CSS 文件，不公开 JS 产物。

路由只处理 `GET` / `HEAD`，限制在资源目录和允许的文件范围内，并使用 `no-cache`。素材与样式随插件一起提供，不依赖作者电脑上的文件或远程图片服务。

## 客户端结构

`src/client/` 使用标准 CommonJS `.cjs` 模块，每个模块通过静态 `require()` 显式声明依赖。`scripts/build.mjs` 从 `index.cjs` 遍历模块图，原样包装到 DSH 的同步模块加载 factory 中，保留内部模块缓存；不转译源码、不使用运行时 `eval`，不需要额外打包器。只有 React 从宿主获取，不包含另一份 React。

- `config.cjs`：包身份、命名空间和统一资源 URL。
- `theme/tokens.cjs`：浅色 / 深色的语义颜色及代码高亮 token。
- `locales/zh.cjs` / `en.cjs`：界面文案。
- `state/prompt-model.cjs`：默认卡片、字段校验和排序；`prompt-store.cjs`：稳定快照、存储状态与恢复副本。
- `state/prompt-backup.cjs`：纯 JSON 备份、解析和合并预览；`prompt-mutations.cjs`：编辑、删除、撤销与排序的并发保护。
- `components/`：各界面组件；`prompt-transfer.cjs` 提供备份与导入，`prompt-recovery.cjs` 提供异常数据恢复。
- `utils/prompt-fill.cjs` 与 `utils/discard-guard.cjs`：输入保护和编辑/排序的统一关闭确认；`utils/download.cjs`：本地下载及临时 URL 清理。
- `index.cjs`：通过 `apply(ctx)` 注册配色、文案、样式与十个插槽（保留原九个，新增设置页），并通过 effect 回收资源。

CSS 独立源文件按 `base.css` → `hero.css` → `cards.css` → `chrome.css` → `decorations.css` → `responsive.css` → `prompt-library.css` → `prompt-safety.css` → `prompt-transfer.css` → `prompt-browser.css` → `layout.css` → `appearance.css` → `accessibility.css` 的顺序构建为 `lib/client.css`。该顺序保留原来的层叠关系，包括响应式规则之后的提示词库覆盖。`styles/install.cjs` 添加指向 `/theme-caishen/styles/client.css` 的 `<link rel="stylesheet">`，卸载时由 effect 移除。

| 插槽 | 用途 |
| --- | --- |
| `conversation.input.dock` | 空白会话首页与提示词库 |
| `conversation.hero.options` | 首页在线状态与功德按钮 |
| `conversation.hero.brand.mark` | 未选工作区时的品牌标记 |
| `sidebar.brand.mark` | 侧栏金元宝 |
| `sidebar.brand.name` | 侧栏主题名称 |
| `conversation.header.leading` | 会话标题区的印章与文案 |
| `conversation.session.header.utilities` | 会话中的在线状态与功德按钮 |
| `conversation.input.right` | 常驻提示词入口、输入工具栏装饰与首页财神 |
| `settings.trigger` | 宿主设置入口的主题外观 |
| `settings.section` | 宿主设置中的独立主题外观页，id 为 `caishen-appearance` |

空白会话的判断使用宿主摘要，以及已打开会话的消息状态，避免历史会话加载时短暂显示首页。

## 常用修改

**颜色**：修改 `src/client/theme/tokens.cjs`，每项必须同时提供 `light` 和 `dark`；保持 DSH token 名称不变。主题使用 `overrideTokens` 叠加，不注册独立的主题 ID。`reference/` 只保存参考，不应作为第二份运行真值。

**文案**：修改 `src/client/locales/zh.cjs` / `en.cjs`，两份键集合必须一致。插件管理页的介绍仍在 `locale/zh.json` 与 `locale/en.json`。图片内的中文不随语言切换。

**布局**：修改 `src/client/styles/` 中对应 CSS，首页与提示词弹窗使用 `.caishen-hero*`、`.caishen-library*`、`.caishen-card*`、`.caishen-editor*` 等选择器。卡片维持单行滚动；窄窗口减少装饰，编辑弹窗缩为单列表单。不要调整构建顺序来临时覆盖样式问题。

**素材**：当前运行文件统一放在 `assets/runtime/`。保持同名图片即可沿用 URL；换文件名时同步修改客户端 `asset(...)`、CSS、`assets/manifest.json` 与检查脚本，并确认文件包含在运行包中。PNG 原稿、旧版和预览按用途放入其他素材目录，不增加到运行白名单。

| 用途 | 主要文件 |
| --- | --- |
| 当前原设计带字场景 | `assets/runtime/images/caishen-scene-lettered.webp` |
| 兼容旧版场景 | `assets/runtime/images/caishen-scene-lettered.webp` |
| 深浅色横幅 | `assets/runtime/images/banner-dark.webp`、`banner-light.webp` |
| 侧栏与工作区元宝 | `assets/runtime/images/gold-ingot.webp` |
| 卡片预设图标 | `assets/runtime/icons/card-*.svg` |
| 旧版功德徽章（兼容保留） | `assets/runtime/images/merit-badge.webp` |
| 输入框旁财神 | `assets/runtime/images/caishen-cloud-mascot.webp` |
| 对话气泡 | `assets/runtime/images/speech-bubble.webp` |
| 账户头像 | `assets/runtime/images/caishen-avatar.webp` |
| 标题印章 | `assets/runtime/images/logo-shun.webp` |

本次视觉修复恢复原设计带字场景、原 KPI 气泡和功德图片匾额；动态 +1 与无障碍计数仍为 DOM 文本。插画中的金额、效率、书名只作装饰。输入区财神在稳定 `[data-composer-card]` 旁预留完整右列，窄/低窗口回收该列并隐藏装饰。

历史参考素材存放在 `assets/source/` 和 `assets/archive/`，不能把文件存在当作正在使用的依据；以客户端实际引用和迁移清单为准。公开来源说明见 [素材说明](ARTWORK.md)。

## 运行包范围

运行包包含 `lib/`、`cordis.patch.yml`、插件管理页语言元数据、`assets/runtime/`、`assets/application/plugin/icon.svg`、`reference/tokens.json` 及根目录说明文件。npm 自动纳入的 `assets/README.md` 目录索引也予以保留。源码、构建脚本、完整开发文档、原稿、归档、预览和 Dock 图标保留在 Git 仓库，不进入 `.tgz` 运行包。

README 使用仓库绝对链接展示截图和连接开发文档，安装包无需重复携带这些文件。可选 Dock 图标须从仓库单独下载。包的 `./tokens.json` 与 `./icon` 导出分别映射到新的参考和插件图标位置，外部导出名称保持不变。

## 提示词数据

浏览器本地存储键：

| 键 | 数据 |
| --- | --- |
| `dsh-theme-caishen:prompt-cards:v1` | 提示词卡片及其排列顺序 |
| `dsh-theme-caishen:merit` | 功德计数 |
| `dsh-theme-caishen:appearance:v1` | 版本 1 外观选项，不含会话或提示词内容 |
| `dsh-theme-caishen:prompt-usage:v1` | 版本 1 本机偏好：收藏 ID（最多 128）、最近使用 ID（最多 20） |
| `dsh-theme-caishen:prompt-cards:recovery:v1` | 显式重置异常数据前保存的最近一次原文恢复副本 |

卡片首次读取使用当前语言的默认文案；保存后保留用户自己的文字，不因语言切换重写。卡片数据整组校验后一次写入；保存失败时保留已保存状态与弹窗草稿。普通保存会重新读取并拒绝覆盖异常或不可用存储。显式重置先持久化异常原文，再检查原值并写入默认模板；副本失败或并发变化时不覆盖主值。空数组表示用户有意删除全部卡片，不回退为默认卡片。

默认卡片与「研发模板」共用八项研发任务，后者另含一张显式变量模板：问题修复、需求实现、代码审查、关键测试、代码解读、局部重构、性能排查和变更总结。提示词注明输入信息、执行范围和完成标准；代码审查与代码解读默认只分析，变更总结默认只生成文字。更新默认内容只影响没有已保存列表的用户，不迁移或覆盖已有卡片、顺序和空列表。

「研发模板」选择器将选中的模板复制为编辑草稿；用户确认保存后才创建卡片，默认位置为首位。关闭选择器或取消编辑不修改已保存列表。模板入口用于让已有用户按需加入新内容，不自动替换同名卡片。

卡片可选八种图标底色，兼容已有红 / 绿底色数据。新增默认首位；编辑默认保留原位置；排序弹窗在保存时提交，取消不修改存储。同一浏览器来源的窗口通过 `storage` 事件更新提示词列表，未使用云端同步。

改变存储格式时应提供向后兼容处理，避免直接更换 key 导致旧卡片看似丢失。不要在测试中读写开发者实际的浏览器存储。


## 第二阶段数据与交互约定

- `createPromptCardStore()` 保持 `get/subscribe/save`，新增稳定的 `getStatus()`、`retry()`、`reset(cards, expectedRaw)` 和 `getRecoveryRaw()`。状态区分 `missing/ready/corrupt/unavailable/quota`；读取失败或损坏保留上次有效列表。`save(cards, expectedRaw)` 可校验读取时的原值，冲突不写入。
- `prompt-cards.cjs` 继续转发原 API，主存储值仍为卡片数组。异常恢复副本为单独原文字符串，仅在用户明确重置损坏数据时创建或更新，只保留最近一次。
- 备份格式为 `{ format: "dsh-theme-caishen/prompt-cards", version: 1, exportedAt, cards }`；解析同时接受旧版纯数组。16 MiB 上限能覆盖 128 张合法长卡片，包括 JSON 转义；合并保留现有同 ID 卡片与顺序，替换按导入顺序。
- 导入分解析、预览与确认写入；替换须二次确认，数据变化须重新检查。文件异步读取使用序号隔离，过期读取不能覆盖新文件或粘贴内容。
- 非空输入只调用插入动作，失败不回退到 `setDraft`；编辑/排序的关闭按钮、取消、Esc 与遮罩共用关闭保护。确认时正文为 `inert`，继续编辑恢复焦点。
- 删除撤销记录仅存在当前首页或库窗口组件内，最多 128 条，刷新、关闭窗口或清除记录后消失；管理与预览切换保留记录；恢复保留全部字段和原位置，同 ID 冲突或超限不覆盖。

`npm run check` 除原有检查，还执行 `safety-check.mjs`、`data-safety-check.mjs`、`library-safety-check.mjs` 、`transfer-check.mjs` 和 `workflow-check.mjs`，全部使用隔离 DOM/React 或内存存储。真实浏览器预览验证结果与边界见 [验证记录](VALIDATION.md)。

## 第三阶段工作流与兼容约定

- `prompt-entry.cjs` 复用原输入右侧插槽，`prompt-browser.cjs` 管检索、预览与管理，`prompt-detail.cjs` 管变量填写、复制和最终预览；`prompt-workflow.cjs` 连接输入与焦点。手工维护模块继续控制在小文件内，CSS 单独维护。
- 宿主标准输入 props 为 `useInput` 与 `inputActions`。打开库时捕获插入位置及 `draftRev`，最终填入只通过 `insertText`；同时核对当前草稿文本。即使打开时为空，也不在弹窗结束后调用 `setDraft`。换会话关闭窗口，输入框焦点优先使用宿主编辑器根节点，回退到当前 composer 的 `[data-composer-input]`。
- `prompt-template.cjs` 提供纯搜索、常用项选择及模板解析。分类复用 `tag`；搜索不改变存储顺序，最近使用视图按最近 ID 排序。首页按收藏、最近使用和原列表补足，最多六张。
- 卡片增加唯一可选字段 `template: true`；未启用时正文原样使用。启用后 `{{名称}}` 为必填变量，名称 1–40 字符、不含花括号与换行（首尾空白忽略），最多 16 个不同字段；重复名称共用答案，`\{{名称}}` 输出字面占位符。替换为纯文本，不递归解析答案、不执行表达式，最终长度上限 12000 字符。变量答案只在窗口状态内保存，不写入 localStorage 或日志；关闭未填入的答案有放弃确认。
- 主存储继续使用原数组/key，无需批量迁移；校验、编辑冲突、删除撤销和另存为均保留模板标记。普通卡片备份仍为版本 1，任何一张启用模板时导出版本 2；解析接受 1/2 和旧数组，拒绝未知未来版本。兼容方向是当前客户端读取旧数据，不声明旧客户端支持新模板。
- `prompt-preferences.cjs` 单独保存 `{version:1,favorites:[id],recent:[id]}`，不保存正文、草稿、答案或剪贴板文本。复制成功或填入成功记一次使用；收藏写入会清除已不存在的 ID。损坏、不可读或写失败保留有效内存快照并提示，不静默重置存储。多窗口更新通过 storage 事件读取，极短同时写入仍是最后成功写入生效。
- 卡片备份只携带卡片与顺序，使用偏好属于本机状态，不纳入导入/导出；删除后旧 ID 在展示时忽略。搜索、收藏、复制和填入均不会自动保存默认卡片库。
- `prompt-launcher.cjs` 通过可选 `ctx.inject(["shortcuts"])` 注册 `theme-caishen.prompt-library`，无默认绑定、`modals: []`，仅对焦点所在 composer 解析目标。用户在宿主快捷键设置分配按键，由宿主执行冲突检测；服务缺席仍可使用按钮。库内 `/`、搜索框 Enter/向下及结果上下/Home/End 均只在本弹窗处理，不接管输入法组合或嵌套弹窗。
- 管理组件在切换预览时保留挂载，撤销记录随库窗口关闭而释放。原生弹窗的 cancel 事件仅由自己的根处理，避免关闭子弹窗时连带关闭完整库。

## 第四阶段外观与可访问性约定

- `state/appearance.cjs` 保存 `{version:1,layout,decoration,illustrations,easterEggs,focus,palette}`，枚举与布尔值整体验证；未知版本、异常数据和读取失败不覆盖原值。`preview(value,owner)` 仅更新内存，`cancel(owner)` 恢复已保存快照，`save(value,expectedRaw,owner)` 重读原值并检查冲突；失败保留预览，默认恢复也需主动保存。
- 预览有单一 owner，防止多个外观窗口互相取消；跨窗口读取会更新已保存值，当前预览保持，提交时提醒冲突。专注模式在 `resolveAppearance` 中计算覆盖，不改用户原布局、插画和彩蛋选择；关掉专注即恢复。
- `theme/appearance.cjs` 独占六个 `data-caishen-*` 属性和可选的 `dsh-theme-caishen:appearance` token 层；同配色的布局变化不重装 token。取消和卸载释放覆盖，卸载恢复属性原值并移除 storage 监听，不改宿主模式或字体设置。
- `theme/presets.cjs` 只控制强调色、链接和主要按钮；基础暖纸/深檀及错误/成功含义保留。`appearance.css` 维护主题操作/错误/焦点语义色；代表性色对自动检查不等于对宿主所有第三方控件的对比度认证。
- `components/appearance-page.cjs` 通过正式 `settings.section` 提供内嵌设置表单，独立 owner 管理预览；保存更新基线，取消重读最新保存值，离开卸载时释放预览。旧 `appearance-settings.cjs` 保留模态组件源码供历史复验，不在当前客户端图中引用。输入栏不注册外观入口。
- `hero.css` 管完整首页，`layout.css` 管容器查询及紧凑/低高布局，`appearance.css` 管显示选项，`accessibility.css` 管点击目标、焦点、缩放、错误状态、减少动态效果及强制颜色。旧 `responsive.css` 中互相竞争的横幅高度规则已移除；紧凑时不保留插画留白，也不预留输入框吉祥物宽度。
- 原 banner 背景、带字场景、手绘气泡、功德匾额与祥云财神均恢复使用既有运行素材，不重绘图片；无字场景保留原路径兼容。中文图内文字保留，英文使用本地化说明/可访问名称；不会改写用户卡片。
- 编辑器、变量填写及 JSON 导入通过 `aria-invalid` 和 `aria-describedby` 关联错误，存储错误关联保存动作；按钮和色块主要目标至少 36px，正文/提示采用可读的状态色。系统减少动态效果时禁用状态脉冲、卡片过渡与功德飘字，不停用操作。

新增 `appearance-check.mjs` 验证预览事务、原值冲突、异常保留、effect/监听清理和代表性色对；现有提示词保护与工作流检查继续运行。浏览器根字号 200% 和隔离宿主工具栏布局经过验证；真实 OS 读屏、所有浏览器缩放组合及实际 DSH 安装仍需单独验证。

## 兼容性与验证边界

部分样式依赖宿主 CSS Module 类名片段，例如首页标题、composer 宽度、侧栏背景、输入框提示、工作区文件夹与账户区域。DSH 升级后，即使插件仍能加载，这些装饰也可能失效，需要重新核对选择器。

配色参考及适配目标为 DSH `0.2.1-rc.2`，当前 `engines.dsh` 限定此版本。不要仅依据配色参考扩大兼容范围；应按 [发布验收](RELEASING.md) 在目标版本完成真实安装验证。

停用时应关闭整个「财神打工版」组合包，而不只是其中的 `theme-caishen` 行：关闭内层行不会撤回组合包里禁用官方品牌的补丁。

现有文档截图来自独立 React 布局预览，使用插件真实组件、样式和提取的宿主 CSS。它能检查布局与局部交互，无法证明插件管理器安装、宿主插槽加载或桌面端运行成功。发布记录应分开写明离线检查、独立预览和实际 DSH 验收的结果。阶段 1 至阶段 4 均未声称完成实机安装验收；项目专属库、功德扩展和兼容探索等后续功能见需求清单。

## 第五阶段范围与功德约定

- `state/prompt-scopes.cjs` 复用现有 store 的校验、备份与冲突处理，缓存按宿主稳定 ID 划分的库；`components/prompt-workspace.cjs` 负责范围切换。切换前复用未保存保护；会话/项目身份变化关闭旧窗口，填入再次核对打开时的身份。
- 全局卡片仍用 `dsh-theme-caishen:prompt-cards:v1`，恢复副本仍用 `dsh-theme-caishen:prompt-cards:recovery:v1`，全局偏好仍用 `dsh-theme-caishen:prompt-usage:v1`。不复制、不迁移旧库。
- 项目 key 前缀为 `dsh-theme-caishen:project:<workspaceId>`，分别追加 `:prompt-cards:v1`、`:recovery:v1`、`:prompt-usage:v1`。缺失项目库为空数组视图；研发模板是主动添加的素材，不是隐式继承。重置只清空当前项目，先备份其异常原文；撤销记录留在当前库实例内。
- 备份格式仍为版本 1/2 卡片，不带 origin、项目身份或偏好；导入目标由当前范围决定。跨设备 ID 不映射，用户明确选定目标后导入。项目空间本地保存，清理网站数据会删除所有范围。
- 功德 key 仍为 `dsh-theme-caishen:merit` 数字字符串。`navigator.locks` 的同名独占锁在当前客户端之间串行执行重读/累加/写入，storage 事件订阅最新累计；不保证与不参与锁的旧客户端并发安全。
- 写入失败将本窗口增量暂留内存；重试在锁内与最新持久数合并，成功后清除 pending，避免重复计入。无共享锁时只保留内存增量，不尝试覆盖共享值；状态和按钮有明确反馈。计数校验为非负安全整数，异常值保留，重置确认时检查原值；损坏原文先备份到 `dsh-theme-caishen:merit:recovery:v1`，失败则不清零。
- `components/merit-panel.cjs` 仅在主动打开时显示累计、派生里程碑和按本地日期选取的五条签文；没有额外每日记录或成就存储。彩蛋关闭隐藏入口但不清理计数；数据不代表真实项目成果。

## 第六阶段宿主复验

当前为 50 个客户端模块、17 份 CSS、320 个双语键、10 个插槽（原九个加正式设置页），手写入口 126 行。`lib/client.js` 仍是可安装的自动生成单文件，维护只修改 `src/`。

宿主私有类选择器统一在 `styles/host-adapter.css`，插槽与项目解析统一在 `adapter/host.cjs`。升级需执行 `check:host`、`check:browser` 与真实打包安装生命周期验收；命令、隔离环境和证据边界见 [兼容说明](COMPATIBILITY.md)。日常 `check:release` 保持零依赖离线运行，不能代替外部浏览器或目标宿主。探索方向与不纳入核心主题的原因见 [评估记录](EXPLORATION.md)。

## 原视觉恢复与桌宠兼容

`hero.css` 维护原云纹边框、朱红标题、带字场景和气泡；图片的透明留白由插画容器处理，不更改素材字节。`fortune.css` 单独维护功德匾额、动态 +1 与红金功德簿，按可见匾额对齐而非透明图片高度；不以大图高度撑高宿主控件行。

主题动作组用 `body :is(.caishen-hero-actions,.caishen-utilities)` 居中并清零历史 top 偏移，覆盖桌宠旧样式针对 48px 图片设置的补偿，不修改桌宠项目。composer 财神定位在原生 `data-composer-card`，不用底部工具行或浏览器右边缘作为定位父。
