/** Serve runtime artwork and the standalone stylesheet in both Web and desktop DSH. */
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { artworkHandler } from "./artwork.js";

const artworkDirectory = resolve(fileURLToPath(new URL("../../assets/runtime/", import.meta.url)));
const stylesDirectory = resolve(fileURLToPath(new URL("../../lib/", import.meta.url)));
const ROUTES = [
	{ path: "/theme-caishen/assets", directory: artworkDirectory, label: "artwork route" },
	// Keep old /extra URLs working after consolidating the two artwork folders.
	{ path: "/theme-caishen/extra", directory: artworkDirectory, label: "legacy artwork alias" },
	{ path: "/theme-caishen/styles", directory: stylesDirectory, allowedFiles: ["client.css"], label: "stylesheet route" }
];

export function apply(ctx) {
	ctx.inject(["webServer"], (scope) => {
		for (const route of ROUTES) {
			scope.effect(
				() => scope.webServer.register({
					kind: "prefix",
					path: route.path,
					handler: artworkHandler(route.directory, route.path + "/", route.allowedFiles)
				}),
				"theme-caishen: " + route.label
			);
		}
	});
}
