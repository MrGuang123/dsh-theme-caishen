/** Tested host contract: DSH 0.2.1-rc.2. No guessed scope or DOM action fallback. */
const COMPOSER_REGION = '[data-conversation-region="composer"]';
const COMPOSER_INPUT = '[data-composer-input]';
function composerInput(target) { return target?.closest?.(COMPOSER_REGION)?.querySelector(COMPOSER_INPUT) || null; }
const SLOTS = Object.freeze([
	["conversation.input.dock", { id: "caishen-hero", order: -100 }, "HeroSlot", "hero dock"],
	["conversation.hero.options", { id: "caishen-hero-actions", order: 100 }, "HeroActionsSlot", "hero actions"],
	["conversation.hero.brand.mark", {}, "HeroMarkSlot", "hero brand mark"],
	["sidebar.brand.mark", { priority: -1000 }, "SidebarMarkSlot", "sidebar brand mark"],
	["sidebar.brand.name", { priority: -1000 }, "BrandNameSlot", "sidebar brand name"],
	["conversation.header.leading", {}, "HeaderBrandSlot", "header marquee"],
	["conversation.session.header.utilities", { id: "caishen-utilities", order: 100 }, "UtilitiesSlot", "header utilities"],
	["conversation.input.right", { id: "caishen-fortune", order: 10 }, "FortuneMeterSlot", "fortune meter"],
	["settings.trigger", { priority: -1000 }, "SettingsTriggerSlot", "fortune settings trigger"],
	["settings.section", { id: "caishen-appearance", order: 5 }, "AppearancePageSlot", "appearance settings page", "appearance.title"]
]);
/** useWorkspaces is the root hook; items/sessionIds is authoritative membership. */
function projectForSession(snapshot, sessionId) {
	if (typeof sessionId !== "string" || !Array.isArray(snapshot?.items)) return null;
	const matches = snapshot.items.filter((item) => Array.isArray(item.sessionIds) && item.sessionIds.includes(sessionId));
	if (matches.length !== 1) return null;
	const item = matches[0];
	if (typeof item.workspaceId !== "string" || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,199}$/.test(item.workspaceId)) return null;
	return { id: item.workspaceId, path: typeof item.path === "string" ? item.path : "", label: typeof item.title === "string" && item.title.trim() ? item.title : typeof item.path === "string" ? item.path : item.workspaceId };
}
function useProjectContext(props) {
	const snapshot = typeof props.useWorkspaces === "function" ? props.useWorkspaces((state) => state) : null;
	return projectForSession(snapshot, props.sessionId);
}
module.exports = { COMPOSER_REGION, COMPOSER_INPUT, composerInput, SLOTS, projectForSession, useProjectContext };
