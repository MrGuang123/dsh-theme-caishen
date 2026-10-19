/**
 * Host half of the Caishen theme package.
 *
 * The browser half owns every visual; this half adds two read-only artwork
 * routes. Serving the files instead of inlining them keeps the client bundle
 * small and lets the theme swap art without rebundling.
 *
 * The desktop shell forwards `dsh-app://app/theme-caishen/{assets,extra}/...`
 * to these Host routes with its own cookie, so the same URLs work in the
 * desktop window and in the browser.
 */
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const TYPES = {
	".png": "image/png",
	".webp": "image/webp",
	".svg": "image/svg+xml",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".woff2": "font/woff2",
	".json": "application/json; charset=utf-8"
};

/** Create a path-safe handler for one artwork directory. */
function artworkHandler(directory, prefix) {
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
		try {
			const body = await readFile(file);
			const type = TYPES[extname(file).toLowerCase()] ?? "application/octet-stream";
			response.writeHead(200, {
				"content-type": type,
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

const ROUTES = [
	{
		dir: resolve(fileURLToPath(new URL("../caishen-assets/", import.meta.url))),
		prefix: "/theme-caishen/assets/",
		path: "/theme-caishen/assets",
		label: "theme-caishen: artwork route"
	},
	{
		dir: resolve(fileURLToPath(new URL("../caishen-extra-assets/", import.meta.url))),
		prefix: "/theme-caishen/extra/",
		path: "/theme-caishen/extra",
		label: "theme-caishen: extra artwork route"
	}
];

export function apply(ctx) {
	ctx.inject(["webServer"], (scope) => {
		for (const route of ROUTES) {
			scope.effect(
				() =>
					scope.webServer.register({
						kind: "prefix",
						path: route.path,
						handler: artworkHandler(route.dir, route.prefix)
					}),
				route.label
			);
		}
	});
}
