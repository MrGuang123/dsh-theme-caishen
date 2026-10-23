const React = require("react");
const h = React.createElement;
const { PromptBrowser } = require("./prompt-browser.cjs");

/** Switching libraries remounts only after the active browser accepts discard. */
function PromptWorkspace({ libraries, project, workflow, t, cardStore, preferences }) {
	const [kind, setKind] = React.useState("global");
	if (kind === "project" && !project) return null;
	const active = kind === "project" && project ? libraries.project(project.id) : libraries?.global || { cardStore, preferences };
	return h(PromptBrowser, { key: kind + ":" + (project?.id || ""), ...active, t,
		initialCardId: kind === "global" ? workflow.request.cardId : undefined,
		scope: { kind, project, onChange: setKind },
		onFill: (text, id) => workflow.fill(text, id, active.preferences),
		onCopy: (id) => workflow.record(id, active.preferences), onClose: workflow.close });
}
module.exports = { PromptWorkspace };
