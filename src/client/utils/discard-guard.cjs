const React = require("react");
const h = React.createElement;

/** One close path for buttons, Escape and backdrop; the dialog owns final cleanup. */
function useDiscardGuard({ dirty, onClose, dialog, fallbackSelector }) {
	const [confirming, setConfirming] = React.useState(false);
	const keepButton = React.useRef(null);
	const lastEditing = React.useRef(null);
	React.useEffect(() => {
		const editing = dialog.current?.querySelector("[data-discard-editing]");
		if (editing) editing.inert = confirming;
		if (confirming) keepButton.current?.focus();
		return () => { if (editing) editing.inert = false; };
	}, [confirming]);
	function requestClose() {
		if (!dirty) { onClose(); return; }
		setConfirming(true);
		if (confirming) keepButton.current?.focus();
	}
	function keep() {
		setConfirming(false);
		window.requestAnimationFrame(() => {
			const target = lastEditing.current;
			if (target?.isConnected && !target.disabled) target.focus({ preventScroll: true });
			else dialog.current?.querySelector(fallbackSelector)?.focus({ preventScroll: true });
		});
	}
	return {
		confirming, keepButton, requestClose, keep, discard: onClose,
		rememberFocus(event) {
			if (!confirming && event.target.closest?.("[data-discard-editing]")) lastEditing.current = event.target;
		},
		onCancel(event) { event.preventDefault(); requestClose(); },
		onBackdrop(event) {
			const element = dialog.current;
			if (event.target !== element) return;
			const rect = element.getBoundingClientRect();
			if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) requestClose();
		}
	};
}

function DiscardChanges({ guard, t, id }) {
	return h(React.Fragment, null,
		h("p", { id, className: "caishen-editor__delete-message", role: "alert" }, t("discard.message")),
		h("span", { className: "caishen-editor__footer-spacer" }),
		h("button", { type: "button", ref: guard.keepButton, className: "caishen-editor__button",
			"aria-describedby": id, onClick: guard.keep }, t("discard.keep")),
		h("button", { type: "button", className: "caishen-editor__button caishen-editor__button--danger",
			onClick: guard.discard }, t("discard.confirm")));
}

module.exports = { useDiscardGuard, DiscardChanges };
