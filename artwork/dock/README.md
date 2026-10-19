# DSH 财神黑金图标

独立的 macOS 应用图标设计，保留 DSH 鲸鱼轮廓，融合财神主题的元宝与祥云。此目录提供可下载的图标素材，不自动替换主题插件的 icon.svg，也不修改已安装 DSH 应用。

- dsh-caishen-black-gold-v1.png：1254×1254 生成原图，圆角方形黑金底座，外部透明。
- dsh-caishen-black-gold-v1.icns：使用 macOS sips / iconutil 从原图导出的多尺寸应用图标。

生成方式：内置 image_gen，参考用户提供的 DSH 图标截图与当前主题的金元宝素材。格式导出不修改构图。

macOS 手动替换与恢复应用图标的步骤见[主 README](../../README.md#可选macos-黑金应用图标)。安装主题不会自动更换程序坞图标。

## 最终生成提示词

```text
Use case: logo-brand.
Asset type: finished macOS Dock app icon, one square PNG asset, not a mockup.
Input images: Image 1 is an identity reference for the DSH whale logo from the user's screenshot. Image 2 is a supporting material/style reference for the Caishen theme's polished gold ingot, not a composition to copy.
Primary request: create an elegant black-and-gold DSH × Caishen app icon. Preserve the recognizable whale silhouette from image 1: rounded curved body, large flowing inner negative-space belly, tiny clear eye, upward forked tail toward the upper right. Render that whale as a richly luminous warm-gold emblem with subtle sculpted bevels, cream highlights and amber-gold edge shading. It must remain a clear graphic mark, not a realistic swimming whale.
Scene/backdrop: a deep obsidian-black rounded-square macOS app tile, front-facing and perfectly centered, very restrained soft material shading and an extremely fine gold edge. Outside the rounded tile must be real transparent alpha, including corners. No surrounding white canvas.
Composition/framing: one large central whale as the unmistakable first visual, occupying around 72 percent of the icon width with generous clean breathing room. Add just one small gracefully shaped Chinese gold ingot centered underneath the whale, about 24 percent of the tile width, as a secondary Caishen motif. A couple of faint gold auspicious-cloud engraved curves may sit low in the black background; keep these extremely subtle so the whale remains clear at 32 pixels.
Style/medium: refined polished Chinese gold illustration meets restrained premium macOS app icon; crisp silhouette and smooth clean edges, gentle shallow 3D depth, not photorealistic product photography. Match the rich gold material of image 2, with simpler detail suitable for an app icon.
Color palette: obsidian black, warm metallic gold and champagne-gold highlights only.
Constraints: 1:1 square composition, high-resolution production icon. One tile only, one whale only, one small ingot only. Preserve recognizable DSH identity. Keep the eye and belly cutout very legible. No human figure, no face costume, no text, no letters, no monograms, no watermark, no excessive tiny coins, no glitter spray, no external drop shadow far outside the tile, no dock/screen/device mockup, no perspective tilt. True alpha outside the tile.
```
