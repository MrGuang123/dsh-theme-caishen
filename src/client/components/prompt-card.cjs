const React = require("react");
const h = React.createElement;
const { asset } = require("../config.cjs");
const { fmt } = require("../utils/presentation.cjs");
const { isPromptCardIcon } = require("../state/prompt-cards.cjs");

const CARD_ICONS = {
	cost: asset("icons/card-cost.svg"), debt: asset("icons/card-debt.svg"),
	report: asset("icons/card-report.svg"), merge: asset("icons/card-merge.svg")
};

function CardIcon({ icon }) {
	return CARD_ICONS[icon]
		? h("img", { src: CARD_ICONS[icon], alt: "", loading: "lazy", draggable: "false" })
		: h("span", { className: "caishen-card__emoji" }, isPromptCardIcon(icon) ? icon : "✦");
}

function Card({ card, t, filled, onFill, onEdit, preview = false }) {
	return h(
		"article",
		{
			className: "caishen-card",
			"data-card-id": card.id,
			role: preview ? undefined : "listitem",
			"data-filled": filled ? "true" : "false",
			"data-tone": card.tone
		},
		h(
			"button",
			{ type: "button", className: "caishen-card__use", onClick: onFill, disabled: preview,
				"aria-label": fmt(t("card.fillAria"), { title: card.title }) },
			h(
				"span",
				{ className: "caishen-card__top" },
				h("span", { className: "caishen-card__icon", "aria-hidden": "true" }, h(CardIcon, { icon: card.icon })),
				card.tag || filled ? h("span", { className: "caishen-card__tag", title: card.tag }, filled ? t("card.filled") : card.tag) : null
			),
			h("span", { className: "caishen-card__title", title: card.title }, card.title || t("editor.title")),
			h("span", { className: "caishen-card__desc" }, card.desc)
		),
		preview ? null : h("button", { type: "button", className: "caishen-card__edit", onClick: onEdit,
			"aria-label": fmt(t("editor.editAria"), { title: card.title }) }, t("card.edit"))
	);
}

module.exports = { Card, CardIcon, CARD_ICONS };
