const React = require("react");
const h = React.createElement;
const { renderPromptTemplate } = require("../state/prompt-template.cjs");
const { CardIcon } = require("./prompt-card.cjs");

function PromptDetail({ card, values, onValues, onFill, onCopy, onEdit, onDuplicate, onFavorite, favorite, blocked, canDuplicate, t }) {
	const [attempted, setAttempted] = React.useState(false);
	const [message, setMessage] = React.useState("");
	const form = React.useRef(null);
	const rendered = renderPromptTemplate(card, values);
	function ready() {
		setAttempted(true);
		if (!rendered.ok) {
			const index = Math.max(0, rendered.fields.indexOf(rendered.missing[0]));
			form.current?.querySelector('[data-variable="' + index + '"]')?.focus();
			return false;
		}
		return true;
	}
	async function copy() {
		if (!ready()) return;
		try {
			await navigator.clipboard.writeText(rendered.text);
			onCopy(card.id); setMessage("workflow.copied");
		} catch (_) { setMessage("workflow.copyError"); }
	}
	function fill() {
		if (!ready()) return;
		const result = onFill(rendered.text, card.id);
		if (!result.ok) setMessage("workflow.stale");
	}
	return h("section", { className: "caishen-browser__detail caishen-tone", "data-tone": card.tone, "aria-label": t("workflow.preview") },
		h("div", { className: "caishen-browser__detail-heading" },
			h("div", null, h("h4", null, h("span", { className: "caishen-card__icon", "aria-hidden": "true" }, h(CardIcon, { icon: card.icon })), " ", card.title), h("p", null, card.desc)),
			h("button", { type: "button", className: "caishen-editor__button", "aria-pressed": favorite, onClick: () => onFavorite(card.id) }, t(favorite ? "workflow.unfavorite" : "workflow.favorite"))),
		h("div", { className: "caishen-browser__detail-actions" },
			h("button", { type: "button", className: "caishen-editor__button", disabled: blocked, onClick: () => onEdit(card) }, t("card.edit")),
			h("button", { type: "button", className: "caishen-editor__button", disabled: blocked || !canDuplicate, onClick: () => onDuplicate(card) }, t("workflow.duplicate"))),
		h("div", { ref: form, className: "caishen-browser__variables" }, rendered.fields.map((name, index) =>
			h("label", { key: name, className: "caishen-editor__field" }, h("span", null, name, " · ", t("workflow.required")),
				h("textarea", { rows: 2, maxLength: 12000, value: Object.prototype.hasOwnProperty.call(values, name) ? values[name] : "", "data-variable": index,
					"aria-required": "true", "aria-invalid": attempted && rendered.missing.includes(name) ? "true" : undefined,
					"aria-describedby": attempted && rendered.missing.includes(name) ? "caishen-variable-error" : rendered.tooLong ? "caishen-variable-length" : undefined,
					onChange: (event) => { onValues({ ...values, [name]: event.target.value }); setMessage(""); } })))),
		attempted && rendered.missing.length ? h("p", { id: "caishen-variable-error", role: "alert", className: "caishen-editor__error" }, t("workflow.missing"), " ", rendered.missing.join(t("workflow.listSeparator"))) : null,
		rendered.tooLong ? h("p", { id: "caishen-variable-length", role: "alert", className: "caishen-editor__error" }, t("workflow.tooLong")) : null,
		h("h5", null, t("workflow.preview")),
		h("pre", { className: "caishen-browser__preview", tabIndex: 0 }, rendered.text),
		h("div", { className: "caishen-browser__detail-actions" },
			h("button", { type: "button", className: "caishen-editor__button", onClick: copy }, t("workflow.copy")),
			h("button", { type: "button", className: "caishen-editor__button caishen-editor__button--primary", onClick: fill }, t("workflow.fill"))),
		h("p", { className: "caishen-transfer__hint" }, t("workflow.noSend")),
		message ? h("p", { role: message === "workflow.copied" ? "status" : "alert", className: "caishen-transfer__hint" }, t(message)) : null);
}

module.exports = { PromptDetail };
