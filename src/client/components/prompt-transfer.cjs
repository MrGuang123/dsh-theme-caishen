const React = require("react");
const h = React.createElement;
const { fmt } = require("../utils/presentation.cjs");
const { downloadText } = require("../utils/download.cjs");
const { createPromptBackup, parsePromptBackup, planPromptImport, MAX_BACKUP_BYTES } = require("../state/prompt-backup.cjs");

function errorName(code) {
	if (code === "size") return "limit";
	return ["file", "limit", "download", "corrupt", "unavailable", "storage", "quota", "invalid-json", "format", "version", "duplicate-id", "conflict"].includes(code) ? code : "invalid";
}

function PromptTransfer({ cards, cardStore, t, onClose }) {
	const status = React.useSyncExternalStore(cardStore.subscribe, cardStore.getStatus, cardStore.getStatus);
	const [source, setSource] = React.useState("");
	const [parsed, setParsed] = React.useState(null);
	const [mode, setMode] = React.useState("merge");
	const [error, setError] = React.useState("");
	const [notice, setNotice] = React.useState("");
	const [reading, setReading] = React.useState(false);
	const [confirmReplace, setConfirmReplace] = React.useState(false);
	const dialog = React.useRef(null);
	const fileInput = React.useRef(null);
	const replacementButton = React.useRef(null);
	const readSequence = React.useRef(0);
	const previewRaw = React.useRef(status.raw);
	const confirmedRaw = React.useRef(null);
	const blocked = status.kind === "corrupt" || status.kind === "unavailable";
	const sourceError = ["file", "limit", "invalid-json", "format", "version", "duplicate-id", "invalid"].includes(error);
	const recoveryRaw = cardStore.getRecoveryRaw?.();
	const plan = parsed ? planPromptImport(cardStore.get() ?? cards, parsed.cards, mode) : null;
	React.useEffect(() => {
		const previous = document.activeElement;
		const element = dialog.current;
		element.showModal();
		fileInput.current?.focus();
		return () => {
			readSequence.current++;
			if (element.open) element.close();
			if (previous?.isConnected) previous.focus({ preventScroll: true });
		};
	}, []);
	React.useEffect(() => { if (confirmReplace) replacementButton.current?.focus(); }, [confirmReplace]);
	function failure(code) {
		setError(errorName(code));
	}
	function changeSource(value) {
		readSequence.current++;
		setSource(value); setParsed(null); setReading(false); setConfirmReplace(false); setError(""); setNotice("");
	}
	function validate(text) {
		setConfirmReplace(false); setError(""); setNotice("");
		const result = parsePromptBackup(text);
		previewRaw.current = cardStore.getStatus().raw;
		setParsed(result.ok ? result : null);
		if (!result.ok) failure(result.error);
	}
	async function chooseFile(event) {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;
		changeSource("");
		if (file.size > MAX_BACKUP_BYTES) { failure("limit"); return; }
		const sequence = readSequence.current;
		setReading(true);
		try {
			const text = await file.text();
			if (sequence !== readSequence.current) return;
			setSource(text); validate(text);
		} catch (_error) {
			if (sequence === readSequence.current) failure("file");
		} finally {
			if (sequence === readSequence.current) setReading(false);
		}
	}
	function exportBackup(recovery = false) {
		setError(""); setNotice("");
		const now = new Date();
		const day = [now.getFullYear(), now.getMonth() + 1, now.getDate()].map((value) => String(value).padStart(2, "0")).join("-");
		let text;
		if (recovery) {
			text = cardStore.getRecoveryRaw?.();
			if (typeof text !== "string") { failure("download"); return; }
		} else {
			const result = createPromptBackup(cardStore.get() ?? cards);
			if (!result.ok) { failure(result.error); return; }
			text = result.text;
		}
		try {
			downloadText(`caishen-prompts-${recovery ? "recovery-" : ""}${day}.json`, text);
			setNotice(recovery ? "recoveryReady" : "downloadReady");
		} catch (_error) { failure("download"); }
	}
	function commit() {
		if (!parsed || reading) return;
		const latestStatus = cardStore.retry();
		if (["corrupt", "unavailable"].includes(latestStatus.kind)) { failure(latestStatus.kind); return; }
		if (latestStatus.raw !== previewRaw.current || (confirmReplace && latestStatus.raw !== confirmedRaw.current)) {
			previewRaw.current = latestStatus.raw;
			setConfirmReplace(false); failure("conflict"); return;
		}
		const latestPlan = planPromptImport(cardStore.get() ?? cards, parsed.cards, mode);
		if (!latestPlan.ok) { failure(latestPlan.error); return; }
		setError("");
		if (mode === "replace" && !confirmReplace) { confirmedRaw.current = latestStatus.raw; setConfirmReplace(true); return; }
		const result = cardStore.save(latestPlan.cards, latestStatus.raw);
		if (result.ok) onClose();
		else failure(result.error);
	}
	function button(label, action, extra = {}) {
		return h("button", { type: "button", className: "caishen-editor__button", onClick: action, ...extra }, t("transfer." + label));
	}
	return h("dialog", { ref: dialog, className: "caishen-editor caishen-transfer", "aria-labelledby": "caishen-transfer-title",
		"aria-describedby": "caishen-transfer-subtitle", onCancel: (event) => { event.preventDefault(); onClose(); },
		onClick: (event) => {
			if (event.target !== dialog.current) return;
			const rect = dialog.current.getBoundingClientRect();
			if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
		} },
		h("header", { className: "caishen-editor__header" },
			h("div", null, h("h3", { id: "caishen-transfer-title", className: "caishen-editor__heading" }, t("transfer.title")),
				h("p", { id: "caishen-transfer-subtitle", className: "caishen-editor__subtitle" }, t("transfer.subtitle"), cardStore.scope?.kind === "project" ? " · " + t("scope.project") : " · " + t("scope.global"))),
			h("button", { type: "button", className: "caishen-editor__close", onClick: onClose, "aria-label": t("transfer.close") }, "×")),
		h("div", { className: "caishen-transfer__body" },
			h("section", { className: "caishen-transfer__export" }, button("export", () => exportBackup()),
				blocked ? h("p", { className: "caishen-transfer__hint" }, t("transfer.exportFallback")) : null,
				typeof recoveryRaw === "string" ? h("div", null, button("exportRecovery", () => exportBackup(true)),
					h("p", { className: "caishen-transfer__hint" }, t("transfer.recoveryHint"))) : null),
			h("label", { className: "caishen-editor__field" }, h("span", null, t("transfer.file")),
				h("input", { ref: fileInput, type: "file", accept: ".json,application/json", onChange: chooseFile,
					"aria-invalid": sourceError ? "true" : undefined, "aria-describedby": sourceError ? "caishen-transfer-error" : undefined })),
			h("label", { className: "caishen-editor__field" }, h("span", null, t("transfer.paste")),
				h("textarea", { rows: 5, value: source, placeholder: t("transfer.placeholder"), spellCheck: false,
					"aria-invalid": sourceError ? "true" : undefined, "aria-describedby": sourceError ? "caishen-transfer-error" : undefined,
					onChange: (event) => changeSource(event.target.value) })),
			h("div", null, button("validate", () => validate(source), { disabled: reading || !source.trim() }),
				reading ? h("span", { className: "caishen-transfer__hint", role: "status" }, t("transfer.reading")) : null),
			parsed ? h("section", { className: "caishen-transfer__preview", "aria-labelledby": "caishen-transfer-preview" },
				h("h4", { id: "caishen-transfer-preview" }, t("transfer.preview")),
				h("p", null, fmt(t("transfer.imported"), { count: parsed.cards.length })),
				parsed.legacy ? h("p", { className: "caishen-transfer__hint" }, t("transfer.legacy")) : null,
				parsed.cards.length ? h("ol", { className: "caishen-transfer__titles" }, parsed.cards.map((card) => h("li", { key: card.id }, card.title)))
					: h("p", { className: "caishen-transfer__hint" }, t("transfer.empty")),
				h("fieldset", { className: "caishen-transfer__modes" }, h("legend", null, t("transfer.mode")),
					["merge", "replace"].map((value) => h("label", { key: value },
						h("input", { type: "radio", name: "caishen-import-mode", value, checked: mode === value,
							onChange: () => { setMode(value); setConfirmReplace(false); setError(""); } }), t("transfer." + value)))),
				plan?.ok ? h("p", { className: "caishen-transfer__summary", role: "status" }, fmt(t("transfer.summary"), {
					duplicate: plan.duplicateCount, added: plan.addedCount, total: plan.cards.length }))
					: h("p", { className: "caishen-editor__error", role: "alert" }, t("transfer.error." + errorName(plan?.error)))) : null,
			blocked ? h("p", { className: "caishen-editor__error", role: "alert" }, t("transfer.error." + status.kind)) : null,
			error ? h("p", { id: "caishen-transfer-error", className: "caishen-editor__error", role: "alert" }, t("transfer.error." + error)) : null,
			notice ? h("p", { className: "caishen-transfer__notice", role: "status" }, t("transfer." + notice)) : null),
		h("footer", { className: "caishen-editor__footer" },
			confirmReplace ? h("p", { className: "caishen-transfer__warning", role: "alert" }, fmt(t("transfer.replaceWarning"), { count: parsed.cards.length })) : null,
			h("span", { className: "caishen-editor__footer-spacer" }),
			confirmReplace ? button("back", () => setConfirmReplace(false)) : null,
			button("cancel", onClose),
			button(confirmReplace ? "confirmReplace" : "confirm", commit, { ref: replacementButton,
				disabled: blocked || reading || !plan?.ok,
				className: "caishen-editor__button caishen-editor__button--primary" })));
}

module.exports = { PromptTransfer };
