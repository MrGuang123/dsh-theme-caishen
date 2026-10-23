/** Semantic palettes overlaid on the host theme. */

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

module.exports = TOKENS;
