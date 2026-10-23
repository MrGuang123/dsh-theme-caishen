const { placePromptCard } = require("./prompt-model.cjs");
const sameCard = (left, right) => ["id", "icon", "tone", "title", "tag", "desc", "prompt", "template"].every((key) => left[key] === right[key]);

/** Re-read before a user action, then protect the write with that exact raw value. */
function currentLibrary(store, defaults) {
	const status = store.retry();
	if (["corrupt", "unavailable"].includes(status.kind)) return { ok: false, error: status.kind };
	return { ok: true, cards: store.get() ?? defaults, raw: status.raw };
}

function savePromptCard(store, defaults, editor, card, position) {
	const current = currentLibrary(store, defaults);
	if (!current.ok) return current;
	const existing = current.cards.find((item) => item.id === card.id);
	if (editor.isNew && current.cards.length >= 128) return { ok: false, error: "limit" };
	if (editor.isNew && existing) return { ok: false, error: "conflict" };
	if (!editor.isNew && !existing) return { ok: false, error: "missing" };
	if (!editor.isNew && !sameCard(existing, editor.card)) return { ok: false, error: "conflict" };
	return store.save(placePromptCard(current.cards, card, position), current.raw);
}

function savePromptOrder(store, defaults, order) {
	const current = currentLibrary(store, defaults);
	if (!current.ok) return current;
	const byId = new Map(current.cards.map((card) => [card.id, card]));
	const ordered = order.map((card) => byId.get(card.id)).filter(Boolean);
	const ids = new Set(ordered.map((card) => card.id));
	return store.save([...ordered, ...current.cards.filter((card) => !ids.has(card.id))], current.raw);
}

function deletePromptCard(store, defaults, initial) {
	const current = currentLibrary(store, defaults);
	if (!current.ok) return current;
	const position = current.cards.findIndex((card) => card.id === initial.id);
	if (position === -1) return { ok: false, error: "missing" };
	if (!sameCard(current.cards[position], initial)) return { ok: false, error: "conflict" };
	const result = store.save(current.cards.filter((card) => card.id !== initial.id), current.raw);
	return result.ok ? { ok: true, deleted: { card: current.cards[position], position } } : result;
}

function restorePromptCard(store, defaults, record) {
	const current = currentLibrary(store, defaults);
	if (!current.ok) return current;
	if (current.cards.some((card) => card.id === record.card.id)) return { ok: false, error: "undoConflict" };
	if (current.cards.length >= 128) return { ok: false, error: "limit" };
	return store.save(placePromptCard(current.cards, record.card, record.position), current.raw);
}

module.exports = { savePromptCard, savePromptOrder, deletePromptCard, restorePromptCard };
