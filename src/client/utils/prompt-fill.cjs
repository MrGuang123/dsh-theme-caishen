/** Composer-only boundary: injected actions, no React, DOM, storage or sending. */
function fillPrompt(draft, prompt, inputActions) {
	const existing = typeof draft === "string" ? draft : "";
	let operation = "draft";
	try {
		if (existing.length > 0) {
			operation = "capture";
			const span = inputActions.captureInsertion();
			if (span === false) return { ok: false, error: operation };
			operation = "insert";
			if (inputActions.insertText("\n\n" + prompt, span) === false) return { ok: false, error: operation };
		} else if (inputActions.setDraft(prompt) === false) {
			return { ok: false, error: operation };
		}
		return { ok: true, error: "" };
	} catch (_error) {
		return { ok: false, error: operation };
	}
}

/** A modal must insert using the revision captured before the composer lost focus. */
function capturePromptInsertion(draft, actions) {
	try {
		const span = actions.captureInsertion();
		return span && typeof span === "object" ? { draft, span } : null;
	} catch (_) { return null; }
}

function fillCapturedPrompt(prompt, actions, captured, currentDraft) {
	if (!captured || captured.draft !== currentDraft) return { ok: false, error: "stale" };
	try {
		return { ok: actions.insertText((captured.draft.length ? "\n\n" : "") + prompt, captured.span) !== false };
	} catch (_) { return { ok: false, error: "insert" }; }
}

module.exports = { fillPrompt, capturePromptInsertion, fillCapturedPrompt };
