const React = require("react");
const h = React.createElement;
const { getDefaultPromptCards, getLibraryDefaults } = require("../state/prompt-cards.cjs");
const { downloadText } = require("../utils/download.cjs");

function PromptRecovery({ cardStore, status, t }) {
	const [confirming, setConfirming] = React.useState(null);
	const [error, setError] = React.useState("");
	const [message, setMessage] = React.useState("");
	const cancel = React.useRef(null);
	const resetButton = React.useRef(null);
	const notice = React.useRef(null);
	React.useEffect(() => { if (confirming) cancel.current?.focus(); }, [confirming]);
	const failed = ["corrupt", "unavailable", "quota"].includes(status.kind);
	function exportRaw() {
		try {
			const raw = cardStore.getRecoveryRaw();
			if (raw === null) return;
			downloadText("caishen-prompts-recovery.json", raw);
			setError("");
			setMessage("recovery.exported");
		} catch (_error) { setError("download"); }
	}
	function reset() {
		const result = cardStore.reset(getLibraryDefaults(cardStore, t), confirming.raw);
		if (!result.ok) { setError(result.error); return; }
		setConfirming(null);
		setError("");
		setMessage("recovery.done");
		window.requestAnimationFrame(() => notice.current?.focus({ preventScroll: true }));
	}
	function cancelReset() {
		setConfirming(null);
		window.requestAnimationFrame(() => resetButton.current?.focus({ preventScroll: true }));
	}
	if (!failed && !message && !error) return null;
	const errorKey = error === "download" ? "transfer.error.download" : "editor.error." + error;
	return h("div", { ref: notice, tabIndex: -1, className: "caishen-library__notice", "data-recovery-state": status.kind },
		failed ? h("p", { role: "alert" }, t("recovery." + status.kind)) : null,
		message ? h("p", { role: "status" }, t(message)) : null,
		error ? h("p", { role: "alert", className: "caishen-library__notice-error" }, t(errorKey)) : null,
		confirming ? h("div", { className: "caishen-library__notice-actions" },
			h("p", { id: "caishen-recovery-confirm", role: "alert" }, t(cardStore.scope?.kind === "project" ? "scope.confirm" : "recovery.confirmMessage")),
			h("button", { ref: cancel, type: "button", className: "caishen-editor__button", onClick: cancelReset }, t("recovery.cancel")),
			h("button", { type: "button", className: "caishen-editor__button caishen-editor__button--danger", "aria-describedby": "caishen-recovery-confirm", onClick: reset }, t("recovery.confirm")))
			: h("div", { className: "caishen-library__notice-actions" },
				failed ? h("button", { type: "button", className: "caishen-editor__button", onClick: () => {
					const next = cardStore.retry(); setError("");
					setMessage(["ready", "missing"].includes(next.kind) ? "recovery.read" : "");
					window.requestAnimationFrame(() => notice.current?.focus({ preventScroll: true }));
				} }, t("recovery.retry")) : null,
				cardStore.getRecoveryRaw() !== null ? h("button", { type: "button", className: "caishen-editor__button", onClick: exportRaw }, t("recovery.export")) : null,
				status.kind === "corrupt" ? h("button", { ref: resetButton, type: "button", className: "caishen-editor__button caishen-editor__button--danger", onClick: () => {
					setConfirming({ raw: status.raw }); setError(""); setMessage("");
				} }, t(cardStore.scope?.kind === "project" ? "scope.reset" : "recovery.reset")) : null));
}

module.exports = { PromptRecovery };
