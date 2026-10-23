const React = require("react");
const h = React.createElement;
const { PromptWorkspace } = require("./prompt-workspace.cjs");
const { usePromptWorkflow } = require("../utils/prompt-workflow.cjs");
const { BookGlyph } = require("./icons.cjs");

function PromptEntry({ t, cardStore, preferences, launcher, libraries, project, ...props }) {
	const workflow = usePromptWorkflow({ ...props, preferences, scopeIdentity: project?.id });
	const button = React.useRef(null);
	const latest = React.useRef(workflow);
	latest.current = workflow;
	React.useEffect(() => launcher.attach(button.current, (target) => latest.current.open(null, target)), [launcher]);
	return h(React.Fragment, null,
		h("button", { ref: button, type: "button", className: "caishen-prompt-entry", "aria-haspopup": "dialog",
			title: t(workflow.notice ? "workflow.preferenceError" : "workflow.open"), "aria-label": t("workflow.open"),
			onClick: (event) => workflow.open(null, event.currentTarget) }, h(BookGlyph), h("span", { className: "caishen-entry-label" }, t("workflow.entry")), workflow.notice ? " !" : null),
		workflow.notice ? h("span", { role: "status", className: "caishen-sr-only" }, t("workflow.preferenceError")) : null,
		workflow.request ? h(PromptWorkspace, { t, cardStore, preferences, libraries, project, workflow }) : null);
}

module.exports = { PromptEntry };
