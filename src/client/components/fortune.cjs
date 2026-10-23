const React = require("react");
const h = React.createElement;
const { asset } = require("../config.cjs");
const { fmt, cx } = require("../utils/presentation.cjs");
const { CoinGlyph, SparkGlyph } = require("./icons.cjs");

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
	const [notice, setNotice] = React.useState("");
	const [burst, setBurst] = React.useState(0);
	const artwork = t("merit.label").includes("功德");
	React.useEffect(() => {
		if (!burst) return undefined;
		const timer = setTimeout(() => setBurst(0), 900);
		return () => clearTimeout(timer);
	}, [burst]);
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
				const before = merit.get();
				const finish = (result) => { setNotice(result?.ok ? "" : result?.error || "unavailable"); if (merit.get() > before) setBurst((value) => value + 1); };
				const result = merit.add(1);
				if (result?.then) result.then(finish); else finish(result);
			},
			"aria-label": fmt(t("merit.count"), { count }),
			title: notice ? t("journal.error." + notice) : t("journal.disclaimer")
		},
		artwork
			? h("img", { className: "caishen-merit__art", src: asset("images/merit-badge.webp"), alt: "", "aria-hidden": "true", draggable: "false" })
			: h("span", { className: "caishen-merit__coin", "aria-hidden": "true" }, h(CoinGlyph, { size: iconSize })),
		artwork ? increment : h("span", { className: "caishen-merit__label" }, t("merit.label").replace(/\s*\+1$/, ""), " ", increment),
		notice ? h("span", { role: "status", className: "caishen-merit__notice" }, " !", h("span", { className: "caishen-sr-only" }, t("journal.error." + notice))) : null
	);
}

function CloudMascot() {
	return h(
		"span",
		{ className: "caishen-cloud-mascot-wrap", "aria-hidden": "true" },
		h("img", {
			className: "caishen-cloud-mascot",
			src: asset("images/caishen-cloud-mascot.webp"),
			alt: "",
			draggable: "false"
		})
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

module.exports = { StatusChip, MeritButton, CloudMascot, FortuneMeter };
