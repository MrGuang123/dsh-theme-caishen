/** Shared string formatting and class-name helpers. */

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

module.exports = { fmt, cx };
