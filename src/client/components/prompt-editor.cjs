const React = require("react");
const h = React.createElement;
const { CARD_TONES } = require("../config.cjs");
const { fmt } = require("../utils/presentation.cjs");
const { validateCard } = require("../state/prompt-cards.cjs");
const { Card, CardIcon, CARD_ICONS } = require("./prompt-card.cjs");
const { useDiscardGuard, DiscardChanges } = require("../utils/discard-guard.cjs");

function PromptEditor({ initial, initialPosition, total, isNew, t, onSave, onDelete, onClose }) {
	const [draft, setDraft] = React.useState(() => ({ ...initial }));
	const [position, setPosition] = React.useState(initialPosition);
	const [error, setError] = React.useState("");
	const [confirmDelete, setConfirmDelete] = React.useState(false);
	const dialog = React.useRef(null);
	const cancelButton = React.useRef(null);
	const dirty = position !== initialPosition || Object.keys(draft).some((name) => draft[name] !== initial[name]);
	const guard = useDiscardGuard({ dirty, onClose, dialog, fallbackSelector: '[name="title"]' });
	React.useEffect(() => { if (confirmDelete) cancelButton.current?.focus(); }, [confirmDelete]);
	React.useEffect(() => {
		const previous = document.activeElement;
		const element = dialog.current;
		element.showModal();
		element.querySelector('[name="title"]').focus();
		return () => {
			if (element.open) element.close();
			if (previous && previous.isConnected) previous.focus({ preventScroll: true });
		};
	}, []);
	const update = (name, value) => { setDraft((prev) => ({ ...prev, [name]: value })); setError(""); };
	function save(event) {
		event.preventDefault();
		if (confirmDelete || guard.confirming) return;
		const validation = validateCard(draft);
		if (!validation.ok) {
			setError(validation.error);
			dialog.current.querySelector('[name="' + validation.error + '"]')?.focus();
			return;
		}
		const result = onSave(validation.card, position);
		if (!result.ok) setError(result.error);
	}
	function remove() {
		const result = onDelete(draft.id);
		if (!result.ok) setError(result.error);
	}
	function field(name, maxLength, rows) {
		const props = { name, value: draft[name], maxLength, onChange: (event) => update(name, event.target.value),
			"aria-invalid": error === name ? "true" : undefined, "aria-describedby": error === name ? "caishen-editor-error" : undefined,
			required: name === "title" || name === "prompt" };
		return h("label", { className: "caishen-editor__field" },
			h("span", null, t("editor." + name)),
			rows ? h("textarea", { ...props, rows }) : h("input", { ...props, type: "text" }));
	}
	const icons = ["cost", "debt", "report", "merge", "🐞", "🛠️", "🔍", "🧪", "📖", "🧹", "⚡", "📝", "🚀", "📚", "💡"];
	const messageKey = ["icon", "title", "prompt", "template", "storage", "corrupt", "unavailable", "quota", "conflict", "limit", "missing"].includes(error) ? error : "invalid";
	return h("dialog", { ref: dialog, className: "caishen-editor", "aria-labelledby": "caishen-editor-title",
		onCancel: guard.onCancel, onClick: guard.onBackdrop, onFocusCapture: guard.rememberFocus },
		h("form", { className: "caishen-editor__form", onSubmit: save },
			h("header", { className: "caishen-editor__header" },
				h("div", null, h("h3", { id: "caishen-editor-title", className: "caishen-editor__heading" }, t(isNew ? "editor.add" : "editor.edit")),
					h("p", { className: "caishen-editor__subtitle" }, t("editor.subtitle"))),
				h("button", { type: "button", className: "caishen-editor__close", onClick: guard.requestClose, "aria-label": t("editor.close") }, "×")),
			h("div", { className: "caishen-editor__body", "data-discard-editing": "" },
				h("div", { className: "caishen-editor__fields" },
					h("div", { className: "caishen-editor__field" }, h("span", null, t("editor.icon")),
						h("div", { className: "caishen-editor__icons", role: "group", "aria-label": t("editor.icon") }, icons.map((icon) =>
							h("button", { key: icon, type: "button", className: "caishen-editor__icon", "aria-pressed": draft.icon === icon,
								"aria-label": CARD_ICONS[icon] ? t("card." + icon + ".title") : icon, onClick: () => update("icon", icon) }, h(CardIcon, { icon })))),
						h("label", { className: "caishen-editor__field" }, h("span", null, t("editor.emoji")),
							h("input", { name: "icon", type: "text", maxLength: 64, value: CARD_ICONS[draft.icon] ? "" : draft.icon,
								placeholder: t("editor.emojiHint"), "aria-invalid": error === "icon" ? "true" : undefined,
								"aria-describedby": error === "icon" ? "caishen-editor-error" : undefined,
								onChange: (event) => update("icon", event.target.value) }))),
					h("div", { className: "caishen-editor__row" }, field("title", 60), field("tag", 24)),
					field("desc", 180, 2),
					h("div", { className: "caishen-editor__field" },
						h("span", null, t("editor.tone"), h("span", { className: "caishen-editor__tone-name" }, t("editor." + draft.tone))),
						h("div", { className: "caishen-editor__tones", role: "group", "aria-label": t("editor.tone") }, CARD_TONES.map((tone) =>
							h("button", { key: tone, type: "button", className: "caishen-tone caishen-editor__tone", "data-tone": tone,
								"aria-label": t("editor." + tone), title: t("editor." + tone), "aria-pressed": draft.tone === tone,
								onClick: () => update("tone", tone) }, draft.tone === tone ? "✓" : null)))),
					h("label", { className: "caishen-editor__field" }, h("span", null, t("editor.position")),
						h("select", { name: "position", value: position, onChange: (event) => setPosition(Number(event.target.value)) },
							Array.from({ length: total }, (_, index) => h("option", { key: index, value: index },
								fmt(t("editor.positionValue"), { position: index + 1 }) + (index === 0 ? " · " + t("editor.first") : index === total - 1 ? " · " + t("editor.last") : ""))))),
					field("prompt", 12000, 7),
					h("label", { className: "caishen-browser__template-toggle" }, h("input", { name: "template", type: "checkbox", checked: draft.template === true,
						"aria-invalid": error === "template" ? "true" : undefined, "aria-describedby": error === "template" ? "caishen-editor-error" : "caishen-template-help",
						onChange: (event) => update("template", event.target.checked ? true : undefined) }), t("workflow.template")),
					h("p", { id: "caishen-template-help", className: "caishen-transfer__hint" }, t("workflow.templateHelp"))),
				h("aside", { className: "caishen-editor__preview" }, h("p", { className: "caishen-editor__preview-label" }, t("editor.preview")),
					h(Card, { card: draft, t, preview: true }), h("p", { className: "caishen-editor__preview-hint" }, t("editor.previewHint")))),
			h("footer", { className: "caishen-editor__footer" },
				guard.confirming ? h(DiscardChanges, { guard, t, id: "caishen-editor-discard" }) : h(React.Fragment, null,
				confirmDelete ? h("p", { className: "caishen-editor__delete-message" }, fmt(t("editor.deleteMessage"), { title: initial.title })) : null,
				error ? h("p", { id: "caishen-editor-error", className: "caishen-editor__error", role: "alert" }, t("editor.error." + messageKey)) : null,
				!isNew && onDelete && !confirmDelete ? h("button", { type: "button", className: "caishen-editor__button caishen-editor__button--danger",
					onClick: () => { setConfirmDelete(true); setError(""); } }, t("editor.delete")) : null,
				h("span", { className: "caishen-editor__footer-spacer" }),
				h("button", { type: "button", ref: cancelButton, className: "caishen-editor__button", onClick: confirmDelete ? () => setConfirmDelete(false) : guard.requestClose }, t(confirmDelete ? "editor.back" : "editor.cancel")),
				confirmDelete
					? h("button", { type: "button", className: "caishen-editor__button caishen-editor__button--danger", onClick: remove }, t("editor.confirmDelete"))
					: h("button", { type: "submit", className: "caishen-editor__button caishen-editor__button--primary" }, t("editor.save"))))));
}

module.exports = { PromptEditor };
