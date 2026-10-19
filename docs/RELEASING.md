# GitHub 发布步骤

本项目直接从 [Git 仓库](https://github.com/MrGuang123/dsh-theme-caishen) 安装，不需要发布到 npm。仓库根目录必须包含 `package.json`、`cordis.patch.yml`、`lib/` 和运行素材。不要只上传截图或打包文件。

这里列出的推送与发布命令由维护者确认后执行，不会自动上传内容。

## 首次公开前

1. 确认仓库可公开访问，并添加 `dsh-plugin` Topic。
2. 核对 `package.json` 的作者、仓库链接和 MIT 许可证元数据，以及仓库中的 `LICENSE`。
3. 确认 `package.json.version` 为准备发布的版本；`engines.dsh` 只填写已验证的版本范围。
4. 检查 README 截图可在仓库中直接打开。独立预览图保留其来源说明，实际安装截图注明对应 DSH 版本。
5. 检查暂存文件，不提交个人 profile、会话、密钥、缓存、系统杂项或临时预览输出。

GitHub 安装可以保留 `package.json` 中的 `private: true`；它阻止 npm 发布，不阻止从 Git 安装。

## 检查源码与打包内容

在仓库根目录运行：

```bash
npm run check:release
npm pack --dry-run
npm pack
```

`check:release` 包含源码离线检查与打包检查。核对打包列表包含运行入口、客户端、补丁、中英文元数据、图标和所有被引用的素材，且没有本机路径、个人配置或临时文件。

`npm pack` 生成的 `.tgz` 是可供本机验收或 GitHub Release 附件使用的安装包；GitHub 仓库本身仍需提交源码与运行文件。不要将 `.tgz` 反复提交进 Git 历史。

## 全新环境验收

使用与日常工作隔离的 DSH 测试 profile / 测试环境，记录 DSH 完整版本、操作系统和运行方式。不要仅通过开发目录的链接安装判断发布完成。

先在「插件」→「添加插件」填入刚生成的 `.tgz` 的绝对路径，完成安装并启用，核对：

- 插件页能读到正确名称、版本、图标与介绍，没有加载错误。
- 浅色、深色及跟随系统能切换；新会话与已有消息的会话均能打开。
- 首页素材完整，元宝、财神、气泡位置正常；已有会话不显示首页横幅。
- 「今日财运在线」在新旧会话中的高度一致，功德 `+1` 从文字位置上飘。
- 提示词新增、修改、删除、八色选择与排序可用；刷新后保留，点击卡片只填入而不发送。
- 窄窗口、较矮窗口和编辑弹窗没有阻断操作的溢出或遮挡。
- 关闭整个「财神打工版」组合包及卸载均正常，主题不再占据宿主界面插槽；按宿主要求刷新或重启后确认恢复。只关闭内层 `theme-caishen` 行不算完整停用，因为禁用官方品牌的补丁仍在组合包中。

验收结束后记录实际结果；未完成的项目要明确标记，不写成已经通过。独立布局预览不替代这一步。

## 推送仓库与版本标签

确认工作区内容、版本号和验收结果后再提交。首次关联远端可使用：

```bash
git remote add origin https://github.com/MrGuang123/dsh-theme-caishen.git
git push -u origin main
```

如果已配置 `origin`，先核对现有地址，不重复添加。以上命令假设当前分支为 `main`，分支名称不同则使用实际名称。

发布 `0.1.0` 时，版本号与标签保持对应：

```bash
git tag -a v0.1.0 -m '财神打工版 v0.1.0'
git push origin v0.1.0
```

后续版本修改 `package.json.version`、发布记录和文档中的示例版本，再创建新标签；不要移动已经对外分享的标签。

## 验证 GitHub 安装后分享

在隔离的测试环境中，再使用公开地址安装一次：

```bash
dsh plugin --profile web add 'git+https://github.com/MrGuang123/dsh-theme-caishen.git#v0.1.0'
```

`web` 应替换为实际 CLI profile。桌面端用户建议在 DSH「插件」→「添加插件」填同一地址。确认下载、版本识别、启用和素材加载成功，再把带标签的地址分享给其他用户。

可在 GitHub 创建对应标签的 Release，写明功能、实际验证的 DSH 版本、已知问题和安装地址，并附上 `.tgz` 作为另一种安装来源。Release 不是 Git 安装的必要条件；标签和完整仓库内容才决定该地址安装的版本。

第三方插件升级通常需要卸载后重新安装新标签。发布说明应提醒用户先备份自定义提示词文本；本主题不会主动清理浏览器中的卡片数据，但更换访问地址、浏览器或清理网站数据会影响本地存储。

## 官方参考

- [DSH 插件安装与管理](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-plugin-manager/README.zh.md)
- [DSH 插件清单](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/util/package-manifest/README.zh.md)
