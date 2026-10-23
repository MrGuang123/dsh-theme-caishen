const { CARD_TONES } = require("../config.cjs");
const { templateFields } = require("./prompt-template.cjs");

/** Localized defaults stay live until the user explicitly saves an override. */
function getDefaultPromptCards(t) {
	return [
		["debug", "🐞", "red"],
		["feature", "🛠️", "gold"],
		["review", "🔍", "blue"],
		["tests", "🧪", "green"],
		["explain", "📖", "teal"],
		["refactor", "🧹", "purple"],
		["performance", "⚡", "rose"],
		["summary", "📝", "brown"]
	].map(([id, icon, tone]) => ({
		id,
		icon,
		tone,
		tag: t("card." + id + ".tag"),
		title: t("card." + id + ".title"),
		desc: t("card." + id + ".desc"),
		prompt: t("card." + id + ".prompt")
	}));
}

/** Restrict custom artwork to one emoji; arbitrary image URLs never enter the UI. */
function isPromptCardIcon(value) {
	if (typeof value !== "string" || value.length > 64) return false;
	if (["cost", "debt", "report", "merge"].includes(value)) return true;
	return /^(?:\p{Regional_Indicator}{2}|[0-9#*]\uFE0F?\u20E3|\p{Extended_Pictographic}\uFE0F?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}\uFE0F?(?:\p{Emoji_Modifier})?)*)$/u.test(value);
}

/** Field names are stable validation codes, independent of the active locale. */
function validateCard(value) {
	if (value === null || typeof value !== "object" || Array.isArray(value)) {
		return { ok: false, error: "object" };
	}
	try {
		const id = typeof value.id === "string" ? value.id.trim() : "";
		if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(id)) return { ok: false, error: "id" };
		const icon = typeof value.icon === "string" ? value.icon.trim() : "";
		if (!isPromptCardIcon(icon)) return { ok: false, error: "icon" };
		const tone = typeof value.tone === "string" ? value.tone.trim() : "";
		if (!CARD_TONES.includes(tone)) return { ok: false, error: "tone" };
		const text = {};
		for (const [field, max] of [["title", 60], ["tag", 24], ["desc", 180], ["prompt", 12000]]) {
			const raw = value[field];
			if (typeof raw !== "string") return { ok: false, error: field };
			const normalized = field === "prompt" ? raw : raw.trim();
			if (normalized.length > max || ((field === "title" || field === "prompt") && !normalized.trim())) {
				return { ok: false, error: field };
			}
			if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(normalized)) return { ok: false, error: field };
			text[field] = normalized;
		}
		if (value.template !== undefined && typeof value.template !== "boolean") return { ok: false, error: "template" };
		if (value.template === true && (templateFields(text.prompt).length === 0 || templateFields(text.prompt).length > 16)) return { ok: false, error: "template" };
		return { ok: true, card: { id, icon, tone, ...text, ...(value.template === true ? { template: true } : {}) } };
	} catch (_error) {
		return { ok: false, error: "object" };
	}
}

function normalizePromptCards(value) {
	if (!Array.isArray(value) || value.length > 128) return { ok: false, error: "cards" };
	const cards = [];
	const ids = new Set();
	for (const candidate of value) {
		const result = validateCard(candidate);
		if (!result.ok) return result;
		if (ids.has(result.card.id)) return { ok: false, error: "duplicate-id" };
		ids.add(result.card.id);
		cards.push(result.card);
	}
	return { ok: true, cards };
}

/** Place a new or edited card without changing the caller's array or records. */
function placePromptCard(cards, card, position) {
	const next = cards.filter((existing) => existing.id !== card.id);
	const index = Number.isFinite(position) ? Math.max(0, Math.min(next.length, Math.trunc(position))) : next.length;
	next.splice(index, 0, card);
	return next;
}

/** Reorder an existing card only; callers decide when to persist the result. */
function movePromptCard(cards, id, position) {
	const card = cards.find((existing) => existing.id === id);
	return card ? placePromptCard(cards, card, position) : cards.slice();
}

function getLibraryDefaults(store, t) { return store.scope?.kind === "project" ? [] : getDefaultPromptCards(t); }

module.exports = { getLibraryDefaults, getDefaultPromptCards, isPromptCardIcon, validateCard, normalizePromptCards, placePromptCard, movePromptCard };
