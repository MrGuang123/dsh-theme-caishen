const KEY = "dsh-theme-caishen:prompt-usage:v1";
const EMPTY = Object.freeze({ favorites: Object.freeze([]), recent: Object.freeze([]) });

function decode(raw) {
	if (raw === null) return EMPTY;
	const value = JSON.parse(raw);
	if (!value || value.version !== 1) throw new Error("version");
	for (const key of ["favorites", "recent"]) {
		if (!Array.isArray(value[key]) || value[key].length > (key === "recent" ? 20 : 128)
			|| value[key].some((id) => typeof id !== "string" || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(id))
			|| new Set(value[key]).size !== value[key].length) throw new Error("invalid");
	}
	return Object.freeze({ favorites: Object.freeze(value.favorites), recent: Object.freeze(value.recent) });
}

/** IDs only: no draft, variable answers, clipboard contents or prompt bodies. */
function createPromptPreferences(key = KEY) {
	let snapshot = EMPTY, rawCache, status = "ready";
	const listeners = new Set();
	function refresh() {
		try {
			const raw = window.localStorage.getItem(key);
			if (raw !== rawCache) { snapshot = decode(raw); rawCache = raw; }
			status = "ready";
		} catch (_) { status = "unavailable"; }
	}
	function emit() { for (const listener of listeners) listener(); }
	function storage(event) { if (event.key === key || event.key === null) { refresh(); emit(); } }
	refresh();
	return {
		get: () => snapshot,
		getStatus: () => status,
		subscribe(listener) {
			if (listeners.size === 0) window.addEventListener("storage", storage);
			listeners.add(listener); refresh();
			return () => { listeners.delete(listener); if (!listeners.size) window.removeEventListener("storage", storage); };
		},
		update(id, kind, availableIds) {
			refresh();
			if (status !== "ready") { emit(); return { ok: false }; }
			const next = { version: 1, favorites: [...snapshot.favorites], recent: [...snapshot.recent] };
			if (Array.isArray(availableIds)) {
				const available = new Set(availableIds);
				next.favorites = next.favorites.filter((value) => available.has(value));
				next.recent = next.recent.filter((value) => available.has(value));
			}
			if (kind === "favorite") {
				if (next.favorites.includes(id)) next.favorites = next.favorites.filter((value) => value !== id);
				else if (next.favorites.length < 128) next.favorites.push(id);
				else return { ok: false };
			} else if (kind === "use") next.recent = [id, ...next.recent.filter((value) => value !== id)].slice(0, 20);
			else return { ok: false };
			try {
				const raw = JSON.stringify(next);
				const decoded = decode(raw);
				window.localStorage.setItem(key, raw);
				rawCache = raw; snapshot = decoded; emit(); return { ok: true };
			} catch (_) { status = "unavailable"; emit(); return { ok: false }; }
		}
	};
}

module.exports = { createPromptPreferences, KEY };
