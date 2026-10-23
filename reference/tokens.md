# Token reference (built-in palette, dsh-client-ui-theme)

Every `--dsw-*` alias/specific token the shipped stylesheets declare, with its
default light and dark value. Override these through `ctx.theme.overrideTokens()`
or a registered theme; overrides are written as inline custom properties on
`<body>`, so any CSS value works (including `var()` and `color-mix()`).

`--dsw-static-*` scales also exist (77 values: amber/blue/deepseek/green/neutral/
neutral-bluish/red). They are palette constants shared by both schemes; overriding
them re-hues everything that references them, which is a blunt but effective tool.

| Token | light | dark |
|---|---|---|

## Surfaces / layers

| `--dsw-alias-bg-base` | `var(--dsw-static-neutral-bluish-00)` | `var(--dsw-static-neutral-bluish-950)` |
| `--dsw-alias-bg-document-preview` | `var(--dsw-static-neutral-bluish-100)` | `var(--dsw-static-neutral-bluish-950)` |
| `--dsw-alias-bg-document-selection` | `color-mix(in srgb, var(--dsw-static-blue-500) 40%, transparent)` | `color-mix(in srgb, var(--dsw-static-blue-500) 40%, transparent)` |
| `--dsw-alias-bg-layer-1` | `var(--dsw-static-neutral-bluish-00)` | `var(--dsw-static-neutral-bluish-875)` |
| `--dsw-alias-bg-layer-2` | `var(--dsw-static-neutral-bluish-00)` | `var(--dsw-static-neutral-bluish-850)` |
| `--dsw-alias-bg-layer-3` | `var(--dsw-static-neutral-bluish-00)` | `var(--dsw-static-neutral-bluish-800)` |
| `--dsw-alias-bg-mask-1` | `#0000003d` | `#00000080` |
| `--dsw-alias-bg-mask-2` | `#0000001f` | `#0003` |
| `--dsw-alias-bg-mask-3` | `#0000007a` | `#0000007a` |
| `--dsw-alias-bg-mask-drop` | `#ffffffb3` | `#272730b3` |
| `--dsw-alias-bg-mask-photo` | `#000000e0` | `#000000e0` |
| `--dsw-alias-bg-module-platform` | `var(--dsw-static-neutral-bluish-60)` | `var(--dsw-static-neutral-bluish-800)` |
| `--dsw-alias-bg-multi-select` | `var(--dsw-static-neutral-bluish-60)` | `var(--dsw-static-neutral-850)` |
| `--dsw-alias-bg-overlay` | `var(--dsw-static-neutral-bluish-150)` | `var(--dsw-static-neutral-bluish-700)` |
| `--dsw-alias-bg-skeleton` | `#0000000a` | `#ffffff14` |
| `--dsw-alias-menu-group-header-fill` | `#f8f9faf0` | `#303136f0` |
| `--dsw-menu-surface-fill` | `#f8f9fa94` | `#43454a73` |

## Text / labels

| `--dsw-alias-label-caption` | `var(--dsw-static-neutral-bluish-400)` | `var(--dsw-static-neutral-bluish-600)` |
| `--dsw-alias-label-deep-diving` | `color-mix(in srgb, var(--dsw-static-deepseek-500) 70%, var(--dsw-static-blue-950))` | `color-mix(in srgb, var(--dsw-static-deepseek-450) 55%, var(--dsw-static-neutral-bluish-400))` |
| `--dsw-alias-label-deep-diving-shimmer` | `color-mix(in srgb, var(--dsw-static-deepseek-500) 30%, var(--dsw-static-blue-950))` | `color-mix(in srgb, var(--dsw-static-blue-300) 65%, var(--dsw-static-deepseek-400))` |
| `--dsw-alias-label-dimmed` | `var(--dsw-static-neutral-bluish-200)` | `var(--dsw-static-neutral-bluish-750)` |
| `--dsw-alias-label-document-preview` | `var(--dsw-static-neutral-bluish-700)` | `var(--dsw-static-neutral-bluish-300)` |
| `--dsw-alias-label-primary` | `var(--dsw-static-neutral-bluish-1000)` | `var(--dsw-static-neutral-bluish-50)` |
| `--dsw-alias-label-primary-bluish` | `var(--dsw-static-blue-900)` | `var(--dsw-static-neutral-bluish-50)` |
| `--dsw-alias-label-primary-dimmed` | `var(--dsw-static-neutral-bluish-950)` | `var(--dsw-static-neutral-bluish-100)` |
| `--dsw-alias-label-primary-foreground` | `var(--dsw-static-neutral-bluish-00)` | `var(--dsw-static-neutral-bluish-1000)` |
| `--dsw-alias-label-primary-inverted` | `var(--dsw-static-neutral-bluish-00)` | `var(--dsw-static-neutral-bluish-800)` |
| `--dsw-alias-label-secondary` | `var(--dsw-static-neutral-bluish-700)` | `var(--dsw-static-neutral-bluish-300)` |
| `--dsw-alias-label-shimmer` | `color-mix(in srgb, var(--dsw-static-neutral-1000) 30%, transparent)` | `color-mix(in srgb, var(--dsw-static-neutral-00) 45%, transparent)` |
| `--dsw-alias-label-tertiary` | `var(--dsw-static-neutral-bluish-600)` | `var(--dsw-static-neutral-bluish-400)` |

## Borders

| `--dsw-alias-border-inverted` | `#0000` | `#ffffff0f` |
| `--dsw-alias-border-inverted2` | `#0000` | `#ffffff14` |
| `--dsw-alias-border-l1` | `#0000000a` | `#ffffff0f` |
| `--dsw-alias-border-l2` | `#0000001a` | `#ffffff1f` |
| `--dsw-alias-border-l2-darkmode-thin` | `#0000001a` | `#ffffff0f` |
| `--dsw-alias-border-l3` | `#0000001f` | `#ffffff29` |
| `--dsw-alias-border-l4` | `#00000029` | `#fff3` |

## Buttons

| `--dsw-alias-button-contrast-fill` | `var(--dsw-static-neutral-bluish-700)` | `var(--dsw-static-neutral-bluish-50)` |
| `--dsw-alias-button-elevated-fill` | `var(--dsw-static-neutral-bluish-00)` | `var(--dsw-static-neutral-bluish-750)` |
| `--dsw-alias-button-floating-fill` | `var(--dsw-static-neutral-bluish-00)` | `var(--dsw-static-neutral-bluish-850)` |
| `--dsw-alias-button-floating-hover` | `var(--dsw-static-neutral-bluish-75)` | `var(--dsw-static-neutral-bluish-800)` |
| `--dsw-alias-button-ghost-active-border` | `var(--dsw-static-neutral-bluish-500)` | `var(--dsw-static-neutral-bluish-600)` |
| `--dsw-alias-button-ghost-active-fill` | `var(--dsw-static-neutral-bluish-100)` | `var(--dsw-static-neutral-bluish-750)` |
| `--dsw-alias-button-ghost-active-hover` | `var(--dsw-static-neutral-bluish-150)` | `var(--dsw-static-neutral-bluish-700)` |
| `--dsw-alias-button-info-fill` | `var(--dsw-static-deepseek-500)` | `var(--dsw-static-deepseek-400)` |
| `--dsw-alias-button-info-hover` | `var(--dsw-static-deepseek-400)` | `var(--dsw-static-deepseek-500)` |
| `--dsw-alias-button-primary-dimmed` | `var(--dsw-static-neutral-bluish-100)` | `var(--dsw-static-neutral-bluish-750)` |
| `--dsw-alias-button-primary-fill` | `var(--dsw-alias-brand-primary)` | `var(--dsw-alias-brand-primary)` |
| `--dsw-alias-button-primary-hover` | `var(--dsw-static-neutral-bluish-750)` | `var(--dsw-static-neutral-bluish-100)` |
| `--dsw-alias-button-tool-bar-fill` | `#54555780` | `#54555780` |
| `--dsw-alias-button-tool-bar-fill-invisible` | `#1f1f1f5c` | `#1f1f1f5c` |
| `--dsw-alias-button-tool-bar-hover` | `#54555799` | `#54555799` |

## Interactive

| `--dsw-alias-interactive-bg-active` | `#2631481a` | `#ffffff24` |
| `--dsw-alias-interactive-bg-hover` | `#2631480f` | `#ffffff14` |
| `--dsw-alias-interactive-bg-hover-accent` | `#26314824` | `#ffffff3d` |
| `--dsw-alias-interactive-bg-hover-danger` | `#ec13130d` | `#f25a5a26` |
| `--dsw-alias-interactive-bg-hover-solid` | `var(--dsw-static-neutral-bluish-75)` | `var(--dsw-static-neutral-bluish-800)` |

## States

| `--dsw-alias-state-business-primary` | `var(--dsw-static-deepseek-500)` | `var(--dsw-static-deepseek-400)` |
| `--dsw-alias-state-business-tertiary` | `var(--dsw-static-deepseek-100)` | `var(--dsw-static-deepseek-800)` |
| `--dsw-alias-state-error-primary` | `var(--dsw-static-red-600)` | `var(--dsw-static-red-400)` |
| `--dsw-alias-state-error-secondary` | `var(--dsw-static-red-400)` | `var(--dsw-static-red-400)` |
| `--dsw-alias-state-idle-primary` | `var(--dsw-static-neutral-300)` | `var(--dsw-static-neutral-600)` |
| `--dsw-alias-state-success-primary` | `var(--dsw-static-green-500)` | `var(--dsw-static-green-500)` |
| `--dsw-alias-state-success-secondary` | `var(--dsw-static-green-400)` | `var(--dsw-static-green-400)` |
| `--dsw-alias-state-success-tertiary` | `var(--dsw-static-green-100)` | `var(--dsw-static-green-900)` |
| `--dsw-alias-state-warn-label` | `var(--dsw-static-amber-600)` | `var(--dsw-static-amber-600)` |
| `--dsw-alias-state-warn-primary` | `var(--dsw-static-amber-500)` | `var(--dsw-static-amber-500)` |
| `--dsw-alias-state-warn-secondary` | `var(--dsw-static-amber-400)` | `var(--dsw-static-amber-400)` |
| `--dsw-alias-state-warn-tertiary` | `var(--dsw-static-amber-100)` | `var(--dsw-static-amber-900)` |

## Markdown / code

| `--dsw-alias-markdown-citation` | `var(--dsw-static-neutral-bluish-100)` | `var(--dsw-static-neutral-bluish-800)` |
| `--dsw-alias-markdown-code-block` | `var(--dsw-static-neutral-bluish-50)` | `var(--dsw-static-neutral-bluish-900)` |
| `--dsw-alias-markdown-code-block-banner` | `var(--dsw-static-neutral-bluish-50)` | `var(--dsw-static-neutral-bluish-850)` |
| `--dsw-alias-markdown-code-segment-selected` | `var(--dsw-static-neutral-bluish-00)` | `var(--dsw-static-neutral-bluish-800)` |
| `--dsw-alias-markdown-code-segment-unselected` | `var(--dsw-static-neutral-bluish-75)` | `var(--dsw-static-neutral-bluish-900)` |
| `--dsw-alias-markdown-inline-code` | `var(--dsw-static-neutral-50)` | `var(--dsw-static-neutral-800)` |
| `--dsw-alias-markdown-placeholder` | `var(--dsw-static-neutral-bluish-60)` | `var(--dsw-static-neutral-bluish-850)` |
| `--dsw-alias-markdown-tag` | `var(--dsw-static-neutral-bluish-75)` | `var(--dsw-static-neutral-bluish-850)` |
| `--shiki-token-comment` | `#868e96` | `#adb5bd` |
| `--shiki-token-constant` | `#1c7ed6` | `#4dabf7` |
| `--shiki-token-function` | `#6741d9` | `#b197fc` |
| `--shiki-token-keyword` | `#d6336c` | `#faa2c1` |
| `--shiki-token-link` | `#1971c2` | `#74c0fc` |
| `--shiki-token-parameter` | `#e8590c` | `#ffa94d` |
| `--shiki-token-punctuation` | `#495057` | `#ced4da` |
| `--shiki-token-string` | `#2f9e44` | `#69db7c` |
| `--shiki-token-string-expression` | `#2b8a3e` | `#8ce99a` |

## Sidebar / specific

| `--dsw-alias-brand-primary` | `var(--dsw-static-neutral-bluish-1000)` | `var(--dsw-static-neutral-bluish-50)` |
| `--dsw-alias-brand-primary-invert` | `var(--dsw-static-neutral-bluish-1000)` | `var(--dsw-static-neutral-bluish-50)` |
| `--dsw-alias-brand-primary-new-colorprimary-new-color` | `#4176e6` | `var(--dsw-static-deepseek-450)` |
| `--dsw-alias-brand-text` | `var(--dsw-static-neutral-bluish-1000)` | `var(--dsw-static-neutral-bluish-50)` |
| `--dsw-alias-code-diff-added` | `var(--dsw-static-green-500-a08)` | `var(--dsw-static-green-500-a12)` |
| `--dsw-alias-code-diff-deleted` | `var(--dsw-static-red-600-a08)` | `var(--dsw-static-red-400-a12)` |
| `--dsw-alias-file-diff-added-bg` | `#e6f4e7` | `#1f3124` |
| `--dsw-alias-file-diff-added-gutter` | `#edf7ed` | `#132016` |
| `--dsw-alias-file-diff-added-marker` | `#01a241` | `#41c977` |
| `--dsw-alias-file-diff-deleted-bg` | `#fce6e2` | `#3c1f1b` |
| `--dsw-alias-file-diff-deleted-gutter` | `#fdece9` | `#28130e` |
| `--dsw-alias-file-diff-deleted-marker` | `#ba2723` | `#fa423e` |
| `--dsw-alias-link` | `var(--dsw-static-deepseek-500)` | `var(--dsw-static-deepseek-400)` |
| `--dsw-alias-menu-icon` | `var(--dsw-static-neutral-bluish-800)` | `var(--dsw-alias-label-primary-dimmed)` |
| `--dsw-alias-scrollbar-bg-l1` | `var(--dsw-static-neutral-200)` | `var(--dsw-static-neutral-700)` |
| `--dsw-alias-scrollbar-bg-l2` | `var(--dsw-static-neutral-200)` | `var(--dsw-static-neutral-600)` |
| `--dsw-alias-scrollbar-hover-l1` | `var(--dsw-static-neutral-300)` | `var(--dsw-static-neutral-600)` |
| `--dsw-alias-scrollbar-hover-l2` | `var(--dsw-static-neutral-300)` | `var(--dsw-static-neutral-550)` |
| `--dsw-alias-switch-thumb` | `var(--dsw-static-neutral-bluish-00)` | `var(--dsw-static-neutral-bluish-400)` |
| `--dsw-alias-toast-bg` | `var(--dsw-static-neutral-bluish-800)` | `var(--dsw-static-neutral-bluish-750)` |
| `--dsw-alias-toast-label` | `var(--dsw-static-neutral-bluish-00)` | `var(--dsw-static-neutral-bluish-00)` |
| `--dsw-alias-tooltip-bg` | `var(--dsw-static-neutral-bluish-850)` | `var(--dsw-static-neutral-bluish-750)` |
| `--dsw-alias-tooltip-key-bg` | `color-mix(in srgb, var(--dsw-alias-tooltip-bg), white 18%)` | `color-mix(in srgb, var(--dsw-alias-tooltip-bg), white 18%)` |
| `--dsw-alias-turn-trigger-bg` | `var(--dsw-alias-markdown-code-block)` | `var(--dsw-alias-interactive-bg-hover)` |
| `--dsw-alias-turn-trigger-bg-hover` | `var(--dsw-alias-interactive-bg-hover)` | `var(--dsw-alias-interactive-bg-active)` |
| `--dsw-specific-bubble` | `var(--dsw-static-deepseek-50)` | `var(--dsw-static-neutral-bluish-850)` |
| `--dsw-specific-bubble-highlight` | `var(--dsw-static-deepseek-200)` | `var(--dsw-static-neutral-bluish-750)` |
| `--dsw-specific-input-major` | `var(--dsw-static-neutral-bluish-00)` | `var(--dsw-static-neutral-bluish-850)` |
| `--dsw-specific-login-input` | `var(--dsw-static-neutral-bluish-50)` | `var(--dsw-static-neutral-bluish-900)` |
| `--dsw-specific-menu` | `var(--dsw-menu-surface-fill)` | `var(--dsw-menu-surface-fill)` |
| `--dsw-specific-selector` | `var(--dsw-static-neutral-bluish-60)` | `var(--dsw-static-neutral-bluish-800)` |
| `--dsw-specific-sidebar-fill` | `var(--dsw-static-neutral-bluish-50)` | `var(--dsw-static-neutral-bluish-900)` |
| `--dsw-specific-sidebar-nav-item-active` | `var(--dsw-static-neutral-bluish-100)` | `var(--dsw-static-neutral-bluish-750)` |
| `--dsw-specific-sidebar-nav-item-active-accent` | `var(--dsw-static-deepseek-100)` | `var(--dsw-static-neutral-bluish-800)` |
| `--dsw-specific-sidebar-nav-item-hover` | `var(--dsw-static-neutral-bluish-75)` | `var(--dsw-static-neutral-bluish-850)` |
| `--dsw-specific-tip` | `var(--dsw-static-neutral-bluish-60)` | `var(--dsw-static-neutral-bluish-800)` |
