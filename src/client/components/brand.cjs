const React = require("react");
const h = React.createElement;
const { asset } = require("../config.cjs");
const { cx } = require("../utils/presentation.cjs");

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

function HeaderBrand({ t }) {
	return h(
		"span",
		{ className: "caishen-header-brand", title: t("brand.aria") },
		h("img", {
			className: "caishen-header-brand__logo",
			src: asset("images/logo-shun.webp"),
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

module.exports = { LogoMark, HeaderBrand, BrandName, SettingsTrigger };
