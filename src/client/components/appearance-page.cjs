const React = require("react");
const h = React.createElement;
const { DEFAULTS, OPTIONS } = require("../state/appearance.cjs");

function baseline(store) { return { settings: store.getSaved(), raw: store.getStatus().raw }; }

/** A normal settings section: its preview is released when the host navigates away. */
function AppearancePage({ t, store }) {
	const [initial, setInitial] = React.useState(() => baseline(store));
	const [draft, setDraft] = React.useState(initial.settings);
	const [error, setError] = React.useState("");
	const [notice, setNotice] = React.useState("");
	const status = React.useSyncExternalStore(store.subscribe, store.getStatus, store.getStatus);
	const owner = React.useRef({}), id = React.useId();
	const dirty = Object.keys(DEFAULTS).some((name) => draft[name] !== initial.settings[name]);
	React.useEffect(() => {
		if (!dirty) { store.cancel(owner.current); return; }
		const result = store.preview(draft, owner.current);
		if (!result.ok) setError(result.error);
	}, [draft, dirty, store]);
	React.useEffect(() => {
		const token = owner.current;
		return () => store.cancel(token);
	}, [store]);
	function update(name, value) { setDraft((old) => ({ ...old, [name]: value })); setError(""); setNotice(""); }
	function restoreSaved() {
		store.cancel(owner.current);
		store.retry();
		const next = baseline(store);
		setInitial(next); setDraft(next.settings); setError(""); setNotice("restored");
	}
	function save(event) {
		event.preventDefault();
		const result = store.save(draft, initial.raw, owner.current);
		if (!result.ok) { setError(result.error); setNotice(""); return; }
		const next = baseline(store);
		setInitial(next); setDraft(next.settings); setError(""); setNotice("saved");
	}
	function select(name) {
		return h("label", { className: "caishen-appearance-page__field", htmlFor: id + "-" + name },
			h("span", null, t("appearance." + name)),
			h("select", { id: id + "-" + name, name, "aria-label": t("appearance." + name), value: draft[name], disabled: draft.focus && name !== "palette",
				onChange: (event) => update(name, event.target.value) },
				OPTIONS[name].map((value) => h("option", { key: value, value }, t("appearance." + name + "." + value)))));
	}
	function toggle(name, hint) {
		return h("label", { className: "caishen-appearance-page__toggle", htmlFor: id + "-" + name },
			h("span", { className: "caishen-appearance-page__toggle-copy" },
				h("span", null, t("appearance." + name)),
				hint ? h("small", { id: id + "-" + name + "-hint" }, t(hint)) : null),
			h("input", { id: id + "-" + name, name, type: "checkbox", "aria-label": t("appearance." + name), checked: draft[name],
				disabled: draft.focus && name !== "focus", "aria-describedby": hint ? id + "-" + name + "-hint" : undefined,
				onChange: (event) => update(name, event.target.checked) }));
	}
	const issue = error || (["corrupt", "unavailable"].includes(status.kind) ? status.kind : status.raw !== initial.raw ? "conflict" : "");
	return h("section", { className: "caishen-appearance-page", "aria-labelledby": id + "-title" },
		h("header", { className: "caishen-appearance-page__header" },
			h("span", { className: "caishen-appearance-page__mark", "aria-hidden": "true" }, "财"),
			h("div", null, h("h2", { id: id + "-title" }, t("appearance.title")),
				h("p", null, t("appearance.page.preview")))),
		h("form", { className: "caishen-appearance-page__form", onSubmit: save },
			h("fieldset", { className: "caishen-appearance-page__group" },
				h("legend", null, t("appearance.page.home")), select("layout"), select("decoration"), toggle("illustrations")),
			h("fieldset", { className: "caishen-appearance-page__group" },
				h("legend", null, t("appearance.page.details")), select("palette"), toggle("easterEggs")),
			h("div", { className: "caishen-appearance-page__focus" }, toggle("focus", "appearance.focusHint")),
			h("p", { className: "caishen-appearance-page__hint" }, t("appearance.artHint")),
			h("div", { className: "caishen-appearance-page__feedback", "aria-live": "polite" },
				issue ? h("p", { role: "alert", className: "caishen-appearance-page__error" }, t(issue === "conflict" ? "appearance.page.conflict" : "appearance.error." + issue)) :
					h("p", { role: "status" }, notice ? t("appearance.page." + notice) : dirty ? t("appearance.page.unsaved") : t("appearance.page.current"))),
			h("footer", { className: "caishen-appearance-page__footer" },
				h("button", { type: "button", className: "caishen-appearance-page__button caishen-appearance-page__defaults",
					onClick: () => { setDraft(DEFAULTS); setError(""); setNotice(""); } }, t("appearance.reset")),
				h("span", { className: "caishen-appearance-page__actions" },
					h("button", { type: "button", className: "caishen-appearance-page__button", onClick: restoreSaved }, t("editor.cancel")),
					h("button", { type: "submit", className: "caishen-appearance-page__button caishen-appearance-page__button--primary", disabled: !dirty && !issue }, t("appearance.save"))))));
}

module.exports = { AppearancePage };
