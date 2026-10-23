const React = require("react");
const h = React.createElement;
const { getDefaultPromptCards, getLibraryDefaults } = require("../state/prompt-cards.cjs");
const { savePromptCard, savePromptOrder, deletePromptCard, restorePromptCard } = require("../state/prompt-mutations.cjs");
const { ArrowGlyph } = require("./icons.cjs");
const { Card } = require("./prompt-card.cjs");
const { PromptEditor } = require("./prompt-editor.cjs");
const { PromptTemplates } = require("./prompt-templates.cjs");
const { PromptSorter } = require("./prompt-sorter.cjs");
const { PromptTransfer } = require("./prompt-transfer.cjs");
const { PromptRecovery } = require("./prompt-recovery.cjs");
const { fmt } = require("../utils/presentation.cjs");
const { homePromptCards } = require("../state/prompt-template.cjs");

function PromptLibrary({ t, cardStore, preferences, full = true, filled, onFill, onBrowse }) {
	const stored = React.useSyncExternalStore(cardStore.subscribe, cardStore.get, cardStore.get);
	const status = React.useSyncExternalStore(cardStore.subscribe, cardStore.getStatus, cardStore.getStatus);
	const cards = stored === null ? getLibraryDefaults(cardStore, t) : stored;
	const usage = preferences ? React.useSyncExternalStore(preferences.subscribe, preferences.get, preferences.get) : { favorites: [], recent: [] };
	const visible = full ? cards : homePromptCards(cards, usage);
	const headingId = full ? "caishen-library-manage-title" : "caishen-library-title";
	const blocked = ["corrupt", "unavailable"].includes(status.kind);
	const [editor, setEditor] = React.useState(null);
	const [sorting, setSorting] = React.useState(false);
	const [templatesOpen, setTemplatesOpen] = React.useState(false);
	const [transferOpen, setTransferOpen] = React.useState(false);
	const [deleted, setDeleted] = React.useState([]);
	const [noticeError, setNoticeError] = React.useState("");
	const undoButton = React.useRef(null);
	const rail = React.useRef(null);
	const addButton = React.useRef(null);
	const [edges, setEdges] = React.useState({ prev: false, next: false });
	React.useEffect(() => {
		const element = rail.current;
		if (!element) return undefined;
		function measure() {
			const prev = element.scrollLeft > 2;
			const next = element.scrollWidth - element.clientWidth - element.scrollLeft > 2;
			setEdges((old) => old.prev === prev && old.next === next ? old : { prev, next });
		}
		measure();
		element.addEventListener("scroll", measure, { passive: true });
		window.addEventListener("resize", measure);
		const observer = typeof ResizeObserver === "function" ? new ResizeObserver(measure) : null;
		observer?.observe(element);
		return () => { element.removeEventListener("scroll", measure); window.removeEventListener("resize", measure); observer?.disconnect(); };
	}, [stored, t]);
	function move(direction) {
		const element = rail.current;
		const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
		element?.scrollBy({ left: direction * (element.clientWidth + 12), behavior: reduced ? "auto" : "smooth" });
	}
	function add(template) {
		const id = "p-" + (window.crypto?.randomUUID?.() || Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10));
		const card = template || { icon: "🚀", tone: "red", tag: "", title: "", desc: "", prompt: "" };
		setTemplatesOpen(false);
		setEditor({ isNew: true, position: 0, card: { ...card, id } });
	}
	function save(card, position) {
		const result = savePromptCard(cardStore, getLibraryDefaults(cardStore, t), editor, card, position);
		if (result.ok) {
			setEditor(null);
			window.requestAnimationFrame(() => rail.current?.querySelector('[data-card-id="' + card.id + '"]')?.scrollIntoView({ block: "nearest", inline: "nearest" }));
		}
		return result;
	}
	function saveOrder(order) {
		const result = savePromptOrder(cardStore, getLibraryDefaults(cardStore, t), order);
		if (result.ok) { setSorting(false); window.requestAnimationFrame(() => rail.current?.scrollTo({ left: 0, behavior: "auto" })); }
		return result;
	}
	function remove(id) {
		if (id !== editor.card.id) return { ok: false, error: "missing" };
		const result = deletePromptCard(cardStore, getLibraryDefaults(cardStore, t), editor.card);
		if (result.ok) {
			setDeleted((previous) => [...previous, result.deleted].slice(-128));
			setNoticeError("");
			setEditor(null);
			window.requestAnimationFrame(() => undoButton.current?.focus({ preventScroll: true }));
		}
		return result;
	}
	function undo() {
		const record = deleted[deleted.length - 1];
		if (!record) return;
		const result = restorePromptCard(cardStore, getLibraryDefaults(cardStore, t), record);
		if (!result.ok) { setNoticeError(result.error); return; }
		setDeleted((previous) => previous.slice(0, -1));
		setNoticeError("");
		window.requestAnimationFrame(() => {
			const target = rail.current?.querySelector('[data-card-id="' + record.card.id + '"] .caishen-card__edit');
			target?.focus({ preventScroll: true });
			target?.scrollIntoView({ block: "nearest", inline: "nearest" });
		});
	}
	return h("section", { className: "caishen-library", "aria-labelledby": headingId },
		h("div", { className: "caishen-library__header" },
			h("h3", { id: headingId, className: "caishen-library__heading" }, t(full ? "library.title" : "workflow.common")),
			h("span", { className: "caishen-library__hint" }, t("library.hint")),
			h("div", { className: "caishen-library__controls" },
				!full ? h("button", { type: "button", className: "caishen-library__add", onClick: (event) => onBrowse(event.currentTarget) }, t("workflow.browse")) : null,
				full ? h(React.Fragment, null,
				h("button", { type: "button", className: "caishen-library__add", onClick: () => setTransferOpen(true) }, t("library.transfer")),
				h("button", { type: "button", className: "caishen-library__add", disabled: blocked || cards.length >= 128,
					onClick: () => setTemplatesOpen(true) }, t("library.templates")),
				h("button", { type: "button", className: "caishen-library__add", disabled: blocked || cards.length < 2,
					onClick: () => setSorting(true) }, t("library.sort")),
				h("button", { type: "button", className: "caishen-library__nav", "data-direction": "prev", disabled: !edges.prev,
					"aria-label": t("library.prev"), onClick: () => move(-1) }, h(ArrowGlyph, { size: 12 })),
				h("button", { type: "button", className: "caishen-library__nav", "data-direction": "next", disabled: !edges.next,
					"aria-label": t("library.next"), onClick: () => move(1) }, h(ArrowGlyph, { size: 12 })),
				h("button", { type: "button", ref: addButton, className: "caishen-library__add", disabled: blocked || cards.length >= 128,
					onClick: () => add() }, "+ ", t("library.add"))) : null)),
		h(PromptRecovery, { cardStore, status, t }),
		deleted.length ? h("div", { className: "caishen-library__notice caishen-library__undo", role: "status" },
			h("span", null, fmt(t("undo.message"), { title: deleted[deleted.length - 1].card.title })),
			h("button", { ref: undoButton, type: "button", className: "caishen-editor__button", onClick: undo, disabled: blocked }, t("undo.restore")),
			h("button", { type: "button", className: "caishen-editor__button", onClick: () => {
				setDeleted([]); setNoticeError(""); addButton.current?.focus({ preventScroll: true });
			} }, t("undo.dismiss"))) : null,
		noticeError ? h("p", { className: "caishen-library__notice-error", role: "alert" }, t(noticeError === "undoConflict" ? "undo.error.conflict" : "editor.error." + noticeError)) : null,
		h("div", { className: "caishen-cards", ref: rail, role: "list", tabIndex: 0, "aria-label": t("library.title"),
			onKeyDown: (event) => { if (event.target === event.currentTarget && ["ArrowLeft", "ArrowRight"].includes(event.key)) {
				event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1);
			} } }, visible.map((card) => h(Card, { key: card.id, card, t, filled: filled === card.id, onFill: (event) => onFill(card, event?.currentTarget),
				onEdit: () => setEditor({ isNew: false, position: cards.indexOf(card), card }) }))),
		cards.length === 0 ? h("div", { className: "caishen-library__empty" }, t("library.empty")) : null,
		editor ? h(PromptEditor, { key: editor.card.id, initial: editor.card, initialPosition: editor.position,
			total: cards.length + (editor.isNew ? 1 : 0), isNew: editor.isNew, t, onSave: save, onDelete: remove, onClose: () => setEditor(null) }) : null,
		templatesOpen ? h(PromptTemplates, { templates: [...getDefaultPromptCards(t), {
			id: "variable-planning", icon: "💡", tone: "gold", title: t("workflow.starterTitle"), tag: t("workflow.starterTag"),
			desc: t("workflow.starterDesc"), prompt: t("workflow.starterPrompt"), template: true
		}], t, onUse: add, onClose: () => setTemplatesOpen(false) }) : null,
		transferOpen ? h(PromptTransfer, { cards, cardStore, t, onClose: () => setTransferOpen(false) }) : null,
		sorting ? h(PromptSorter, { cards, t, onSave: saveOrder, onClose: () => setSorting(false) }) : null);
}

module.exports = { PromptLibrary };
