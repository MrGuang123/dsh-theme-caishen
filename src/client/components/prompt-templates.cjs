const React = require("react");
const h = React.createElement;
const { Card, CardIcon } = require("./prompt-card.cjs");

function PromptTemplates({ templates, t, onUse, onClose }) {
	const [selectedId, setSelectedId] = React.useState(templates[0].id);
	const selected = templates.find((card) => card.id === selectedId) || templates[0];
	const dialog = React.useRef(null);
	React.useEffect(() => {
		const previous = document.activeElement;
		const element = dialog.current;
		element.showModal();
		element.querySelector('[aria-pressed="true"]')?.focus();
		return () => {
			if (element.open) element.close();
			if (previous?.isConnected) previous.focus({ preventScroll: true });
		};
	}, []);
	return h("dialog", { ref: dialog, className: "caishen-editor caishen-templates", "aria-labelledby": "caishen-templates-title",
		onCancel: (event) => { event.preventDefault(); onClose(); },
		onClick: (event) => { if (event.target === dialog.current) {
			const rect = dialog.current.getBoundingClientRect();
			if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
		} } }, h("div", { className: "caishen-editor__form" },
		h("header", { className: "caishen-editor__header" },
			h("div", null, h("h3", { id: "caishen-templates-title", className: "caishen-editor__heading" }, t("templates.title")),
				h("p", { className: "caishen-editor__subtitle" }, t("templates.hint"))),
			h("button", { type: "button", className: "caishen-editor__close", onClick: onClose, "aria-label": t("templates.close") }, "×")),
		h("div", { className: "caishen-templates__layout" },
			h("div", { className: "caishen-templates__list", role: "group", "aria-label": t("templates.list") }, templates.map((card) =>
				h("button", { key: card.id, type: "button", className: "caishen-tone caishen-templates__option", "data-tone": card.tone,
					"aria-pressed": selected.id === card.id, onClick: () => setSelectedId(card.id) },
					h("span", { className: "caishen-card__icon", "aria-hidden": "true" }, h(CardIcon, { icon: card.icon })),
					h("span", { className: "caishen-templates__text" }, h("span", { className: "caishen-templates__name" }, card.title),
						h("span", { className: "caishen-templates__desc" }, card.desc))))),
			h("div", { className: "caishen-templates__preview" },
				h(Card, { card: selected, t, preview: true }),
				h("h4", { className: "caishen-templates__prompt-label" }, t("templates.prompt")),
				h("p", { className: "caishen-templates__prompt" }, selected.prompt))),
		h("footer", { className: "caishen-editor__footer" },
			h("span", { className: "caishen-editor__footer-spacer" }),
			h("button", { type: "button", className: "caishen-editor__button", onClick: onClose }, t("editor.cancel")),
			h("button", { type: "button", className: "caishen-editor__button caishen-editor__button--primary", onClick: () => onUse(selected) }, t("templates.use")))));
}

module.exports = { PromptTemplates };
