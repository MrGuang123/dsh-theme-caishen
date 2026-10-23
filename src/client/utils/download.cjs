/** Request a local browser download and release the temporary URL after dispatch. */
function downloadText(filename, text, type = "application/json") {
	if (typeof document === "undefined" || typeof Blob !== "function" || typeof URL === "undefined"
		|| typeof URL.createObjectURL !== "function" || typeof URL.revokeObjectURL !== "function"
		|| typeof setTimeout !== "function" || typeof filename !== "string" || typeof text !== "string") {
		throw new Error("download");
	}
	let anchor;
	let objectURL;
	try {
		const parent = document.body || document.documentElement;
		if (!parent) throw new Error("download");
		anchor = document.createElement("a");
		objectURL = URL.createObjectURL(new Blob([text], { type }));
		anchor.href = objectURL;
		anchor.download = filename.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-");
		anchor.hidden = true;
		parent.appendChild(anchor);
		anchor.click();
		return true;
	} catch (_error) {
		throw new Error("download");
	} finally {
		try { anchor?.remove(); } catch (_error) { /* Cleanup must not hide the download result. */ }
		if (objectURL) {
			const revoke = () => { try { URL.revokeObjectURL(objectURL); } catch (_error) { /* Browser is closing. */ } };
			try { setTimeout(revoke, 1000); } catch (_error) { revoke(); }
		}
	}
}

module.exports = { downloadText };
