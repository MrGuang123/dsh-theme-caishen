const KEY = "dsh-theme-caishen:appearance:v1";
const DEFAULTS = Object.freeze({ layout: "auto", decoration: "subtle", illustrations: true, easterEggs: true, focus: false, palette: "classic" });
const OPTIONS = Object.freeze({ layout: ["auto", "full", "compact"], decoration: ["full", "subtle", "none"], palette: ["classic", "jade", "ink"] });

function validateAppearance(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return null;
	const result = {};
	for (const name of Object.keys(DEFAULTS)) {
		if (OPTIONS[name] ? !OPTIONS[name].includes(value[name]) : typeof value[name] !== "boolean") return null;
		result[name] = value[name];
	}
	return Object.freeze(result);
}

/** Focus is an effective override; turning it off restores the user's choices. */
function resolveAppearance(value) {
	return value.focus ? { ...value, layout: "compact", decoration: "none", illustrations: false, easterEggs: false } : value;
}

function createAppearanceStore() {
	let saved = DEFAULTS, preview = null, owner = null;
	let status = Object.freeze({ kind: "missing", raw: null });
	const listeners = new Set();
	function setStatus(kind, raw) {
		if (status.kind !== kind || status.raw !== raw) status = Object.freeze({ kind, raw });
	}
	function read() {
		try {
			const raw = window.localStorage.getItem(KEY);
			if (raw === null) { saved = DEFAULTS; setStatus("missing", null); return; }
			try {
				const data = raw.length <= 4096 ? JSON.parse(raw) : null;
				const settings = data?.version === 1 ? validateAppearance(data) : null;
				if (!settings) throw Error("invalid");
				if (status.raw !== raw || ["corrupt", "unavailable"].includes(status.kind)) saved = settings;
				setStatus("ready", raw);
			} catch (_) { setStatus("corrupt", raw); }
		} catch (_) { setStatus("unavailable", status.raw); }
	}
	function emit() { for (const listener of listeners) listener(); }
	function storage(event) { if (event.key === KEY || event.key === null) { read(); emit(); } }
	read();
	return {
		get: () => preview || saved,
		getSaved: () => saved,
		getStatus: () => status,
		subscribe(listener) {
			if (!listeners.size) window.addEventListener("storage", storage);
			listeners.add(listener); read();
			return () => { listeners.delete(listener); if (!listeners.size) window.removeEventListener("storage", storage); };
		},
		retry() { read(); emit(); return status; },
		preview(value, token) {
			if (owner && owner !== token) return { ok: false, error: "busy" };
			const normalized = validateAppearance(value);
			if (!normalized) return { ok: false, error: "invalid" };
			owner = token; preview = normalized; emit(); return { ok: true };
		},
		cancel(token) { if (owner !== token) return; owner = null; preview = null; emit(); },
		save(value, expectedRaw, token) {
			if (owner && owner !== token) return { ok: false, error: "busy" };
			const normalized = validateAppearance(value);
			if (!normalized) return { ok: false, error: "invalid" };
			read();
			if (["corrupt", "unavailable"].includes(status.kind)) { emit(); return { ok: false, error: status.kind }; }
			if (status.raw !== expectedRaw) { emit(); return { ok: false, error: "conflict" }; }
			try {
				const raw = JSON.stringify({ version: 1, ...normalized });
				window.localStorage.setItem(KEY, raw);
				saved = normalized; owner = null; preview = null; setStatus("ready", raw); emit(); return { ok: true };
			} catch (error) {
				const kind = error?.name === "QuotaExceededError" ? "quota" : "unavailable";
				setStatus(kind, status.raw); emit(); return { ok: false, error: kind };
			}
		}
	};
}

module.exports = { KEY, DEFAULTS, OPTIONS, validateAppearance, resolveAppearance, createAppearanceStore };
