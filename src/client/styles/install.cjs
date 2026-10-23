const { LAYER, STYLESHEET_URL } = require("../config.cjs");

/** DSH owns the JS module; this effect owns and releases the external stylesheet. */
function installStyles() {
	const link = document.createElement("link");
	link.rel = "stylesheet";
	link.href = STYLESHEET_URL;
	link.dataset.pluginCss = LAYER;
	document.head.append(link);
	return () => link.remove();
}

module.exports = { installStyles };
