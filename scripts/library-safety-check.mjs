import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createPromptCardStore } = require("../src/client/state/prompt-cards.cjs");
const { savePromptCard, savePromptOrder, deletePromptCard, restorePromptCard } = require("../src/client/state/prompt-mutations.cjs");
const KEY = "dsh-theme-caishen:prompt-cards:v1";
const card = (id, title = id) => ({ id, icon: "🧪", tone: "gold", title, tag: "", desc: "", prompt: "  Body\n    Preserve whitespace  " });

function harness(cards) {
	const values = new Map(cards === undefined ? [] : [[KEY, JSON.stringify(cards)]]);
	let quota = false;
	globalThis.window = { localStorage: {
		getItem: (key) => values.get(key) ?? null,
		setItem(key, value) {
			if (quota) throw Object.assign(new Error("full"), { name: "QuotaExceededError" });
			values.set(key, value);
		}
	} };
	return { store: createPromptCardStore(), values, failWrite: (value) => { quota = value; }, raw: () => values.get(KEY) };
}

const env = harness([card("a"), card("b")]);
const initial = env.store.get()[0];
env.values.set(KEY, JSON.stringify([card("a", "other window"), card("b")]));
const external = env.raw();
assert.equal(savePromptCard(env.store, [], { isNew: false, card: initial }, card("a", "mine"), 0).error, "conflict");
assert.equal(deletePromptCard(env.store, [], initial).error, "conflict");
assert.equal(env.raw(), external, "editing or deleting an externally changed card must preserve its bytes");
env.values.set(KEY, JSON.stringify([card("a"), card("b", "updated elsewhere")]));
assert.equal(savePromptCard(env.store, [], { isNew: false, card: initial }, card("a", "mine"), 1).ok, true);
assert.deepEqual(env.store.get().map((item) => item.title), ["updated elsewhere", "mine"]);
assert.equal(savePromptCard(env.store, [], { isNew: true }, card("a"), 0).error, "conflict");
const deletion = deletePromptCard(env.store, [], env.store.get()[1]);
assert.equal(deletion.ok, true);
assert.equal(deletion.deleted.position, 1);
assert.deepEqual(env.store.get().map((item) => item.id), ["b"]);
env.failWrite(true);
assert.equal(restorePromptCard(env.store, [], deletion.deleted).error, "quota");
assert.deepEqual(env.store.get().map((item) => item.id), ["b"]);
env.failWrite(false);
assert.equal(restorePromptCard(env.store, [], deletion.deleted).ok, true);
assert.deepEqual(env.store.get()[1], deletion.deleted.card, "undo restores every field and original position");
const beforeCollision = env.raw();
assert.equal(restorePromptCard(env.store, [], deletion.deleted).error, "undoConflict");
assert.equal(env.raw(), beforeCollision, "undo must not overwrite a card with the same ID");
env.values.set(KEY, JSON.stringify(Array.from({ length: 128 }, (_, index) => card("full-" + index))));
assert.equal(restorePromptCard(env.store, [], deletion.deleted).error, "limit");
env.values.set(KEY, "{broken");
for (const action of [
	() => savePromptCard(env.store, [], { isNew: true }, card("new"), 0),
	() => deletePromptCard(env.store, [], initial),
	() => restorePromptCard(env.store, [], deletion.deleted),
	() => savePromptOrder(env.store, [], [])
]) assert.equal(action().error, "corrupt");
assert.equal(env.raw(), "{broken");

const ordering = harness([card("a"), card("b"), card("c")]);
const draft = ordering.store.get().slice().reverse();
ordering.values.set(KEY, JSON.stringify([card("a", "new a"), card("c"), card("d")]));
assert.equal(savePromptOrder(ordering.store, [], draft).ok, true);
assert.deepEqual(ordering.store.get().map((item) => item.id), ["c", "a", "d"]);
assert.equal(ordering.store.get()[1].title, "new a", "sort must keep current fields and newly added cards");
const missing = deletePromptCard(ordering.store, [], card("missing"));
assert.equal(missing.error, "missing");

const defaults = [card("default")];
const firstUse = harness();
// Field order may differ between localized defaults and normalized persisted data.
const reordered = { prompt: defaults[0].prompt, desc: "", tag: "", title: "default", tone: "gold", icon: "🧪", id: "default" };
firstUse.values.set(KEY, JSON.stringify([reordered]));
assert.equal(savePromptCard(firstUse.store, defaults, { isNew: false, card: defaults[0] }, card("default", "edited"), 0).ok, true);
assert.equal(firstUse.store.get()[0].title, "edited");
console.log("ok — library safety: edit/delete conflicts, undo fidelity/quota/collisions/limits, corrupt-write blocking and latest-order merging");
