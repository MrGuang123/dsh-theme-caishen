import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import vm from "node:vm";

const KEY = "dsh-theme-caishen:prompt-cards:v1";
const plain = (value) => JSON.parse(JSON.stringify(value));

function harness(source, initial) {
	const values = new Map(initial === undefined ? [] : [[KEY, initial]]);
	const subscriptions = new Set();
	const state = { writes: 0, added: 0, removed: 0, failRead: false, failWrite: false };
	let registration;
	const localStorage = {
		getItem(key) {
			if (state.failRead) throw new Error("SecurityError");
			return values.get(key) ?? null;
		},
		setItem(key, value) {
			if (state.failWrite) throw new Error("QuotaExceededError");
			state.writes += 1;
			values.set(key, value);
		},
	};
	const window = {
		__ModuleLoader__: { load: (value) => { registration = value; } },
		localStorage,
		addEventListener(name, listener) {
			assert.equal(name, "storage");
			state.added += 1;
			subscriptions.add(listener);
		},
		removeEventListener(name, listener) {
			assert.equal(name, "storage");
			state.removed += 1;
			subscriptions.delete(listener);
		},
	};
	vm.runInNewContext(source, { window, setTimeout, clearTimeout });
	const mod = registration.factory(() => ({}));
	return {
		mod, state, values, localStorage,
		stored: () => values.get(KEY),
		event(key = KEY, storageArea = localStorage) {
			for (const listener of [...subscriptions]) listener({ key, storageArea });
		},
	};
}

/** Exercise persisted behavior without mounting or changing the real browser store. */
export function checkPromptCards(source) {
	const env = harness(source);
	const { getDefaultPromptCards, validateCard, normalizePromptCards, isPromptCardIcon, placePromptCard, movePromptCard, createPromptCardStore, LOCALES } = env.mod;
	for (const helper of [getDefaultPromptCards, validateCard, normalizePromptCards, isPromptCardIcon, placePromptCard, movePromptCard, createPromptCardStore]) {
		assert.equal(typeof helper, "function", "prompt-card helpers must be exported");
	}
	const zh = getDefaultPromptCards((key) => LOCALES.zh[key]);
	const en = getDefaultPromptCards((key) => LOCALES.en[key]);
	const defaultIds = "debug,feature,review,tests,explain,refactor,performance,summary";
	assert.equal(zh.map((card) => card.id).join(","), defaultIds);
	assert.equal(en.map((card) => card.id).join(","), defaultIds);
	assert.equal(zh.map((card) => card.icon).join(","), "🐞,🛠️,🔍,🧪,📖,🧹,⚡,📝");
	assert.equal(zh.map((card) => card.tone).join(","), "red,gold,blue,green,teal,purple,rose,brown");
	assert.equal(zh[0].title, LOCALES.zh["card.debug.title"]);
	assert.equal(en[0].title, LOCALES.en["card.debug.title"]);
	for (const [locale, cards] of [["zh", zh], ["en", en]]) {
		const normalized = normalizePromptCards(cards);
		assert.equal(normalized.ok, true, `all eight ${locale} defaults must be valid editable cards`);
		assert.deepEqual(plain(normalized.cards), plain(cards), `normalization must preserve all ${locale} default fields`);
		for (const card of cards) {
			for (const field of ["title", "tag", "desc", "prompt"]) {
				assert.equal(card[field], LOCALES[locale][`card.${card.id}.${field}`], `${card.id}.${field} must use the selected locale`);
				assert.ok(card[field].trim(), `${locale} ${card.id}.${field} must be present`);
			}
		}
	}
	assert.notEqual(zh[0].prompt, en[0].prompt, "default prompts must follow the current locale");
	const fresh = getDefaultPromptCards((key) => LOCALES.zh[key]);
	assert.notEqual(fresh, zh);
	assert.notEqual(fresh[0], zh[0]);
	const store = createPromptCardStore();
	assert.equal(store.get(), null, "missing overrides must use locale-dependent defaults");
	assert.equal(store.get(), store.get(), "default snapshots must be stable");
	assert.equal(env.state.writes, 0, "reading defaults must not persist or freeze the active locale");
	assert.equal(env.state.added, 0, "creating a store must not attach a global listener");

	// Old saved libraries are user data, even when their ids match retired defaults.
	const legacyCards = [
		{ id: "merge", icon: "🔍", tone: "blue", tag: "", title: "我的合并检查", desc: "", prompt: "只检查我选定的变更。\n  保留缩进和尾部空格。  " },
		{ id: "cost", icon: "cost", tone: "brown", tag: "节省时间", title: "定制性能排查", desc: "保留既有简介", prompt: "请分析指定慢请求。" },
		{ id: "report", icon: "📝", tone: "purple", tag: "个人模板", title: "本周进展", desc: "以事实为依据", prompt: "整理已完成事项和待办。" },
		{ id: "debt", icon: "debt", tone: "teal", tag: "局部调整", title: "我的重构任务", desc: "只处理明确范围", prompt: "先解读模块，再提出局部重构方案。" },
	];
	const legacyRaw = JSON.stringify(legacyCards);
	const legacyEnv = harness(source, legacyRaw);
	const legacyStore = legacyEnv.mod.createPromptCardStore();
	assert.deepEqual(plain(legacyStore.get()), legacyCards, "an existing customized four-card library must retain order, text, icons, colors and empty optional fields");
	assert.equal(legacyEnv.state.writes, 0, "loading old cards must not migrate or overwrite storage");
	const legacySnapshot = legacyStore.get();
	const stopLegacy = legacyStore.subscribe(() => {});
	getDefaultPromptCards((key) => LOCALES.en[key]);
	assert.equal(legacyStore.get(), legacySnapshot, "new locale defaults must not replace the existing library");
	assert.equal(legacyEnv.stored(), legacyRaw, "the original persisted library must remain byte-for-byte unchanged on load");
	assert.equal(legacyEnv.state.writes, 0);
	stopLegacy();
	const emptyEnv = harness(source, "[]");
	const emptyStore = emptyEnv.mod.createPromptCardStore();
	assert.deepEqual(plain(emptyStore.get()), [], "a previously emptied library must stay empty after default changes");
	assert.equal(emptyEnv.state.writes, 0, "loading an intentionally empty library must not save defaults");

	const custom = {
		id: "custom-123", icon: "🧪", tone: "green",
		title: "  测试计划  ", tag: "  先测后发  ", desc: "  覆盖关键路径  ",
		prompt: "  请生成测试计划。\n\n保留这行缩进：\n    test();\n  ",
	};
	const addition = [...zh, custom];
	assert.deepEqual(plain(store.save(addition)), { ok: true });
	assert.equal(env.state.writes, 1, "a complete card list must persist in one atomic write");
	assert.equal(store.get().length, 9);
	assert.equal(store.get()[8].title, "测试计划");
	assert.equal(store.get()[8].tag, "先测后发");
	assert.equal(store.get()[8].desc, "覆盖关键路径");
	assert.equal(store.get()[8].prompt, custom.prompt, "prompt whitespace and newlines must remain verbatim");
	assert.equal(custom.title, "  测试计划  ", "normalization must not mutate the submitted draft");
	assert.ok(Object.isFrozen(store.get()) && Object.isFrozen(store.get()[8]));
	const savedSnapshot = store.get();
	assert.equal(store.get(), savedSnapshot);
	assert.deepEqual(plain(createPromptCardStore().get()), plain(savedSnapshot), "reload must restore saved cards");
	assert.equal(getDefaultPromptCards((key) => LOCALES.en[key])[0].title, en[0].title);
	assert.equal(store.get(), savedSnapshot, "locale defaults must not rewrite customized cards");

	const edited = savedSnapshot.map((card) => card.id === custom.id ? { ...card, title: "已修改", prompt: "updated\n  prompt" } : card);
	assert.deepEqual(plain(store.save(edited)), { ok: true });
	assert.equal(createPromptCardStore().get()[8].title, "已修改", "editing must survive reload");
	assert.equal(createPromptCardStore().get()[8].prompt, "updated\n  prompt");
	assert.deepEqual(plain(store.save(store.get().filter((card) => card.id !== "review"))), { ok: true });
	assert.equal(createPromptCardStore().get().some((card) => card.id === "review"), false, "deletion must survive reload");
	assert.deepEqual(plain(store.save([])), { ok: true });
	assert.equal(env.stored(), "[]");
	assert.ok(Array.isArray(store.get()) && store.get().length === 0, "zero cards must not fall back to defaults");
	assert.ok(Array.isArray(createPromptCardStore().get()), "an intentionally empty list must survive reload");
	const emptySnapshot = store.get();
	assert.equal(store.get(), emptySnapshot);
	assert.deepEqual(plain(store.save([custom])), { ok: true }, "a new card can be added after deleting every card");
	assert.equal(store.get().length, 1);

	const base = { ...zh[0] };
	const tones = ["red", "green", "gold", "teal", "blue", "purple", "rose", "brown"];
	for (const tone of tones) {
		assert.equal(validateCard({ ...base, tone }).ok, true, `theme tone ${tone} was rejected`);
		assert.equal(validateCard({ ...base, tone: ` ${tone} ` }).card.tone, tone, "tone normalization must preserve the selected color");
	}
	const colorEnv = harness(source);
	const colorStore = colorEnv.mod.createPromptCardStore();
	const colorCards = tones.map((tone, index) => ({ ...base, id: `tone-${index}`, tone }));
	assert.deepEqual(plain(colorStore.save(colorCards)), { ok: true });
	assert.deepEqual(plain(colorEnv.mod.createPromptCardStore().get()), colorCards, "every theme color must persist with the complete card fields");
	for (const icon of ["cost", "debt", "report", "merge", "🐞", "🧪", "🚀", "🛠️", "📚", "🔍", "💡", "⚡", "👩🏽‍💻", "🇨🇳", "1️⃣"]) {
		assert.equal(isPromptCardIcon(icon), true, `valid icon ${icon} was rejected`);
		assert.equal(validateCard({ ...base, icon }).ok, true);
	}
	for (const icon of ["", "bug", "cost.svg", "../icon.svg", "https://example.com/a.png", "data:image/svg+xml,<svg/>", "javascript:alert(1)", "<svg/>", "🧪 text", "💰💰", "\u200D", "🧪\u200D", "🧪\u202E", "\uD800"]) {
		assert.equal(isPromptCardIcon(icon), false, `unsafe or malformed icon ${icon} was accepted`);
		assert.equal(validateCard({ ...base, icon }).error, "icon");
	}
	for (const [field, value] of [
		["id", "../bad"], ["id", "a".repeat(65)], ["tone", "neon"],
		["title", " "], ["title", "x".repeat(61)], ["tag", "x".repeat(25)],
		["desc", "x".repeat(181)], ["prompt", " \n\t "], ["prompt", "x".repeat(12001)],
		["title", 1], ["tag", null], ["desc", undefined], ["prompt", false], ["prompt", "bad\u0000text"],
	]) {
		assert.equal(validateCard({ ...base, [field]: value }).error, field, `${field} validation drifted`);
	}
	assert.equal(validateCard({ ...base, title: "x".repeat(60), tag: "x".repeat(24), desc: "x".repeat(180), prompt: "x".repeat(11998) + " \n" }).ok, true);
	assert.equal(validateCard({ ...base, tag: "", desc: "" }).ok, true);
	for (const invalid of [null, false, "card", [], 1]) assert.equal(validateCard(invalid).error, "object");
	assert.equal(validateCard({ ...base, extra: "ignored" }).card.extra, undefined, "unknown fields must not enter persisted records");
	assert.equal(normalizePromptCards([base, { ...base, id: ` ${base.id} ` }]).error, "duplicate-id");
	assert.equal(normalizePromptCards(Array.from({ length: 128 }, (_, index) => ({ ...base, id: `card-${index}` }))).ok, true);
	assert.equal(normalizePromptCards(Array.from({ length: 129 }, (_, index) => ({ ...base, id: `card-${index}` }))).error, "cards");
	for (const invalid of [null, {}, "[]", false]) assert.equal(normalizePromptCards(invalid).error, "cards");

	const beforeInvalid = store.get();
	const beforeInvalidRaw = env.stored();
	const beforeInvalidWrites = env.state.writes;
	for (const invalid of [[base, base], [{ ...base, icon: "https://example.com/icon" }], [{ ...base, prompt: "" }], null]) {
		assert.deepEqual(plain(store.save(invalid)), { ok: false, error: "invalid" });
		assert.equal(store.get(), beforeInvalid);
		assert.equal(env.stored(), beforeInvalidRaw);
	}
	assert.equal(env.state.writes, beforeInvalidWrites, "invalid submissions must never write storage");

	// Ordering is an explicit draft operation: keep every card field and write only on save.
	const orderEnv = harness(source);
	const orderStore = orderEnv.mod.createPromptCardStore();
	const orderCards = Object.freeze(["cost", "debt", "report", "merge"].map((id) => Object.freeze({
		id, icon: id, tone: id === "debt" || id === "merge" ? "green" : "red",
		tag: "旧版标签", title: `旧版 ${id}`, desc: "独立排序测试数据", prompt: `保留旧版 ${id} 的内容。`,
	})));
	const orderBefore = plain(orderCards);
	const ids = (cards) => cards.map((card) => card.id).join(",");
	const assertFieldsPreserved = (cards) => {
		assert.equal(cards.length, orderCards.length);
		for (const card of cards) {
			assert.equal(card, orderCards.find((original) => original.id === card.id), "reordering must preserve record identity and all editable fields");
		}
	};
	for (const [id, position, expected] of [
		["merge", 0, "merge,cost,debt,report"],
		["cost", 2, "debt,report,cost,merge"],
		["cost", 3, "debt,report,merge,cost"],
		["cost", 999, "debt,report,merge,cost"],
		["merge", -10, "merge,cost,debt,report"],
		["cost", 1.9, "debt,cost,report,merge"],
		["cost", NaN, "debt,report,merge,cost"],
		["cost", Infinity, "debt,report,merge,cost"],
		["cost", undefined, "debt,report,merge,cost"],
	]) {
		const moved = movePromptCard(orderCards, id, position);
		assert.equal(ids(moved), expected, `moving ${id} to ${position} chose the wrong position`);
		assert.notEqual(moved, orderCards, "each reorder must return a fresh draft array");
		assertFieldsPreserved(moved);
	}
	const unchanged = movePromptCard(orderCards, "missing", 0);
	assert.notEqual(unchanged, orderCards, "unknown ids must still return a shallow copy");
	assert.equal(ids(unchanged), ids(orderCards), "unknown ids must not insert or remove cards");
	assertFieldsPreserved(unchanged);
	assert.deepEqual(plain(orderCards), orderBefore, "ordering must not mutate the source array or records");
	assert.equal(orderEnv.state.writes, 0, "moving draft cards must not persist any changes");
	const newCard = Object.freeze({ ...base, id: "new-first", icon: "🚀", tone: "gold", tag: "常用", title: "代码审查", desc: "检查关键风险", prompt: "请检查变更。\n  保留缩进。" });
	for (const [position, expected] of [
		[0, "new-first,cost,debt,report,merge"],
		[2, "cost,debt,new-first,report,merge"],
		[999, "cost,debt,report,merge,new-first"],
		[-1, "new-first,cost,debt,report,merge"],
		[1.9, "cost,new-first,debt,report,merge"],
		[NaN, "cost,debt,report,merge,new-first"],
	]) {
		const placed = placePromptCard(orderCards, newCard, position);
		assert.equal(ids(placed), expected, `placing a new card at ${position} chose the wrong position`);
		assert.equal(placed.find((card) => card.id === newCard.id), newCard);
		assert.notEqual(placed, orderCards);
	}
	const editAtFront = Object.freeze({ ...orderCards[2], icon: "🧪", tone: "purple", tag: "检查", title: "修改的标题", desc: "修改的简介", prompt: "修改的内容\n  保留排版" });
	const replaced = placePromptCard(orderCards, editAtFront, 0);
	assert.equal(ids(replaced), "report,cost,debt,merge", "editing a card and moving it must replace its old position without duplication");
	assert.equal(replaced[0], editAtFront, "placement must retain all updated editable fields");
	assert.deepEqual(plain(orderCards), orderBefore, "adding or replacing must not mutate the frozen input");
	assert.equal(orderEnv.state.writes, 0, "placing cards must not persist an editor draft");
	const reorderDraft = movePromptCard(replaced, "merge", 1);
	assert.deepEqual(plain(orderStore.save(reorderDraft)), { ok: true });
	assert.equal(orderEnv.state.writes, 1, "confirming an entire reordered draft must use one atomic write");
	assert.deepEqual(plain(orderEnv.mod.createPromptCardStore().get()), plain(reorderDraft), "saved order and every editable field must survive reload");
	const beforeOrderFailure = orderStore.get();
	const beforeOrderFailureRaw = orderEnv.stored();
	orderEnv.state.failWrite = true;
	assert.deepEqual(plain(orderStore.save(movePromptCard(beforeOrderFailure, "debt", 0))), { ok: false, error: "storage" });
	assert.equal(orderStore.get(), beforeOrderFailure, "a failed reorder save must retain the displayed order");
	assert.equal(orderEnv.stored(), beforeOrderFailureRaw, "a failed reorder save must retain the persisted order");
	assert.deepEqual(plain(orderEnv.mod.createPromptCardStore().get()), plain(reorderDraft), "a reload after a failed save must restore the last confirmed order");
	assert.equal(orderEnv.state.writes, 1);

	for (const raw of ["{broken", "null", "{}", '[{"id":"broken"}]', JSON.stringify([base, base]), JSON.stringify([{ ...base, icon: "data:image/png;base64,AAAA" }])]) {
		const corrupt = harness(source, raw);
		const corruptStore = corrupt.mod.createPromptCardStore();
		assert.equal(corruptStore.get(), null, "corrupt data must safely fall back to defaults");
		const unsubscribe = corruptStore.subscribe(() => {});
		assert.equal(corrupt.stored(), raw, "corrupt data must remain recoverable without silent replacement");
		assert.equal(corrupt.state.writes, 0);
		corrupt.state.failWrite = true;
		assert.deepEqual(plain(corruptStore.save([base])), { ok: false, error: "storage" });
		assert.equal(corruptStore.get(), null);
		assert.equal(corrupt.stored(), raw, "failed recovery saves must preserve the original corrupt data");
		unsubscribe();
	}
	const denied = harness(source);
	denied.state.failRead = true;
	denied.state.failWrite = true;
	const deniedStore = denied.mod.createPromptCardStore();
	assert.equal(deniedStore.get(), null);
	assert.deepEqual(plain(deniedStore.save([base])), { ok: false, error: "storage" });
	assert.equal(deniedStore.get(), null);
	assert.equal(denied.state.writes, 0);
	const beforeFailure = store.get();
	const beforeFailureRaw = env.stored();
	env.state.failWrite = true;
	assert.deepEqual(plain(store.save([])), { ok: false, error: "storage" });
	assert.equal(store.get(), beforeFailure, "quota failures must leave the displayed cards intact");
	assert.equal(env.stored(), beforeFailureRaw);
	env.state.failWrite = false;
	assert.deepEqual(plain(store.save([])), { ok: true }, "saving should recover when storage becomes available");

	const shared = harness(source);
	const sharedStore = shared.mod.createPromptCardStore();
	let changes = 0;
	const unsubscribeBroken = sharedStore.subscribe(() => { throw new Error("bad subscriber"); });
	const unsubscribe = sharedStore.subscribe(() => { changes += 1; });
	assert.equal(shared.state.added, 1, "only the first subscriber may attach a global listener");
	shared.values.set(KEY, JSON.stringify([base]));
	shared.event("unrelated");
	shared.event(KEY, {});
	assert.equal(sharedStore.get(), null, "other keys or sessionStorage events must be ignored");
	shared.event();
	assert.equal(sharedStore.get().length, 1);
	assert.equal(changes, 1, "one broken subscriber must not block cross-tab updates");
	const sharedSnapshot = sharedStore.get();
	shared.values.set(KEY, JSON.stringify([base], null, 2));
	shared.event();
	assert.equal(sharedStore.get(), sharedSnapshot, "equivalent storage content must preserve snapshot identity");
	assert.equal(changes, 1);
	assert.deepEqual(plain(sharedStore.save([base])), { ok: true });
	assert.equal(sharedStore.get(), sharedSnapshot, "an unchanged save must preserve snapshot identity");
	assert.equal(changes, 1);
	shared.values.set(KEY, "[]");
	shared.event();
	assert.equal(sharedStore.get().length, 0);
	assert.equal(changes, 2);
	shared.values.set(KEY, "invalid external data");
	shared.event();
	assert.equal(sharedStore.get(), null);
	assert.equal(changes, 3);
	assert.equal(shared.stored(), "invalid external data");
	assert.equal(shared.state.writes, 1, "storage events must never write back or repair values automatically");
	shared.values.set(KEY, JSON.stringify([base]));
	shared.event();
	shared.state.failRead = true;
	const lastKnownSnapshot = sharedStore.get();
	shared.event();
	assert.equal(sharedStore.get(), lastKnownSnapshot, "transient read denial must preserve the last known snapshot");
	shared.state.failRead = false;
	shared.values.delete(KEY);
	shared.event(null);
	assert.equal(sharedStore.get(), null, "cross-tab localStorage.clear must restore locale defaults");
	unsubscribeBroken();
	assert.equal(shared.state.removed, 0, "the listener must survive while another subscriber remains");
	unsubscribe();
	unsubscribe();
	assert.equal(shared.state.removed, 1, "last subscriber cleanup must detach once");
	const missedUpdate = shared.mod.createPromptCardStore();
	shared.values.set(KEY, "[]");
	const stop = missedUpdate.subscribe(() => {});
	assert.ok(Array.isArray(missedUpdate.get()), "first subscription must catch changes since store creation");
	stop();
	assert.equal(shared.state.added, 2);
	assert.equal(shared.state.removed, 2);
	return "prompt cards — eight localized R&D defaults, existing-library preservation, persistent CRUD and ordering, theme colors, validation, storage failures and cross-tab cleanup";
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const root = join(dirname(fileURLToPath(import.meta.url)), "..");
	const source = await readFile(join(root, "lib/client.js"), "utf8");
	console.log("ok — " + checkPromptCards(source));
}
