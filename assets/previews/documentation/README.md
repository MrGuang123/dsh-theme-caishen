# 截图来源

图片仅为文档预览，不是运行依赖；不携带用户会话、令牌或账户信息。文件校验值记录在 `assets/manifest.json`。

| 文件 | 来源与范围 |
| --- | --- |
| `visual-repair-host-home-light.png`、`visual-repair-host-home-dark.png` | 2026-10-23，真实 DSH `0.2.1-rc.2`，原设计恢复后的隔离安装截图；深浅色从宿主通用设置切换，1440×1000；带字场景、图片功德、红金功德簿及输入右侧财神均为真实插件组件 |
| `visual-repair-host-settings-light.png` | 同一真实宿主内的独立 `settings.section` 外观页，无额外嵌套弹窗 |
| `home-light.png`、`home-dark.png`、`prompt-editor.png`、`prompt-sort.png` | 较早的独立组件预览，保留原图作为历史配色/管理界面参考；不表示最新布局或真实安装 |
| `phase56-host-home-light.png` | 2026-10-23，真实 DSH `0.2.1-rc.2` 安装包的隔离 Web profile，Chrome 1440×1000，中文浅色；输入框为无模型请求的测试文字 |
| `phase56-host-project-library.png` | 同一真实安装环境，项目库使用宿主生成的工作区 ID；显示的 `/private/tmp/caishen-phase56/...` 为两个同名测试目录之一 |
| `phase56-host-merit.png` | 同一真实安装环境，两个页面原生 Web Locks 累计后主动打开功德簿，计数为测试数据 |
| `phase56-fixture-merit-dark-en-text200.png` | 当前组件与宿主 React/CSS 的独立浏览器夹具，540×720、英文深色、200% 根字号；不是完整 DSH 页面 |

真实安装图来自已安装 DSH 的 `app.asar` 启动的 Web profile，未模拟宿主输入、工作区或插件管理器。账号未配置模型，未发送实际模型请求。独立夹具用于额外布局和故障场景，复验方法见 [兼容说明](../../../docs/COMPATIBILITY.md)。
