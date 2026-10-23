const React = require("react");
const h = React.createElement;
const { DEFAULTS, OPTIONS } = require("../state/appearance.cjs");
const { useDiscardGuard, DiscardChanges } = require("../utils/discard-guard.cjs");
const { SlidersGlyph } = require("./icons.cjs");

function AppearanceSettings({ t, store, onClose }) {
	const [initial] = React.useState(() => ({ settings: store.getSaved(), raw: store.getStatus().raw }));
	const [draft, setDraft] = React.useState(initial.settings);
	const [error, setError] = React.useState("");
	const status = React.useSyncExternalStore(store.subscribe, store.getStatus, store.getStatus);
	const owner = React.useRef({}), dialog = React.useRef(null);
	const dirty = Object.keys(DEFAULTS).some((name) => draft[name] !== initial.settings[name]);
	const guard = useDiscardGuard({ dirty, onClose, dialog, fallbackSelector: '[name="layout"]' });
	React.useEffect(() => {
		const result = store.preview(draft, owner.current);
		if (!result.ok) setError(result.error);
	}, [draft, store]);
	React.useEffect(() => {
		const element = dialog.current, previous = document.activeElement, token = owner.current;
		element.showModal();
		element.querySelector('[name="layout"]')?.focus();
		return () => { if (element.open) element.close(); store.cancel(token); if (previous?.isConnected) previous.focus({ preventScroll: true }); };
	}, []);
	function update(name, value) { setDraft((old) => ({ ...old, [name]: value })); setError(""); }
	function save(event) {
		event.preventDefault();
		if (guard.confirming) return;
		const result = store.save(draft, initial.raw, owner.current);
		if (result.ok) onClose(); else setError(result.error);
	}
	function select(name) {
		return h("label", { className: "caishen-editor__field" }, h("span", null, t("appearance." + name)),
			h("select", { name, "aria-label": t("appearance." + name), value: draft[name], disabled: draft.focus && name !== "palette", onChange: (event) => update(name, event.target.value) },
				OPTIONS[name].map((value) => h("option", { key: value, value }, t("appearance." + name + "." + value)))));
	}
	function toggle(name) {
		return h("label", { className: "caishen-appearance__toggle" },
			h("input", { name, type: "checkbox", checked: draft[name], disabled: draft.focus && name !== "focus", onChange: (event) => update(name, event.target.checked) }),
			h("span", null, t("appearance." + name)));
	}
	const issue = error || (["corrupt", "unavailable"].includes(status.kind) ? status.kind : status.raw !== initial.raw ? "conflict" : "");
	return h("dialog", { ref: dialog, className: "caishen-editor caishen-appearance", "aria-labelledby": "caishen-appearance-title",
		onCancel: guard.onCancel, onClick: guard.onBackdrop, onFocusCapture: guard.rememberFocus },
		h("form", { className: "caishen-editor__form", onSubmit: save },
			h("header", { className: "caishen-editor__header" },
				h("div", null, h("h3", { id: "caishen-appearance-title", className: "caishen-editor__heading" }, t("appearance.title")), h("p", { className: "caishen-editor__subtitle" }, t("appearance.preview"))),
				h("button", { type: "button", className: "caishen-editor__close", "aria-label": t("appearance.close"), onClick: guard.requestClose }, "×")),
			h("div", { className: "caishen-appearance__body", "data-discard-editing": "" },
				h("div", { className: "caishen-appearance__options" }, select("layout"), select("decoration"), select("palette")),
				toggle("illustrations"), toggle("easterEggs"), toggle("focus"),
				h("p", { className: "caishen-transfer__hint" }, t("appearance.focusHint")),
				h("p", { className: "caishen-transfer__hint" }, t("appearance.artHint")),
				h("button", { type: "button", className: "caishen-editor__button", onClick: () => { setDraft(DEFAULTS); setError(""); } }, t("appearance.reset"))),
			h("footer", { className: "caishen-editor__footer" }, guard.confirming ? h(DiscardChanges, { guard, t, id: "caishen-appearance-discard" }) : h(React.Fragment, null,
				issue ? h("p", { id: "caishen-appearance-error", role: "alert", className: "caishen-editor__error" }, t("appearance.error." + issue)) : null,
				h("span", { className: "caishen-editor__footer-spacer" }),
				h("button", { type: "button", className: "caishen-editor__button", onClick: guard.requestClose }, t("editor.cancel")),
				h("button", { type: "submit", className: "caishen-editor__button caishen-editor__button--primary", disabled: error === "busy", "aria-describedby": issue ? "caishen-appearance-error" : undefined }, t("appearance.save"))))));
}

function AppearanceEntry({ t, store }) {
	const [open, setOpen] = React.useState(false);
	return h(React.Fragment, null,
		h("button", { type: "button", className: "caishen-prompt-entry caishen-appearance-entry", "aria-haspopup": "dialog", "aria-label": t("appearance.title"), title: t("appearance.title"),
			onClick: () => { store.retry(); setOpen(true); } }, h(SlidersGlyph), h("span", { className: "caishen-entry-label" }, t("appearance.title"))),
		open ? h(AppearanceSettings, { t, store, onClose: () => setOpen(false) }) : null);
}
module.exports = { AppearanceSettings, AppearanceEntry };
