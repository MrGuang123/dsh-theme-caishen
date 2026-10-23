# 财神主题素材重绘

工具：内置 image_gen，透明背景。PNG 保留生成原稿，WebP 为保留 alpha 的格式转换；未通过叠加独立书堆/屏幕修改场景。

以下为既有素材的生成记录。本轮只整理目录和引用，没有重新生成图片。当前目录与旧新路径对应见 [素材清单](../assets/manifest.json)，素材职责见 [素材说明](ARTWORK.md)。

| 记录 | PNG 原稿 | 页面使用文件 |
| --- | --- | --- |
| merit | `assets/source/images/merit-badge.png` | `assets/runtime/images/merit-badge.webp` |
| scene | `assets/source/images/caishen-scene-lettered.png` | `assets/runtime/images/caishen-scene-lettered.webp` |
| ingot | `assets/source/images/gold-ingot.png` | `assets/runtime/images/gold-ingot.webp` |

## merit

Use case: precise-object-edit.
Asset type: transparent UI badge for the 财神打工版 theme.
Input image: edit target, existing red and gold 功德+1 badge.
Primary request: redraw this badge with the same polished Chinese New Year illustration style, but REMOVE the "+1" completely from the artwork. The badge must display only the exact Chinese text "功德" on the LEFT half of the long red plaque. Reserve a clean blank red area immediately to the right of 功德 for an HTML "+1" that will be added by code later. Keep the golden ingot decoration at the right end, gold double border, and short red tassel. Make the tassel less tall and make the whole composition a compact horizontal badge, roughly 3:1 aspect ratio, tightly framed with very small transparent margin.
Text (verbatim): "功德"
Constraints: real transparent background, no + symbol, no digit 1, no other letters or numbers; only 功德 on left half. Cream-gold brush calligraphy matching the reference. No background rectangle outside the plaque, no watermark.

## scene

Use case: precise-object-edit.
Asset type: single integrated transparent hero illustration.
Input image: edit target, existing 财神 programmer scene.
Primary request: edit the ORIGINAL objects inside this image, preserving the scene composition. Add legible gold/cream text and a small ascending orange bar chart directly ON the existing black desktop monitor to the character's right. Monitor text exactly: "本月已为团队节省", "¥68,888.00", "效率提升", "+88.8%". On the spines of the ORIGINAL three books at lower right write, top to bottom: "《代码生财之道》", "《降本增效108式》", "《从BUG到财富》". The lettering must follow the existing books' perspective and be part of their surfaces. On the existing small gold desk sign to the left of laptop write "摸鱼不积极" above "思想有问题" in dark brown. Keep original laptop with its gold code symbol.
Constraints: retain EXACT same red-robed Caishen identity, sunglasses, hat, coffee, thumbs up, laptop, original monitor frame, three ORIGINAL books, envelope, ingots, desk silhouette, object positions, proportions, and transparent surroundings. This is ONE unified illustration with the same three books and monitor: no extra or stacked objects, no separate overlapping monitor or book illustrations. Sharpen existing illustration gently. True alpha transparency, no background, no watermark.

## ingot

Use case: stylized-concept.
Asset type: transparent app brand icon, reused as workspace folder symbol.
Primary request: one large luxurious Chinese gold ingot (元宝), front three-quarter view, a plump rounded gold bullion center cradled by high gracefully flared boat-shaped edges. Rich luminous golden metal, warm orange reflected shading underneath, bright cream highlights on the rim, excellent visible volume, small engraved traditional curved flourish on front, elegant polished Chinese New Year illustration matching a cartoon red-and-gold 财神 app. Crisp clean silhouette readable at 24 pixels. Centered with tight framing, minimal transparent padding, landscape roughly 1.4:1.
Constraints: exactly one standalone ingot. Genuine transparent background. No coins, no text, no letters, no flowers, no clouds, no surrounding scene, no watermark, no frame. Not an emoji or flat generic outline.
