const React = require("react");
const { composerInput } = require("../adapter/host.cjs");
const { fillPrompt, capturePromptInsertion, fillCapturedPrompt } = require("./prompt-fill.cjs");

function usePromptWorkflow({ input, useInput, inputActions, preferences, keyboard, sessionId, scopeIdentity }) {
	const current = typeof useInput === "function" ? useInput((state) => state) : input;
	const draft = typeof current?.draft === "string" ? current.draft : "";
	const [request, setRequest] = React.useState(null);
	const [filled, setFilled] = React.useState("");
	const [error, setError] = React.useState(false);
	const [notice, setNotice] = React.useState(false);
	const timer = React.useRef(null), returnTarget = React.useRef(null);
	React.useEffect(() => () => clearTimeout(timer.current), []);
	React.useEffect(() => { setRequest(null); setFilled(""); setError(false); }, [sessionId, scopeIdentity]);
	function focusComposer() {
		window.requestAnimationFrame(() => {
			const target = keyboard?.editor?.getRootElement?.() || returnTarget.current;
			if (target?.isConnected) target.focus({ preventScroll: true });
		});
	}
	function rememberTarget(target) {
		returnTarget.current = composerInput(target);
	}
	function record(id, usage = preferences) { setNotice(usage?.update(id, "use").ok === false); }
	function feedback(result, id, usage = preferences) {
		clearTimeout(timer.current); setError(!result.ok); setFilled(result.ok && usage === preferences ? id : "");
		if (result.ok) { record(id, usage); timer.current = setTimeout(() => setFilled(""), 1800); }
	}
	function open(card, target) {
		rememberTarget(target);
		setRequest({ cardId: card?.id, sessionId, scopeIdentity, captured: capturePromptInsertion(draft, inputActions) });
	}
	function useCard(card, target) {
		if (card.template) { open(card, target); return; }
		rememberTarget(target);
		const result = typeof current?.draft === "string" ? fillPrompt(draft, card.prompt, inputActions) : { ok: false };
		feedback(result, card.id);
		if (result.ok) focusComposer();
	}
	function close() { setRequest(null); focusComposer(); }
	function fill(text, id, usage = preferences) {
		const result = request?.sessionId === sessionId && request?.scopeIdentity === scopeIdentity ? fillCapturedPrompt(text, inputActions, request?.captured, draft) : { ok: false };
		feedback(result, id, usage);
		if (result.ok) close();
		return result;
	}
	return { request, filled, error, notice, open, useCard, close, fill, record };
}

module.exports = { usePromptWorkflow };
