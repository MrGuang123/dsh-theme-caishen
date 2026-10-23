const React = require("react");
const h = React.createElement;
const { asset } = require("../config.cjs");
const { SparkGlyph } = require("./icons.cjs");
const { PromptLibrary } = require("./prompt-library.cjs");
const { usePromptWorkflow } = require("../utils/prompt-workflow.cjs");
const { PromptWorkspace } = require("./prompt-workspace.cjs");

/** Blank-session hero banner. It only mounts while the chat is empty. */
function HeroBanner({ t, cardStore, preferences, libraries, project, input, useInput, keyboard, inputActions, useChat, useSessions, useSession, sessionId }) {
	const summaryBlank = useSessions((state) => {
		if (sessionId === undefined) return undefined;
		const session = state.byId[sessionId];
		return session === undefined ? undefined : session.blank;
	});
	const openState = useSession((state) => (state === undefined ? undefined : state.openState));
	const empty =
		typeof useChat === "function"
			? useChat((state) => (state === undefined || state.order === undefined ? false : state.order.length === 0))
			: false;
	const workflow = usePromptWorkflow({ input, useInput, inputActions, preferences, keyboard, sessionId, scopeIdentity: project?.id });
	const { filled, error: fillError } = workflow;
	const blank = summaryBlank === true || (openState === "open" && empty);
	if (!blank) return null;

	return h(
		"div",
		{ className: "caishen-hero", "data-caishen-hero": "" },
		h(
			"section",
			{ className: "caishen-hero__banner", "aria-labelledby": "caishen-hero-title" },
			h(
				"div",
				{ className: "caishen-hero__grid" },
				h(
					"div",
					{ className: "caishen-hero__copy" },
					h(
						"div",
						{ className: "caishen-hero__kicker" },
						h("span", { className: "caishen-seal caishen-seal--lg", "aria-hidden": "true" }, "财"),
						h("span", null, t("hero.kicker"))
					),
					h(
						"h2",
						{ id: "caishen-hero-title", className: "caishen-hero__title" },
						t("hero.titleLead"),
						h("wbr"),
						t("hero.titleMid"),
						h("span", { className: "caishen-hero__title-accent" }, t("hero.titleAccent"))
					),
					h("p", { className: "caishen-hero__subtitle" }, t("hero.subtitle")),
					h("p", { className: "caishen-hero__hint" }, h(SparkGlyph, { size: 12 }), t("hero.hint"))
				),
				h(
					"div",
					{ className: "caishen-hero__art-wrap" },
					h("img", {
						className: "caishen-hero__art",
						src: asset("images/caishen-scene-lettered.webp"),
						alt: t("hero.artAlt"),
						draggable: "false",
						decoding: "async"
					}),
					h("img", { className: "caishen-hero__bubble", src: asset("images/speech-bubble.webp"), alt: t("hero.bubble"), draggable: "false" })
				)
			)
		),
		h(PromptLibrary, { t, cardStore, preferences, full: false, filled, onFill: workflow.useCard, onBrowse: (target) => workflow.open(null, target) }),
		fillError ? h("p", { className: "caishen-editor__error", role: "alert" }, t("card.fillError")) : null,
		workflow.notice ? h("p", { role: "status", className: "caishen-transfer__hint" }, t("workflow.preferenceError")) : null,
		workflow.request ? h(PromptWorkspace, { t, cardStore, preferences, libraries, project, workflow }) : null,
		h("div", { className: "caishen-hero__footer", "aria-hidden": "true" }, t("hero.footer")),
		h(
			"span",
			{ className: "caishen-sr-only", "aria-live": "polite", "aria-atomic": "true" },
			filled ? t("card.filled") : ""
		)
	);
}

module.exports = { HeroBanner };
