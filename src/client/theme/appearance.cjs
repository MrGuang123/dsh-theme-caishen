const { resolveAppearance } = require("../state/appearance.cjs");
const { presetTokens } = require("./presets.cjs");
const { LAYER } = require("../config.cjs");

/** One owner for body attributes and the optional palette layer, released on unload. */
function installAppearance(ctx, store) {
	const body = document.body;
	if (!body) return () => {};
	const attributes = ["layout", "decoration", "illustrations", "eggs", "focus", "palette"].map((name) => "data-caishen-" + name);
	const original = attributes.map((name) => body.getAttribute(name));
	let disposePalette = null, palette = null;
	function update() {
		const value = resolveAppearance(store.get());
		const values = [value.layout, value.decoration, value.illustrations ? "on" : "off", value.easterEggs ? "on" : "off", value.focus ? "on" : "off", value.palette];
		attributes.forEach((name, index) => body.setAttribute(name, values[index]));
		if (palette === value.palette) return;
		disposePalette?.();
		// Classic uses the original palette; the UI still gets semantic action colors in CSS.
		disposePalette = value.palette === "classic" ? null : ctx.theme.overrideTokens(LAYER + ":appearance", presetTokens(value.palette));
		palette = value.palette;
	}
	const off = store.subscribe(update);
	update();
	return () => {
		off(); disposePalette?.();
		attributes.forEach((name, index) => original[index] === null ? body.removeAttribute(name) : body.setAttribute(name, original[index]));
	};
}
module.exports = { installAppearance };
