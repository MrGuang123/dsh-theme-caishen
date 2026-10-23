const { LAYER } = require("../config.cjs");
const { normalizePromptCards } = require("./prompt-model.cjs");

/** Preserve the last valid list; recovery is a separate, explicit write path. */
function createPromptCardStore(options = {}) {
	const key = options.key || LAYER + ":prompt-cards:v1";
	const recoveryKey = options.recoveryKey || LAYER + ":prompt-cards:recovery:v1";
	let snapshot = null;
	let serialized = null;
	let status = Object.freeze({ kind: "missing", raw: null });
	let recoveryRaw = null;
	let lastCorruptRaw = null;
	let listening = false;
	const listeners = new Set();

	function publish(kind, raw, cards) {
		let changed = false;
		if (cards !== undefined) {
			const json = cards === null ? null : JSON.stringify(cards);
			if (serialized !== json) {
				snapshot = cards === null ? null : Object.freeze(cards.map((card) => Object.freeze(card)));
				serialized = json;
				changed = true;
			}
		}
		if (status.kind !== kind || status.raw !== raw) {
			status = Object.freeze({ kind, raw });
			changed = true;
		}
		if (changed) for (const listener of listeners) {
			try { listener(); } catch (_error) { /* Isolate failed subscribers. */ }
		}
	}

	function readStored() {
		let raw;
		try { raw = window.localStorage.getItem(key); }
		catch (_error) {
			publish("unavailable", status.raw);
			return { ok: false, error: "unavailable" };
		}
		if (raw === null) {
			publish(status.kind === "quota" && status.raw === null ? "quota" : "missing", null, options.empty ?? null);
			return { ok: true, raw, kind: "missing" };
		}
		try {
			const result = normalizePromptCards(JSON.parse(raw));
			if (result.ok) {
				publish(status.kind === "quota" && status.raw === raw ? "quota" : "ready", raw, result.cards);
				return { ok: true, raw, kind: "ready" };
			}
		} catch (_error) { /* Retain both invalid bytes and the last valid snapshot. */ }
		lastCorruptRaw = raw;
		publish("corrupt", raw);
		return { ok: false, error: "corrupt", raw };
	}

	function failedWrite(error) {
		const name = error && error.name;
		const quota = name === "QuotaExceededError" || name === "NS_ERROR_DOM_QUOTA_REACHED" || error?.code === 22 || error?.code === 1014;
		const code = quota ? "quota" : name === "SecurityError" || name === "NotAllowedError" ? "unavailable" : "storage";
		publish(quota ? "quota" : "unavailable", status.raw);
		return { ok: false, error: code };
	}

	function write(cards) {
		const json = JSON.stringify(cards);
		try { window.localStorage.setItem(key, json); }
		catch (error) { return failedWrite(error); }
		publish("ready", json, cards);
		return { ok: true };
	}

	function onStorage(event) {
		if (event.key !== key && event.key !== null) return;
		try { if (event.storageArea && event.storageArea !== window.localStorage) return; }
		catch (_error) { return; }
		readStored();
	}

	readStored();
	return {
		get: () => snapshot,
		getStatus: () => status,
		retry: () => { readStored(); return status; },
		subscribe(listener) {
			const subscription = () => listener();
			listeners.add(subscription);
			if (!listening && typeof window.addEventListener === "function") {
				window.addEventListener("storage", onStorage);
				listening = true;
			}
			readStored();
			return () => {
				listeners.delete(subscription);
				if (listeners.size === 0 && listening) {
					window.removeEventListener("storage", onStorage);
					listening = false;
				}
			};
		},
		save(cards, expectedRaw) {
			const result = normalizePromptCards(cards);
			if (!result.ok) return { ok: false, error: "invalid" };
			const current = readStored();
			if (!current.ok) return { ok: false, error: current.error };
			if (arguments.length > 1 && current.raw !== expectedRaw) return { ok: false, error: "conflict" };
			return write(result.cards);
		},
		reset(cards, expectedRaw) {
			const result = normalizePromptCards(cards);
			if (!result.ok) return { ok: false, error: "invalid" };
			const current = readStored();
			if (current.error === "unavailable") return { ok: false, error: "unavailable" };
			if (current.raw !== expectedRaw) return { ok: false, error: "conflict" };
			if (current.error === "corrupt") {
				try { window.localStorage.setItem(recoveryKey, current.raw); }
				catch (error) { return failedWrite(error); }
				recoveryRaw = current.raw;
				const checked = readStored();
				if (checked.error === "unavailable") return { ok: false, error: "unavailable" };
				if (checked.raw !== expectedRaw) return { ok: false, error: "conflict" };
			}
			return write(result.cards);
		},
		getRecoveryRaw() {
			if (status.kind === "corrupt" || (lastCorruptRaw !== null && status.raw === lastCorruptRaw && !["ready", "missing"].includes(status.kind))) return status.raw;
			try { recoveryRaw = window.localStorage.getItem(recoveryKey); }
			catch (_error) { /* Cached recovery material remains available when reads fail. */ }
			return recoveryRaw ?? lastCorruptRaw;
		}
	};
}

module.exports = { createPromptCardStore };
