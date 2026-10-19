/**
 * 财神打工版 — browser half of the DeepSeek Harness Caishen theme.
 *
 * The bundle does three things:
 *   1. overlays a complete vermilion-and-gold alias palette on the built-in
 *      theme, so light / dark / system and the font preferences keep working;
 *   2. injects one plugin-owned stylesheet for the banner, talisman cards and
 *      brand marks (artwork colours only, host tokens everywhere else);
 *   3. contributes the home-screen hero, sidebar brand, header marquee and a
 *      small merit easter egg through the live slot tree.
 *
 * The wrapper shape is the plain module-loader contract used by shipped
 * packages; the `id` MUST equal package.json `name`.
 */
window.__ModuleLoader__.load({
	id: "dsh-theme-caishen",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;

		const React = require("react");
		const h = React.createElement;

		const LAYER = "dsh-theme-caishen";
		const NS = "theme-caishen";
		const ASSET_BASE = "/theme-caishen/assets/";
		const EXTRA_BASE = "/theme-caishen/extra/";
		const asset = (path) => ASSET_BASE + path;
		const extra = (path) => EXTRA_BASE + path;

		/**
		 * Alias + specific tokens. Each entry needs both palettes: the theme
		 * runtime rejects a bare string, because one value cannot stay legible
		 * in both schemes. Shiki tokens are included as well; they ride the
		 * same inline custom-property mechanism.
		 */
		const TOKENS = {
			// ---- surfaces -------------------------------------------------
			"--dsw-alias-bg-base": { light: "#f7ead5", dark: "#1a100b" },
			"--dsw-alias-bg-document-preview": { light: "#f3e4cc", dark: "#241710" },
			"--dsw-alias-bg-document-selection": {
				light: "color-mix(in srgb, #d9a441 45%, transparent)",
				dark: "color-mix(in srgb, #e8b04b 40%, transparent)"
			},
			"--dsw-alias-bg-layer-1": { light: "#fffaf0", dark: "#241710" },
			"--dsw-alias-bg-layer-2": { light: "#fff6e8", dark: "#2b1c14" },
			"--dsw-alias-bg-layer-3": { light: "#ffefdb", dark: "#332218" },
			"--dsw-alias-bg-mask-1": { light: "#2a160b3d", dark: "#00000080" },
			"--dsw-alias-bg-mask-2": { light: "#2a160b1f", dark: "#00000033" },
			"--dsw-alias-bg-mask-3": { light: "#2a160b7a", dark: "#0000007a" },
			"--dsw-alias-bg-mask-drop": { light: "#fff8eab3", dark: "#2a1a12b3" },
			"--dsw-alias-bg-mask-photo": { light: "#1b0f08e0", dark: "#1b0f08e0" },
			"--dsw-alias-bg-module-platform": { light: "#f3e1c6", dark: "#2a1b13" },
			"--dsw-alias-bg-multi-select": { light: "#f7ecd9", dark: "#3a2719" },
			"--dsw-alias-bg-overlay": { light: "#eed8b8", dark: "#3a261a" },
			"--dsw-alias-bg-skeleton": { light: "#3b24140a", dark: "#ffffff14" },
			"--dsw-alias-menu-group-header-fill": { light: "#fff7e8f0", dark: "#33231af0" },
			"--dsw-menu-surface-fill": { light: "#fffaf094", dark: "#2a1c1473" },

			// ---- text / labels -------------------------------------------
			"--dsw-alias-label-caption": { light: "#a58563", dark: "#96795f" },
			"--dsw-alias-label-deep-diving": {
				light: "color-mix(in srgb, #b3261e 70%, #3b2414)",
				dark: "color-mix(in srgb, #e8b04b 62%, #d8c0a0)"
			},
			"--dsw-alias-label-deep-diving-shimmer": {
				light: "color-mix(in srgb, #e8b04b 60%, #3b2414)",
				dark: "#ffd98a"
			},
			"--dsw-alias-label-dimmed": { light: "#c3a887", dark: "#6f5843" },
			"--dsw-alias-label-document-preview": { light: "#6e4c31", dark: "#d8c0a0" },
			"--dsw-alias-label-primary": { light: "#3b2414", dark: "#f7e8d2" },
			"--dsw-alias-label-primary-bluish": { light: "#5a2a16", dark: "#f7e8d2" },
			"--dsw-alias-label-primary-dimmed": { light: "#4a2b18", dark: "#e9d6ba" },
			"--dsw-alias-label-primary-foreground": { light: "#fff8ec", dark: "#fff8ec" },
			"--dsw-alias-label-primary-inverted": { light: "#fff8ec", dark: "#2a160b" },
			"--dsw-alias-label-secondary": { light: "#6e4c31", dark: "#d8c0a0" },
			"--dsw-alias-label-shimmer": {
				light: "color-mix(in srgb, #b3261e 30%, transparent)",
				dark: "color-mix(in srgb, #ffd98a 40%, transparent)"
			},
			"--dsw-alias-label-tertiary": { light: "#8b6a4d", dark: "#b99a79" },

			// ---- borders -------------------------------------------------
			"--dsw-alias-border-inverted": { light: "#0000", dark: "#ffffff0f" },
			"--dsw-alias-border-inverted2": { light: "#0000", dark: "#ffffff14" },
			"--dsw-alias-border-l1": { light: "#3b24140a", dark: "#ffffff0f" },
			"--dsw-alias-border-l2": { light: "#3b24141a", dark: "#ffffff1f" },
			"--dsw-alias-border-l2-darkmode-thin": { light: "#3b24141a", dark: "#ffffff0f" },
			"--dsw-alias-border-l3": { light: "#3b24141f", dark: "#ffffff29" },
			"--dsw-alias-border-l4": { light: "#3b241429", dark: "#ffffff38" },

			// ---- buttons / interactive -----------------------------------
			"--dsw-alias-button-contrast-fill": { light: "#5a3420", dark: "#f0dcc0" },
			"--dsw-alias-button-elevated-fill": { light: "#fffaf0", dark: "#2a1c14" },
			"--dsw-alias-button-floating-fill": { light: "#fffaf0", dark: "#332218" },
			"--dsw-alias-button-floating-hover": { light: "#f7ead4", dark: "#3a2719" },
			"--dsw-alias-button-ghost-active-border": { light: "#c9ad86", dark: "#6f5843" },
			"--dsw-alias-button-ghost-active-fill": { light: "#f5e8d2", dark: "#3a2719" },
			"--dsw-alias-button-ghost-active-hover": { light: "#efdec2", dark: "#4a3320" },
			"--dsw-alias-button-info-fill": { light: "#b3261e", dark: "#c53a2e" },
			"--dsw-alias-button-info-hover": { light: "#8f1d16", dark: "#e05345" },
			"--dsw-alias-button-primary-dimmed": { light: "#f3e4cc", dark: "#3a2719" },
			"--dsw-alias-button-primary-fill": { light: "#b3261e", dark: "#c53a2e" },
			"--dsw-alias-button-primary-hover": { light: "#8f1d16", dark: "#e05345" },
			"--dsw-alias-button-tool-bar-fill": { light: "#54555780", dark: "#54555780" },
			"--dsw-alias-button-tool-bar-fill-invisible": { light: "#1f1f1f5c", dark: "#1f1f1f5c" },
			"--dsw-alias-button-tool-bar-hover": { light: "#54555799", dark: "#54555799" },
			"--dsw-alias-interactive-bg-active": { light: "#8f3d1f1a", dark: "#ffffff24" },
			"--dsw-alias-interactive-bg-hover": { light: "#8f3d1f0f", dark: "#ffffff14" },
			"--dsw-alias-interactive-bg-hover-accent": { light: "#b3261e24", dark: "#f0b35b33" },
			"--dsw-alias-interactive-bg-hover-danger": { light: "#c0392b14", dark: "#f25a5a26" },
			"--dsw-alias-interactive-bg-hover-solid": { light: "#f3e4cc", dark: "#3a2719" },

			// ---- semantic states -----------------------------------------
			"--dsw-alias-state-business-primary": { light: "#b3261e", dark: "#e8b04b" },
			"--dsw-alias-state-business-tertiary": { light: "#f7dfc2", dark: "#3a2718" },
			"--dsw-alias-state-error-primary": { light: "#b3261e", dark: "#f07a6e" },
			"--dsw-alias-state-error-secondary": { light: "#d95a4e", dark: "#f28f85" },
			"--dsw-alias-state-idle-primary": { light: "#c3a887", dark: "#6f5843" },
			"--dsw-alias-state-success-primary": { light: "#2f7d4f", dark: "#6fbf8b" },
			"--dsw-alias-state-success-secondary": { light: "#4c9a6a", dark: "#8fd6a4" },
			"--dsw-alias-state-success-tertiary": { light: "#e6f2e8", dark: "#1f3124" },
			"--dsw-alias-state-warn-label": { light: "#8a5a12", dark: "#f0c36a" },
			"--dsw-alias-state-warn-primary": { light: "#b7791f", dark: "#e8b04b" },
			"--dsw-alias-state-warn-secondary": { light: "#d9a441", dark: "#f3d594" },
			"--dsw-alias-state-warn-tertiary": { light: "#f7ecd2", dark: "#3a2718" },

			// ---- markdown / code -----------------------------------------
			"--dsw-alias-markdown-citation": { light: "#f3e4cc", dark: "#332218" },
			"--dsw-alias-markdown-code-block": { light: "#f6e9d3", dark: "#1f1510" },
			"--dsw-alias-markdown-code-block-banner": { light: "#f0e1c7", dark: "#2a1c14" },
			"--dsw-alias-markdown-code-segment-selected": { light: "#fffaf0", dark: "#3a2719" },
			"--dsw-alias-markdown-code-segment-unselected": { light: "#f7ecd9", dark: "#241710" },
			"--dsw-alias-markdown-inline-code": { light: "#f3e4cc", dark: "#332218" },
			"--dsw-alias-markdown-placeholder": { light: "#e7d4b7", dark: "#3a2719" },
			"--dsw-alias-markdown-tag": { light: "#f1e2c8", dark: "#332218" },
			"--dsw-alias-code-diff-added": { light: "#2f7d4f14", dark: "#6fbf8b14" },
			"--dsw-alias-code-diff-deleted": { light: "#b3261e14", dark: "#f07a6e14" },
			"--dsw-alias-file-diff-added-bg": { light: "#e9f4e9", dark: "#1f3124" },
			"--dsw-alias-file-diff-added-gutter": { light: "#eff8ef", dark: "#132016" },
			"--dsw-alias-file-diff-added-marker": { light: "#2f8f52", dark: "#41c977" },
			"--dsw-alias-file-diff-deleted-bg": { light: "#fbe7e2", dark: "#3c1f1b" },
			"--dsw-alias-file-diff-deleted-gutter": { light: "#fdeeea", dark: "#28130e" },
			"--dsw-alias-file-diff-deleted-marker": { light: "#ba2723", dark: "#fa423e" },

			// ---- brand / links -------------------------------------------
			"--dsw-alias-brand-primary": { light: "#b3261e", dark: "#c53a2e" },
			"--dsw-alias-brand-primary-invert": { light: "#7a1a14", dark: "#f7e8d2" },
			"--dsw-alias-brand-primary-new-colorprimary-new-color": { light: "#b3261e", dark: "#e8b04b" },
			"--dsw-alias-brand-text": { light: "#7a1a14", dark: "#f7e8d2" },
			"--dsw-alias-link": { light: "#a51c15", dark: "#f3b35b" },
			"--dsw-alias-menu-icon": { light: "#6e4c31", dark: "#e9d6ba" },

			// ---- chrome --------------------------------------------------
			"--dsw-alias-scrollbar-bg-l1": { light: "#e0c9a8", dark: "#5a422e" },
			"--dsw-alias-scrollbar-bg-l2": { light: "#dcc5a4", dark: "#4f3a28" },
			"--dsw-alias-scrollbar-hover-l1": { light: "#cbb08a", dark: "#73563c" },
			"--dsw-alias-scrollbar-hover-l2": { light: "#c9ad86", dark: "#6a4f38" },
			"--dsw-alias-switch-thumb": { light: "#fffdf7", dark: "#c9ad86" },
			"--dsw-alias-toast-bg": { light: "#4a2b18", dark: "#3a2719" },
			"--dsw-alias-toast-label": { light: "#fff5e4", dark: "#fff5e4" },
			"--dsw-alias-tooltip-bg": { light: "#4a2b18", dark: "#3a2719" },
			"--dsw-alias-tooltip-key-bg": {
				light: "color-mix(in srgb, #4a2b18, white 18%)",
				dark: "color-mix(in srgb, #3a2719, white 18%)"
			},
			"--dsw-alias-turn-trigger-bg": { light: "#f7ecd9", dark: "#2a1c14" },
			"--dsw-alias-turn-trigger-bg-hover": { light: "#f3e4cc", dark: "#3a2719" },

			// ---- concrete components -------------------------------------
			"--dsw-specific-bubble": { light: "#f9e3bf", dark: "#3a2719" },
			"--dsw-specific-bubble-highlight": { light: "#f5d6a6", dark: "#4a3320" },
			"--dsw-specific-input-major": { light: "#fffaf0", dark: "#2a1c14" },
			"--dsw-specific-login-input": { light: "#fffaf0", dark: "#241710" },
			"--dsw-specific-menu": { light: "#fffaf0e6", dark: "#2a1c14e0" },
			"--dsw-specific-selector": { light: "#f3e1c6", dark: "#3a2719" },
			"--dsw-specific-sidebar-fill": { light: "#f3e2c6", dark: "#1f130d" },
			"--dsw-specific-sidebar-nav-item-active": { light: "#f5e2c5", dark: "#2a1c14" },
			"--dsw-specific-sidebar-nav-item-active-accent": { light: "#efd7b3", dark: "#3a2719" },
			"--dsw-specific-sidebar-nav-item-hover": { light: "#f9edda", dark: "#241710" },
			"--dsw-specific-tip": { light: "#f8eedb", dark: "#332218" },

			// ---- syntax highlighting -------------------------------------
			"--shiki-token-constant": { light: "#b45309", dark: "#f0b35b" },
			"--shiki-token-string": { light: "#2f7d4f", dark: "#8fd6a4" },
			"--shiki-token-comment": { light: "#a08a6c", dark: "#a89078" },
			"--shiki-token-keyword": { light: "#b3261e", dark: "#f08a7e" },
			"--shiki-token-parameter": { light: "#c2410c", dark: "#f2b76b" },
			"--shiki-token-function": { light: "#8a4b1e", dark: "#e8c98a" },
			"--shiki-token-string-expression": { light: "#3f7d4a", dark: "#a8e0b8" },
			"--shiki-token-punctuation": { light: "#6b4a33", dark: "#d8c0a0" },
			"--shiki-token-link": { light: "#a51c15", dark: "#f3b35b" }
		};

		/** Simplified Chinese copy (key-set source of truth). */
		const zh = {
			"brand.name": "财神打工版",
			"brand.tag": "招财",
			"header.title": "财神打工版 · 专属皮肤",
			"header.subtitle": "让代码为你打工，效率为你生财",
			"brand.aria": "财神打工版",
			"status.online": "今日财运在线",
			"merit.label": "功德 +1",
			"merit.aria": "功德加一",
			"merit.count": "功德 {count}",
			"merit.burst": "+1",
			"hero.kicker": "财神驻场 · 今日宜搞钱",
			"hero.titleLead": "今天先把项目",
			"hero.titleMid": "搞",
			"hero.titleAccent": "赚钱",
			"hero.subtitle": "财神驻场，帮你优化成本、清理技术债、顺手催进度",
			"hero.hint": "点一张符，提示词自动填进输入框",
			"hero.footer": "财神在此，有求必应 · 点张符试试",
			"card.cost.tag": "省就是赚",
			"card.cost.title": "成本优化",
			"card.cost.desc": "代码瘦身降成本，每分预算花在刀刃上",
			"card.cost.prompt": "帮我找出这个项目里可以降本增效的地方，并给出具体的优化方案。",
			"card.debt.tag": "债清运开",
			"card.debt.title": "技术债清账",
			"card.debt.desc": "扫描债务，一键清理，拒绝负利息代码",
			"card.debt.prompt": "扫描这个项目的技术债，列出利息最高的几项，并给出清理计划。",
			"card.report.tag": "汇报不加班",
			"card.report.title": "自动报表总结",
			"card.report.desc": "日报、周报、月报自动生成",
			"card.report.prompt": "根据最近的改动，帮我生成一份本周工作汇报，重点突出成果和风险。",
			"card.merge.tag": "合并旺旺",
			"card.merge.title": "冲突合并开运",
			"card.merge.desc": "智能识别冲突，合并顺利，运气 +10",
			"card.merge.prompt": "帮我检查当前分支的合并冲突，并给出安全、分步的解决指令。",
			"card.debug.tag": "逢凶化吉",
			"card.debug.title": "排查并修复问题",
			"card.debug.desc": "从复现和证据定位根因，修复后验证回归",
			"card.debug.prompt": "请根据下面的问题现象、报错或复现步骤，检查相关代码与项目约定，先复现或建立可验证的判断，再定位根因。直接完成影响范围尽量小的修复，必要时补充能覆盖该缺陷的测试，不顺手重构无关模块。执行针对性验证，如无法运行，明确原因和待验证项。最后说明根因、修改位置、验证结果及剩余风险；不要把推测写成已确认事实。缺少会阻碍定位的关键信息时，具体指出缺少什么。不自动提交、推送代码或部署。\n\n问题现象／报错／复现步骤：",
			"card.feature.tag": "开工大吉",
			"card.feature.title": "实现一个需求",
			"card.feature.desc": "沿用现有约定实现需求，补齐边界与验证",
			"card.feature.prompt": "请结合下面的需求和验收标准，检查相关实现及项目约定，复用已有组件、接口和依赖，直接完成必要的开发。覆盖与需求相关的空状态、异常和边界情况，避免引入无关改动或新依赖；常规实现选择按现有约定处理，只有关键业务规则不明确且会影响正确性时再具体询问。完成后执行适当的检查或测试，说明实现内容、验证结果及未完成事项，不声称执行未运行的检查。不自动提交、推送代码或部署。\n\n需求／验收标准／约束：",
			"card.review.tag": "上线平安",
			"card.review.title": "审查当前改动",
			"card.review.desc": "只读审查当前改动，优先找功能错误与回归",
			"card.review.prompt": "请只读审查下面指定的改动范围；未指定时，以当前工作区的代码改动为起点，必要时阅读关联实现和测试。优先查找可证明的功能错误、边界遗漏、兼容性问题及回归风险，避免只提风格偏好或猜测性问题。按严重程度列出发现，每项给出文件位置、触发条件、影响和判断依据，并指出缺失的关键验证。没有发现明确问题时直接说明，同时列出检查的范围和局限。不要修改文件、创建提交、推送或部署。\n\n审查范围／关注点（可选）：",
			"card.tests.tag": "稳稳交付",
			"card.tests.title": "补充关键测试",
			"card.tests.desc": "围绕关键行为和风险补测试，避免重复实现",
			"card.tests.prompt": "请针对下面的功能、缺陷或当前改动，先阅读相关代码与现有测试约定，找出真正缺少保障的关键行为。补充数量适当的测试，覆盖正常路径及有实际风险的边界或异常；回归测试应能捕获原缺陷，避免仅照抄实现或堆叠无价值断言。优先使用项目已有测试工具，不为测试顺手改动无关生产代码。运行相关测试并如实报告结果；无法运行时说明阻碍和后续命令。目标不明确时具体询问。不自动提交、推送代码或部署。\n\n测试目标／相关文件／已知风险：",
			"card.explain.tag": "一看就懂",
			"card.explain.title": "理解一段代码",
			"card.explain.desc": "只读梳理入口、数据流和调用关系",
			"card.explain.prompt": "请只读分析下面指定的代码、文件或功能。先说明它解决什么问题，再围绕入口、主要调用链、数据流及状态变化解释核心流程，并指出重要的边界处理、依赖和设计取舍。用文件与函数位置支撑结论，必要时举一个输入到输出的具体例子；区分代码能证实的事实和你的推断，不把未检查的关联模块说成已确认。内容以帮助我后续修改为主，避免逐行复述；如未给出分析目标，先询问具体文件或功能。不要修改文件、创建提交、推送或部署。\n\n代码位置／功能／希望弄清的问题：",
			"card.refactor.tag": "清账生财",
			"card.refactor.title": "局部重构",
			"card.refactor.desc": "限定范围改善结构，保持对外行为一致",
			"card.refactor.prompt": "请对下面指定的范围进行局部重构，先确认现有行为、调用方及测试保障，再改善重复逻辑、职责划分或可读性。保持对外接口、数据格式及可观察行为一致，沿用项目现有约定，不扩散到无关模块，也不借机升级依赖或新增功能。直接完成必要的结构调整，执行能证明行为保持一致的针对性验证；缺少保障时补充有价值的测试。最后说明调整内容、行为保持的依据及残余风险。范围或目标缺失时具体询问。不自动提交、推送代码或部署。\n\n重构范围／主要问题／必须保留的行为：",
			"card.performance.tag": "快马进财",
			"card.performance.title": "定位性能瓶颈",
			"card.performance.desc": "先测量再优化，比较前后并解释收益",
			"card.performance.prompt": "请围绕下面的慢点和使用场景定位性能瓶颈。先检查相关调用链，选择与问题相符的指标和可重复的测量方法，记录基线，再根据证据找出主要耗时或资源开销。对已确认的瓶颈完成范围可控的优化，并在相同条件下比较前后结果，同时检查功能是否回归。不要凭直觉改动整个项目，也不要虚构耗时、吞吐量或收益；环境无法测量时，明确限制并提供可执行的测量步骤。缺少关键场景时具体询问。不自动提交、推送代码或部署。\n\n慢点／复现负载／期望指标／约束：",
			"card.summary.tag": "收工有财",
			"card.summary.title": "总结本次改动",
			"card.summary.desc": "只读整理改动、验证结果和交付风险",
			"card.summary.prompt": "请只读整理下面指定范围的改动；未指定时，从当前工作区的差异和可见的验证记录入手。面向未参与开发的同事，说明解决的问题、用户可感知的变化、重要实现取舍、验证结果及待办或风险。只总结实际存在的修改和已确认执行的检查，区分已通过、失败、未执行及无法核实，不虚构业务成果或测试结论。按我指定的用途组织成简洁可用的文字；未指定用途时给出交付说明。不要修改文件、创建提交、发消息、推送或部署。\n\n改动范围／用途（交付说明、PR 描述或工作汇报）／补充验证记录：",
			"card.filled": "已填入",
			"card.edit": "编辑",
			"card.fillAria": "把「{title}」的提示词填入输入框",
			"library.title": "常用提示词",
			"library.hint": "点卡片填入，点编辑自定义",
			"library.add": "新增提示词",
			"library.templates": "研发模板",
			"templates.title": "研发提示词模板",
			"templates.hint": "选择常用任务，查看完整提示词；使用后可继续编辑，保存才会加入常用列表。",
			"templates.list": "选择研发任务",
			"templates.prompt": "提示词内容",
			"templates.use": "使用此模板",
			"templates.close": "关闭研发模板",
			"library.sort": "排序",
			"library.prev": "上一组提示词",
			"library.next": "下一组提示词",
			"library.empty": "还没有提示词，添加一张常用的开发卡片吧。",
			"editor.add": "新增提示词",
			"editor.edit": "编辑提示词",
			"editor.editAria": "编辑「{title}」",
			"editor.subtitle": "保存常用开发流程，下次点卡片即可填入。",
			"editor.icon": "图标",
			"editor.emoji": "自定义表情",
			"editor.emojiHint": "或输入一个表情，例如 👩‍💻",
			"editor.tag": "图标右侧标签",
			"editor.title": "标题",
			"editor.desc": "简介",
			"editor.prompt": "提示词内容",
			"editor.tone": "图标底色",
			"editor.red": "朱红",
			"editor.green": "翠绿",
			"editor.gold": "鎏金",
			"editor.teal": "青玉",
			"editor.blue": "黛蓝",
			"editor.purple": "紫檀",
			"editor.rose": "胭脂",
			"editor.brown": "沉香",
			"editor.position": "显示位置",
			"editor.positionValue": "第 {position} 位",
			"editor.first": "最前面",
			"editor.last": "最后面",
			"sort.title": "排序提示词",
			"sort.hint": "把常用的放在前面，保存后生效。",
			"sort.save": "保存顺序",
			"sort.top": "置顶",
			"sort.topAria": "将「{title}」移到最前面",
			"sort.upAria": "上移「{title}」",
			"sort.downAria": "下移「{title}」",
			"sort.close": "关闭排序窗口",
			"editor.preview": "卡片预览",
			"editor.previewHint": "点击卡片只会填入输入框，由你确认发送。",
			"editor.save": "保存",
			"editor.cancel": "取消",
			"editor.close": "关闭编辑窗口",
			"editor.delete": "删除卡片",
			"editor.confirmDelete": "确认删除",
			"editor.back": "返回编辑",
			"editor.deleteMessage": "确定删除「{title}」？删除后将从常用提示词中移除。",
			"editor.error.icon": "请选择图标，或输入一个表情。",
			"editor.error.title": "请填写标题，最多 60 个字符。",
			"editor.error.prompt": "请填写提示词内容，最多 12000 个字符。",
			"editor.error.invalid": "内容格式不正确，请检查后重试。",
			"editor.error.storage": "保存失败，本地存储不可用或空间不足。请保留内容后重试。",
			"editor.error.limit": "最多保存 128 张卡片，请先删除不需要的卡片。",
			"editor.error.missing": "这张卡片已在其他窗口删除，请关闭后重新添加。",
			"mascot.alt": "戴墨镜、在电脑前打工的财神",
			"mascot.bubble1": "代码写得好",
			"mascot.bubble2": "KPI 少不了",
			"mascot.saved": "本月已节省",
			"mascot.amount": "¥68,888.00",
			"mascot.efficiency": "效率 +88.8%",
			"fortune.meter": "财运满格",
			"settings.label": "财运设置",
			"fortune.meterAria": "财运满格"
		};

		/** English copy, used as the fallback for every other locale. */
		const en = {
			"brand.name": "Caishen at Work",
			"brand.tag": "FORTUNE",
			"header.title": "CAISHEN AT WORK · EXCLUSIVE SKIN",
			"header.subtitle": "Let the code work for you; efficiency earns the fortune.",
			"brand.aria": "Caishen at Work",
			"status.online": "Fortune online",
			"merit.label": "Merit +1",
			"merit.aria": "Add one merit",
			"merit.count": "Merit {count}",
			"merit.burst": "+1",
			"hero.kicker": "THE GOD OF WEALTH IS ON DUTY",
			"hero.titleLead": "Get the project",
			"hero.titleMid": " ",
			"hero.titleAccent": "profitable",
			"hero.subtitle": "The God of Wealth is on duty — trimming costs, clearing tech debt and nudging the project forward.",
			"hero.hint": "Pick a talisman and the prompt lands in the composer.",
			"hero.footer": "Ask and the fortune answers · try a talisman",
			"card.cost.tag": "SAVE TO EARN",
			"card.cost.title": "Cost tuning",
			"card.cost.desc": "Slim the code, trim the spend",
			"card.cost.prompt": "Find cost and efficiency wins in this project, then propose a concrete optimization plan.",
			"card.debt.tag": "DEBT-FREE",
			"card.debt.title": "Tech-debt clearance",
			"card.debt.desc": "Scan the interest, pay it down once",
			"card.debt.prompt": "Scan this project for technical debt, rank the highest-interest items and draft a cleanup plan.",
			"card.report.tag": "NO OVERTIME",
			"card.report.title": "Auto status report",
			"card.report.desc": "Daily, weekly and monthly summaries",
			"card.report.prompt": "Summarize this week's changes into a concise status report for my team.",
			"card.merge.tag": "MERGE LUCK",
			"card.merge.title": "Merge luck",
			"card.merge.desc": "Resolve conflicts, ship smoothly",
			"card.merge.prompt": "Inspect the current merge conflicts and give me safe, step-by-step resolution instructions.",
			"card.debug.tag": "BUGS BE GONE",
			"card.debug.title": "Diagnose and fix a bug",
			"card.debug.desc": "Find the cause from evidence, fix it and check for regressions",
			"card.debug.prompt": "Use the symptoms, error or reproduction steps below to inspect the relevant code and project conventions. Reproduce the issue or establish a verifiable diagnosis, then fix the root cause with a focused change. Add a regression test when useful and avoid unrelated refactoring. Run targeted verification; if it cannot run, explain the blocker and what remains unverified. Report the cause, changed locations, actual verification results and remaining risks. Distinguish confirmed facts from hypotheses. Ask specifically for any missing information that blocks diagnosis. Do not create commits, push code or deploy.\n\nSymptoms / error / reproduction steps:",
			"card.feature.tag": "LUCKY START",
			"card.feature.title": "Implement a feature",
			"card.feature.desc": "Follow project conventions, cover edge cases and verify behavior",
			"card.feature.prompt": "Implement the requirements and acceptance criteria below. Inspect related code and project conventions first, then reuse existing components, interfaces and dependencies. Handle relevant empty states, errors and edge cases without unrelated changes or new dependencies. Resolve routine implementation choices using existing conventions; ask a specific question only when an unclear business rule would affect correctness. Complete the implementation and run appropriate checks or tests. Explain the resulting behavior, actual verification results and unfinished work. Do not claim checks that were not run. Do not create commits, push code or deploy.\n\nRequirements / acceptance criteria / constraints:",
			"card.review.tag": "SHIP SAFELY",
			"card.review.title": "Review current changes",
			"card.review.desc": "Read-only review for behavior errors, omissions and regressions",
			"card.review.prompt": "Review the specified changes without modifying files. If no range is supplied, start with the current working-tree changes and read related code or tests as needed. Prioritize demonstrable functional defects, missing edge cases, compatibility issues and regression risks over style preferences or speculative concerns. Order findings by severity and include the file location, trigger, impact and supporting evidence for each. Identify important verification gaps. If no concrete issue is found, say so and state the reviewed scope and limitations. Do not modify files, create commits, push code or deploy.\n\nReview scope / areas of concern (optional):",
			"card.tests.tag": "SOLID DELIVERY",
			"card.tests.title": "Add essential tests",
			"card.tests.desc": "Protect important behavior and real risks with useful tests",
			"card.tests.prompt": "Add useful tests for the feature, defect or current changes described below. Read the relevant implementation and existing test conventions, then identify important behaviors that lack coverage. Use a focused set of tests for normal behavior and realistic edge cases or errors. A regression test should catch the original defect; avoid merely mirroring the implementation or adding low-value assertions. Reuse the existing test tools and avoid unrelated production changes. Run the relevant tests and report actual results, or explain blockers and the commands still needed. Ask specifically if the test target is unclear. Do not create commits, push code or deploy.\n\nTest target / related files / known risks:",
			"card.explain.tag": "MAKE IT CLEAR",
			"card.explain.title": "Understand some code",
			"card.explain.desc": "Trace entry points, data flow and calls without changing files",
			"card.explain.prompt": "Analyze the code, file or feature below without modifying files. Explain the problem it solves, then trace the entry point, main calls, data flow and state changes. Describe meaningful edge handling, dependencies and design tradeoffs. Support conclusions with file and function locations and, when helpful, walk through a concrete input-to-output example. Distinguish source-backed facts from inference and do not claim to have checked unrelated modules. Focus on what would help me modify the code later, rather than paraphrasing every line. Ask for a specific file or feature if no target is supplied. Do not modify files, create commits, push code or deploy.\n\nCode location / feature / questions to clarify:",
			"card.refactor.tag": "TIDY FORTUNE",
			"card.refactor.title": "Refactor a focused area",
			"card.refactor.desc": "Improve structure within scope while preserving behavior",
			"card.refactor.prompt": "Refactor only the scope specified below. Establish existing behavior, callers and test coverage first, then improve duplication, responsibilities or readability. Preserve public interfaces, data formats and observable behavior, follow existing conventions and avoid unrelated modules, dependency upgrades or new features. Make the necessary structural changes and run targeted verification that supports behavioral equivalence. Add useful coverage where safeguards are missing. Explain the changes, the evidence that behavior is preserved and remaining risks. Ask specifically if the scope or intended improvement is missing. Do not create commits, push code or deploy.\n\nRefactoring scope / main problem / behavior to preserve:",
			"card.performance.tag": "SWIFT FORTUNE",
			"card.performance.title": "Find a performance bottleneck",
			"card.performance.desc": "Measure first, optimize from evidence and compare the results",
			"card.performance.prompt": "Investigate the slow behavior and workload below. Inspect the relevant call path, choose meaningful metrics and a repeatable measurement method, and record a baseline. Locate the main time or resource cost using evidence, implement a focused optimization for a confirmed bottleneck, then compare before and after under the same conditions and check for functional regressions. Avoid broad speculative changes and never invent timings, throughput or gains. If measurement is unavailable, explain the limitation and provide executable measurement steps. Ask specifically for any missing workload information that blocks progress. Do not create commits, push code or deploy.\n\nSlow behavior / reproduction workload / target metric / constraints:",
			"card.summary.tag": "WELL EARNED",
			"card.summary.title": "Summarize the changes",
			"card.summary.desc": "Read-only summary of behavior, verification and delivery risks",
			"card.summary.prompt": "Summarize the specified changes without modifying files. If no range is supplied, use the current working-tree diff and available verification records. Write for a colleague who did not take part in development: explain the problem, visible behavior changes, important implementation tradeoffs, verification results and remaining work or risks. Describe only changes that exist and checks known to have run; distinguish passed, failed, unrun and unverified checks. Do not invent outcomes or test results. Use the requested format, or provide delivery notes if none is specified. Do not modify files, create commits, send messages, push code or deploy.\n\nChange scope / purpose (delivery notes, PR description or status report) / additional verification records:",
			"card.filled": "Filled in",
			"card.edit": "Edit",
			"card.fillAria": "Fill the {title} prompt into the composer",
			"library.title": "Saved prompts",
			"library.hint": "Use a card or edit it to make it yours",
			"library.add": "Add prompt",
			"library.templates": "Dev templates",
			"templates.title": "Development prompt templates",
			"templates.hint": "Choose a task and read the full prompt. You can edit it next; only saving adds it to your library.",
			"templates.list": "Choose a development task",
			"templates.prompt": "Prompt content",
			"templates.use": "Use this template",
			"templates.close": "Close development templates",
			"library.sort": "Reorder",
			"library.prev": "Previous prompts",
			"library.next": "Next prompts",
			"library.empty": "No saved prompts yet. Add a card for a workflow you use often.",
			"editor.add": "Add prompt",
			"editor.edit": "Edit prompt",
			"editor.editAria": "Edit {title}",
			"editor.subtitle": "Save a useful workflow, then fill it with one click.",
			"editor.icon": "Icon",
			"editor.emoji": "Custom emoji",
			"editor.emojiHint": "Or enter one emoji, such as 👩‍💻",
			"editor.tag": "Label beside the icon",
			"editor.title": "Title",
			"editor.desc": "Description",
			"editor.prompt": "Prompt content",
			"editor.tone": "Icon background",
			"editor.red": "Vermilion",
			"editor.green": "Jade",
			"editor.gold": "Gold",
			"editor.teal": "Teal jade",
			"editor.blue": "Indigo",
			"editor.purple": "Rosewood",
			"editor.rose": "Rouge",
			"editor.brown": "Agarwood",
			"editor.position": "Display position",
			"editor.positionValue": "Position {position}",
			"editor.first": "First",
			"editor.last": "Last",
			"sort.title": "Reorder prompts",
			"sort.hint": "Put frequent prompts first, then save the order.",
			"sort.save": "Save order",
			"sort.top": "First",
			"sort.topAria": "Move {title} to first",
			"sort.upAria": "Move {title} up",
			"sort.downAria": "Move {title} down",
			"sort.close": "Close reorder dialog",
			"editor.preview": "Card preview",
			"editor.previewHint": "Cards fill the composer; you choose when to send.",
			"editor.save": "Save",
			"editor.cancel": "Cancel",
			"editor.close": "Close editor",
			"editor.delete": "Delete card",
			"editor.confirmDelete": "Confirm deletion",
			"editor.back": "Back to editing",
			"editor.deleteMessage": "Delete {title}? This removes it from your saved prompts.",
			"editor.error.icon": "Choose an icon or enter one emoji.",
			"editor.error.title": "Enter a title of up to 60 characters.",
			"editor.error.prompt": "Enter a prompt of up to 12000 characters.",
			"editor.error.invalid": "Check the card fields and try again.",
			"editor.error.storage": "Could not save: local storage is unavailable or full. Keep your text and try again.",
			"editor.error.limit": "You can save up to 128 cards. Remove an unused card first.",
			"editor.error.missing": "This card was deleted in another window. Close the editor and add it again.",
			"mascot.alt": "The God of Wealth in sunglasses, working at a laptop",
			"mascot.bubble1": "Good code,",
			"mascot.bubble2": "good KPI",
			"mascot.saved": "Saved this month",
			"mascot.amount": "¥68,888.00",
			"mascot.efficiency": "Efficiency +88.8%",
			"fortune.meter": "Fortune full",
			"settings.label": "Fortune settings",
			"fortune.meterAria": "Fortune level: full"
		};

		/** Plug-in stylesheet. Tokens first, artwork second. */
		const CSS = `
body {
  --cs-serif: "Songti SC", "STSong", "Noto Serif CJK SC", "Noto Serif SC", "Source Han Serif SC", serif;
  --cs-brush: "Kaiti SC", "STKaiti", "KaiTi", "Songti SC", "STSong", serif;
  --cs-red: #b3261e;
  --cs-red-deep: #8f1d16;
  --cs-red-bright: #cf4334;
  --cs-red-ink: #a51c15;
  --cs-gold: #d9a441;
  --cs-gold-soft: #f0d79b;
  --cs-gold-ink: #8a5a12;
  --cs-cream: #fff8ea;
  --cs-ink: #3b2414;
  --dsw-radius-xs: 5px;
  --dsw-radius-sm: 9px;
  --dsw-radius-md: 13px;
  --dsw-radius-lg: 18px;
  --dsw-radius-xl: 22px;
  --dsw-radius-panel: 30px;
}
body[data-ds-dark-theme] {
  --cs-red: #e05a4e;
  --cs-red-deep: #b3261e;
  --cs-red-bright: #f07364;
  --cs-red-ink: #f3c46a;
  --cs-gold: #e8b04b;
  --cs-gold-soft: #f3d594;
  --cs-gold-ink: #f0c36a;
  --cs-cream: #2a1a12;
  --cs-ink: #f7e8d2;
}
body ::selection {
  background: color-mix(in srgb, #d9a441 42%, transparent);
}
body:has([data-caishen-hero]) [data-conversation-region="composer"] [class*="_headline"] {
  display: none;
}
body:has([data-caishen-hero]) [data-conversation-region="composer"] [class*="_placeholder"] {
  font-size: 0;
}
body:has([data-caishen-hero]) [data-conversation-region="composer"] [class*="_placeholder"]::after {
  content: "财神在此，有求必应～输入你的需求吧！";
  font-size: 14px;
  line-height: 1.5;
  color: var(--dsw-alias-label-tertiary);
}
html[lang^="en"] body:has([data-caishen-hero]) [data-conversation-region="composer"] [class*="_placeholder"]::after {
  content: "The God of Wealth is here — tell me what you need…";
}
body:has([data-caishen-hero]) [class*="_composerHero"] {
  width: min(calc(100% - 28px), 1180px);
  --dsh-composer-card-max-width: min(calc(100% - 28px), 1160px);
  --cs-composer-mascot-size: clamp(88px, 10vw, 144px);
}
body:has([data-caishen-hero]) [data-conversation-region="composer"] [class*="_root"][class*="_hero"]:has(> [class*="_card"]) {
  padding-inline-end: calc(var(--cs-composer-mascot-size) + 20px);
}
body:has([data-caishen-hero]) [data-conversation-region="composer"] [class*="_card"] > [class*="_row"] {
  position: relative;
}
body [class*="_3WPZCG_root"] {
  position: relative;
  background: linear-gradient(180deg, #f7e8cf 0%, #f2dfbf 100%) !important;
  box-shadow: inset -1px 0 0 rgba(160, 110, 40, .12);
}
body [class*="_3WPZCG_root"]::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: .1;
  background: url("/theme-caishen/assets/decor/paper-texture.png") repeat;
  background-size: 512px 512px;
  mix-blend-mode: multiply;
}
body[data-ds-dark-theme] [class*="_3WPZCG_root"] {
  background: linear-gradient(180deg, #22150f 0%, #1b100b 100%) !important;
  box-shadow: inset -1px 0 0 rgba(232, 176, 75, .08);
}
body[data-ds-dark-theme] [class*="_3WPZCG_root"]::after {
  opacity: .06;
  mix-blend-mode: soft-light;
}
[class*="_root"][data-phase="hero"] {
  background:
    radial-gradient(90% 70% at 82% 0%, rgba(255, 226, 176, .55) 0%, rgba(255, 226, 176, 0) 60%),
    radial-gradient(70% 60% at 10% 100%, rgba(255, 241, 216, .7) 0%, rgba(255, 241, 216, 0) 60%),
    var(--dsw-alias-bg-base);
}
body[data-ds-dark-theme] [class*="_root"][data-phase="hero"] {
  background:
    radial-gradient(90% 70% at 82% 0%, rgba(232, 176, 75, .14) 0%, rgba(232, 176, 75, 0) 60%),
    radial-gradient(70% 60% at 10% 100%, rgba(179, 39, 30, .12) 0%, rgba(179, 39, 30, 0) 60%),
    var(--dsw-alias-bg-base);
}
.caishen-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
.caishen-hero {
  width: 100%;
  max-width: min(100%, 1160px);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 1.2vh, 12px);
  color: var(--dsw-alias-label-primary);
  font-family: var(--dsw-font-family);
}
.caishen-hero__banner {
  position: relative;
  overflow: hidden;
  min-height: clamp(300px, 40vh, 420px);
  padding: clamp(16px, 2.2vh, 22px) clamp(18px, 2.6vw, 30px);
  border: 0;
  border-radius: var(--dsw-radius-panel);
  background-color: #fff4de;
  background-image: url("/theme-caishen/assets/images/banner-light.webp");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;
  box-shadow: 0 30px 70px -42px rgba(120, 70, 20, .62), inset 0 1px 0 rgba(255, 255, 255, .55);
}
body[data-ds-dark-theme] .caishen-hero__banner {
  background-color: #24150e;
  background-image: url("/theme-caishen/assets/images/banner-dark.webp");
  box-shadow: 0 30px 70px -34px rgba(0, 0, 0, .8), inset 0 1px 0 rgba(255, 220, 160, .06);
}
.caishen-hero__grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, clamp(380px, 48vh, 540px));
  align-items: center;
  gap: 4px clamp(12px, 1.4vw, 18px);
  min-height: clamp(240px, 35vh, 376px);
}
.caishen-hero__copy {
  position: relative;
  min-width: 0;
  padding: 4px 0 2px;
}
.caishen-hero__copy::before {
  content: "";
  position: absolute;
  inset: -10px -14px;
  z-index: -1;
  background: linear-gradient(90deg, rgba(255, 250, 240, .62) 0%, rgba(255, 250, 240, .32) 58%, rgba(255, 250, 240, 0) 82%);
  filter: blur(1px);
  pointer-events: none;
}
body[data-ds-dark-theme] .caishen-hero__copy::before {
  background: linear-gradient(90deg, rgba(30, 18, 12, .66) 0%, rgba(30, 18, 12, .34) 58%, rgba(30, 18, 12, 0) 82%);
}
.caishen-hero__kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: .1em;
  color: var(--cs-red-ink);
}
body[data-ds-dark-theme] .caishen-hero__kicker {
  color: var(--cs-gold-ink);
}
.caishen-seal {
  display: inline-grid;
  place-items: center;
  width: 24px;
  height: 24px;
  flex: none;
  padding-top: 1px;
  border-radius: 7px;
  border: 1px solid #e8c98a;
  background: linear-gradient(145deg, #c53a2e, #9d1f17);
  color: #ffe9b8;
  font-family: var(--cs-serif);
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  box-shadow: 0 2px 6px rgba(140, 40, 20, .35), inset 0 0 0 1px rgba(255, 255, 255, .15);
}
.caishen-seal--lg {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  font-size: 17px;
}
.caishen-hero__title {
  display: inline-block;
  margin: 8px 0 0;
  font-family: var(--cs-brush);
  font-size: clamp(32px, min(3.6vw, 5.6vh), 54px);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: .015em;
  color: var(--cs-red-ink);
  text-shadow: 0 1px 0 #ffe3ad, 0 3px 14px rgba(150, 60, 20, .16);
}
.caishen-hero__title::after {
  content: "";
  display: block;
  width: 46%;
  height: 7px;
  margin-top: 9px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(217, 164, 65, 0) 0%, #d9a441 18%, #b3261e 62%, rgba(179, 38, 30, 0) 100%);
  opacity: .85;
}
body[data-ds-dark-theme] .caishen-hero__title {
  color: #f3c46a;
  text-shadow: 0 1px 0 rgba(90, 45, 15, .8), 0 3px 16px rgba(0, 0, 0, .35);
}
body[data-ds-dark-theme] .caishen-hero__title::after {
  background: linear-gradient(90deg, rgba(232, 176, 75, 0) 0%, #e8b04b 18%, #b3261e 62%, rgba(232, 176, 75, 0) 100%);
}
.caishen-hero__title-accent {
  display: inline-block;
  padding: 0 2px;
  color: var(--cs-red);
}
body[data-ds-dark-theme] .caishen-hero__title-accent {
  color: #ffd98a;
}
.caishen-hero__subtitle {
  margin: 12px 0 0;
  max-width: 36em;
  font-size: 15.5px;
  line-height: 1.75;
  color: var(--dsw-alias-label-secondary);
}
.caishen-hero__hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 14px 0 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--dsw-alias-label-tertiary);
}
.caishen-hero__art-wrap {
  position: relative;
  justify-self: end;
  align-self: end;
  width: min(100%, clamp(380px, 48vh, 540px));
  margin: -6px -10px clamp(-22px, -2vh, -8px) 0;
}
.caishen-hero__art {
  display: block;
  width: 100%;
  height: auto;
  filter: drop-shadow(0 22px 24px rgba(120, 70, 20, .2));
  user-select: none;
  pointer-events: none;
}
body[data-ds-dark-theme] .caishen-hero__art {
  filter: drop-shadow(0 22px 24px rgba(0, 0, 0, .5));
}
.caishen-hero__bubble {
  position: absolute;
  left: 0;
  top: 18%;
  width: 32%;
  max-width: 140px;
  height: auto;
  pointer-events: none;
  filter: drop-shadow(0 8px 14px rgba(120, 50, 20, .25));
}
body[data-ds-dark-theme] .caishen-hero__bubble {
  filter: drop-shadow(0 8px 14px rgba(0, 0, 0, .4));
}
.caishen-cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}
.caishen-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-height: 150px;
  padding: 15px 14px 13px;
  overflow: hidden;
  border-radius: 20px;
  border: 1px solid color-mix(in srgb, var(--cs-gold) 30%, var(--dsw-alias-border-l2));
  background: linear-gradient(180deg, color-mix(in srgb, var(--dsw-alias-bg-layer-1) 96%, transparent) 0%, color-mix(in srgb, var(--dsw-alias-bg-layer-2) 92%, transparent) 100%);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 14px 28px -24px rgba(120, 70, 20, .55), inset 0 1px 0 rgba(255, 255, 255, .75);
  transition: transform .15s ease, border-color .15s ease, box-shadow .15s ease, background .15s ease;
}
.caishen-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--cs-gold) 65%, transparent);
  box-shadow: 0 16px 30px -20px rgba(120, 70, 20, .55);
}
.caishen-card:focus-visible {
  outline: 2px solid var(--dsw-alias-state-business-primary);
  outline-offset: 2px;
}
body[data-ds-dark-theme] .caishen-card {
  background: linear-gradient(180deg, #2b1c14 0%, #241710 100%);
  box-shadow: 0 14px 28px -22px rgba(0, 0, 0, .85), inset 0 1px 0 rgba(255, 220, 160, .06);
}
.caishen-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  width: 100%;
}
.caishen-card__icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  flex: none;
  border-radius: 50%;
  background: linear-gradient(145deg, #c53a2e, #8f1d16);
  box-shadow: inset 0 0 0 1px rgba(255, 222, 160, .42), 0 6px 12px -8px rgba(120, 30, 20, .5);
}
.caishen-card[data-tone="green"] .caishen-card__icon {
  background: linear-gradient(145deg, #2f7d4f, #1f5c3a);
}
.caishen-card__icon img {
  display: block;
  width: 32px;
  height: 32px;
  object-fit: contain;
}
.caishen-card__tag {
  padding: 3px 8px;
  border-radius: 999px;
  background: linear-gradient(135deg, #f9e2ad, #edc979);
  color: #7a4a12;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .04em;
  white-space: nowrap;
}
body[data-ds-dark-theme] .caishen-card__tag {
  color: #3a2414;
}
.caishen-card[data-filled="true"] {
  border-color: color-mix(in srgb, var(--dsw-alias-state-success-primary) 55%, transparent);
}
.caishen-card[data-filled="true"] .caishen-card__tag {
  background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 18%, transparent);
  color: var(--dsw-alias-state-success-primary);
}
.caishen-card__title {
  margin-top: 10px;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
}
.caishen-card__desc {
  display: -webkit-box;
  margin-top: 4px;
  padding-right: 26px;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: var(--dsw-alias-label-tertiary);
  font-size: 12.5px;
  line-height: 1.55;
}
.caishen-card__arrow {
  position: absolute;
  right: 12px;
  bottom: 11px;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid color-mix(in srgb, var(--cs-gold) 50%, transparent);
  color: var(--cs-gold-ink);
  transition: background .15s ease, border-color .15s ease, color .15s ease, transform .15s ease;
}
.caishen-card:hover .caishen-card__arrow {
  transform: translateX(1px);
  border-color: var(--cs-red);
  background: var(--cs-red);
  color: #fff7e6;
}
.caishen-hero__footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 1px 0 2px;
  color: var(--dsw-alias-label-tertiary);
  font-size: 11px;
  letter-spacing: .04em;
}
.caishen-hero__footer::before,
.caishen-hero__footer::after {
  content: "";
  width: 34px;
  height: 1px;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--cs-gold) 60%, transparent));
}
.caishen-hero__footer::after {
  background: linear-gradient(90deg, color-mix(in srgb, var(--cs-gold) 60%, transparent), transparent);
}
.caishen-status {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 7px;
  height: 32px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-state-success-primary) 28%, transparent);
  background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 10%, transparent);
  color: var(--dsw-alias-state-success-primary);
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}
.caishen-status__dot {
  width: 7px;
  height: 7px;
  flex: none;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 0 3px color-mix(in srgb, currentColor 14%, transparent);
  animation: caishen-pulse 2.4s ease-in-out infinite;
}
@keyframes caishen-pulse {
  0%, 100% { opacity: .55; transform: scale(.9); }
  50% { opacity: 1; transform: scale(1.05); }
}
.caishen-merit {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px 0 8px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, #f0d79b 55%, transparent);
  background: linear-gradient(135deg, #c0392b 0%, #8f1d16 100%);
  color: #fff3dc;
  font: inherit;
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  box-shadow: 0 3px 10px -4px rgba(120, 30, 20, .55), inset 0 1px 0 rgba(255, 255, 255, .18);
  transition: transform .12s ease, filter .12s ease;
}
.caishen-merit:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
}
.caishen-merit:active {
  transform: translateY(0) scale(.97);
}
.caishen-merit:focus-visible {
  outline: 2px solid var(--dsw-alias-state-business-primary);
  outline-offset: 2px;
}
.caishen-merit__coin {
  display: inline-flex;
  color: #ffd98a;
  flex: none;
}
.caishen-merit__increment {
  position: relative;
  display: inline-block;
}
.caishen-merit__burst {
  position: absolute;
  left: 50%;
  top: 0;
  color: #ffd98a;
  font: inherit;
  line-height: inherit;
  pointer-events: none;
  text-shadow: 0 1px 4px rgba(0, 0, 0, .3);
  animation: caishen-merit-burst .9s ease-out forwards;
}
@keyframes caishen-merit-burst {
  0% { opacity: 1; transform: translate(-50%, 0) scale(1); }
  20% { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, -32px) scale(1.12); }
}
.caishen-header-brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  height: 30px;
}
.caishen-header-brand__identity {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1px;
  min-width: 0;
  line-height: 1.05;
}
.caishen-header-brand__name {
  color: var(--dsw-alias-label-primary);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: .03em;
  white-space: nowrap;
}
.caishen-header-brand__tag {
  color: var(--dsw-alias-brand-text);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: .02em;
  opacity: .8;
  white-space: nowrap;
}
.caishen-brand-name {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.caishen-brand-name__text {
  color: var(--dsw-alias-brand-text);
  font-family: var(--cs-serif);
  font-size: 19px;
  font-weight: 700;
  letter-spacing: .02em;
  white-space: nowrap;
}
.caishen-brand-name__tag {
  padding: 2px 6px;
  border-radius: 999px;
  background: linear-gradient(135deg, #f7d98d, #e2b45a);
  color: #7a4a12;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: .08em;
  white-space: nowrap;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .5);
}
body[data-ds-dark-theme] .caishen-brand-name__text {
  color: var(--cs-gold-soft);
}
.caishen-utilities {
  display: inline-flex;
  align-items: flex-start;
  gap: 8px;
}
.caishen-fortune-meter {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--cs-gold) 35%, transparent);
  background: color-mix(in srgb, var(--cs-gold) 8%, transparent);
  color: var(--cs-gold-ink);
  font-size: 10.5px;
  font-weight: 600;
  white-space: nowrap;
}
.caishen-hero-actions {
  display: inline-flex;
  align-items: flex-start;
  gap: 8px;
}
.caishen-settings-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.caishen-settings-trigger__icon {
  display: block;
  width: 18px;
  height: 18px;
  flex: none;
  object-fit: contain;
}
.caishen-settings-trigger__label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.caishen-logo-mark {
  display: block;
  flex: none;
  object-fit: contain;
}
body [class*="_3WPZCG_root"] [class*="_brandIdentity"]:has(.caishen-logo-mark) {
  height: 36px;
}
[data-slot="sidebar.workspaces"] [data-row-key^="workspace:"] > [class*="_folder"] {
  position: relative;
}
[data-slot="sidebar.workspaces"] [data-row-key^="workspace:"] > [class*="_folder"]::before {
  content: "";
  position: absolute;
  inset: -1px -3px;
  background: url("/theme-caishen/assets/images/gold-ingot.webp") center / contain no-repeat;
  pointer-events: none;
}
[data-slot="sidebar.workspaces"] [data-row-key^="workspace:"] > [class*="_folder"] > svg,
[data-conversation-region="composer"] button[class*="_workspace"] > svg[class*="_folder"] > * {
  visibility: hidden;
}
[data-conversation-region="composer"] button[class*="_workspace"] > svg[class*="_folder"] {
  width: 22px;
  height: 20px;
  background: url("/theme-caishen/assets/images/gold-ingot.webp") center / contain no-repeat;
}
.caishen-header-brand__logo {
  display: block;
  flex: none;
  width: 30px;
  height: 30px;
  object-fit: contain;
}
body [class*="_3WPZCG_root"] button[aria-haspopup="menu"][data-collapsed="false"] {
  height: auto;
  min-height: 44px;
  padding-top: 5px;
  padding-bottom: 5px;
}
body [class*="_3WPZCG_root"] button[aria-haspopup="menu"][data-collapsed="false"] [class*="_label"] {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  line-height: 1.15;
  white-space: normal;
}
body [class*="_3WPZCG_root"] button[aria-haspopup="menu"][data-collapsed="false"] [class*="_label"]::after {
  content: "搬砖赚钱中...";
  display: block;
  padding-left: 10px;
  color: var(--dsw-alias-label-tertiary);
  font-size: 10px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: .01em;
  background-image: radial-gradient(circle, #3fbf6f 0 3px, transparent 3.5px);
  background-size: 8px 8px;
  background-position: left 55%;
  background-repeat: no-repeat;
}
html[lang^="en"] body [class*="_3WPZCG_root"] button[aria-haspopup="menu"][data-collapsed="false"] [class*="_label"]::after {
  content: "Grinding for fortune...";
}
.caishen-merit--art {
  position: relative;
  display: inline-block;
  flex: none;
  width: 156px;
  height: 48px;
  margin-top: -4px;
  padding: 0;
  gap: 0;
  border: 0;
  background: none;
  box-shadow: none;
  overflow: visible;
}
.caishen-merit--art:hover {
  filter: brightness(1.06);
  transform: translateY(-1px);
}
.caishen-merit--art:active {
  transform: scale(.97);
}
.caishen-merit__art {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}
.caishen-merit--art .caishen-merit__increment {
  position: absolute;
  left: 54%;
  top: 43%;
  transform: translate(-50%, -50%);
  color: #fff3dc;
  font-family: var(--dsw-font-family);
  font-size: 21px;
  font-weight: 750;
  line-height: 1;
  letter-spacing: -.02em;
  text-shadow: 0 1px 2px rgba(95, 20, 8, .35);
  pointer-events: none;
}
body [class*="_3WPZCG_root"] button[aria-haspopup="menu"][data-collapsed="false"] [class*="_avatar"] {
  background-image: url("/theme-caishen/extra/images/caishen-avatar.webp");
  background-size: cover;
  background-position: center;
  border-radius: 50%;
  overflow: hidden;
}
body [class*="_3WPZCG_root"] button[aria-haspopup="menu"][data-collapsed="false"] [class*="_avatar"] > * {
  display: none;
}
.caishen-cloud-mascot-wrap {
  position: absolute;
  inset-inline-end: calc(-1 * var(--cs-composer-mascot-size) - 12px);
  bottom: -8px;
  z-index: 2;
  width: var(--cs-composer-mascot-size);
  aspect-ratio: 500 / 441;
  display: none;
  pointer-events: none;
}
.caishen-input-accessories {
  display: contents;
}
body:has([data-caishen-hero]) .caishen-cloud-mascot-wrap {
  display: block;
}
.caishen-cloud-mascot {
  display: block;
  width: 100%;
  height: auto;
  filter: drop-shadow(0 14px 18px rgba(120, 70, 20, .28));
}
@media (prefers-reduced-motion: reduce) {
  .caishen-status__dot { animation: none; }
  .caishen-card,
  .caishen-card__arrow,
  .caishen-merit { transition: none; }
  .caishen-merit__burst { animation: none; }
}
@media (max-width: 1000px) {
  .caishen-card { min-height: 126px; padding: 12px; }
  .caishen-card__desc { display: none; }
  .caishen-card__icon { width: 40px; height: 40px; }
  .caishen-card__icon img { width: 27px; height: 27px; }
  .caishen-card__title { font-size: 15px; }
}
@media (max-width: 800px) {
  .caishen-card__tag { display: none; }
}
@media (max-width: 620px) {
  .caishen-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .caishen-card { min-height: 136px; }
  .caishen-card__desc { display: -webkit-box; -webkit-line-clamp: 1; }
  .caishen-card__tag { display: inline-block; }
}
@media (max-width: 760px) {
  .caishen-hero__banner { min-height: 360px; padding: 18px; background-size: cover; }
  .caishen-hero__grid { grid-template-columns: 1fr; min-height: 0; }
  .caishen-hero__art-wrap { display: none; }
  .caishen-hero__title { font-size: 32px; }
  .caishen-hero__subtitle { font-size: 13px; }
  .caishen-header-brand__identity { display: none; }
  .caishen-status__text { display: none; }
  .caishen-status { width: 24px; padding: 0; justify-content: center; }
  .caishen-merit__label { display: none; }
}
@media (max-width: 520px) {
  .caishen-cards { gap: 8px; }
  .caishen-card { min-height: 132px; padding: 11px; }
  .caishen-card__tag { display: none; }
  .caishen-card__icon { width: 36px; height: 36px; border-radius: 12px; }
  .caishen-card__title { font-size: 14px; }
  .caishen-card__desc { font-size: 11px; }
}
@container (width < 560px) {
  .caishen-fortune-meter { display: none; }
}
@media (max-height: 900px) {
  .caishen-hero__footer { display: none; }
  .caishen-hero__hint { margin-top: 8px; }
  .caishen-card { min-height: clamp(124px, 17vh, 150px); }
}
@media (max-height: 780px) {
  .caishen-hero__hint { display: none; }
  .caishen-hero__subtitle { margin-top: 8px; font-size: 14px; }
  .caishen-card__desc { -webkit-line-clamp: 1; }
}
@media (max-height: 680px) {
  .caishen-hero__banner { min-height: 280px; }
  .caishen-hero__grid { min-height: 240px; }
  .caishen-hero__title { font-size: 34px; }
  .caishen-hero__subtitle { font-size: 13px; }
  .caishen-card { min-height: 112px; }
  .caishen-card__desc { display: none; }
  .caishen-card__tag { display: none; }
}
@media (max-height: 620px) {
  .caishen-hero__banner { min-height: 220px; background-size: cover; }
  .caishen-hero__grid { min-height: 190px; }
  .caishen-hero__art-wrap { width: min(100%, 300px); }
  .caishen-hero__title { font-size: 30px; }
  .caishen-hero__subtitle { font-size: 12px; }
  .caishen-hero__kicker { font-size: 11px; }
  .caishen-card { min-height: 96px; }
  .caishen-card__icon { width: 34px; height: 34px; }
  .caishen-card__icon img { width: 22px; height: 22px; }
  .caishen-card__title { font-size: 13px; }
}
/* Saved prompt library and native modal editor. */
.caishen-library { min-width: 0; display: flex; flex-direction: column; gap: 5px; }
.caishen-library__header { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; min-height: 28px; }
.caishen-library__heading { margin: 0; font-size: 12px; font-weight: 650; color: var(--cs-gold-ink); }
.caishen-library__hint { color: var(--dsw-alias-label-tertiary); font-size: 11px; }
.caishen-library__controls { margin-inline-start: auto; display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.caishen-library__nav, .caishen-library__add, .caishen-card__edit {
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid color-mix(in srgb, var(--cs-gold) 35%, transparent);
  background: color-mix(in srgb, var(--cs-gold) 6%, transparent); color: var(--cs-gold-ink);
  font: inherit; cursor: pointer; border-radius: 999px;
}
.caishen-library__nav { width: 26px; height: 26px; padding: 0; }
.caishen-library__nav[data-direction="prev"] svg { transform: rotate(180deg); }
.caishen-library__nav:disabled { opacity: .3; cursor: default; }
.caishen-library__add { height: 27px; padding: 0 10px; font-size: 11px; gap: 4px; white-space: nowrap; }
.caishen-library__add:disabled { opacity: .35; cursor: default; }
.caishen-library button:focus-visible, .caishen-editor button:focus-visible {
  outline: 2px solid var(--cs-gold); outline-offset: 3px;
}
.caishen-cards {
  display: flex; gap: 12px; overflow-x: auto; overflow-y: hidden;
  scroll-snap-type: x proximity; overscroll-behavior-x: contain;
  padding: 3px 2px 8px; margin: 0 -2px; scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--cs-gold) 55%, transparent) transparent;
}
.caishen-cards::-webkit-scrollbar { height: 5px; }
.caishen-cards::-webkit-scrollbar-thumb { background: color-mix(in srgb, var(--cs-gold) 55%, transparent); border-radius: 999px; }
.caishen-library .caishen-card { flex: 0 0 calc((100% - 36px) / 4); box-sizing: border-box; min-width: 190px; scroll-snap-align: start; }
.caishen-card__use { display: flex; flex-direction: column; align-items: flex-start; width: 100%; flex: 1; padding: 0; border: 0; color: inherit; background: none; font: inherit; text-align: left; cursor: pointer; min-width: 0; }
.caishen-card:has(.caishen-card__use:focus-visible) { outline: 2px solid var(--cs-gold); outline-offset: -3px; }
.caishen-card__use:focus-visible { outline: none !important; }
.caishen-card__title { width: 100%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.caishen-card__tag { max-width: calc(100% - 60px); overflow: hidden; text-overflow: ellipsis; }
.caishen-library .caishen-card__desc { display: -webkit-box; padding-inline-end: 40px; }
.caishen-card__emoji { font-size: 26px; line-height: 1; }
.caishen-card__edit { position: absolute; right: 10px; bottom: 10px; min-width: 36px; height: 24px; padding: 0 7px; font-size: 11px; }
.caishen-card__edit:hover, .caishen-library__add:hover { background: color-mix(in srgb, var(--cs-gold) 16%, transparent); }
.caishen-library__empty { padding: 26px 16px; border: 1px dashed color-mix(in srgb, var(--cs-gold) 35%, transparent); border-radius: 18px; text-align: center; color: var(--dsw-alias-label-tertiary); font-size: 13px; }
.caishen-card[data-tone="red"], .caishen-tone[data-tone="red"] { --cs-icon-fill: linear-gradient(145deg, #c53a2e, #8f1d16); }
.caishen-card[data-tone="green"], .caishen-tone[data-tone="green"] { --cs-icon-fill: linear-gradient(145deg, #2f7d4f, #1f5c3a); }
.caishen-card[data-tone="gold"], .caishen-tone[data-tone="gold"] { --cs-icon-fill: linear-gradient(145deg, #d5a340, #94601b); }
.caishen-card[data-tone="teal"], .caishen-tone[data-tone="teal"] { --cs-icon-fill: linear-gradient(145deg, #3b8c86, #225751); }
.caishen-card[data-tone="blue"], .caishen-tone[data-tone="blue"] { --cs-icon-fill: linear-gradient(145deg, #41617f, #253a55); }
.caishen-card[data-tone="purple"], .caishen-tone[data-tone="purple"] { --cs-icon-fill: linear-gradient(145deg, #755479, #44324d); }
.caishen-card[data-tone="rose"], .caishen-tone[data-tone="rose"] { --cs-icon-fill: linear-gradient(145deg, #b85d66, #773844); }
.caishen-card[data-tone="brown"], .caishen-tone[data-tone="brown"] { --cs-icon-fill: linear-gradient(145deg, #94704d, #563c26); }
.caishen-card[data-tone] .caishen-card__icon, .caishen-sort__row .caishen-card__icon { background: var(--cs-icon-fill); }
.caishen-editor {
  box-sizing: border-box; width: min(760px, calc(100vw - 32px)); max-height: min(90dvh, 880px);
  padding: 0; border: 1px solid color-mix(in srgb, var(--cs-gold) 45%, var(--dsw-alias-border-l2));
  border-radius: 22px; color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-layer-1);
  box-shadow: 0 28px 100px rgba(0,0,0,.38); overflow: hidden; font-family: var(--dsw-font-family); color-scheme: light;
}
body[data-ds-dark-theme] .caishen-editor { color-scheme: dark; }
.caishen-editor::backdrop { background: rgba(20, 12, 8, .55); backdrop-filter: blur(5px); }
.caishen-editor__form { display: flex; flex-direction: column; max-height: min(90dvh, 880px); margin: 0; }
.caishen-editor__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 22px 24px 16px; flex: none; }
.caishen-editor__heading { margin: 0; font-size: 20px; font-weight: 650; }
.caishen-editor__subtitle { margin: 6px 0 0; color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 1.5; }
.caishen-editor__close { flex: none; width: 28px; height: 28px; border: 0; background: none; color: var(--dsw-alias-label-secondary); font-size: 23px; cursor: pointer; }
.caishen-editor__body { display: grid; grid-template-columns: minmax(0, 1fr) 205px; gap: 22px; padding: 0 24px 20px; min-height: 0; overflow-y: auto; overflow-x: hidden; scrollbar-width: thin; }
.caishen-editor__fields { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.caishen-editor__field { display: flex; flex-direction: column; gap: 6px; min-width: 0; font-size: 12px; color: var(--dsw-alias-label-secondary); }
.caishen-editor__row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.caishen-editor input, .caishen-editor textarea, .caishen-editor select {
  box-sizing: border-box; width: 100%; border: 1px solid var(--dsw-alias-border-l2); border-radius: 9px;
  background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); font: inherit; font-size: 13px;
  padding: 9px 10px; outline: none;
}
.caishen-editor input:focus, .caishen-editor textarea:focus, .caishen-editor select:focus { border-color: var(--cs-gold); box-shadow: 0 0 0 2px color-mix(in srgb, var(--cs-gold) 14%, transparent); }
.caishen-editor [aria-invalid="true"] { border-color: var(--cs-red); }
.caishen-editor textarea { resize: vertical; min-height: 60px; line-height: 1.55; }
.caishen-editor textarea[name="prompt"] { min-height: 165px; font-family: var(--ds-font-family-code), monospace; }
.caishen-editor__icons { display: flex; flex-wrap: wrap; gap: 6px; }
.caishen-editor__icon { display: grid; place-items: center; width: 34px; height: 34px; padding: 0; border: 1px solid var(--dsw-alias-border-l2); border-radius: 9px; background: var(--dsw-alias-bg-layer-2); color: inherit; cursor: pointer; font-size: 20px; }
.caishen-editor__icon[aria-pressed="true"] { border-color: var(--cs-gold); background: color-mix(in srgb, var(--cs-gold) 16%, var(--dsw-alias-bg-layer-2)); box-shadow: inset 0 0 0 1px var(--cs-gold); }
.caishen-editor__icon img { width: 25px; height: 25px; }
.caishen-editor__tones { display: flex; gap: 9px; flex-wrap: wrap; }
.caishen-editor__tone { width: 29px; height: 29px; padding: 0; border: 2px solid transparent; border-radius: 50%; background: var(--cs-icon-fill); color: #fff8ea; font-size: 15px; line-height: 1; cursor: pointer; box-shadow: inset 0 0 0 1px rgba(255,236,190,.3); }
.caishen-editor__tone[aria-pressed="true"] { outline: 2px solid var(--cs-gold); outline-offset: 2px; }
.caishen-editor__tone-name { margin-inline-start: 8px; color: var(--cs-gold-ink); }
.caishen-templates { width: min(860px, calc(100vw - 32px)); }
.caishen-templates__layout { display: grid; grid-template-columns: minmax(210px, .8fr) minmax(0, 1.2fr); gap: 20px; padding: 0 24px 20px; min-height: 0; overflow-y: auto; scrollbar-width: thin; }
.caishen-templates__list { display: flex; flex-direction: column; gap: 7px; min-width: 0; }
.caishen-templates__option { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px; color: inherit; background: var(--dsw-alias-bg-layer-2); font: inherit; text-align: start; cursor: pointer; }
.caishen-templates__option[aria-pressed="true"] { border-color: var(--cs-gold); box-shadow: inset 0 0 0 1px var(--cs-gold); background: color-mix(in srgb, var(--cs-gold) 9%, var(--dsw-alias-bg-layer-2)); }
.caishen-templates__option .caishen-card__icon { flex: none; width: 36px; height: 36px; background: var(--cs-icon-fill); border-radius: 11px; }
.caishen-templates__option .caishen-card__emoji { font-size: 23px; }
.caishen-templates__text { min-width: 0; }
.caishen-templates__name { display: block; font-size: 13px; font-weight: 650; }
.caishen-templates__desc { display: block; margin-top: 4px; font-size: 11px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }
.caishen-templates__preview { min-width: 0; }
.caishen-templates__preview .caishen-card { min-height: 128px; }
.caishen-templates__preview .caishen-card__tag { display: block; }
.caishen-templates__preview .caishen-card__desc { display: -webkit-box; -webkit-line-clamp: 3; }
.caishen-templates__prompt-label { margin: 16px 0 8px; color: var(--dsw-alias-label-secondary); font-size: 12px; }
.caishen-templates__prompt { margin: 0; padding: 13px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px; background: var(--dsw-alias-bg-layer-2); font: inherit; font-size: 12px; line-height: 1.75; white-space: pre-wrap; overflow-wrap: anywhere; }
.caishen-sort { width: min(650px, calc(100vw - 32px)); }
.caishen-sort__list { list-style: none; margin: 0; padding: 0 24px 16px; overflow-y: auto; min-height: 0; scrollbar-width: thin; }
.caishen-sort__row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--dsw-alias-border-l2); }
.caishen-sort__row:last-child { border-bottom: 0; }
.caishen-sort__index { flex: none; width: 22px; color: var(--dsw-alias-label-tertiary); font-size: 12px; text-align: center; font-variant-numeric: tabular-nums; }
.caishen-sort__row .caishen-card__icon { width: 34px; height: 34px; flex: none; }
.caishen-sort__row .caishen-card__icon img { width: 23px; height: 23px; }
.caishen-sort__row .caishen-card__emoji { font-size: 21px; }
.caishen-sort__name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; }
.caishen-sort__actions { display: flex; gap: 5px; flex: none; }
.caishen-sort__move { display: grid; place-items: center; height: 28px; min-width: 28px; padding: 0 7px; font: inherit; font-size: 12px; border-radius: 7px; border: 1px solid var(--dsw-alias-border-l2); color: var(--cs-gold-ink); background: var(--dsw-alias-bg-layer-2); cursor: pointer; }
.caishen-sort__move:disabled { cursor: default; opacity: .3; }
.caishen-editor__preview { min-width: 0; width: auto; padding-top: 1px; }
.caishen-editor__preview-label { margin: 0 0 10px; font-size: 12px; color: var(--dsw-alias-label-tertiary); }
.caishen-editor__preview .caishen-card { min-height: 165px; box-sizing: border-box; }
.caishen-editor__preview .caishen-card__tag { display: block; }
.caishen-editor__preview .caishen-card__desc { display: -webkit-box; padding-right: 0; -webkit-line-clamp: 3; }
.caishen-editor__preview .caishen-card__use { cursor: default; opacity: 1; }
.caishen-editor__preview .caishen-card:hover { transform: none; }
.caishen-editor__preview-hint { font-size: 11px; line-height: 1.6; color: var(--dsw-alias-label-tertiary); }
.caishen-editor__footer { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; padding: 14px 24px 18px; border-top: 1px solid var(--dsw-alias-border-l2); flex: none; }
.caishen-editor__footer-spacer { flex: 1; }
.caishen-editor__button { padding: 8px 16px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 9px; color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-layer-2); font: inherit; font-size: 13px; cursor: pointer; }
.caishen-editor__button--primary { border-color: var(--cs-gold); color: #3b2414; background: linear-gradient(135deg, #f9e2ad, #edc979); font-weight: 650; }
.caishen-editor__button--danger { color: var(--dsw-alias-state-error-primary); }
.caishen-editor__error, .caishen-editor__delete-message { flex-basis: 100%; margin: 0 0 4px; color: var(--dsw-alias-state-error-primary); font-size: 12px; line-height: 1.5; }
@media (max-width: 800px) { .caishen-library__hint { display: none; } }
@media (max-width: 600px) {
  .caishen-templates__layout { grid-template-columns: 1fr; padding-inline: 18px; }
  .caishen-templates__list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .caishen-templates__option { gap: 7px; padding: 9px; }
  .caishen-templates__desc { display: none; }
  .caishen-editor__body { grid-template-columns: 1fr; }
  .caishen-editor__preview { display: none; }
  .caishen-editor__header, .caishen-editor__footer { padding-inline: 18px; }
  .caishen-editor__body { padding-inline: 18px; }
  .caishen-editor__row { grid-template-columns: 1fr; }
}
`;

		/** Replace `{name}` placeholders in a localized template. */
		function fmt(template, values) {
			return String(template).replace(/\{(\w+)\}/g, (match, key) => {
				return values[key] === undefined ? match : String(values[key]);
			});
		}

		/** Merge class names without pulling in a dependency. */
		function cx() {
			const out = [];
			for (let i = 0; i < arguments.length; i += 1) {
				if (arguments[i]) out.push(arguments[i]);
			}
			return out.join(" ");
		}

		// ---- artwork -------------------------------------------------
		/** A small gold coin with a square hole; used in brand marks. */
		function CoinGlyph({ size = 16 }) {
			return h(
				"svg",
				{
					width: size,
					height: size,
					viewBox: "0 0 24 24",
					fill: "none",
					"aria-hidden": "true",
					focusable: "false",
					style: { display: "block" }
				},
				h(
					"defs",
					null,
					h(
						"linearGradient",
						{ id: "caishen-coin-gold", x1: "0", y1: "0", x2: "0", y2: "1" },
						h("stop", { offset: "0", stopColor: "#fff0b8" }),
						h("stop", { offset: ".55", stopColor: "#ecc265" }),
						h("stop", { offset: "1", stopColor: "#b97b24" })
					)
				),
				h("circle", { cx: 12, cy: 11, r: 9, fill: "url(#caishen-coin-gold)", stroke: "#9a651f", strokeWidth: 1.2 }),
				h("rect", { x: 9, y: 8, width: 6, height: 6, rx: 1, fill: "currentColor" }),
				h("path", { d: "M12 20l-2.4 3h4.8Z", fill: "#b3261e" })
			);
		}

		/** Detailed gold ingot, shared by the brand and workspace rows. */
		function LogoMark({ size = 24, className }) {
			return h("img", {
				className: cx("caishen-logo-mark", className),
				src: asset("images/gold-ingot.webp"),
				width: size,
				height: size,
				alt: "",
				"aria-hidden": "true",
				draggable: "false"
			});
		}

		function SparkGlyph({ size = 12 }) {
			return h(
				"svg",
				{
					width: size,
					height: size,
					viewBox: "0 0 24 24",
					fill: "none",
					"aria-hidden": "true",
					focusable: "false",
					style: { display: "block", flex: "none" }
				},
				h("path", {
					d: "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z",
					fill: "currentColor"
				}),
				h("path", { d: "M18.5 15.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9Z", fill: "currentColor", opacity: .7 })
			);
		}

		function ArrowGlyph({ size = 12 }) {
			return h(
				"svg",
				{ width: size, height: size, viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", focusable: "false" },
				h("path", {
					d: "M5 12h13m-5-5 5 5-5 5",
					stroke: "currentColor",
					strokeWidth: 2,
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})
			);
		}

		function StatusChip({ t, compact }) {
			return h(
				"span",
				{ className: cx("caishen-status", compact && "caishen-status--compact"), title: t("status.online") },
				h("span", { className: "caishen-status__dot", "aria-hidden": "true" }),
				h("span", { className: "caishen-status__text" }, t("status.online"))
			);
		}

		function MeritButton({ t, merit, className, iconSize = 13 }) {
			const count = React.useSyncExternalStore(merit.subscribe, merit.get, merit.get);
			const [burst, setBurst] = React.useState(0);
			React.useEffect(() => {
				if (!burst) return undefined;
				const timer = setTimeout(() => setBurst(0), 900);
				return () => clearTimeout(timer);
			}, [burst]);
			const artwork = t("merit.label").includes("功德");
			const increment = h(
				"span",
				{ className: "caishen-merit__increment", "aria-hidden": "true" },
				t("merit.burst"),
				burst ? h("span", { key: burst, className: "caishen-merit__burst" }, t("merit.burst")) : null
			);
			return h(
				"button",
				{
					type: "button",
					className: cx("caishen-merit", artwork && "caishen-merit--art", className),
					onClick: () => {
						merit.add(1);
						setBurst((value) => value + 1);
					},
					"aria-label": fmt(t("merit.count"), { count })
				},
				artwork
					? h("img", {
							className: "caishen-merit__art",
							src: extra("images/merit-badge.webp"),
							alt: "",
							"aria-hidden": "true",
							draggable: "false"
						})
					: h("span", { className: "caishen-merit__coin", "aria-hidden": "true" }, h(CoinGlyph, { size: iconSize })),
				artwork
					? increment
					: h("span", { className: "caishen-merit__label" }, t("merit.label").replace(/\s*\+1$/, ""), " ", increment)
			);
		}

		function CloudMascot() {
			return h(
				"span",
				{ className: "caishen-cloud-mascot-wrap", "aria-hidden": "true" },
				h("img", {
					className: "caishen-cloud-mascot",
					src: extra("images/caishen-cloud-mascot.webp"),
					alt: "",
					draggable: "false"
				})
			);
		}

		function HeaderBrand({ t }) {
			return h(
				"span",
				{ className: "caishen-header-brand", title: t("brand.aria") },
				h("img", {
					className: "caishen-header-brand__logo",
					src: extra("images/logo-shun.webp"),
					alt: "",
					"aria-hidden": "true",
					draggable: "false"
				}),
				h(
					"span",
					{ className: "caishen-header-brand__identity" },
					h("span", { className: "caishen-header-brand__name" }, t("header.title")),
					h("span", { className: "caishen-header-brand__tag" }, t("header.subtitle"))
				)
			);
		}

		function BrandName({ t }) {
			return h(
				"span",
				{ className: "caishen-brand-name", title: t("brand.aria") },
				h("span", { className: "caishen-brand-name__text" }, t("brand.name")),
				h("span", { className: "caishen-brand-name__tag" }, t("brand.tag"))
			);
		}

		function FortuneMeter({ t }) {
			return h(
				"span",
				{ className: "caishen-fortune-meter", title: t("fortune.meterAria") },
				h(SparkGlyph, { size: 12 }),
				h("span", null, t("fortune.meter"))
			);
		}

		function SettingsTrigger({ t, wide }) {
			return h(
				"span",
				{ className: "caishen-settings-trigger" },
				h("img", {
					className: "caishen-settings-trigger__icon",
					src: asset("decor/decor-coin.svg"),
					alt: "",
					"aria-hidden": "true",
					draggable: "false"
				}),
				h(
					"span",
					{ className: cx("caishen-settings-trigger__label", !wide && "caishen-sr-only") },
					t("settings.label")
				)
			);
		}

		/** Localized defaults stay live until the user explicitly saves an override. */
		function getDefaultPromptCards(t) {
			return [
				["debug", "🐞", "red"],
				["feature", "🛠️", "gold"],
				["review", "🔍", "blue"],
				["tests", "🧪", "green"],
				["explain", "📖", "teal"],
				["refactor", "🧹", "purple"],
				["performance", "⚡", "rose"],
				["summary", "📝", "brown"]
			].map(([id, icon, tone]) => ({
				id,
				icon,
				tone,
				tag: t("card." + id + ".tag"),
				title: t("card." + id + ".title"),
				desc: t("card." + id + ".desc"),
				prompt: t("card." + id + ".prompt")
			}));
		}

		/** Restrict custom artwork to one emoji; arbitrary image URLs never enter the UI. */
		function isPromptCardIcon(value) {
			if (typeof value !== "string" || value.length > 64) return false;
			if (["cost", "debt", "report", "merge"].includes(value)) return true;
			return /^(?:\p{Regional_Indicator}{2}|[0-9#*]\uFE0F?\u20E3|\p{Extended_Pictographic}\uFE0F?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}\uFE0F?(?:\p{Emoji_Modifier})?)*)$/u.test(value);
		}

		/** Field names are stable validation codes, independent of the active locale. */
		function validateCard(value) {
			if (value === null || typeof value !== "object" || Array.isArray(value)) {
				return { ok: false, error: "object" };
			}
			try {
				const id = typeof value.id === "string" ? value.id.trim() : "";
				if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(id)) return { ok: false, error: "id" };
				const icon = typeof value.icon === "string" ? value.icon.trim() : "";
				if (!isPromptCardIcon(icon)) return { ok: false, error: "icon" };
				const tone = typeof value.tone === "string" ? value.tone.trim() : "";
				if (!["red", "green", "gold", "teal", "blue", "purple", "rose", "brown"].includes(tone)) return { ok: false, error: "tone" };
				const text = {};
				for (const [field, max] of [["title", 60], ["tag", 24], ["desc", 180], ["prompt", 12000]]) {
					const raw = value[field];
					if (typeof raw !== "string") return { ok: false, error: field };
					const normalized = field === "prompt" ? raw : raw.trim();
					if (normalized.length > max || ((field === "title" || field === "prompt") && !normalized.trim())) {
						return { ok: false, error: field };
					}
					if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(normalized)) return { ok: false, error: field };
					text[field] = normalized;
				}
				return { ok: true, card: { id, icon, tone, ...text } };
			} catch (_error) {
				return { ok: false, error: "object" };
			}
		}

		function normalizePromptCards(value) {
			if (!Array.isArray(value) || value.length > 128) return { ok: false, error: "cards" };
			const cards = [];
			const ids = new Set();
			for (const candidate of value) {
				const result = validateCard(candidate);
				if (!result.ok) return result;
				if (ids.has(result.card.id)) return { ok: false, error: "duplicate-id" };
				ids.add(result.card.id);
				cards.push(result.card);
			}
			return { ok: true, cards };
		}

		/** Place a new or edited card without changing the caller's array or records. */
		function placePromptCard(cards, card, position) {
			const next = cards.filter((existing) => existing.id !== card.id);
			const index = Number.isFinite(position) ? Math.max(0, Math.min(next.length, Math.trunc(position))) : next.length;
			next.splice(index, 0, card);
			return next;
		}

		/** Reorder an existing card only; callers decide when to persist the result. */
		function movePromptCard(cards, id, position) {
			const card = cards.find((existing) => existing.id === id);
			return card ? placePromptCard(cards, card, position) : cards.slice();
		}

		/** One atomic storage write per edit; failures never change the live snapshot. */
		function createPromptCardStore() {
			const key = LAYER + ":prompt-cards:v1";
			let snapshot = null;
			let serialized = null;
			let listening = false;
			const listeners = new Set();

			function publish(cards, json) {
				if (serialized === json) return;
				snapshot = cards === null ? null : Object.freeze(cards.map((card) => Object.freeze(card)));
				serialized = json;
				for (const listener of listeners) {
					try {
						listener();
					} catch (_error) {
						// A failed subscriber must not prevent the other views updating.
					}
				}
			}

			function readStored() {
				let raw;
				try {
					raw = window.localStorage.getItem(key);
				} catch (_error) {
					return;
				}
				if (raw === null) {
					publish(null, null);
					return;
				}
				try {
					const result = normalizePromptCards(JSON.parse(raw));
					if (result.ok) {
						publish(result.cards, JSON.stringify(result.cards));
						return;
					}
				} catch (_error) {
					// Keep the original corrupt value intact for recovery or inspection.
				}
				publish(null, null);
			}

			function onStorage(event) {
				if (event.key !== key && event.key !== null) return;
				try {
					if (event.storageArea && event.storageArea !== window.localStorage) return;
				} catch (_error) {
					return;
				}
				readStored();
			}

			readStored();
			return {
				get: () => snapshot,
				subscribe: (listener) => {
					const subscription = () => listener();
					listeners.add(subscription);
					if (!listening && typeof window.addEventListener === "function") {
						window.addEventListener("storage", onStorage);
						listening = true;
					}
					readStored();
					return () => {
						listeners.delete(subscription);
						if (listeners.size === 0 && listening) {
							window.removeEventListener("storage", onStorage);
							listening = false;
						}
					};
				},
				save: (cards) => {
					const result = normalizePromptCards(cards);
					if (!result.ok) return { ok: false, error: "invalid" };
					const json = JSON.stringify(result.cards);
					try {
						window.localStorage.setItem(key, json);
					} catch (_error) {
						return { ok: false, error: "storage" };
					}
					publish(result.cards, json);
					return { ok: true };
				}
			};
		}

		const CARD_ICONS = {
			cost: asset("icons/card-cost.svg"), debt: asset("icons/card-debt.svg"),
			report: asset("icons/card-report.svg"), merge: asset("icons/card-merge.svg")
		};
		const CARD_TONES = ["red", "green", "gold", "teal", "blue", "purple", "rose", "brown"];

		function CardIcon({ icon }) {
			return CARD_ICONS[icon]
				? h("img", { src: CARD_ICONS[icon], alt: "", loading: "lazy", draggable: "false" })
				: h("span", { className: "caishen-card__emoji" }, isPromptCardIcon(icon) ? icon : "✦");
		}

		function Card({ card, t, filled, onFill, onEdit, preview = false }) {
			return h(
				"article",
				{
					className: "caishen-card",
					"data-card-id": card.id,
					role: preview ? undefined : "listitem",
					"data-filled": filled ? "true" : "false",
					"data-tone": card.tone
				},
				h(
					"button",
					{ type: "button", className: "caishen-card__use", onClick: onFill, disabled: preview,
						"aria-label": fmt(t("card.fillAria"), { title: card.title }) },
					h(
						"span",
						{ className: "caishen-card__top" },
						h("span", { className: "caishen-card__icon", "aria-hidden": "true" }, h(CardIcon, { icon: card.icon })),
						card.tag || filled ? h("span", { className: "caishen-card__tag", title: card.tag }, filled ? t("card.filled") : card.tag) : null
					),
					h("span", { className: "caishen-card__title", title: card.title }, card.title || t("editor.title")),
					h("span", { className: "caishen-card__desc" }, card.desc)
				),
				preview ? null : h("button", { type: "button", className: "caishen-card__edit", onClick: onEdit,
					"aria-label": fmt(t("editor.editAria"), { title: card.title }) }, t("card.edit"))
			);
		}

		function PromptEditor({ initial, initialPosition, total, isNew, t, onSave, onDelete, onClose }) {
			const [draft, setDraft] = React.useState(() => ({ ...initial }));
			const [position, setPosition] = React.useState(initialPosition);
			const [error, setError] = React.useState("");
			const [confirmDelete, setConfirmDelete] = React.useState(false);
			const dialog = React.useRef(null);
			const cancelButton = React.useRef(null);
			React.useEffect(() => { if (confirmDelete) cancelButton.current?.focus(); }, [confirmDelete]);
			React.useEffect(() => {
				const previous = document.activeElement;
				const element = dialog.current;
				element.showModal();
				element.querySelector('[name="title"]').focus();
				return () => {
					if (element.open) element.close();
					if (previous && previous.isConnected) previous.focus({ preventScroll: true });
				};
			}, []);
			const update = (name, value) => { setDraft((prev) => ({ ...prev, [name]: value })); setError(""); };
			function save(event) {
				event.preventDefault();
				if (confirmDelete) return;
				const validation = validateCard(draft);
				if (!validation.ok) {
					setError(validation.error);
					dialog.current.querySelector('[name="' + validation.error + '"]')?.focus();
					return;
				}
				const result = onSave(validation.card, position);
				if (!result.ok) setError(result.error);
			}
			function remove() {
				const result = onDelete(draft.id);
				if (!result.ok) setError(result.error);
			}
			function field(name, maxLength, rows) {
				const props = { name, value: draft[name], maxLength, onChange: (event) => update(name, event.target.value),
					"aria-invalid": error === name ? "true" : undefined, required: name === "title" || name === "prompt" };
				return h("label", { className: "caishen-editor__field" },
					h("span", null, t("editor." + name)),
					rows ? h("textarea", { ...props, rows }) : h("input", { ...props, type: "text" }));
			}
			const icons = ["cost", "debt", "report", "merge", "🐞", "🛠️", "🔍", "🧪", "📖", "🧹", "⚡", "📝", "🚀", "📚", "💡"];
			const messageKey = ["icon", "title", "prompt", "storage", "limit", "missing"].includes(error) ? error : "invalid";
			return h("dialog", { ref: dialog, className: "caishen-editor", "aria-labelledby": "caishen-editor-title",
				onCancel: (event) => { event.preventDefault(); onClose(); },
				onClick: (event) => { if (event.target === dialog.current) {
					const rect = dialog.current.getBoundingClientRect();
					if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
				} } },
				h("form", { className: "caishen-editor__form", onSubmit: save },
					h("header", { className: "caishen-editor__header" },
						h("div", null, h("h3", { id: "caishen-editor-title", className: "caishen-editor__heading" }, t(isNew ? "editor.add" : "editor.edit")),
							h("p", { className: "caishen-editor__subtitle" }, t("editor.subtitle"))),
						h("button", { type: "button", className: "caishen-editor__close", onClick: onClose, "aria-label": t("editor.close") }, "×")),
					h("div", { className: "caishen-editor__body" },
						h("div", { className: "caishen-editor__fields" },
							h("div", { className: "caishen-editor__field" }, h("span", null, t("editor.icon")),
								h("div", { className: "caishen-editor__icons", role: "group", "aria-label": t("editor.icon") }, icons.map((icon) =>
									h("button", { key: icon, type: "button", className: "caishen-editor__icon", "aria-pressed": draft.icon === icon,
										"aria-label": CARD_ICONS[icon] ? t("card." + icon + ".title") : icon, onClick: () => update("icon", icon) }, h(CardIcon, { icon })))),
								h("label", { className: "caishen-editor__field" }, h("span", null, t("editor.emoji")),
									h("input", { name: "icon", type: "text", maxLength: 64, value: CARD_ICONS[draft.icon] ? "" : draft.icon,
										placeholder: t("editor.emojiHint"), "aria-invalid": error === "icon" ? "true" : undefined,
										onChange: (event) => update("icon", event.target.value) }))),
							h("div", { className: "caishen-editor__row" }, field("title", 60), field("tag", 24)),
							field("desc", 180, 2),
							h("div", { className: "caishen-editor__field" },
								h("span", null, t("editor.tone"), h("span", { className: "caishen-editor__tone-name" }, t("editor." + draft.tone))),
								h("div", { className: "caishen-editor__tones", role: "group", "aria-label": t("editor.tone") }, CARD_TONES.map((tone) =>
									h("button", { key: tone, type: "button", className: "caishen-tone caishen-editor__tone", "data-tone": tone,
										"aria-label": t("editor." + tone), title: t("editor." + tone), "aria-pressed": draft.tone === tone,
										onClick: () => update("tone", tone) }, draft.tone === tone ? "✓" : null)))),
							h("label", { className: "caishen-editor__field" }, h("span", null, t("editor.position")),
								h("select", { name: "position", value: position, onChange: (event) => setPosition(Number(event.target.value)) },
									Array.from({ length: total }, (_, index) => h("option", { key: index, value: index },
										fmt(t("editor.positionValue"), { position: index + 1 }) + (index === 0 ? " · " + t("editor.first") : index === total - 1 ? " · " + t("editor.last") : ""))))),
							field("prompt", 12000, 7)),
						h("aside", { className: "caishen-editor__preview" }, h("p", { className: "caishen-editor__preview-label" }, t("editor.preview")),
							h(Card, { card: draft, t, preview: true }), h("p", { className: "caishen-editor__preview-hint" }, t("editor.previewHint")))),
					h("footer", { className: "caishen-editor__footer" },
						confirmDelete ? h("p", { className: "caishen-editor__delete-message" }, fmt(t("editor.deleteMessage"), { title: initial.title })) : null,
						error ? h("p", { className: "caishen-editor__error", role: "alert" }, t("editor.error." + messageKey)) : null,
						!isNew && !confirmDelete ? h("button", { type: "button", className: "caishen-editor__button caishen-editor__button--danger",
							onClick: () => { setConfirmDelete(true); setError(""); } }, t("editor.delete")) : null,
						h("span", { className: "caishen-editor__footer-spacer" }),
						h("button", { type: "button", ref: cancelButton, className: "caishen-editor__button", onClick: confirmDelete ? () => setConfirmDelete(false) : onClose }, t(confirmDelete ? "editor.back" : "editor.cancel")),
						confirmDelete
							? h("button", { type: "button", className: "caishen-editor__button caishen-editor__button--danger", onClick: remove }, t("editor.confirmDelete"))
							: h("button", { type: "submit", className: "caishen-editor__button caishen-editor__button--primary" }, t("editor.save")))));
		}

		function PromptTemplates({ templates, t, onUse, onClose }) {
			const [selectedId, setSelectedId] = React.useState(templates[0].id);
			const selected = templates.find((card) => card.id === selectedId) || templates[0];
			const dialog = React.useRef(null);
			React.useEffect(() => {
				const previous = document.activeElement;
				const element = dialog.current;
				element.showModal();
				element.querySelector('[aria-pressed="true"]')?.focus();
				return () => {
					if (element.open) element.close();
					if (previous?.isConnected) previous.focus({ preventScroll: true });
				};
			}, []);
			return h("dialog", { ref: dialog, className: "caishen-editor caishen-templates", "aria-labelledby": "caishen-templates-title",
				onCancel: (event) => { event.preventDefault(); onClose(); },
				onClick: (event) => { if (event.target === dialog.current) {
					const rect = dialog.current.getBoundingClientRect();
					if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
				} } }, h("div", { className: "caishen-editor__form" },
				h("header", { className: "caishen-editor__header" },
					h("div", null, h("h3", { id: "caishen-templates-title", className: "caishen-editor__heading" }, t("templates.title")),
						h("p", { className: "caishen-editor__subtitle" }, t("templates.hint"))),
					h("button", { type: "button", className: "caishen-editor__close", onClick: onClose, "aria-label": t("templates.close") }, "×")),
				h("div", { className: "caishen-templates__layout" },
					h("div", { className: "caishen-templates__list", role: "group", "aria-label": t("templates.list") }, templates.map((card) =>
						h("button", { key: card.id, type: "button", className: "caishen-tone caishen-templates__option", "data-tone": card.tone,
							"aria-pressed": selected.id === card.id, onClick: () => setSelectedId(card.id) },
							h("span", { className: "caishen-card__icon", "aria-hidden": "true" }, h(CardIcon, { icon: card.icon })),
							h("span", { className: "caishen-templates__text" }, h("span", { className: "caishen-templates__name" }, card.title),
								h("span", { className: "caishen-templates__desc" }, card.desc))))),
					h("div", { className: "caishen-templates__preview" },
						h(Card, { card: selected, t, preview: true }),
						h("h4", { className: "caishen-templates__prompt-label" }, t("templates.prompt")),
						h("p", { className: "caishen-templates__prompt" }, selected.prompt))),
				h("footer", { className: "caishen-editor__footer" },
					h("span", { className: "caishen-editor__footer-spacer" }),
					h("button", { type: "button", className: "caishen-editor__button", onClick: onClose }, t("editor.cancel")),
					h("button", { type: "button", className: "caishen-editor__button caishen-editor__button--primary", onClick: () => onUse(selected) }, t("templates.use")))));
		}

		function PromptSorter({ cards, t, onSave, onClose }) {
			const [order, setOrder] = React.useState(() => cards.slice());
			const [error, setError] = React.useState("");
			const dialog = React.useRef(null);
			React.useEffect(() => {
				const previous = document.activeElement;
				const element = dialog.current;
				element.showModal();
				return () => {
					if (element.open) element.close();
					if (previous?.isConnected) previous.focus({ preventScroll: true });
				};
			}, []);
			function move(event, id, position) {
				const button = event.currentTarget;
				const row = button.closest("li");
				setOrder((current) => movePromptCard(current, id, position));
				setError("");
				window.requestAnimationFrame(() => {
					const focusTarget = button.isConnected && !button.disabled ? button : row?.querySelector("button:not(:disabled)");
					focusTarget?.focus({ preventScroll: true });
					row?.scrollIntoView({ block: "nearest" });
				});
			}
			function save(event) {
				event.preventDefault();
				const result = onSave(order);
				if (!result.ok) setError(result.error);
			}
			return h("dialog", { ref: dialog, className: "caishen-editor caishen-sort", "aria-labelledby": "caishen-sort-title",
				onCancel: (event) => { event.preventDefault(); onClose(); },
				onClick: (event) => { if (event.target === dialog.current) {
					const rect = dialog.current.getBoundingClientRect();
					if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
				} } }, h("form", { className: "caishen-editor__form", onSubmit: save },
				h("header", { className: "caishen-editor__header" },
					h("div", null, h("h3", { id: "caishen-sort-title", className: "caishen-editor__heading" }, t("sort.title")),
						h("p", { className: "caishen-editor__subtitle" }, t("sort.hint"))),
					h("button", { type: "button", className: "caishen-editor__close", onClick: onClose, "aria-label": t("sort.close") }, "×")),
				h("ol", { className: "caishen-sort__list" }, order.map((card, index) =>
					h("li", { key: card.id, className: "caishen-tone caishen-sort__row", "data-tone": card.tone },
						h("span", { className: "caishen-sort__index", "aria-hidden": "true" }, index + 1),
						h("span", { className: "caishen-card__icon", "aria-hidden": "true" }, h(CardIcon, { icon: card.icon })),
						h("span", { className: "caishen-sort__name", title: card.title }, card.title),
						h("div", { className: "caishen-sort__actions" },
							h("button", { type: "button", className: "caishen-sort__move", disabled: index === 0,
								"aria-label": fmt(t("sort.topAria"), { title: card.title }), onClick: (event) => move(event, card.id, 0) }, t("sort.top")),
							h("button", { type: "button", className: "caishen-sort__move", disabled: index === 0,
								"aria-label": fmt(t("sort.upAria"), { title: card.title }), onClick: (event) => move(event, card.id, index - 1) }, "↑"),
							h("button", { type: "button", className: "caishen-sort__move", disabled: index === order.length - 1,
								"aria-label": fmt(t("sort.downAria"), { title: card.title }), onClick: (event) => move(event, card.id, index + 1) }, "↓"))))),
				h("footer", { className: "caishen-editor__footer" },
					error ? h("p", { className: "caishen-editor__error", role: "alert" }, t("editor.error." + (error === "storage" ? "storage" : "invalid"))) : null,
					h("span", { className: "caishen-editor__footer-spacer" }),
					h("button", { type: "button", className: "caishen-editor__button", onClick: onClose }, t("editor.cancel")),
					h("button", { type: "submit", className: "caishen-editor__button caishen-editor__button--primary" }, t("sort.save")))));
		}

		function PromptLibrary({ t, cardStore, filled, onFill }) {
			const stored = React.useSyncExternalStore(cardStore.subscribe, cardStore.get, cardStore.get);
			const cards = stored === null ? getDefaultPromptCards(t) : stored;
			const [editor, setEditor] = React.useState(null);
			const [sorting, setSorting] = React.useState(false);
			const [templatesOpen, setTemplatesOpen] = React.useState(false);
			const rail = React.useRef(null);
			const addButton = React.useRef(null);
			const [edges, setEdges] = React.useState({ prev: false, next: false });
			React.useEffect(() => {
				const element = rail.current;
				if (!element) return undefined;
				function measure() {
					const prev = element.scrollLeft > 2;
					const next = element.scrollWidth - element.clientWidth - element.scrollLeft > 2;
					setEdges((old) => old.prev === prev && old.next === next ? old : { prev, next });
				}
				measure();
				element.addEventListener("scroll", measure, { passive: true });
				window.addEventListener("resize", measure);
				const observer = typeof ResizeObserver === "function" ? new ResizeObserver(measure) : null;
				observer?.observe(element);
				return () => { element.removeEventListener("scroll", measure); window.removeEventListener("resize", measure); observer?.disconnect(); };
			}, [stored, t]);
			function move(direction) {
				const element = rail.current;
				const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
				element?.scrollBy({ left: direction * (element.clientWidth + 12), behavior: reduced ? "auto" : "smooth" });
			}
			function add(template) {
				const id = "p-" + (window.crypto?.randomUUID?.() || Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10));
				const card = template || { icon: "🚀", tone: "red", tag: "", title: "", desc: "", prompt: "" };
				setTemplatesOpen(false);
				setEditor({ isNew: true, position: 0, card: { ...card, id } });
			}
			function save(card, position) {
				const latest = cardStore.get() ?? getDefaultPromptCards(t);
				if (editor.isNew && latest.length >= 128) return { ok: false, error: "limit" };
				if (!editor.isNew && !latest.some((item) => item.id === card.id)) return { ok: false, error: "missing" };
				const result = cardStore.save(placePromptCard(latest, card, position));
				if (result.ok) {
					setEditor(null);
					window.requestAnimationFrame(() => rail.current?.querySelector('[data-card-id="' + card.id + '"]')?.scrollIntoView({ block: "nearest", inline: "nearest" }));
				}
				return result;
			}
			function saveOrder(order) {
				const latest = cardStore.get() ?? getDefaultPromptCards(t);
				const byId = new Map(latest.map((card) => [card.id, card]));
				const ordered = order.map((card) => byId.get(card.id)).filter(Boolean);
				const orderedIds = new Set(ordered.map((card) => card.id));
				const result = cardStore.save([...ordered, ...latest.filter((card) => !orderedIds.has(card.id))]);
				if (result.ok) { setSorting(false); window.requestAnimationFrame(() => rail.current?.scrollTo({ left: 0, behavior: "auto" })); }
				return result;
			}
			function remove(id) {
				const latest = cardStore.get() ?? getDefaultPromptCards(t);
				const result = cardStore.save(latest.filter((item) => item.id !== id));
				if (result.ok) { setEditor(null); window.requestAnimationFrame(() => addButton.current?.focus({ preventScroll: true })); }
				return result;
			}
			return h("section", { className: "caishen-library", "aria-labelledby": "caishen-library-title" },
				h("div", { className: "caishen-library__header" },
					h("h3", { id: "caishen-library-title", className: "caishen-library__heading" }, t("library.title")),
					h("span", { className: "caishen-library__hint" }, t("library.hint")),
					h("div", { className: "caishen-library__controls" },
						h("button", { type: "button", className: "caishen-library__add", disabled: cards.length >= 128,
							onClick: () => setTemplatesOpen(true) }, t("library.templates")),
						h("button", { type: "button", className: "caishen-library__add", disabled: cards.length < 2,
							onClick: () => setSorting(true) }, t("library.sort")),
						h("button", { type: "button", className: "caishen-library__nav", "data-direction": "prev", disabled: !edges.prev,
							"aria-label": t("library.prev"), onClick: () => move(-1) }, h(ArrowGlyph, { size: 12 })),
						h("button", { type: "button", className: "caishen-library__nav", "data-direction": "next", disabled: !edges.next,
							"aria-label": t("library.next"), onClick: () => move(1) }, h(ArrowGlyph, { size: 12 })),
						h("button", { type: "button", ref: addButton, className: "caishen-library__add", disabled: cards.length >= 128,
							onClick: () => add() }, "+ ", t("library.add")))),
				h("div", { className: "caishen-cards", ref: rail, role: "list", tabIndex: 0, "aria-label": t("library.title"),
					onKeyDown: (event) => { if (event.target === event.currentTarget && ["ArrowLeft", "ArrowRight"].includes(event.key)) {
						event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1);
					} } }, cards.map((card, index) => h(Card, { key: card.id, card, t, filled: filled === card.id, onFill: () => onFill(card),
						onEdit: () => setEditor({ isNew: false, position: index, card }) }))),
				cards.length === 0 ? h("div", { className: "caishen-library__empty" }, t("library.empty")) : null,
				editor ? h(PromptEditor, { key: editor.card.id, initial: editor.card, initialPosition: editor.position,
					total: cards.length + (editor.isNew ? 1 : 0), isNew: editor.isNew, t, onSave: save, onDelete: remove, onClose: () => setEditor(null) }) : null,
				templatesOpen ? h(PromptTemplates, { templates: getDefaultPromptCards(t), t, onUse: add, onClose: () => setTemplatesOpen(false) }) : null,
				sorting ? h(PromptSorter, { cards, t, onSave: saveOrder, onClose: () => setSorting(false) }) : null);
		}

		/** Blank-session hero banner. It only mounts while the chat is empty. */
		function HeroBanner({ t, cardStore, input, inputActions, useChat, useSessions, useSession, sessionId }) {
			const summaryBlank = useSessions((state) => {
				if (sessionId === undefined) return undefined;
				const session = state.byId[sessionId];
				return session === undefined ? undefined : session.blank;
			});
			const openState = useSession((state) => (state === undefined ? undefined : state.openState));
			const empty =
				typeof useChat === "function"
					? useChat((state) => (state === undefined || state.order === undefined ? false : state.order.length === 0))
					: false;
			const [filled, setFilled] = React.useState("");
			const timer = React.useRef(undefined);
			React.useEffect(() => {
				return () => {
					if (timer.current !== undefined) clearTimeout(timer.current);
				};
			}, []);
			const blank = summaryBlank === true || (openState === "open" && empty);
			if (!blank) return null;

			function fill(card) {
				const draft = input && typeof input.draft === "string" ? input.draft : "";
				let filledNow = false;
				if (draft.trim() !== "") {
					try {
						const span = inputActions.captureInsertion();
						filledNow = inputActions.insertText("\n\n" + card.prompt, span) !== false;
					} catch (_error) {
						filledNow = false;
					}
				}
				if (!filledNow) {
					try {
						inputActions.setDraft(card.prompt);
						filledNow = true;
					} catch (_error) {
						// The composer can be locked mid-turn; leave the card unchanged.
					}
				}
				if (!filledNow) return;
				setFilled(card.id);
				if (timer.current !== undefined) clearTimeout(timer.current);
				timer.current = setTimeout(() => setFilled(""), 1800);
			}

			return h(
				"div",
				{ className: "caishen-hero", "data-caishen-hero": "" },
				h(
					"section",
					{ className: "caishen-hero__banner", "aria-labelledby": "caishen-hero-title" },
					h(
						"div",
						{ className: "caishen-hero__grid" },
						h(
							"div",
							{ className: "caishen-hero__copy" },
							h(
								"div",
								{ className: "caishen-hero__kicker" },
								h("span", { className: "caishen-seal caishen-seal--lg", "aria-hidden": "true" }, "财"),
								h("span", null, t("hero.kicker"))
							),
							h(
								"h2",
								{ id: "caishen-hero-title", className: "caishen-hero__title" },
								t("hero.titleLead"),
								h("wbr"),
								t("hero.titleMid"),
								h("span", { className: "caishen-hero__title-accent" }, t("hero.titleAccent"))
							),
							h("p", { className: "caishen-hero__subtitle" }, t("hero.subtitle")),
							h("p", { className: "caishen-hero__hint" }, h(SparkGlyph, { size: 12 }), t("hero.hint"))
						),
						h(
							"div",
							{ className: "caishen-hero__art-wrap" },
							h("img", {
								className: "caishen-hero__art",
								src: asset("images/caishen-scene-lettered.webp"),
								alt: t("mascot.alt"),
								draggable: "false",
								decoding: "async"
							}),
							h("img", {
								className: "caishen-hero__bubble",
								src: extra("images/speech-bubble.webp"),
								alt: "",
								"aria-hidden": "true",
								draggable: "false"
							})
						)
					)
				),
				h(PromptLibrary, { t, cardStore, filled, onFill: fill }),
				h("div", { className: "caishen-hero__footer", "aria-hidden": "true" }, t("hero.footer")),
				h(
					"span",
					{ className: "caishen-sr-only", "aria-live": "polite", "aria-atomic": "true" },
					filled ? t("card.filled") : ""
				)
			);
		}

		/** Persistent merit counter, shared by every button in one page. */
		function createMeritStore() {
			const key = LAYER + ":merit";
			let value = 0;
			try {
				const raw = window.localStorage.getItem(key);
				const parsed = Number(raw);
				if (Number.isFinite(parsed) && parsed > 0) value = Math.floor(parsed);
			} catch (_error) {
				value = 0;
			}
			const listeners = new Set();
			return {
				get: () => value,
				subscribe: (listener) => {
					listeners.add(listener);
					return () => listeners.delete(listener);
				},
				add: (amount = 1) => {
					value += amount;
					try {
						window.localStorage.setItem(key, String(value));
					} catch (_error) {
						// Private mode can reject storage; the in-memory counter still works.
					}
					for (const listener of listeners) {
						try {
							listener();
						} catch (_error) {
							// A broken listener must not stop the others.
						}
					}
				}
			};
		}

		function apply(ctx) {
			ctx.effect(() => ctx.theme.overrideTokens(LAYER, TOKENS), LAYER + ": palette overlay");
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), LAYER + ": dictionaries");
			ctx.effect(() => {
				const style = document.createElement("style");
				style.dataset.pluginCss = LAYER;
				style.textContent = CSS;
				document.head.append(style);
				return () => style.remove();
			}, LAYER + ": stylesheet");

			const tr = ctx.locale.bind(NS);
			const merit = createMeritStore();
			const cardStore = createPromptCardStore();

			/**
			 * Re-render a component when the active locale advances. The bound
			 * translator already reads the current dictionary; the subscription
			 * only supplies the render.
			 */
			function useT() {
				const [, force] = React.useReducer((value) => value + 1, 0);
				React.useEffect(() => ctx.locale.subscribe(force), []);
				return tr;
			}

			function HeroSlot(props) {
				return h(HeroBanner, { ...props, t: useT(), cardStore });
			}

			function HeroMarkSlot({ size, className }) {
				return h(LogoMark, { size, className });
			}

			function SidebarMarkSlot({ size }) {
				return h(LogoMark, { size: Math.max(size || 24, 32) });
			}

			function BrandNameSlot() {
				return h(BrandName, { t: useT() });
			}

			function HeaderBrandSlot() {
				return h(HeaderBrand, { t: useT() });
			}

			function UtilitiesSlot() {
				const t = useT();
				return h(
					"span",
					{ className: "caishen-utilities" },
					h(StatusChip, { t, compact: true }),
					h(MeritButton, { t, merit, iconSize: 12 })
				);
			}

			function FortuneMeterSlot() {
				return h(
					"span",
					{ className: "caishen-input-accessories" },
					h(FortuneMeter, { t: useT() }),
					h(CloudMascot)
				);
			}

			function SettingsTriggerSlot({ wide }) {
				return h(SettingsTrigger, { t: useT(), wide });
			}

			function HeroActionsSlot() {
				const t = useT();
				return h(
					"span",
					{ className: "caishen-hero-actions" },
					h(StatusChip, { t, compact: true }),
					h(MeritButton, { t, merit, iconSize: 12 })
				);
			}

			function register(slot, options, Component, label) {
				return ctx.effect(
					() =>
						ctx.slots.inject(slot, () =>
							ctx.slots.register({ name: slot, locale: NS, ...options }, Component)
						),
					LAYER + ": " + label
				);
			}

			register("conversation.input.dock", { id: "caishen-hero", order: -100 }, HeroSlot, "hero dock");
			register("conversation.hero.options", { id: "caishen-hero-actions", order: 100 }, HeroActionsSlot, "hero actions");
			register("conversation.hero.brand.mark", {}, HeroMarkSlot, "hero brand mark");
			register("sidebar.brand.mark", { priority: -1000 }, SidebarMarkSlot, "sidebar brand mark");
			register("sidebar.brand.name", { priority: -1000 }, BrandNameSlot, "sidebar brand name");
			register("conversation.header.leading", {}, HeaderBrandSlot, "header marquee");
			register("conversation.session.header.utilities", { id: "caishen-utilities", order: 100 }, UtilitiesSlot, "header utilities");
			register("conversation.input.right", { id: "caishen-fortune", order: 10 }, FortuneMeterSlot, "fortune meter");
			register("settings.trigger", { priority: -1000 }, SettingsTriggerSlot, "fortune settings trigger");
		}

		exports.apply = apply;
		exports.inject = ["theme", "slots", "locale"];
		exports.TOKENS = TOKENS;
		exports.LOCALES = { zh, en };
		exports.getDefaultPromptCards = getDefaultPromptCards;
		exports.isPromptCardIcon = isPromptCardIcon;
		exports.validateCard = validateCard;
		exports.normalizePromptCards = normalizePromptCards;
		exports.placePromptCard = placePromptCard;
		exports.movePromptCard = movePromptCard;
		exports.createPromptCardStore = createPromptCardStore;
		return module.exports;
	}
});
