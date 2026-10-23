const { LAYER } = require("../config.cjs");
const KEY = LAYER + ":merit";
function parseMerit(raw) {
	if (raw === null) return 0;
	if (typeof raw !== "string" || !/^\d{1,16}$/.test(raw)) return null;
	const count = Number(raw);
	return Number.isSafeInteger(count) ? count : null;
}
/** Web Locks serialize cooperating windows. Without it, clicks stay explicitly local. */
function createMeritStore() {
	let value = 0, pending = 0, status = Object.freeze({ kind: "ready", raw: null, pending: 0 });
	const listeners = new Set();
	function emit(kind, raw, count = value) {
		value = count;
		if (status.kind !== kind || status.raw !== raw || status.pending !== pending) status = Object.freeze({ kind, raw, pending });
		for (const fn of listeners) { try { fn(); } catch (_) { /* Subscriber isolation. */ } }
	}
	function read() {
		try {
			const raw = window.localStorage.getItem(KEY), count = parseMerit(raw);
			if (count === null) { emit("corrupt", raw); return { ok: false, error: "corrupt", raw }; }
			if (!Number.isSafeInteger(count + pending)) { emit("limit", raw); return { ok: false, error: "limit", raw }; }
			emit(pending ? "pending" : "ready", raw, count + pending);
			return { ok: true, raw, count };
		} catch (_) { emit("unavailable", status.raw); return { ok: false, error: "unavailable" }; }
	}
	function storage(event) { if (event.key === KEY || event.key === null) read(); }
	function locked(action, fallback) {
		try {
			const locks = window.navigator?.locks;
			if (!locks?.request) return fallback();
			return Promise.resolve(locks.request(KEY, { mode: "exclusive" }, action)).catch(() => fallback("unavailable"));
		} catch (_) { return fallback(); }
	}
	function local(amount, reason) {
		if (!Number.isSafeInteger(value + amount)) return { ok: false, error: "limit" };
		pending += amount; emit(reason, status.raw, value + amount);
		return { ok: false, error: reason, local: true };
	}
	function update(amount) {
		return locked(() => {
			const current = read();
			if (!current.ok) return local(amount, current.error);
			const next = current.count + pending + amount;
			if (!Number.isSafeInteger(next)) return { ok: false, error: "limit" };
			try {
				if (window.localStorage.getItem(KEY) !== current.raw) return local(amount, "conflict");
				window.localStorage.setItem(KEY, String(next));
				pending = 0; emit("ready", String(next), next); return { ok: true };
			} catch (error) { return local(amount, error?.name === "QuotaExceededError" ? "quota" : "unavailable"); }
		}, (reason) => local(amount, reason || "volatile"));
	}
	read();
	return {
		get: () => value, getStatus: () => status,
		subscribe(fn) {
			if (!listeners.size && typeof window.addEventListener === "function") window.addEventListener("storage", storage);
			listeners.add(fn); read();
			return () => { listeners.delete(fn); if (!listeners.size && typeof window.removeEventListener === "function") window.removeEventListener("storage", storage); };
		},
		add(amount = 1) { return Number.isSafeInteger(amount) && amount > 0 ? update(amount) : { ok: false, error: "invalid" }; },
		retry() { return pending ? update(0) : read(); },
		reset(expectedRaw) {
			return locked(() => {
				const current = read();
				if (current.error === "unavailable") return current;
				if (current.raw !== expectedRaw) return { ok: false, error: "conflict" };
				try {
					if (current.error === "corrupt") window.localStorage.setItem(KEY + ":recovery:v1", current.raw);
					if (window.localStorage.getItem(KEY) !== expectedRaw) return { ok: false, error: "conflict" };
					window.localStorage.setItem(KEY, "0"); pending = 0; emit("ready", "0", 0); return { ok: true };
				} catch (error) { const kind = error?.name === "QuotaExceededError" ? "quota" : "unavailable"; emit(kind, status.raw); return { ok: false, error: kind }; }
			}, () => { emit("volatile", status.raw); return { ok: false, error: "volatile" }; });
		}
	};
}
function meritMilestone(count) { return [1000, 100, 10, 1].find((n) => count >= n) || 0; }
function dailyFortune(date = new Date()) {
	const day = [date.getFullYear(), date.getMonth() + 1, date.getDate()].map((n, i) => i ? String(n).padStart(2, "0") : n).join("-");
	return { day, index: [...day].reduce((n, c) => n * 31 + c.charCodeAt(0) >>> 0, 0) % 5 };
}
module.exports = { KEY, parseMerit, createMeritStore, meritMilestone, dailyFortune };
