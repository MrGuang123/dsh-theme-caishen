const React = require("react");
const h = React.createElement;
const { getDefaultPromptCards, getLibraryDefaults } = require("../state/prompt-model.cjs");
const { selectPromptCards } = require("../state/prompt-template.cjs");
const { savePromptCard } = require("../state/prompt-mutations.cjs");
const { useDiscardGuard, DiscardChanges } = require("../utils/discard-guard.cjs");
const { PromptDetail } = require("./prompt-detail.cjs");
const { PromptEditor } = require("./prompt-editor.cjs");
const { PromptLibrary } = require("./prompt-library.cjs");

function PromptBrowser({ t, cardStore, preferences, initialCardId, onFill, onCopy, onClose, scope }) {
	const stored = React.useSyncExternalStore(cardStore.subscribe, cardStore.get, cardStore.get);
	const status = React.useSyncExternalStore(cardStore.subscribe, cardStore.getStatus, cardStore.getStatus);
	const usage = React.useSyncExternalStore(preferences.subscribe, preferences.get, preferences.get);
	const preferenceStatus = React.useSyncExternalStore(preferences.subscribe, preferences.getStatus, preferences.getStatus);
	const cards = stored ?? getLibraryDefaults(cardStore, t);
	const [query, setQuery] = React.useState("");
	const [category, setCategory] = React.useState("");
	const [filter, setFilter] = React.useState("all");
	const [selected, setSelected] = React.useState(initialCardId || null);
	const [drafts, setDrafts] = React.useState({});
	const [manage, setManage] = React.useState(false);
	const [editor, setEditor] = React.useState(null);
	const [preferenceError, setPreferenceError] = React.useState(false);
	const dialog = React.useRef(null), search = React.useRef(null);
	const pendingScope = React.useRef(null);
	const blocked = ["corrupt", "unavailable"].includes(status.kind);
	const guard = useDiscardGuard({ dirty: Object.values(drafts).some((fields) => Object.values(fields).some(Boolean)),
		onClose: () => pendingScope.current ? scope.onChange(pendingScope.current) : onClose(), dialog, fallbackSelector: 'input[type="search"]' });
	const closeGuard = { ...guard, keep() { pendingScope.current = null; guard.keep(); } };
	const activeCategory = cards.some((item) => item.tag === category) ? category : "";
	const results = selectPromptCards(cards, { query, category: activeCategory, filter }, usage);
	const card = results.find((item) => item.id === selected);
	React.useEffect(() => { if (category && !activeCategory) setCategory(""); }, [category, activeCategory]);
	React.useEffect(() => {
		const element = dialog.current, previous = document.activeElement;
		element.showModal();
		(element.querySelector("[data-variable]") || search.current)?.focus();
		return () => { if (element.open) element.close(); if (previous?.isConnected) previous.focus({ preventScroll: true }); };
	}, []);
	function favorite(id) { setPreferenceError(!preferences.update(id, "favorite", cards.map((item) => item.id)).ok); }
	function choose(item) { setSelected(item.id); setQuery(""); setCategory(""); setFilter("all"); setManage(false); }
	function edit(item, duplicate) {
		const id = duplicate ? "p-" + (window.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2, 10)) : item.id;
		setEditor({ isNew: duplicate, position: duplicate ? 0 : cards.indexOf(item), card: {
			...item, id, title: duplicate ? item.title.slice(0, 48) + t("workflow.copySuffix").slice(0, 12) : item.title } });
	}
	function save(item, position) {
		const result = savePromptCard(cardStore, getLibraryDefaults(cardStore, t), editor, item, position);
		if (result.ok) { choose(item); setEditor(null); }
		return result;
	}
	function keydown(event) {
		if (event.defaultPrevented || event.isComposing || guard.confirming || event.target.closest("dialog") !== dialog.current) return;
		const target = event.target;
		if (event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey
			&& !target.matches("input, textarea, select, [contenteditable=true]")) {
			event.preventDefault(); search.current?.focus();
		}
		const list = dialog.current?.querySelectorAll("[data-prompt-result]");
		if (target === search.current && ["Enter", "ArrowDown"].includes(event.key)) { event.preventDefault(); list?.[0]?.focus(); }
		const index = Array.from(list || []).indexOf(target);
		if (index >= 0 && ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
			event.preventDefault();
			const next = event.key === "Home" ? 0 : event.key === "End" ? list.length - 1 : Math.max(0, Math.min(list.length - 1, index + (event.key === "ArrowDown" ? 1 : -1)));
			list[next]?.focus();
		}
	}
	return h("dialog", { ref: dialog, className: "caishen-editor caishen-browser", "aria-labelledby": "caishen-browser-title",
		onCancel: (event) => { if (event.target === dialog.current) guard.onCancel(event); },
		onClick: guard.onBackdrop, onFocusCapture: guard.rememberFocus, onKeyDown: keydown },
		h("header", { className: "caishen-editor__header" },
			h("div", null, h("h3", { id: "caishen-browser-title", className: "caishen-editor__heading" }, t("workflow.title")),
				h("p", { className: "caishen-editor__subtitle" }, t("workflow.shortcuts"))),
			h("button", { type: "button", className: "caishen-editor__close", "aria-label": t("workflow.close"), onClick: guard.requestClose }, "×")),
		h("div", { className: "caishen-browser__body", "data-discard-editing": "" },
			scope ? h("div", { className: "caishen-scope" },
				h("label", { className: "caishen-editor__field" }, h("span", null, t("scope.label")),
					h("select", { "aria-label": t("scope.label"), value: scope.kind, onChange: (event) => { pendingScope.current = event.target.value; guard.requestClose(); } },
						h("option", { value: "global" }, t("scope.global")), h("option", { value: "project", disabled: !scope.project }, t("scope.project") + (scope.project ? " · " + scope.project.label : "")))),
				h("p", { className: "caishen-transfer__hint" }, t(scope.kind === "project" ? "scope.projectHint" : "scope.globalHint")),
				scope.kind === "project" && scope.project?.path ? h("p", { className: "caishen-scope__path" }, scope.project.path) : null,
				!scope.project ? h("p", { className: "caishen-transfer__hint" }, t("scope.unavailable")) : null) : null,
			h("div", { className: "caishen-browser__toolbar" },
				h("label", null, h("span", { className: "caishen-sr-only" }, t("workflow.search")),
					h("input", { ref: search, type: "search", value: query, placeholder: t("workflow.search"), onChange: (event) => { setQuery(event.target.value); setManage(false); } })),
				h("label", null, h("span", { className: "caishen-sr-only" }, t("workflow.category")),
					h("select", { value: activeCategory, onChange: (event) => { setCategory(event.target.value); setManage(false); } },
						h("option", { value: "" }, t("workflow.allCategories")), [...new Set(cards.map((item) => item.tag).filter(Boolean))].map((tag) => h("option", { key: tag, value: tag }, tag)))),
				h("button", { type: "button", className: "caishen-editor__button", "aria-pressed": manage, onClick: () => setManage(!manage) }, t("workflow.manage"))),
			h("div", { className: "caishen-browser__filters", role: "group", "aria-label": t("workflow.filter") }, ["all", "favorites", "recent"].map((value) =>
				h("button", { key: value, type: "button", className: "caishen-editor__button", "aria-pressed": filter === value && !manage,
					onClick: () => { setFilter(value); setManage(false); } }, t("workflow." + value)))),
			preferenceError || preferenceStatus !== "ready" ? h("p", { role: "alert", className: "caishen-editor__error" }, t("workflow.preferenceError")) : null,
			!manage && ["corrupt", "unavailable", "quota"].includes(status.kind) ? h("p", { role: "alert", className: "caishen-library__notice" }, t("recovery." + status.kind)) : null,
			h("div", { hidden: !manage }, h(PromptLibrary, { t, cardStore, preferences, full: true, onFill: choose })),
				h("div", { className: "caishen-browser__columns", hidden: manage },
					h("div", { className: "caishen-browser__results" },
						h("p", { role: "status", className: "caishen-transfer__hint" }, results.length, " / ", cards.length),
						results.length ? h("ul", { "aria-label": t("workflow.results") }, results.map((item) => h("li", { key: item.id },
							h("button", { type: "button", "data-prompt-result": item.id, "aria-pressed": selected === item.id,
								onClick: () => setSelected(item.id) }, h("strong", null, usage.favorites.includes(item.id) ? "★ " : "", item.title), h("span", null, item.desc || item.tag))))) :
							h("p", { className: "caishen-library__empty" }, t(cards.length ? "workflow.noResults" : "library.empty"))),
					card ? h(PromptDetail, { key: card.id, card, values: Object.prototype.hasOwnProperty.call(drafts, card.id) ? drafts[card.id] : {},
						onValues: (values) => setDrafts((previous) => ({ ...previous, [card.id]: values })), onFill, onCopy, t, blocked,
						onEdit: (item) => edit(item, false), onDuplicate: (item) => edit(item, true), canDuplicate: cards.length < 128,
						favorite: usage.favorites.includes(card.id), onFavorite: favorite }) :
						h("p", { className: "caishen-browser__placeholder" }, t("workflow.select")))),
		guard.confirming ? h("footer", { className: "caishen-editor__footer" }, h(DiscardChanges, { guard: closeGuard, t, id: "caishen-browser-discard" })) : null,
		editor ? h(PromptEditor, { initial: editor.card, initialPosition: editor.position, isNew: editor.isNew, total: cards.length + (editor.isNew ? 1 : 0),
			t, onSave: save, onClose: () => setEditor(null), onDelete: null }) : null);
}

module.exports = { PromptBrowser };
