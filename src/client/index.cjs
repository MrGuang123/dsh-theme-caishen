/** Browser entry: register theme services and connect the independent UI modules. */
const React = require("react");
const h = React.createElement;
const { LAYER, NS } = require("./config.cjs");
const { SLOTS } = require("./adapter/host.cjs");
const TOKENS = require("./theme/tokens.cjs");
const zh = require("./locales/zh.cjs");
const en = require("./locales/en.cjs");
const { installStyles } = require("./styles/install.cjs");
const promptCards = require("./state/prompt-cards.cjs");
const { createMeritStore } = require("./state/merit.cjs");
const { MeritEntry } = require("./components/merit-panel.cjs");
const { createPromptPreferences } = require("./state/prompt-preferences.cjs");
const { createPromptLauncher } = require("./utils/prompt-launcher.cjs");
const { PromptEntry } = require("./components/prompt-entry.cjs");
const { createAppearanceStore } = require("./state/appearance.cjs");
const { installAppearance } = require("./theme/appearance.cjs");
const { AppearancePage } = require("./components/appearance-page.cjs");
const { HeroBanner } = require("./components/hero-banner.cjs");
const { LogoMark, BrandName, HeaderBrand, SettingsTrigger } = require("./components/brand.cjs");
const { StatusChip, MeritButton, FortuneMeter, CloudMascot } = require("./components/fortune.cjs");
const { createPromptCardStore } = promptCards;
const { createPromptLibraries, useProjectContext } = require("./state/prompt-scopes.cjs");

function apply(ctx) {
	ctx.effect(() => ctx.theme.overrideTokens(LAYER, TOKENS), LAYER + ": palette overlay");
	ctx.effect(() => ctx.locale.register(NS, { zh, en }), LAYER + ": dictionaries");
	ctx.effect(installStyles, LAYER + ": stylesheet");

	const tr = ctx.locale.bind(NS);
	const merit = createMeritStore();
	const cardStore = createPromptCardStore();
	const preferences = createPromptPreferences();
	const libraries = createPromptLibraries(cardStore, preferences);
	const launcher = createPromptLauncher();
	const appearance = createAppearanceStore();
	ctx.effect(() => installAppearance(ctx, appearance), LAYER + ": appearance preferences");
	if (typeof ctx.inject === "function") ctx.inject(["shortcuts"], (scope) => {
		scope.effect(() => scope.shortcuts.register(launcher.command(tr)), LAYER + ": prompt command");
	});

	/**
	 * Re-render a component when the active locale advances. The bound
	 * translator already reads the current dictionary; the subscription
	 * only supplies the render.
	 */
	function useT() {
		const [, force] = React.useReducer((value) => value + 1, 0);
		React.useEffect(() => ctx.locale.subscribe(force), []);
		return tr;
	}

	function HeroSlot(props) {
		return h(HeroBanner, { ...props, t: useT(), cardStore, preferences, libraries, project: useProjectContext(props) });
	}

	function HeroMarkSlot({ size, className }) {
		return h(LogoMark, { size, className });
	}

	function SidebarMarkSlot({ size }) {
		return h(LogoMark, { size: Math.max(size || 24, 32) });
	}

	function BrandNameSlot() {
		return h(BrandName, { t: useT() });
	}

	function HeaderBrandSlot() {
		return h(HeaderBrand, { t: useT() });
	}

	function UtilitiesSlot() {
		const t = useT();
		return h(
			"span",
			{ className: "caishen-utilities" },
			h(StatusChip, { t, compact: true }),
			h(MeritButton, { t, merit, iconSize: 12 }),
			h(MeritEntry, { t, merit })
		);
	}

	function FortuneMeterSlot(props) {
		const t = useT();
		return h(
			"span",
			{ className: "caishen-input-accessories" },
			h(PromptEntry, { ...props, t, cardStore, preferences, launcher, libraries, project: useProjectContext(props) }),
			h(FortuneMeter, { t }),
			h(CloudMascot)
		);
	}

	function AppearancePageSlot() { return h(AppearancePage, { t: useT(), store: appearance }); }

	function SettingsTriggerSlot({ wide }) {
		return h(SettingsTrigger, { t: useT(), wide });
	}

	function HeroActionsSlot() {
		const t = useT();
		return h(
			"span",
			{ className: "caishen-hero-actions" },
			h(StatusChip, { t, compact: true }),
			h(MeritButton, { t, merit, iconSize: 12 }),
			h(MeritEntry, { t, merit })
		);
	}

	function register(slot, options, Component, label) {
		return ctx.effect(
			() =>
				ctx.slots.inject(slot, () =>
					ctx.slots.register({ name: slot, locale: NS, ...options }, Component)
				),
			LAYER + ": " + label
		);
	}

	const components = { HeroSlot, HeroActionsSlot, HeroMarkSlot, SidebarMarkSlot, BrandNameSlot, HeaderBrandSlot, UtilitiesSlot, FortuneMeterSlot, SettingsTriggerSlot, AppearancePageSlot };
	for (const [slot, options, component, label, labelKey] of SLOTS) register(slot, labelKey ? { ...options, label: () => tr(labelKey) } : options, components[component], label);
}

module.exports = { apply, inject: ["theme", "slots", "locale"], TOKENS, LOCALES: { zh, en }, ...promptCards };
