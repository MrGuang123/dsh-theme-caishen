const { normalizePromptCards } = require("./prompt-model.cjs");

const FORMAT = "dsh-theme-caishen/prompt-cards";
// Accommodate all 128 valid cards at their field limits, including JSON escapes.
const MAX_BACKUP_BYTES = 16 * 1024 * 1024;

function validateList(value) {
	if (!Array.isArray(value)) return { ok: false, error: "invalid" };
	if (value.length > 128) return { ok: false, error: "limit" };
	const result = normalizePromptCards(value);
	return result.ok ? result : { ok: false, error: result.error === "duplicate-id" ? "duplicate-id" : "invalid", detail: result.error };
}

/** Count UTF-8 bytes without requiring Blob or another browser-only dependency. */
function utf8Bytes(text) {
	let size = 0;
	for (const character of text) {
		const point = character.codePointAt(0);
		size += point <= 0x7f ? 1 : point <= 0x7ff ? 2 : point <= 0xffff ? 3 : 4;
		if (size > MAX_BACKUP_BYTES) break;
	}
	return size;
}

/** Pure export preparation: the caller owns downloading and all storage access. */
function createPromptBackup(cards, date = new Date()) {
	const result = validateList(cards);
	if (!result.ok) return result;
	let exportedAt;
	try { exportedAt = new Date(date).toISOString(); }
	catch (_error) { return { ok: false, error: "invalid", detail: "date" }; }
	const backup = { format: FORMAT, version: result.cards.some((card) => card.template === true) ? 2 : 1, exportedAt, cards: result.cards };
	const text = JSON.stringify(backup, null, 2);
	if (utf8Bytes(text) > MAX_BACKUP_BYTES) return { ok: false, error: "limit" };
	return { ok: true, backup, text, cards: result.cards };
}

function parsePromptBackup(text) {
	if (typeof text !== "string") return { ok: false, error: "invalid" };
	if (text.length > MAX_BACKUP_BYTES || utf8Bytes(text) > MAX_BACKUP_BYTES) return { ok: false, error: "limit" };
	let value;
	try { value = JSON.parse(text.replace(/^\uFEFF/, "")); }
	catch (_error) { return { ok: false, error: "invalid-json" }; }
	const legacy = Array.isArray(value);
	if (!legacy) {
		if (!value || typeof value !== "object" || value.format !== FORMAT) return { ok: false, error: "format" };
		if (![1, 2].includes(value.version)) return { ok: false, error: "version" };
		if (typeof value.exportedAt !== "string" || !Number.isFinite(Date.parse(value.exportedAt))) return { ok: false, error: "invalid", detail: "exportedAt" };
	}
	const result = validateList(legacy ? value : value.cards);
	return result.ok ? { ok: true, cards: result.cards, legacy, exportedAt: legacy ? null : value.exportedAt } : result;
}

function planPromptImport(current, incoming, mode) {
	if (mode !== "merge" && mode !== "replace") return { ok: false, error: "invalid", detail: "mode" };
	const existing = validateList(current);
	if (!existing.ok) return existing;
	const imported = validateList(incoming);
	if (!imported.ok) return imported;
	if (mode === "replace") return { ok: true, cards: imported.cards, mode, duplicateCount: 0, addedCount: imported.cards.length };
	const ids = new Set(existing.cards.map((card) => card.id));
	const additions = imported.cards.filter((card) => !ids.has(card.id));
	if (existing.cards.length + additions.length > 128) return { ok: false, error: "limit" };
	return { ok: true, cards: [...existing.cards, ...additions], mode, duplicateCount: imported.cards.length - additions.length, addedCount: additions.length };
}

module.exports = { createPromptBackup, parsePromptBackup, planPromptImport, MAX_BACKUP_BYTES };
