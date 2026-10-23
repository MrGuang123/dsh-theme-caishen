const React = require("react");
const h = React.createElement;
const { fmt } = require("../utils/presentation.cjs");
const { meritMilestone, dailyFortune } = require("../state/merit.cjs");
const { BookGlyph } = require("./icons.cjs");
function MeritPanel({ t, merit, onClose }) {
	const count = React.useSyncExternalStore(merit.subscribe, merit.get, merit.get);
	const status = React.useSyncExternalStore(merit.subscribe, merit.getStatus, merit.getStatus);
	const [fortune] = React.useState(() => dailyFortune());
	const [confirm, setConfirm] = React.useState(null), [error, setError] = React.useState(""), [busy, setBusy] = React.useState(false);
	const dialog = React.useRef(null), keep = React.useRef(null);
	React.useEffect(() => {
		const element = dialog.current, previous = document.activeElement; element.showModal();
		return () => { if (element.open) element.close(); if (previous?.isConnected) previous.focus({ preventScroll: true }); };
	}, []);
	React.useEffect(() => { if (confirm) keep.current?.focus(); }, [confirm]);
	async function reset() {
		setBusy(true); const result = await merit.reset(confirm.raw); setBusy(false);
		if (result.ok) { setConfirm(null); setError(""); } else setError(result.error);
	}
	function cancel(event) { event.preventDefault(); if (busy) return; if (confirm) { setConfirm(null); setError(""); } else onClose(); }
	return h("dialog", { ref: dialog, className: "caishen-editor caishen-merit-panel", "aria-labelledby": "caishen-merit-title", onCancel: cancel },
		h("header", { className: "caishen-editor__header" }, h("h3", { id: "caishen-merit-title", className: "caishen-editor__heading" }, t("journal.title")),
			h("button", { type: "button", className: "caishen-editor__close", disabled: busy, "aria-label": t("journal.close"), onClick: onClose }, "×")),
		h("div", { className: "caishen-merit-panel__body" },
			h("p", null, fmt(t("journal.total"), { count })), h("p", null, t("journal.milestone." + meritMilestone(count))),
			h("section", { className: "caishen-library__notice" }, h("h4", null, t("journal.daily"), " · ", fortune.day), h("p", null, t("journal.fortune." + fortune.index))),
			h("p", { className: "caishen-transfer__hint" }, t("journal.disclaimer")),
			status.kind !== "ready" ? h("p", { role: "status", className: "caishen-editor__error" }, t("journal.error." + status.kind)) : null,
			error ? h("p", { role: "alert", className: "caishen-editor__error" }, t("journal.error." + error)) : null),
		h("footer", { className: "caishen-editor__footer" }, confirm ? h(React.Fragment, null,
			h("p", { className: "caishen-editor__delete-message", role: "alert" }, t("journal.confirmHint")),
			h("button", { ref: keep, type: "button", className: "caishen-editor__button", disabled: busy, onClick: () => { setConfirm(null); setError(""); } }, t("journal.keep")),
			h("button", { type: "button", className: "caishen-editor__button caishen-editor__button--danger", disabled: busy, onClick: reset }, t("journal.confirm"))) : h(React.Fragment, null,
			h("button", { type: "button", className: "caishen-editor__button", disabled: busy, onClick: async () => { setBusy(true); const result = await merit.retry(); setBusy(false); setError(result.ok ? "" : result.error); } }, t("journal.retry")),
			h("button", { type: "button", className: "caishen-editor__button caishen-editor__button--danger", disabled: busy, onClick: async () => { setBusy(true); await merit.retry(); setBusy(false); setConfirm({ raw: merit.getStatus().raw }); setError(""); } }, t("journal.reset")))));
}
function MeritEntry({ t, merit }) {
	const [open, setOpen] = React.useState(false);
	return h(React.Fragment, null, h("button", { type: "button", className: "caishen-merit-entry", "aria-label": t("journal.title"), "aria-haspopup": "dialog", "aria-expanded": open, onClick: () => setOpen(true) },
		h("span", { className: "caishen-merit-entry__seal", "aria-hidden": "true" }, h(BookGlyph)),
		h("span", { className: "caishen-merit-entry__label" }, t("journal.title"))),
		open ? h(MeritPanel, { t, merit, onClose: () => setOpen(false) }) : null);
}
module.exports = { MeritEntry, MeritPanel };
