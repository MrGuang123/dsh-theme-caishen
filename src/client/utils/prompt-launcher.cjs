const { COMPOSER_REGION } = require("../adapter/host.cjs");
/** One optional host command routes only to the focused composer's live entry. */
function createPromptLauncher() {
	const entries = new Map();
	return {
		attach(element, open) { entries.set(element, open); return () => entries.delete(element); },
		command(t) {
			return { id: "theme-caishen.prompt-library", label: () => t("workflow.open"), defaults: {}, modals: [], group: "input",
				resolve(context) {
					if (context.modal != null) return { status: "pass" };
					for (const [element, open] of entries) {
						const composer = element?.closest(COMPOSER_REGION);
						if (composer?.contains(context.target)) return { status: "handled", run: () => open(element) };
					}
					return { status: "pass" };
				} };
		}
	};
}

module.exports = { createPromptLauncher };
