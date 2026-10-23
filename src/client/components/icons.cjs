const React = require("react");
const h = React.createElement;

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

function BookGlyph() {
	return h("svg", { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8,
		strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", focusable: "false" },
		h("path", { d: "M12 5c-3-2-7-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-2-1-6-1-9 1Z" }), h("path", { d: "M12 5v15" }));
}
function SlidersGlyph() {
	return h("svg", { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8,
		strokeLinecap: "round", "aria-hidden": "true", focusable: "false" },
		h("path", { d: "M4 7h3m6 0h7M4 17h7m6 0h3" }), h("circle", { cx: 10, cy: 7, r: 3 }), h("circle", { cx: 14, cy: 17, r: 3 }));
}
module.exports = { CoinGlyph, SparkGlyph, ArrowGlyph, BookGlyph, SlidersGlyph };
