import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const KEY = "dsh-theme-caishen:prompt-cards:v1";
const RECOVERY = "dsh-theme-caishen:prompt-cards:recovery:v1";
const plain = (value) => JSON.parse(JSON.stringify(value));
const card = (id = "one") => ({ id, icon: "🧪", tone: "gold", title: "标题", tag: "", desc: "", prompt: "  正文\n    保留缩进  " });

/** Load standard source modules with an isolated, entirely in-memory browser. */
function harness(initial) {
	const values = new Map(initial === undefined ? [] : [[KEY, initial]]);
	const subscriptions = new Set();
	const state = { failRead: false, failWrite: "", failKey: null, writes: 0, afterWrite: null };
	const storage = {
		getItem(key) { if (state.failRead) throw new Error("read denied"); return values.get(key) ?? null; },
		setItem(key, value) {
			if (state.failWrite && (!state.failKey || state.failKey === key)) throw Object.assign(new Error("write denied"), { name: state.failWrite });
			values.set(key, value); state.writes += 1; state.afterWrite?.(key, value);
		}
	};
	const browser = {
		localStorage: storage,
		addEventListener: (_name, callback) => subscriptions.add(callback),
		removeEventListener: (_name, callback) => subscriptions.delete(callback)
	};
	const context = vm.createContext({ window: browser });
	const cache = new Map();
	function load(file) {
		const path = resolve(root, "src/client", file);
		if (cache.has(path)) return cache.get(path).exports;
		const module = { exports: {} }; cache.set(path, module);
		const source = readFileSync(path, "utf8");
		const execute = vm.runInContext(`(function(require,module,exports){\n${source}\n})`, context, { filename: path });
		execute((specifier) => load(resolve(dirname(path), specifier)), module, module.exports);
		return module.exports;
	}
	return {
		mod: load("state/prompt-cards.cjs"), backup: load("state/prompt-backup.cjs"), state, values, subscriptions,
		event(key = KEY, storageArea = storage) { for (const callback of [...subscriptions]) callback({ key, storageArea }); }
	};
}

function checkStoreSafety() {
	const raw = JSON.stringify([card()]);
	const env = harness(raw), store = env.mod.createPromptCardStore();
	const original = store.get(), originalStatus = store.getStatus();
	assert.deepEqual(plain(originalStatus), { kind: "ready", raw });
	assert.equal(store.getStatus(), originalStatus);
	assert.ok(Object.isFrozen(originalStatus));
	let changes = 0;
	const stopBad = store.subscribe(() => { throw new Error("subscriber failed"); });
	const stop = store.subscribe(() => { changes += 1; });
	assert.equal(env.subscriptions.size, 1);
	env.values.set(KEY, "{broken"); env.event("other"); env.event(KEY, {});
	assert.equal(store.getStatus(), originalStatus);
	env.event();
	assert.equal(store.get(), original, "invalid external data retains the last valid cards");
	assert.deepEqual(plain(store.getStatus()), { kind: "corrupt", raw: "{broken" });
	assert.equal(changes, 1);
	const corruptStatus = store.getStatus(); env.event();
	assert.equal(store.getStatus(), corruptStatus, "unchanged status has stable identity");
	assert.deepEqual(plain(store.save([])), { ok: false, error: "corrupt" });
	assert.equal(env.values.get(KEY), "{broken"); assert.equal(env.state.writes, 0);
	assert.equal(store.getRecoveryRaw(), "{broken");
	env.state.failRead = true;
	assert.deepEqual(plain(store.save([])), { ok: false, error: "unavailable" });
	assert.equal(store.get(), original);
	assert.equal(store.getStatus().kind, "unavailable");
	assert.equal(store.getRecoveryRaw(), "{broken");
	env.state.failRead = false; env.values.set(KEY, raw);
	assert.equal(store.retry().kind, "ready"); assert.equal(store.get(), original);
	env.state.failWrite = "QuotaExceededError";
	assert.deepEqual(plain(store.save([])), { ok: false, error: "quota" });
	assert.equal(store.getStatus().kind, "quota"); assert.equal(store.get(), original);
	assert.equal(env.values.get(KEY), raw);
	for (const [name, error] of [["SecurityError", "unavailable"], ["NotAllowedError", "unavailable"], ["Error", "storage"]]) {
		env.state.failWrite = name;
		assert.deepEqual(plain(store.save([])), { ok: false, error });
		assert.equal(store.get(), original);
	}
	env.state.failWrite = "";
	assert.deepEqual(plain(store.save([])), { ok: true });
	assert.deepEqual(plain(store.get()), []); assert.equal(store.getStatus().kind, "ready");
	env.values.delete(KEY); env.event(null);
	assert.equal(store.get(), null); assert.equal(store.getStatus().kind, "missing");
	stopBad(); assert.equal(env.subscriptions.size, 1); stop(); stop(); assert.equal(env.subscriptions.size, 0);
	const unattended = harness(raw), asleep = unattended.mod.createPromptCardStore();
	unattended.values.set(KEY, "invalid");
	assert.deepEqual(plain(asleep.save([])), { ok: false, error: "corrupt" }, "save rechecks storage without subscribers");
	assert.equal(unattended.values.get(KEY), "invalid");
	const late = harness(), lateStore = late.mod.createPromptCardStore(); late.values.set(KEY, raw);
	const stopLate = lateStore.subscribe(() => {}); assert.equal(lateStore.getStatus().kind, "ready"); stopLate();
	const raced = harness(raw), stale = raced.mod.createPromptCardStore();
	const expectedRaw = stale.getStatus().raw, newerRaw = JSON.stringify([card("newer")]);
	raced.values.set(KEY, newerRaw);
	assert.deepEqual(plain(stale.save([], expectedRaw)), { ok: false, error: "conflict" });
	assert.equal(raced.values.get(KEY), newerRaw); assert.equal(raced.state.writes, 0);
	assert.equal(stale.get()[0].id, "newer", "a rejected stale save still exposes the latest valid snapshot");
	assert.deepEqual(plain(stale.save([], stale.getStatus().raw)), { ok: true });
	const fresh = harness(), freshStore = fresh.mod.createPromptCardStore();
	assert.deepEqual(plain(freshStore.save([card()], null)), { ok: true }, "explicit null protects first save into missing storage");
}

function checkRecovery() {
	const env = harness("{broken"), store = env.mod.createPromptCardStore();
	env.values.set(RECOVERY, "older recovery");
	assert.equal(store.get(), null);
	assert.deepEqual(plain(store.reset([], "older")), { ok: false, error: "conflict" });
	assert.equal(env.state.writes, 0);
	assert.deepEqual(plain(store.reset([{}], "{broken")), { ok: false, error: "invalid" });
	env.state.failWrite = "QuotaExceededError"; env.state.failKey = RECOVERY;
	assert.deepEqual(plain(store.reset([], "{broken")), { ok: false, error: "quota" });
	assert.equal(env.values.get(KEY), "{broken"); assert.equal(env.state.writes, 0);
	assert.equal(store.getRecoveryRaw(), "{broken", "current corrupt bytes take priority when backing them up fails");
	env.state.failKey = KEY;
	assert.deepEqual(plain(store.reset([], "{broken")), { ok: false, error: "quota" });
	assert.equal(env.values.get(RECOVERY), "{broken"); assert.equal(env.values.get(KEY), "{broken");
	env.state.failWrite = ""; env.state.failKey = null;
	assert.deepEqual(plain(store.reset([], "{broken")), { ok: true });
	assert.equal(env.values.get(KEY), "[]"); assert.equal(store.getStatus().kind, "ready");
	assert.equal(store.getRecoveryRaw(), "{broken");
	assert.equal(env.mod.createPromptCardStore().getRecoveryRaw(), "{broken", "recovery survives reload");
	env.values.set(KEY, "second corruption");
	assert.deepEqual(plain(store.reset([card()], "second corruption")), { ok: true });
	assert.equal(store.getRecoveryRaw(), "second corruption", "retain the most recent recovery copy");
	env.values.set(KEY, "third corruption");
	env.state.afterWrite = (key) => { if (key === RECOVERY) env.values.set(KEY, JSON.stringify([card("external")])); };
	assert.deepEqual(plain(store.reset([], "third corruption")), { ok: false, error: "conflict" });
	assert.equal(JSON.parse(env.values.get(KEY))[0].id, "external", "recovery backup cannot overwrite an intervening edit");
	env.state.failRead = true;
	assert.deepEqual(plain(store.reset([], null)), { ok: false, error: "unavailable" });
	assert.equal(store.getRecoveryRaw(), "third corruption");
}

function checkBackups() {
	const env = harness(), { createPromptBackup, parsePromptBackup, planPromptImport, MAX_BACKUP_BYTES } = env.backup;
	const original = Object.freeze([Object.freeze(card())]);
	const exported = createPromptBackup(original, "2026-10-22T00:00:00.000Z");
	assert.equal(exported.ok, true);
	assert.equal(exported.backup.format, "dsh-theme-caishen/prompt-cards");
	assert.equal(exported.backup.version, 1);
	assert.equal(exported.backup.exportedAt, "2026-10-22T00:00:00.000Z");
	assert.deepEqual(plain(parsePromptBackup(exported.text).cards), plain(original));
	assert.deepEqual(plain(parsePromptBackup("\uFEFF" + exported.text).cards), plain(original));
	assert.equal(parsePromptBackup(JSON.stringify(original)).legacy, true);
	assert.deepEqual(plain(parsePromptBackup("[]").cards), []);
	assert.deepEqual(plain(parsePromptBackup(createPromptBackup([]).text).cards), []);
	assert.equal(createPromptBackup(original, "invalid").error, "invalid");
	assert.equal(createPromptBackup([{}]).error, "invalid");
	for (const [text, error] of [
		["{", "invalid-json"], ["null", "format"], ["{}", "format"],
		[JSON.stringify({ ...exported.backup, version: 3 }), "version"],
		[JSON.stringify({ ...exported.backup, exportedAt: "bad" }), "invalid"],
		[JSON.stringify([{}]), "invalid"], [JSON.stringify([card(), card()]), "duplicate-id"],
		[JSON.stringify(Array.from({ length: 129 }, (_, i) => card("p" + i))), "limit"],
		[" ".repeat(MAX_BACKUP_BYTES + 1), "limit"], ["中".repeat(Math.ceil(MAX_BACKUP_BYTES / 3) + 1), "limit"]
	]) assert.equal(parsePromptBackup(text).error, error);
	const incoming = Object.freeze([Object.freeze({ ...card(), title: "incoming duplicate" }), Object.freeze(card("two"))]);
	const merge = planPromptImport(original, incoming, "merge");
	assert.deepEqual(plain(merge.cards), [card(), card("two")]);
	assert.equal(merge.duplicateCount, 1); assert.equal(merge.addedCount, 1);
	const replace = planPromptImport(original, incoming, "replace");
	assert.deepEqual(plain(replace.cards), plain(incoming)); assert.equal(replace.addedCount, 2);
	assert.deepEqual(plain(planPromptImport(original, [], "merge").cards), plain(original));
	assert.deepEqual(plain(planPromptImport(original, [], "replace").cards), []);
	assert.equal(planPromptImport(original, incoming, "wrong").error, "invalid");
	assert.equal(planPromptImport(original, [card(), card()], "merge").error, "duplicate-id");
	const full = Array.from({ length: 128 }, (_, i) => card("p" + i));
	assert.equal(planPromptImport(full, [card("new")], "merge").error, "limit");
	assert.equal(planPromptImport(full, [card("p0")], "merge").cards.length, 128);
	const longest = full.map((item) => ({ ...item, prompt: "中".repeat(12000) }));
	const largest = createPromptBackup(longest);
	assert.equal(largest.ok, true, "a full valid library must remain exportable at maximum prompt lengths");
	assert.deepEqual(plain(parsePromptBackup(largest.text).cards), longest);
	assert.equal(env.state.writes, 0, "all backup and preview operations are pure");
}

export function checkDataSafety() {
	checkStoreSafety(); checkRecovery(); checkBackups();
	return "data safety — corrupt/unavailable write blocking, recovery backup/reset conflicts, quota, stable status and pure import/export";
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log("ok — " + checkDataSafety());
