# 宿主兼容与复验

本轮目标和已验证版本为 DSH `0.2.1-rc.2`，`engines.dsh` 保持该精确版本。代码契约核对、独立组件浏览器与真实安装是三类证据，不能互相替代。实际结果见 [验证记录](VALIDATION.md)。

## 适配边界

- `src/client/adapter/host.cjs` 集中维护十个插槽（原九个加正式 `settings.section`）、composer DOM 标记和工作区映射。输入读取 `useInput`，写入只使用捕获 `draftRev` 后的 `inputActions.insertText`；失败不调用 DOM 写入或整段替换。
- 根 hook `useWorkspaces` 的 `items[].workspaceId` 是项目持久 ID，`sessionIds` 为会话归属；只有唯一匹配且 ID 合法时才开放项目库。不能从目录名、路径或会话标题猜 ID。未取得身份时全局库仍可用。
- 宿主私有 CSS 类名片段全部集中在 `styles/host-adapter.css`，其余样式维护主题自身类名；这些片段没有稳定 API 承诺，升级必须复验。
- `scripts/check-host.mjs` 只读指定 `app.asar` 内的版本、十个插槽、输入、工作区、快捷键、主题与 9 个 CSS 类名片段，并阻止私有类选择器散落回其他文件。静态匹配通过不证明行为正确。

## 可复现组件浏览器

离线构建及测试无需安装依赖：

```bash
npm run build
npm run check:release
npm run check:host -- '/path/to/DeepSeek Harness.app/Contents/Resources/app.asar'
```

浏览器验收需要外部 Playwright、Chrome 与目标 DSH 的前端运行时，不增加插件的生产依赖：

```bash
CAISHEN_QA_RUNTIME=/path/to/runtime/package.json \
CAISHEN_HOST_ASAR='/path/to/DeepSeek Harness.app/Contents/Resources/app.asar' \
CAISHEN_CHROME='/path/to/Chrome' \
npm run check:browser
```

`CAISHEN_QA_RUNTIME` 指向可解析已安装 `playwright` 的包清单；使用 Playwright 自带 Chromium 时可省略 `CAISHEN_CHROME`。脚本从指定宿主静态提取 React/ReactDOM 与真实输入工具栏 CSS，运行本项目的当前 `lib/`，不启动整个宿主、不读用户 profile、不复制宿主运行时进仓库。提取边界不匹配时直接失败，升级后需要维护该适配。

全部页面与静态资源在新的隔离浏览器上下文中拦截到 loopback origin，Web Locks 与 localStorage 为原生浏览器实现；剪贴板为隔离适配器，异常配额由夹具模拟。代表性矩阵包括空白/已有会话、浅/深色、中/英文、1280×900、400×600、1280×500、540×720 与 200% 根字号。截图和机器记录输出到 Git 忽略的 `assets/previews/development/phase56/`。这是组件和契约验证，不称为安装截图。

## 真实安装复验顺序

1. 用独立的 `DSH_HOME`、`DSH_AGENTS_HOME`、profile、包缓存和浏览器上下文，安装本次 `npm pack` 的 `.tgz`；核对安装后的 JS/CSS 哈希与当前构建一致。同版本反复验收时使用不同的包路径，避免包管理器复用旧内容。
2. 启动目标版本。确认主题、图片和 CSS 加载；用两个同名临时目录创建工作区，验证稳定 ID 隔离、全局旧库及实际 composer 填入与焦点恢复。不开启真实模型请求。
3. 在同一浏览器上下文的两个页面检验功德并发累计、确认重置；检查外观预览/取消。切换浅深色、窄窗和低高度复核弹窗；从宿主设置左侧进入主题外观，验证保存、取消和离开回滚。
4. 在插件详情关闭整包的“启用 财神打工版”，再启用；确认主题属性、样式 link 与插槽卸载/恢复。仅停用内层 `theme-caishen` 不算整包停用。
5. 从插件管理器卸载整个包，确认官方品牌恢复、主题入口/属性/样式释放，持久数据仍留存；按宿主要求刷新或重启复核。卸载不清除 localStorage。
6. 写清实测结果和未测边界，再决定是否扩大版本范围。完整桌面原生窗口、所有操作系统、读屏与付费模型流程需要各自的环境和授权，不能从 Web profile 结果推定。

本轮使用安装版 app.asar 启动真实 Web profile，桌面程序文件只读。无桌面验收的目录选择使用宿主自带 browse 路径，不改日常 profile；遥测在测试实例关闭。精选截图的来源见 [截图索引](../assets/previews/documentation/README.md)。
