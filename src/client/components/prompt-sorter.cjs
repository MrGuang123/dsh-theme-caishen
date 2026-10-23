const React = require("react");
const h = React.createElement;
const { fmt } = require("../utils/presentation.cjs");
const { movePromptCard } = require("../state/prompt-cards.cjs");
const { CardIcon } = require("./prompt-card.cjs");
const { useDiscardGuard, DiscardChanges } = require("../utils/discard-guard.cjs");

function PromptSorter({ cards, t, onSave, onClose }) {
	const [order, setOrder] = React.useState(() => cards.slice());
	const [error, setError] = React.useState("");
	const dialog = React.useRef(null);
	const initialIds = React.useRef(cards.map((card) => card.id));
	const dirty = order.length !== initialIds.current.length || order.some((card, index) => card.id !== initialIds.current[index]);
	const guard = useDiscardGuard({ dirty, onClose, dialog, fallbackSelector: ".caishen-sort__move:not(:disabled)" });
	React.useEffect(() => {
		const previous = document.activeElement;
		const element = dialog.current;
		element.showModal();
		return () => {
			if (element.open) element.close();
			if (previous?.isConnected) previous.focus({ preventScroll: true });
		};
	}, []);
	function move(event, id, position) {
		const button = event.currentTarget;
		const row = button.closest("li");
		setOrder((current) => movePromptCard(current, id, position));
		setError("");
		window.requestAnimationFrame(() => {
			const focusTarget = button.isConnected && !button.disabled ? button : row?.querySelector("button:not(:disabled)");
			focusTarget?.focus({ preventScroll: true });
			row?.scrollIntoView({ block: "nearest" });
		});
	}
	function save(event) {
		event.preventDefault();
		if (guard.confirming) return;
		const result = onSave(order);
		if (!result.ok) setError(result.error);
	}
	return h("dialog", { ref: dialog, className: "caishen-editor caishen-sort", "aria-labelledby": "caishen-sort-title",
		onCancel: guard.onCancel, onClick: guard.onBackdrop, onFocusCapture: guard.rememberFocus },
		h("form", { className: "caishen-editor__form", onSubmit: save },
		h("header", { className: "caishen-editor__header" },
			h("div", null, h("h3", { id: "caishen-sort-title", className: "caishen-editor__heading" }, t("sort.title")),
				h("p", { className: "caishen-editor__subtitle" }, t("sort.hint"))),
			h("button", { type: "button", className: "caishen-editor__close", onClick: guard.requestClose, "aria-label": t("sort.close") }, "×")),
		h("ol", { className: "caishen-sort__list", "data-discard-editing": "" }, order.map((card, index) =>
			h("li", { key: card.id, className: "caishen-tone caishen-sort__row", "data-tone": card.tone },
				h("span", { className: "caishen-sort__index", "aria-hidden": "true" }, index + 1),
				h("span", { className: "caishen-card__icon", "aria-hidden": "true" }, h(CardIcon, { icon: card.icon })),
				h("span", { className: "caishen-sort__name", title: card.title }, card.title),
				h("div", { className: "caishen-sort__actions" },
					h("button", { type: "button", className: "caishen-sort__move", disabled: index === 0,
						"aria-label": fmt(t("sort.topAria"), { title: card.title }), onClick: (event) => move(event, card.id, 0) }, t("sort.top")),
					h("button", { type: "button", className: "caishen-sort__move", disabled: index === 0,
						"aria-label": fmt(t("sort.upAria"), { title: card.title }), onClick: (event) => move(event, card.id, index - 1) }, "↑"),
					h("button", { type: "button", className: "caishen-sort__move", disabled: index === order.length - 1,
						"aria-label": fmt(t("sort.downAria"), { title: card.title }), onClick: (event) => move(event, card.id, index + 1) }, "↓"))))),
		h("footer", { className: "caishen-editor__footer" },
			guard.confirming ? h(DiscardChanges, { guard, t, id: "caishen-sort-discard" }) : h(React.Fragment, null,
			error ? h("p", { className: "caishen-editor__error", role: "alert" }, t("editor.error." + (["storage", "corrupt", "unavailable", "quota", "conflict"].includes(error) ? error : "invalid"))) : null,
			h("span", { className: "caishen-editor__footer-spacer" }),
			h("button", { type: "button", className: "caishen-editor__button", onClick: guard.requestClose }, t("editor.cancel")),
			h("button", { type: "submit", className: "caishen-editor__button caishen-editor__button--primary" }, t("sort.save"))))));
}

module.exports = { PromptSorter };
