import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";

const require = createRequire(import.meta.url);
const backup = require("../src/client/state/prompt-backup.cjs");
const presentation = require("../src/client/utils/presentation.cjs");
const componentSource = await readFile(new URL("../src/client/components/prompt-transfer.cjs", import.meta.url), "utf8");
const downloadSource = await readFile(new URL("../src/client/utils/download.cjs", import.meta.url), "utf8");
const plain = (value) => JSON.parse(JSON.stringify(value));
const card = (id, title = id) => ({ id, title, icon: "🧪", tone: "green", tag: "", desc: "", prompt: `Run ${id}` });

/** Hook and DOM doubles keep every test independent of a browser and real storage. */
function harness(cards) {
	const hooks = [], downloads = [], writes = [];
	let cursor = 0, tree, current = cards, status = { kind: "ready", raw: JSON.stringify(cards) }, recoveryRaw = null;
	let closed = 0, saveCalls = 0, saveError = null, downloadError = false, restored = 0, focused = 0;
	const previous = { isConnected: true, focus() { restored++; } };
	const effects = [];
	const React = {
		createElement(type, props, ...children) { return { type, props: { ...props, children: children.flat(Infinity).filter((child) => child !== null && child !== undefined && child !== false) } }; },
		useState(initial) {
			const index = cursor++;
			if (!hooks[index]) hooks[index] = { value: typeof initial === "function" ? initial() : initial };
			return [hooks[index].value, (value) => { hooks[index].value = typeof value === "function" ? value(hooks[index].value) : value; }];
		},
		useRef(initial) { const index = cursor++; return (hooks[index] ??= { current: initial }); },
		useSyncExternalStore(_subscribe, get) { return get(); },
		useEffect(callback, dependencies) {
			const index = cursor++, old = hooks[index];
			if (!old || dependencies.some((value, i) => value !== old.dependencies[i])) {
				hooks[index] = { dependencies, cleanup: old?.cleanup };
				effects.push(() => { old?.cleanup?.(); hooks[index].cleanup = callback(); });
			}
		},
	};
	const store = {
		get: () => current, getStatus: () => status, retry: () => status, getRecoveryRaw: () => recoveryRaw, subscribe: () => () => {},
		save(next, expectedRaw) {
			saveCalls++;
			if (saveError) return { ok: false, error: saveError };
			if (expectedRaw !== status.raw) return { ok: false, error: "conflict" };
			writes.push(plain(next)); current = next; status = { kind: "ready", raw: JSON.stringify(next) }; return { ok: true };
		},
	};
	const module = { exports: {} };
	runInNewContext(componentSource, { module, document: { activeElement: previous }, require(name) {
		if (name === "react") return React;
		if (name.endsWith("presentation.cjs")) return presentation;
		if (name.endsWith("prompt-backup.cjs")) return backup;
		if (name.endsWith("download.cjs")) return { downloadText(...args) { if (downloadError) throw new Error("denied"); downloads.push(args); return true; } };
		throw new Error(`Unexpected dependency ${name}`);
	} });
	function nodes(node = tree) { return typeof node === "object" && node ? [node, ...node.props.children.flatMap((child) => nodes(child))] : []; }
	function render() {
		cursor = 0;
		tree = module.exports.PromptTransfer({ cards, cardStore: store, onClose: () => { closed++; }, t: (key) => key === "transfer.summary" ? "duplicate={duplicate} added={added} total={total}" : key });
		for (const node of nodes()) if (node.props.ref && !node.props.ref.current) node.props.ref.current = {
			open: false, showModal() { this.open = true; }, close() { this.open = false; }, focus() { focused++; },
			getBoundingClientRect: () => ({ left: 0, top: 0, right: 100, bottom: 100 }),
		};
		for (const effect of effects.splice(0)) effect();
		return tree;
	}
	const find = (predicate) => { const result = nodes().find(predicate); assert.ok(result, "expected UI node"); return result; };
	const button = (key) => find((node) => node.type === "button" && node.props.children.includes("transfer." + key));
	const click = (key) => { const node = button(key); assert.ok(!node.props.disabled, `${key} is disabled`); node.props.onClick(); render(); };
	const text = () => find((node) => node.type === "textarea");
	const paste = (value) => { text().props.onChange({ target: { value } }); render(); };
	const preview = (incoming) => { paste(JSON.stringify(incoming)); click("validate"); };
	render();
	return { render, find, button, click, paste, preview, text, writes, downloads, store,
		counts: () => ({ closed, saveCalls, restored, focused }),
		hasText: (value) => nodes().some((node) => node.props.children.includes(value)),
		setCards(value) { current = value; status = { kind: "ready", raw: JSON.stringify(value) }; }, setStatus(kind) { status = { kind, raw: status.raw }; },
		setRecovery(value) { recoveryRaw = value; render(); }, failSave(value) { saveError = value; }, failDownload() { downloadError = true; },
		async file(file) { const pending = find((node) => node.type === "input" && node.props.type === "file").props.onChange({ target: { files: [file], value: "selected" } }); render(); await pending; render(); },
		unmount() { for (const hook of hooks) hook?.cleanup?.(); },
	};
}

const invalid = harness([card("a")]);
assert.ok(invalid.counts().focused > 0, "native dialog must focus a control");
invalid.paste("{"); invalid.click("validate");
assert.ok(invalid.hasText("transfer.error.invalid-json"));
assert.ok(invalid.button("confirm").props.disabled);
invalid.click("cancel");
assert.equal(invalid.writes.length, 0);
let prevented = false;
invalid.find((node) => node.type === "dialog").props.onCancel({ preventDefault() { prevented = true; } });
assert.ok(prevented);
const modal = invalid.find((node) => node.type === "dialog");
modal.props.onClick({ target: modal.props.ref.current, clientX: 50, clientY: 50 });
assert.equal(invalid.counts().closed, 2, "a click inside dialog bounds must not close it");
modal.props.onClick({ target: modal.props.ref.current, clientX: -1, clientY: -1 });
assert.equal(invalid.counts().closed, 3);
invalid.unmount(); assert.equal(invalid.counts().restored, 1);

const merge = harness([card("a")]);
merge.preview([card("a", "incoming duplicate"), card("b")]);
assert.ok(merge.hasText("duplicate=1 added=1 total=2"));
assert.equal(merge.find((node) => node.type === "ol").props.children.length, 2);
assert.equal(merge.writes.length, 0, "preview must not write storage");
merge.setCards([card("a", "latest"), card("c")]);
merge.click("confirm");
assert.equal(merge.writes.length, 0, "an unseen external edit must require reviewing the updated preview");
assert.ok(merge.hasText("transfer.error.conflict"));
merge.click("confirm");
assert.deepEqual(merge.writes, [[card("a", "latest"), card("c"), card("b")]]);
assert.equal(merge.counts().saveCalls, 1, "confirmation must perform one atomic save");

const replace = harness([card("a")]);
replace.preview([]);
replace.find((node) => node.type === "input" && node.props.value === "replace").props.onChange(); replace.render();
replace.click("confirm"); assert.equal(replace.counts().saveCalls, 0);
assert.ok(replace.hasText("transfer.replaceWarning"));
replace.click("back"); assert.equal(replace.counts().saveCalls, 0);
replace.click("confirm"); replace.click("confirmReplace");
assert.deepEqual(replace.writes, [[]], "empty-array replacement must clear the library after two confirmations");

const externalReplace = harness([card("a")]);
externalReplace.preview([]);
externalReplace.find((node) => node.type === "input" && node.props.value === "replace").props.onChange(); externalReplace.render();
externalReplace.click("confirm");
externalReplace.setCards([card("a"), card("external")]);
externalReplace.click("confirmReplace");
assert.equal(externalReplace.writes.length, 0, "replacement consent must not cover a later external edit");
assert.ok(externalReplace.hasText("transfer.error.conflict"));
externalReplace.click("confirm"); externalReplace.click("confirmReplace");
assert.deepEqual(externalReplace.writes, [[]]);

for (const kind of ["corrupt", "unavailable"]) {
	const blocked = harness([card("a")]); blocked.preview([card("b")]);
	const staleButton = blocked.button("confirm"); blocked.setStatus(kind);
	staleButton.props.onClick(); blocked.render();
	assert.equal(blocked.counts().saveCalls, 0, "submission must reread the current storage status");
	assert.ok(blocked.hasText("transfer.error." + kind));
	assert.ok(blocked.button("confirm").props.disabled);
	blocked.click("export"); assert.equal(blocked.downloads.length, 1, "visible fallback cards must remain exportable");
}
const retry = harness([card("a")]); retry.preview([card("b")]); retry.failSave("quota"); retry.click("confirm");
assert.ok(retry.hasText("transfer.error.quota")); assert.equal(retry.writes.length, 0);
assert.ok(retry.find((node) => node.type === "ol"), "failed save must keep the preview");
retry.failSave(null); retry.click("confirm"); assert.equal(retry.writes.length, 1);
const changed = harness([card("a")]); changed.preview([card("b")]); changed.paste("broken");
assert.ok(changed.button("confirm").props.disabled, "changing the source must invalidate the old preview");

const exports = harness([card("a")]); exports.setCards([card("latest")]); exports.click("export");
assert.deepEqual(JSON.parse(exports.downloads[0][1]).cards, [card("latest")]);
exports.setRecovery("{corrupt bytes"); exports.click("exportRecovery");
assert.match(exports.downloads[1][0], /recovery-/); assert.equal(exports.downloads[1][1], "{corrupt bytes");
exports.failDownload(); exports.click("export"); assert.ok(exports.hasText("transfer.error.download"));
assert.equal(exports.counts().saveCalls, 0, "exports must never write the prompt store");

const files = harness([card("a")]);
let releaseOld;
const old = files.file({ size: 20, text: () => new Promise((resolve) => { releaseOld = resolve; }) });
await files.file({ size: 2, text: async () => "[]" }); releaseOld(JSON.stringify([card("old")])); await old;
assert.equal(files.text().props.value, "[]", "an older file read must not replace a newer selection");
let releasePasted;
const pending = files.file({ size: 20, text: () => new Promise((resolve) => { releasePasted = resolve; }) });
files.paste("my pasted JSON"); releasePasted("[]"); await pending;
assert.equal(files.text().props.value, "my pasted JSON", "late file reads must not overwrite pasted text");
let readLarge = false;
await files.file({ size: backup.MAX_BACKUP_BYTES + 1, text() { readLarge = true; } });
assert.equal(readLarge, false); assert.ok(files.hasText("transfer.error.limit"));
await files.file({ size: 2, text() { throw new Error("denied"); } }); assert.ok(files.hasText("transfer.error.file"));

function downloadHarness({ absent = false, clickError = false } = {}) {
	const events = [], timers = [], module = { exports: {} };
	const anchor = { click() { events.push("click"); if (clickError) throw new Error("blocked"); }, remove() { events.push("remove"); } };
	const globals = { module, setTimeout(callback, delay) { timers.push({ callback, delay }); },
		Blob: class { constructor(parts, options) { events.push([parts, options]); } },
		URL: { createObjectURL: () => "blob:isolated", revokeObjectURL(url) { events.push(["revoke", url]); } } };
	if (!absent) globals.document = { body: { appendChild() { events.push("append"); } }, createElement: () => anchor };
	runInNewContext(downloadSource, globals);
	return { download: module.exports.downloadText, events, timers, anchor };
}
const download = downloadHarness();
assert.equal(download.download("backup.json", "[]"), true);
assert.equal(download.anchor.download, "backup.json");
assert.equal(download.anchor.href, "blob:isolated");
assert.ok(download.events.includes("remove"));
assert.ok(!download.events.some((event) => Array.isArray(event) && event[0] === "revoke"), "URL must survive initial download dispatch");
assert.equal(download.timers[0].delay, 1000); download.timers[0].callback();
assert.deepEqual(plain(download.events.at(-1)), ["revoke", "blob:isolated"]);
assert.throws(() => downloadHarness({ absent: true }).download("x", "[]"), /download/);
const denied = downloadHarness({ clickError: true });
assert.throws(() => denied.download("x", "[]"), /download/);
assert.ok(denied.events.includes("remove")); assert.equal(denied.timers.length, 1);
console.log("ok — isolated prompt transfer: preview, merge, replacement, failures, file races, recovery export and delayed download cleanup");
