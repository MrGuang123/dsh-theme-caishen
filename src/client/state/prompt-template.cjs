/** Explicitly enabled, literal templates. No expressions, HTML or code execution. */
function templateFields(prompt) {
	const fields = [];
	const seen = new Set();
	for (const match of prompt.matchAll(/(?<!\\)\{\{([^{}\r\n]{1,40})\}\}/gu)) {
		const name = match[1].trim();
		if (!name || seen.has(name)) continue;
		seen.add(name);
		fields.push(name);
	}
	return fields;
}

function renderPromptTemplate(card, values = {}) {
	if (card.template !== true) return { ok: true, text: card.prompt, fields: [], missing: [] };
	const fields = templateFields(card.prompt);
	const answer = (name) => Object.prototype.hasOwnProperty.call(values || {}, name) && typeof values[name] === "string" ? values[name] : "";
	const missing = fields.filter((name) => !answer(name).trim());
	const text = card.prompt.replace(/\\(\{\{[^{}\r\n]{1,40}\}\})|(?<!\\)\{\{([^{}\r\n]{1,40})\}\}/gu, (literal, escaped, raw) => {
		if (escaped) return escaped;
		const name = raw.trim();
		return fields.includes(name) && answer(name).trim() ? answer(name) : literal;
	});
	return { ok: missing.length === 0 && text.length <= 12000, text, fields, missing, tooLong: text.length > 12000 };
}

/** Tag doubles as the user's editable category. Filtering never changes source order. */
function selectPromptCards(cards, { query = "", category = "", filter = "all" } = {}, preferences = { favorites: [], recent: [] }) {
	const terms = query.trim().toLocaleLowerCase().split(/\s+/u).filter(Boolean);
	const favorite = new Set(preferences.favorites);
	const recent = new Set(preferences.recent);
	const result = cards.filter((card) => (!category || card.tag === category)
		&& (filter !== "favorites" || favorite.has(card.id)) && (filter !== "recent" || recent.has(card.id))
		&& terms.every((term) => [card.title, card.desc, card.prompt].join("\n").toLocaleLowerCase().includes(term)));
	if (filter === "recent") return result.slice().sort((a, b) => preferences.recent.indexOf(a.id) - preferences.recent.indexOf(b.id));
	return result;
}

function homePromptCards(cards, preferences) {
	const byId = new Map(cards.map((card) => [card.id, card]));
	return [...new Set([...preferences.favorites, ...preferences.recent, ...cards.map((card) => card.id)])]
		.map((id) => byId.get(id)).filter(Boolean).slice(0, 6);
}

module.exports = { templateFields, renderPromptTemplate, selectPromptCards, homePromptCards };
