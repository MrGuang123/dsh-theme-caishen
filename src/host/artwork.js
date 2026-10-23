import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

const TYPES = {
	".png": "image/png",
	".webp": "image/webp",
	".svg": "image/svg+xml",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".woff2": "font/woff2",
	".json": "application/json; charset=utf-8",
	".css": "text/css; charset=utf-8"
};

/** Read-only resource handler; an optional allow-list restricts the styles route. */
export function artworkHandler(directory, prefix, allowedFiles) {
	return async (request, response) => {
		if (request.method !== "GET" && request.method !== "HEAD") {
			response.writeHead(405);
			response.end();
			return;
		}
		let pathname;
		try {
			pathname = decodeURIComponent(new URL(request.url ?? "/", "http://theme-caishen.invalid").pathname);
		} catch (_error) {
			response.writeHead(400);
			response.end();
			return;
		}
		if (!pathname.startsWith(prefix)) {
			response.writeHead(404);
			response.end();
			return;
		}
		const relative = pathname.slice(prefix.length);
		if (relative.length === 0 || relative.includes("\0")) {
			response.writeHead(404);
			response.end();
			return;
		}
		const file = resolve(directory, relative);
		if (file !== directory && !file.startsWith(directory + sep)) {
			response.writeHead(403);
			response.end();
			return;
		}
		if (allowedFiles && !allowedFiles.includes(relative)) {
			response.writeHead(404);
			response.end();
			return;
		}
		try {
			const body = await readFile(file);
			response.writeHead(200, {
				"content-type": TYPES[extname(file).toLowerCase()] ?? "application/octet-stream",
				"content-length": body.byteLength,
				"cache-control": "no-cache"
			});
			response.end(request.method === "HEAD" ? undefined : body);
		} catch (error) {
			response.writeHead(error && error.code === "ENOENT" ? 404 : 500);
			response.end();
		}
	};
}
