/**
 * Offline self-check for the Caishen theme.
 *
 *   node scripts/check.mjs
 *
 * Catches the mistakes that otherwise only show up after a reload: a token
 * missing one palette, a bundle whose id drifted from the package name, a
 * locale key missing from one dictionary, a slot registration that never
 * installed, and a missing display resource.
 */
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { checkPromptCards } from "./prompt-cards-check.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const css = await readFile(join(root, "lib/client.css"), "utf8");

let registration;
let styleRemoved = false;
const style = {
	dataset: {},
	textContent: "",
	remove() {
		styleRemoved = true;
	},
};

globalThis.window = {
	__ModuleLoader__: {
		load(value) {
			registration = value;
		},
	},
	localStorage: {
		getItem: () => null,
		setItem: () => {},
	},
};

globalThis.document = {
	createElement: (tag) => {
		assert.equal(tag, "link", "theme CSS must load from a separate stylesheet");
		return style;
	},
	head: { append: () => {} },
};

const React = {
	createElement: (type, props, ...children) => ({ type, props: props || {}, children: children.flat() }),
	useState: (initial) => [typeof initial === "function" ? initial() : initial, () => {}],
	useReducer: (_reducer, initial) => [initial, () => {}],
	useEffect: () => {},
	useRef: (value) => ({ current: value }),
	useSyncExternalStore: (_subscribe, getSnapshot) => getSnapshot(),
};

await import(pathToFileURL(join(root, "lib/client.js")).href);

assert.ok(registration, "bundle never called window.__ModuleLoader__.load");
assert.equal(registration.id, pkg.name, "bundle id must equal package.json name");
assert.equal(pkg.name, "dsh-theme-caishen");

const mod = registration.factory((name) => {
	assert.equal(name, "react", `unexpected runtime module: ${name}`);
	return React;
});

assert.equal(typeof mod.apply, "function", "client half must export apply");
assert.ok(Array.isArray(mod.inject), "client half must export inject");
assert.deepEqual([...mod.inject].sort(), ["locale", "slots", "theme"], "client inject drifted");

const TOKENS = mod.TOKENS;
assert.ok(TOKENS && typeof TOKENS === "object", "TOKENS must be exported");
const tokenNames = Object.keys(TOKENS);
assert.ok(tokenNames.length >= 100, `expected a full palette, got ${tokenNames.length} tokens`);
for (const [name, pair] of Object.entries(TOKENS)) {
	assert.ok(
		name.startsWith("--dsw-") || name.startsWith("--shiki-"),
		`${name} is neither a --dsw-* nor a --shiki-* token`,
	);
	assert.equal(typeof pair, "object", `${name} needs a { light, dark } pair`);
	assert.equal(typeof pair.light, "string", `${name}.light`);
	assert.equal(typeof pair.dark, "string", `${name}.dark`);
	assert.ok(pair.light.length > 0, `${name}.light is empty`);
	assert.ok(pair.dark.length > 0, `${name}.dark is empty`);
}

const { zh, en } = mod.LOCALES;
assert.deepEqual(Object.keys(zh).sort(), Object.keys(en).sort(), "zh/en dictionaries drifted");
for (const key of Object.keys(zh)) {
	assert.ok(zh[key].length > 0, `zh.${key} is empty`);
	assert.ok(en[key].length > 0, `en.${key} is empty`);
}

const layers = [];
const dictionaries = [];
const effects = [];
const registrations = [];
const ctx = {
	effect(fn, label) {
		assert.equal(typeof label, "string", "effect needs a label");
		const dispose = fn();
		assert.equal(typeof dispose, "function", `effect "${label}" must return a disposer`);
		effects.push(dispose);
		return dispose;
	},
	theme: {
		overrideTokens(source, tokens) {
			layers.push([source, tokens]);
			return () => {};
		},
	},
	locale: {
		register(namespace, dicts) {
			assert.ok(dicts.zh && dicts.en, "locale registration needs zh and en");
			dictionaries.push([namespace, dicts]);
			return () => {};
		},
		bind(namespace) {
			return (key) => {
				const dict = dictionaries.find((entry) => entry[0] === namespace);
				return dict ? dict[1].zh[key] ?? key : key;
			};
		},
		subscribe() {
			return () => {};
		},
	},
	slots: {
		inject(slot, callback) {
			assert.equal(typeof callback, "function");
			callback();
			return () => {};
		},
		register(options, Component) {
			assert.equal(typeof Component, "function", `slot ${options.name} has no component`);
			registrations.push({ ...options, Component });
			return () => {};
		},
	},
};

mod.apply(ctx);

assert.equal(layers.length, 1, "apply must mount exactly one token layer");
assert.equal(layers[0][0], "dsh-theme-caishen", "overlay layer source drifted");
assert.equal(layers[0][1], TOKENS, "apply must publish the exported TOKENS");
assert.equal(dictionaries.length, 1, "apply must register one locale namespace");
assert.equal(dictionaries[0][0], "theme-caishen", "locale namespace drifted");
assert.equal(dictionaries[0][1].zh, zh);

const expectedSlots = [
	"conversation.input.dock",
	"conversation.hero.options",
	"conversation.hero.brand.mark",
	"sidebar.brand.mark",
	"sidebar.brand.name",
	"conversation.header.leading",
	"conversation.session.header.utilities",
	"conversation.input.right",
	"settings.trigger",
	"settings.section",
];
assert.deepEqual(
	registrations.map((entry) => entry.name).sort(),
	[...expectedSlots].sort(),
	"slot registrations drifted",
);
for (const entry of registrations) {
	assert.equal(entry.locale, "theme-caishen", `${entry.name} must bind the theme locale`);
}
assert.ok(
	registrations.some((entry) => entry.name === "conversation.input.dock" && entry.id === "caishen-hero"),
	"hero dock registration missing",
);

assert.equal(style.dataset.pluginCss, "dsh-theme-caishen", "stylesheet marker drifted");
assert.equal(style.rel, "stylesheet", "theme must install a stylesheet link");
assert.equal(style.href, "/theme-caishen/styles/client.css", "stylesheet route drifted");
assert.equal(style.textContent, "", "CSS must not be embedded in the client JavaScript");
assert.ok(css.includes(".caishen-hero__banner"), "banner stylesheet missing");
assert.ok(css.includes(".caishen-card"), "card stylesheet missing");
assert.ok(css.includes("--dsw-radius-panel"), "radius scale missing");
assert.ok(
	css.includes('[data-row-key^="workspace:"] > [class*="_folder"]::before') &&
		css.includes('/theme-caishen/assets/images/gold-ingot.webp'),
	"workspace folder styling must use the detailed ingot",
);
assert.ok(!css.includes("http"), "stylesheet must not depend on remote assets");
assert.ok(
	css.includes("/theme-caishen/assets/images/banner-light.webp"),
	"banner artwork URL missing",
);

const clientSource = await readFile(join(root, "lib/client.js"), "utf8");
assert.ok(!clientSource.includes(".caishen-hero__banner {"), "client bundle contains embedded CSS");
console.log("ok — " + checkPromptCards(clientSource));
assert.ok(clientSource.includes('asset("images/caishen-scene-lettered.webp")'), "original lettered hero scene URL missing");
assert.ok(clientSource.includes('asset("icons/card-cost.svg")'), "card icon asset URL missing");

function renderTree(node) {
	if (node === null || node === undefined || typeof node !== "object") return [];
	if (typeof node.type === "function") return renderTree(node.type(node.props));
	return [node, ...node.children.flatMap(renderTree)];
}
const renderSlot = (name, props = {}) => {
	const entry = registrations.find((registration) => registration.name === name);
	assert.ok(entry, `${name} was not registered`);
	return renderTree(entry.Component(props));
};
const meritNodes = renderSlot("conversation.hero.options");
const meritButton = meritNodes.find((node) => node.type === "button");
assert.ok(meritButton, "merit button did not render");
assert.ok(
	meritNodes.some((node) => node.props.className === "caishen-merit__increment" && node.children.includes("+1")),
	"the merit increment must render as real text",
);
assert.ok(
	meritNodes.some((node) => node.type === "img" && node.props.src.endsWith("/merit-badge.webp")),
	"Chinese merit must preserve the original red-and-gold artwork",
);
meritButton.props.onClick();
assert.ok(
	renderSlot("conversation.hero.options").some((node) => node.type === "button" && node.props["aria-label"] === "功德 1"),
	"clicking merit must update its persistent count",
);
assert.ok(
	renderSlot("conversation.hero.options").every((node) => node.props.className !== "caishen-merit__count"),
	"merit should not display a corner count badge",
);
const heroNodes = renderSlot("conversation.input.dock", {
	useSessions: () => true,
	useSession: () => "open",
	useChat: () => true,
});
const heroImages = heroNodes.filter((node) => node.type === "img");
assert.ok(
	heroImages.some((node) => node.props.src.endsWith("/caishen-scene-lettered.webp")),
	"hero must preserve the original monitor and book lettering",
);
assert.ok(
	heroImages.every((node) => !/\/(?:monitor-screen|book-stack)\.webp$/.test(node.props.src)),
	"the monitor and books must remain part of the scene instead of separate overlay images",
);
assert.ok(
	renderSlot("sidebar.brand.mark", { size: 16 }).some((node) => node.props.src?.endsWith("/gold-ingot.webp") && node.props.width >= 32),
	"sidebar brand needs the larger detailed gold ingot",
);
assert.ok(
	renderSlot("conversation.input.right").some((node) => node.props.className === "caishen-cloud-mascot"),
	"the cloud mascot must be mounted beside the composer controls",
);

const hostSource = await readFile(join(root, "lib/host/index.js"), "utf8");
assert.ok(hostSource.includes('"/theme-caishen/assets"'), "host artwork route missing");
assert.ok(hostSource.includes('"/theme-caishen/extra"'), "host extra artwork route missing");
assert.ok(hostSource.includes('"/theme-caishen/styles"'), "host stylesheet route missing");
assert.ok(clientSource.includes('asset("images/logo-shun.webp")'), "header seal URL missing");
assert.ok(clientSource.includes('asset("images/caishen-cloud-mascot.webp")'), "cloud mascot URL missing");

for (const dispose of effects) dispose();
assert.equal(styleRemoved, true, "stylesheet disposer must remove the injected style");

const zhMeta = JSON.parse(await readFile(join(root, "locale/zh.json"), "utf8"));
const enMeta = JSON.parse(await readFile(join(root, "locale/en.json"), "utf8"));
assert.ok(zhMeta.meta.title && zhMeta.meta.description, "zh display metadata missing");
assert.ok(enMeta.meta.title && enMeta.meta.description, "en display metadata missing");

const iconPath = join(root, pkg.exports["./icon"]);
const icon = await readFile(iconPath, "utf8");
const iconStat = await stat(iconPath);
assert.ok(icon.trimStart().startsWith("<svg"), "icon must be an SVG document");
assert.ok(icon.trimEnd().endsWith("</svg>"), "icon SVG is truncated");
assert.ok(iconStat.size < 256 * 1024, "icon exceeds the 256 KiB limit");

assert.ok(pkg.exports["./client"], "package must export ./client");
assert.ok(pkg.exports["./locale/*.json"], "package must export locale dictionaries");
assert.ok(pkg.exports["./icon"], "package must export ./icon");
assert.ok(pkg.files.includes("assets/runtime"), "package must ship runtime artwork");
for (const relative of [
	"assets/runtime/images/caishen-scene.webp",
	"assets/runtime/images/gold-ingot.webp",
	"assets/runtime/images/banner-light.webp",
	"assets/runtime/images/banner-dark.webp",
	"assets/runtime/icons/card-cost.svg",
	"assets/runtime/icons/card-debt.svg",
	"assets/runtime/icons/card-report.svg",
	"assets/runtime/icons/card-merge.svg",
	"assets/runtime/decor/decor-coin.svg",
	"assets/runtime/decor/paper-texture.png",
	"assets/runtime/images/logo-shun.webp",
	"assets/runtime/images/merit-badge.webp",
	"assets/runtime/images/caishen-avatar.webp",
	"assets/runtime/images/caishen-cloud-mascot.webp",
	"assets/runtime/images/speech-bubble.webp",
]) {
	const info = await stat(join(root, relative));
	assert.ok(info.size > 0, `${relative} is missing or empty`);
}
assert.equal(pkg.dsh.bundle.patch, "./cordis.patch.yml");
assert.equal(pkg.dsh.client.platform, "web");

const patch = await readFile(join(root, "cordis.patch.yml"), "utf8");
assert.ok(patch.includes("id: ui-brand-official"), "official brand row override missing");
assert.ok(patch.includes("disabled: true"), "official brand row must be disabled for the skin");

const host = await import(pathToFileURL(join(root, "lib/index.js")).href);
assert.equal(typeof host.apply, "function", "host half must export apply");

console.log(
	`ok — ${tokenNames.length} tokens, ${Object.keys(zh).length} copy keys, ` +
		`${registrations.length} slots, layer "${layers[0][0]}", id "${registration.id}"`,
);
