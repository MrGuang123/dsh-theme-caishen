/** Isolated safety checks: no browser, real storage, installed React or file writes. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const event = () => ({ preventDefault() { this.prevented = true; } });
const flatten = (node) => node && typeof node === "object" ? [node, ...(node.children || []).flatMap(flatten)] : [];
const find = (tree, predicate) => flatten(tree).find(predicate);

function hooks() {
	const slots = [], pending = [], frames = [];
	let cursor = 0;
	const React = {
		Fragment: "fragment",
		createElement: (type, props, ...children) => ({ type, props: props || {}, children: children.flat().filter((value) => value !== null) }),
		useState(initial) {
			const i = cursor++;
			const slot = slots[i] ||= { value: typeof initial === "function" ? initial() : initial };
			return [slot.value, (next) => { slot.value = typeof next === "function" ? next(slot.value) : next; }];
		},
		useRef(initial) { const i = cursor++; return (slots[i] ||= { current: initial }); },
		useEffect(callback, deps) {
			const i = cursor++, slot = slots[i] ||= {};
			if (!slot.deps || deps.some((value, index) => value !== slot.deps[index])) {
				slot.deps = deps; pending.push(() => { slot.cleanup?.(); slot.cleanup = callback(); });
			}
		}
	};
	const window = { requestAnimationFrame: (callback) => frames.push(callback) };
	Object.defineProperty(window, "localStorage", { get() { throw new Error("real storage must never be accessed"); } });
	return {
		React, window, document: { activeElement: null },
		render(callback) { cursor = 0; return callback(); },
		effects() { while (pending.length) pending.shift()(); },
		frames() { while (frames.length) frames.shift()(); },
		dispose() { slots.forEach((slot) => slot.cleanup?.()); }
	};
}

function loader(runtime = hooks(), overrides = {}) {
	const cache = new Map();
	function load(file) {
		const path = resolve(root, file);
		if (cache.has(path)) return cache.get(path).exports;
		const module = { exports: {} };
		cache.set(path, module);
		const require = (name) => name === "react" ? runtime.React : overrides[name] || load(resolve(dirname(path), name));
		runInNewContext(`(function(require,module,exports){\n${readFileSync(path, "utf8")}\n})`,
			{ window: runtime.window, document: runtime.document, setTimeout: () => 1, clearTimeout() {} }, { filename: path })(require, module, module.exports);
		return module.exports;
	}
	return { runtime, load };
}

const { fillPrompt } = loader().load("src/client/utils/prompt-fill.cjs");
for (const draft of ["用户的原始需求", "  \n"]) {
	for (const mode of ["capture-throw", "capture-false", "insert-throw", "insert-false", "ok"]) {
		let value = draft, replacements = 0, insertions = 0;
		const result = fillPrompt(draft, "模板正文", {
			captureInsertion() { if (mode === "capture-throw") throw Error("capture"); return mode === "capture-false" ? false : { cursor: 1 }; },
			insertText(text, span) {
				assert.equal(text, "\n\n模板正文"); assert.equal(span.cursor, 1); insertions++;
				if (mode === "insert-throw") throw Error("insert"); return mode === "insert-false" ? false : undefined;
			},
			setDraft(text) { replacements++; value = text; },
			send() { assert.fail("must never send"); }
		});
		assert.equal(result.ok, mode === "ok"); assert.equal(value, draft); assert.equal(replacements, 0);
		assert.equal(insertions, mode.startsWith("capture") ? 0 : 1);
		if (!result.ok) assert.equal(result.error, mode.split("-")[0]);
	}
}
for (const mode of ["throw", "false", "ok"]) {
	const result = fillPrompt("", "模板正文", {
		setDraft(text) { assert.equal(text, "模板正文"); if (mode === "throw") throw Error("draft"); return mode === "false" ? false : undefined; },
		captureInsertion() { assert.fail("empty composer must not capture"); }, insertText() { assert.fail("empty composer must not insert"); }
	});
	assert.equal(result.ok, mode === "ok"); if (!result.ok) assert.equal(result.error, "draft");
}
assert.equal(fillPrompt("existing", "prompt", undefined).ok, false);

// Drive the real hook through clean/dirty, all close routes, keep, discard and focus.
const guardRuntime = hooks(), guardModule = loader(guardRuntime).load("src/client/utils/discard-guard.cjs");
let dirty = false, closed = 0, focused = "";
const editing = { inert: false }, fallback = { focus() { focused = "fallback"; } };
const dialog = { current: { querySelector: (selector) => selector === "[data-discard-editing]" ? editing : fallback,
	getBoundingClientRect: () => ({ left: 10, right: 20, top: 10, bottom: 20 }) } };
const renderGuard = () => guardRuntime.render(() => guardModule.useDiscardGuard({ dirty, dialog, fallbackSelector: "input", onClose() { closed++; } }));
let guard = renderGuard();
guardRuntime.effects(); guard.requestClose(); assert.equal(closed, 1);
dirty = true; guard = renderGuard();
const target = { isConnected: true, closest: () => editing, focus() { focused = "field"; } };
guard.rememberFocus({ target });
for (const route of ["button", "escape", "backdrop"]) {
	if (route === "button") guard.requestClose();
	if (route === "escape") { const e = event(); guard.onCancel(e); assert.equal(e.prevented, true); }
	if (route === "backdrop") guard.onBackdrop({ target: dialog.current, clientX: 0, clientY: 0 });
	guard = renderGuard(); guard.keepButton.current = { focus() { focused = "keep"; } }; guardRuntime.effects();
	assert.equal(guard.confirming, true); assert.equal(closed, 1); assert.equal(editing.inert, true); assert.equal(focused, "keep");
	const controls = flatten(guardModule.DiscardChanges({ guard, t: (key) => key, id: "test-discard" })).filter((node) => node.type === "button");
	assert.equal(controls.length, 2); controls.forEach((node) => assert.equal(node.props.type, "button"));
	guard.keep(); guard = renderGuard(); guardRuntime.effects(); guardRuntime.frames();
	assert.equal(guard.confirming, false); assert.equal(editing.inert, false); assert.equal(focused, "field");
}
guard.onBackdrop({ target: dialog.current, clientX: 15, clientY: 15 });
guard = renderGuard(); assert.equal(guard.confirming, false);
target.isConnected = false; guard.requestClose(); guard = renderGuard(); guard.keep();
guard = renderGuard(); guardRuntime.effects(); guardRuntime.frames(); assert.equal(focused, "fallback");
guard.requestClose(); guard = renderGuard(); guard.discard(); assert.equal(closed, 2); guardRuntime.dispose();

// Components use the same guard for every close action and keep drafts on failure.
const card = { id: "a", icon: "🚀", tone: "red", title: "标题", tag: "", desc: "", prompt: "正文" };
for (const kind of ["editor", "sorter"]) {
	const runtime = hooks(); let guardOptions, saves = 0, error = "quota";
	const mockGuard = { confirming: false, requestClose() {}, onCancel() {}, onBackdrop() {}, rememberFocus() {} };
	const DiscardChanges = () => null;
	const { load } = loader(runtime, { "../utils/discard-guard.cjs": { DiscardChanges, useDiscardGuard(options) { guardOptions = options; return mockGuard; } } });
	const Component = load(`src/client/components/prompt-${kind}.cjs`)[kind === "editor" ? "PromptEditor" : "PromptSorter"];
	const props = { t: (key) => key, onClose() {}, onDelete: () => ({ ok: true }),
		onSave() { saves++; return { ok: false, error }; }, initial: card, initialPosition: 0, total: 2, isNew: false,
		cards: [card, { ...card, id: "b", title: "第二张" }] };
	let tree; const render = () => { tree = runtime.render(() => Component(props)); return tree; };
	render(); assert.equal(guardOptions.dirty, false);
	let returnedFocus = 0;
	runtime.document.activeElement = { isConnected: true, focus() { returnedFocus++; } };
	const nativeDialog = { open: false, showModal() { this.open = true; }, close() { this.open = false; }, querySelector: () => ({ focus() {} }) };
	tree.props.ref.current = nativeDialog; runtime.effects(); assert.equal(nativeDialog.open, true);
	assert.equal(tree.props.onCancel, mockGuard.onCancel); assert.equal(tree.props.onClick, mockGuard.onBackdrop);
	assert.equal(find(tree, (node) => node.props.className === "caishen-editor__close").props.onClick, mockGuard.requestClose);
	assert.equal(find(tree, (node) => node.type === "button" && node.children.includes("editor.cancel")).props.onClick, mockGuard.requestClose);
	const change = () => {
		if (kind === "editor") find(tree, (node) => node.props.name === "title").props.onChange({ target: { value: "修改后" } });
		else find(tree, (node) => node.props["aria-label"] === "sort.downAria" && !node.props.disabled).props.onClick({ currentTarget: { closest: () => null } });
	};
	change(); render(); assert.equal(guardOptions.dirty, true);
	for (const code of ["storage", "corrupt", "unavailable", "quota", "conflict"]) {
		error = code; find(tree, (node) => node.type === "form").props.onSubmit(event()); render();
		assert.ok(find(tree, (node) => node.props.role === "alert" && node.children.includes("editor.error." + code)));
		if (kind === "editor") assert.equal(find(tree, (node) => node.props.name === "title").props.value, "修改后");
	}
	mockGuard.confirming = true; render(); const before = saves;
	find(tree, (node) => node.type === "form").props.onSubmit(event()); assert.equal(saves, before);
	assert.ok(find(tree, (node) => node.type === DiscardChanges)); assert.equal(find(tree, (node) => node.props.type === "submit"), undefined);
	mockGuard.confirming = false; render();
	if (kind === "editor") find(tree, (node) => node.props.name === "title").props.onChange({ target: { value: card.title } });
	else change();
	render(); assert.equal(guardOptions.dirty, false);
	if (kind === "editor") {
		find(tree, (node) => node.props.name === "position").props.onChange({ target: { value: "1" } }); render();
		assert.equal(guardOptions.dirty, true);
	}
	runtime.dispose(); assert.equal(nativeDialog.open, false); assert.equal(returnedFocus, 1);
}

// Fill failure clears any previous success and exposes an alert; success clears it.
const heroRuntime = hooks(); const PromptLibrary = () => null;
const { HeroBanner } = loader(heroRuntime, { "./prompt-library.cjs": { PromptLibrary } }).load("src/client/components/hero-banner.cjs");
let succeeds = true;
const heroProps = { t: (key) => key, input: { draft: "existing" }, cardStore: {}, sessionId: "test",
	useSessions: (selector) => selector({ byId: { test: { blank: true } } }), useSession: () => "open", useChat: () => true,
	inputActions: { captureInsertion: () => ({}), insertText: () => succeeds, setDraft() { assert.fail("must not replace"); } } };
let hero = heroRuntime.render(() => HeroBanner(heroProps));
const fill = () => find(hero, (node) => node.type === PromptLibrary).props.onFill(card);
fill(); hero = heroRuntime.render(() => HeroBanner(heroProps)); assert.equal(find(hero, (node) => node.type === PromptLibrary).props.filled, "a");
succeeds = false; fill(); hero = heroRuntime.render(() => HeroBanner(heroProps));
assert.equal(find(hero, (node) => node.type === PromptLibrary).props.filled, "");
assert.ok(find(hero, (node) => node.props.role === "alert" && node.children.includes("card.fillError")));
succeeds = true; fill(); hero = heroRuntime.render(() => HeroBanner(heroProps)); assert.equal(find(hero, (node) => node.props.role === "alert"), undefined);

console.log("ok — safe composer insertion, discard guard, close routes, focus, failed saves and confirmation submit protection");
