/**
 * Verify the actual npm tarball, then smoke-test its relocated static routes.
 * No install, registry access, or third-party Node packages are needed.
 * Requires Node.js, npm, and tar (included with macOS/Linux and modern Windows).
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, posix, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { runInNewContext } from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const temporary = await mkdtemp(join(tmpdir(), "caishen-package-check-"));
const STYLE_URL = "/theme-caishen/styles/client.css";
const MAX_ARCHIVE_BYTES = 2 * 1024 * 1024;
const MAX_UNPACKED_BYTES = 3 * 1024 * 1024;
const routeDirectories = new Map([
	["/theme-caishen/assets/", "assets/runtime"],
	["/theme-caishen/extra/", "assets/runtime"],
	["/theme-caishen/styles/", "lib"],
]);

function command(executable, args, options = {}) {
	const result = spawnSync(executable, args, {
		cwd: root,
		encoding: "utf8",
		maxBuffer: 8 * 1024 * 1024,
		windowsHide: true,
		...options,
	});
	assert.ifError(result.error);
	assert.equal(result.status, 0,
		`${executable} failed (${result.status}):\n${result.stderr || result.stdout}`);
	return result.stdout;
}

function exportTargets(value) {
	if (typeof value === "string") return [value];
	if (value === null) return [];
	assert.ok(value && typeof value === "object", "invalid package export target");
	return Object.values(value).flatMap(exportTargets);
}

function escapeRegex(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

try {
	const archiveDirectory = join(temporary, "archive");
	const extractDirectory = join(temporary, "extracted");
	await Promise.all([mkdir(archiveDirectory), mkdir(extractDirectory)]);
	const npmArgs = ["pack", "--json", "--ignore-scripts", "--pack-destination", archiveDirectory];
	const npmOptions = {
		env: {
			...process.env,
			npm_config_cache: join(temporary, "npm-cache"),
			npm_config_logs_dir: join(temporary, "npm-logs"),
			npm_config_update_notifier: "false",
			npm_config_offline: "true",
			npm_config_audit: "false",
			npm_config_fund: "false",
		},
	};
	// npm run supplies the actual npm CLI path, avoiding .cmd shell handling on Windows.
	const npmCLI = process.env.npm_execpath;
	const npmOutput = npmCLI && /\.(?:c?js|mjs)$/i.test(npmCLI)
		? command(process.execPath, [npmCLI, ...npmArgs], npmOptions)
		: command(process.platform === "win32" ? "npm.cmd" : "npm", npmArgs,
			{ ...npmOptions, shell: process.platform === "win32" });
	const packed = JSON.parse(npmOutput);
	assert.equal(packed.length, 1, "expected one package from npm pack");
	const pack = packed[0];
	assert.equal(typeof pack.filename, "string", "npm pack did not report an archive");
	assert.equal(posix.basename(pack.filename), pack.filename, "unsafe npm archive filename");
	const archive = join(archiveDirectory, pack.filename);
	const files = new Set(pack.files.map((file) => file.path));
	assert.ok(files.size > 0, "npm packed no files");
	const archiveBytes = (await stat(archive)).size;
	assert.ok(archiveBytes <= MAX_ARCHIVE_BYTES,
		`compressed package exceeds 2 MiB: ${archiveBytes} bytes`);
	const forbidden = /(?:^|\/)(?:\.DS_Store|__MACOSX|output|node_modules|\.git|\.dsh|\.ssh|\.aws|\.npmrc|\.env(?:\.[^/]*)?)(?:\/|$)|\.(?:pem|key|p12|pfx)$|\.(?:tgz|log)$/i;
	const allowed = /^(?:package\.json|README\.md|LICENSE|CHANGELOG\.md|cordis\.patch\.yml|lib\/(?:index\.js|client\.js|client\.css|host\/[^/]+\.js)|locale\/[^/]+\.json|reference\/tokens\.json|assets\/README\.md|assets\/application\/plugin\/icon\.svg|assets\/runtime\/(?:images|icons|decor)\/(?:[^/]+\/)*[^/]+\.(?:png|webp|svg|jpe?g|woff2|json))$/;
	const developmentDirectories = /(?:^|\/)(?:source|archive|application|dock|previews|docs|src|scripts)(?:\/|$)/i;
	for (const file of files) {
		assert.equal(posix.normalize(file), file, `non-canonical package path: ${file}`);
		assert.ok(!posix.isAbsolute(file) && !file.startsWith("../") && !file.includes("\\"),
			`unsafe package path: ${file}`);
		assert.ok(!forbidden.test(file), `development/private file leaked into package: ${file}`);
		assert.ok(allowed.test(file), `file outside the runtime release inventory: ${file}`);
		assert.ok(file === "assets/application/plugin/icon.svg" || !developmentDirectories.test(file),
			`source/reference artwork or development directory leaked into package: ${file}`);
	}
	// Inspect archive paths before extraction, independently of npm's JSON inventory.
	const archiveMembers = command("tar", ["-tzf", archive]).split(/\r?\n/).filter(Boolean);
	const archivedFiles = new Set();
	for (const member of archiveMembers) {
		assert.ok(member.startsWith("package/"), `unexpected archive root: ${member}`);
		const file = member.slice("package/".length).replace(/\/$/, "");
		if (!file) continue;
		assert.equal(posix.normalize(file), file, `unsafe archive member: ${member}`);
		assert.ok(!file.startsWith("../") && !file.includes("\\"), `unsafe archive member: ${member}`);
		if (!member.endsWith("/")) archivedFiles.add(file);
	}
	assert.deepEqual([...archivedFiles].sort(), [...files].sort(), "npm inventory differs from tarball contents");
	command("tar", ["-xzf", archive, "-C", extractDirectory]);
	const unpacked = join(extractDirectory, "package");
	let unpackedBytes = 0;
	for (const file of files) {
		const details = await stat(join(unpacked, file));
		assert.ok(details.isFile(), `archive member is not a regular file: ${file}`);
		unpackedBytes += details.size;
	}
	assert.ok(unpackedBytes <= MAX_UNPACKED_BYTES,
		`unpacked package exceeds 3 MiB: ${unpackedBytes} bytes`);
	const manifest = JSON.parse(await readFile(join(unpacked, "package.json"), "utf8"));
	assert.equal(pack.name, manifest.name, "packed name differs from manifest");
	assert.equal(pack.version, manifest.version, "packed version differs from manifest");
	assert.equal(manifest.type, "module", "host entry requires ESM");
	assert.equal(manifest.dsh?.manifestVersion, 1, "missing supported DSH manifest");
	assert.equal(manifest.dsh?.client?.platform, "web", "missing Web GUI client declaration");
	assert.equal(manifest.exports?.["."], `./${manifest.main.replace(/^\.\//, "")}`,
		"main and root export differ");
	for (const target of [manifest.main, manifest.dsh?.bundle?.patch, ...exportTargets(manifest.exports)]) {
		assert.equal(typeof target, "string", "missing entry/export/bundle target");
		const file = target.replace(/^\.\//, "");
		assert.ok(!file.startsWith("../") && !posix.isAbsolute(file), `entry escapes package: ${target}`);
		if (file.includes("*")) {
			const pattern = new RegExp(`^${file.split("*").map(escapeRegex).join(".*")}$`);
			assert.ok([...files].some((candidate) => pattern.test(candidate)), `empty export pattern: ${target}`);
		} else {
			assert.ok(files.has(file), `entry/export target is absent from tarball: ${target}`);
		}
	}
	for (const required of [
		"README.md", "LICENSE", "CHANGELOG.md", "locale/en.json", "locale/zh.json",
		"lib/index.js", "lib/host/index.js", "lib/host/artwork.js", "lib/client.js", "lib/client.css", "reference/tokens.json",
		"assets/README.md", "assets/application/plugin/icon.svg",
	]) {
		assert.ok(files.has(required), `release metadata missing: ${required}`);
	}
	const patch = await readFile(join(unpacked, manifest.dsh.bundle.patch), "utf8");
	const insertedNames = [...patch.matchAll(/^\s{4,}name:\s*(?:"([^"]+)"|'([^']+)'|([^\s#]+))\s*(?:#.*)?$/gm)]
		.map((match) => match[1] ?? match[2] ?? match[3]);
	assert.ok(insertedNames.includes(manifest.name), "bundle patch does not insert this package name");
	const clientFile = manifest.exports["./client"];
	assert.equal(typeof clientFile, "string", "client export must identify the browser entry");
	const clientSource = await readFile(join(unpacked, clientFile), "utf8");
	const cssSource = await readFile(join(unpacked, "lib/client.css"), "utf8");
	assert.ok(cssSource.trim().length > 0, "packed client stylesheet is empty");
	assert.ok(clientSource.includes(STYLE_URL), "browser entry does not reference the standalone stylesheet");
	const registrations = [];
	runInNewContext(clientSource, {
		window: { __ModuleLoader__: { load(value) { registrations.push(value); } } },
	}, { filename: clientFile, timeout: 1000 });
	assert.equal(registrations.length, 1, "browser entry must register exactly one package factory");
	const [registration] = registrations;
	assert.equal(registration?.id, manifest.name, "browser module id differs from package name");
	assert.equal(typeof registration.factory, "function", "browser module has no factory");
	const localPath = /(?:\/Users\/[^\s/"'<>]+\/|\/home\/[^\s/"'<>]+\/|[A-Za-z]:\\(?:Users|home)\\)/;
	const secret = /-----BEGIN (?:RSA |EC |OPENSSH |DSA |ENCRYPTED )?PRIVATE KEY-----|\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[A-Z0-9]{16}|sk-[A-Za-z0-9_-]{32,})\b/;
	for (const file of files) {
		if (!/\.(?:js|mjs|cjs|json|md|txt|ya?ml|svg|css|html)$/i.test(file) && file !== "LICENSE") continue;
		const contents = await readFile(join(unpacked, file), "utf8");
		assert.ok(!localPath.test(contents), `author-local absolute path in ${file}`);
		assert.ok(!secret.test(contents), `possible credential/private key in ${file}`);
		if (file.endsWith(".svg")) {
			for (const match of contents.matchAll(/(?:\b(?:xlink:)?href\s*=\s*["']([^"']+)["']|\burl\(\s*["']?([^\s"'()]+))/g)) {
				const reference = match[1] ?? match[2];
				if (reference.startsWith("#") || reference.startsWith("data:")) continue;
				assert.ok(!/^(?:[a-z]+:|\/\/|\/)/i.test(reference), `external SVG dependency in ${file}`);
				const target = posix.normalize(posix.join(posix.dirname(file), reference.split(/[?#]/)[0]));
				assert.ok(files.has(target), `missing SVG dependency ${reference} in ${file}`);
			}
		}
	}
	const browserAssets = new Set();
	const bases = new Set([...clientSource.matchAll(/\bconst\s+ASSET_BASE\s*=\s*["']([^"']+)["']/g)]
		.map((match) => match[1]));
	assert.deepEqual([...bases], ["/theme-caishen/assets/"], "unrecognized or inconsistent ASSET_BASE URL");
	const [assetBase] = bases;
	const literalCalls = [...clientSource.matchAll(/\basset\s*\(\s*["']([^"']+)["']\s*\)/g)];
	const allCalls = [...clientSource.matchAll(/\basset\s*\(/g)].filter((match) =>
		!/\bfunction\s+$/.test(clientSource.slice(Math.max(0, match.index - 40), match.index)));
	assert.equal(literalCalls.length, allCalls.length, "dynamic asset() call needs package-check support");
	for (const call of literalCalls) browserAssets.add(assetBase + call[1]);
	for (const source of [clientSource, cssSource]) {
		for (const match of source.matchAll(/(\/theme-caishen\/(?:assets|extra)\/[^"'`\s)]+\.[a-z0-9]+(?:\?[^"'`\s)]*)?)(?=["'`\s)])/gi)) {
			browserAssets.add(match[1]);
		}
	}
	assert.ok(!/@import\b/i.test(cssSource), "stylesheet imports need explicit package-check support");
	const cssURLs = [...cssSource.matchAll(/\burl\(\s*(?:"([^"]*)"|'([^']*)'|([^\s"'()]+))\s*\)/gi)];
	assert.equal(cssURLs.length, [...cssSource.matchAll(/\burl\s*\(/gi)].length,
		"unparsed CSS URL needs package-check support");
	for (const match of cssURLs) {
		const reference = match[1] ?? match[2] ?? match[3];
		if (reference.startsWith("#") || reference.startsWith("data:")) continue;
		const url = new URL(reference, `https://theme-caishen.invalid${STYLE_URL}`);
		assert.equal(url.origin, "https://theme-caishen.invalid", `external CSS dependency: ${reference}`);
		assert.ok(url.pathname.startsWith("/theme-caishen/assets/") || url.pathname.startsWith("/theme-caishen/extra/"),
			`CSS dependency outside runtime artwork routes: ${reference}`);
		browserAssets.add(url.pathname + url.search);
	}
	assert.ok(browserAssets.size >= 10, "too few browser artwork references found");
	// The previous extra route remains an alias for existing installations and URLs.
	browserAssets.add("/theme-caishen/extra/images/merit-badge.webp");
	function resourceFile(url) {
		const pathname = new URL(url, "https://theme-caishen.invalid").pathname;
		const prefix = [...routeDirectories.keys()].find((candidate) => pathname.startsWith(candidate));
		assert.ok(prefix, `unknown browser resource route: ${url}`);
		const relative = decodeURIComponent(pathname.slice(prefix.length));
		assert.equal(posix.normalize(relative), relative, `non-canonical resource URL: ${url}`);
		assert.ok(relative && !posix.isAbsolute(relative) && !relative.startsWith("../") && !relative.includes("\\"),
			`unsafe browser resource URL: ${url}`);
		return { prefix, file: `${routeDirectories.get(prefix)}/${relative}` };
	}
	for (const url of browserAssets) {
		const { file } = resourceFile(url);
		assert.ok(files.has(file), `browser artwork absent from tarball: ${url}`);
		assert.ok((await stat(join(unpacked, file))).size > 0, `empty artwork: ${file}`);
	}
	const host = await import(pathToFileURL(join(unpacked, manifest.main)).href);
	assert.equal(typeof host.apply, "function", "relocated host entry has no apply()");
	const activeRoutes = new Map();
	const disposers = [];
	const scope = {
		webServer: {
			register(route) {
				assert.equal(route.kind, "prefix", "static route must be scoped by prefix");
				assert.ok(routeDirectories.has(route.path + "/"), `unexpected host route: ${route.path}`);
				assert.ok(!activeRoutes.has(route.path), `duplicate route: ${route.path}`);
				assert.equal(typeof route.handler, "function");
				activeRoutes.set(route.path, route.handler);
				return () => activeRoutes.delete(route.path);
			},
		},
		effect(callback) {
			const dispose = callback();
			assert.equal(typeof dispose, "function", "route effect did not return cleanup");
			disposers.push(dispose);
			return dispose;
		},
	};
	host.apply({
		inject(services, callback) {
			assert.deepEqual(services, ["webServer"], "unexpected host service dependency");
			callback(scope);
		},
	});
	assert.equal(activeRoutes.size, routeDirectories.size, "host did not mount all three static routes");
	async function request(route, method, url) {
		let status;
		let headers = {};
		let ended = false;
		let body = Buffer.alloc(0);
		await activeRoutes.get(route)({ method, url }, {
			writeHead(code, values = {}) { status = code; headers = values; },
			end(value) { ended = true; if (value !== undefined) body = Buffer.from(value); },
		});
		assert.ok(ended, `${method} ${url} never ended`);
		assert.equal(typeof status, "number", `${method} ${url} has no status`);
		return { status, headers, body };
	}
	for (const url of [...browserAssets, STYLE_URL]) {
		const { prefix, file } = resourceFile(url);
		const response = await request(prefix.slice(0, -1), "GET", url);
		assert.equal(response.status, 200, `relocated resource GET failed: ${url}`);
		const expected = await readFile(join(unpacked, file));
		assert.deepEqual(response.body, expected, `resource bytes differ: ${url}`);
		assert.equal(Number(response.headers["content-length"]), expected.length, `resource length differs: ${url}`);
		if (url === STYLE_URL) {
			assert.equal(response.headers["content-type"], "text/css; charset=utf-8", "wrong stylesheet MIME type");
		} else {
			assert.ok(/^image\//.test(response.headers["content-type"]), `wrong artwork MIME type: ${url}`);
		}
	}
	for (const url of [
		"/theme-caishen/assets/images/caishen-scene-lettered.webp",
		"/theme-caishen/extra/images/merit-badge.webp",
		STYLE_URL,
	]) {
		const route = [...activeRoutes.keys()].find((candidate) => url.startsWith(candidate + "/"));
		const response = await request(route, "HEAD", `${url}?release-check=1`);
		const { file } = resourceFile(url);
		assert.equal(response.status, 200, `relocated resource HEAD failed: ${url}`);
		assert.equal(response.body.length, 0, `HEAD sent a body: ${url}`);
		assert.equal(Number(response.headers["content-length"]), (await stat(join(unpacked, file))).size,
			`HEAD content length differs: ${url}`);
		assert.equal(response.headers["content-type"], url === STYLE_URL ? "text/css; charset=utf-8" : "image/webp",
			`wrong HEAD MIME type: ${url}`);
	}
	for (const file of ["client.js", "index.js", "package.json", "client.css.map"]) {
		for (const method of ["GET", "HEAD"]) {
			const response = await request("/theme-caishen/styles", method, `/theme-caishen/styles/${file}`);
			assert.equal(response.status, 404, `stylesheet route exposed ${file} via ${method}`);
			assert.equal(response.body.length, 0, `stylesheet route leaked ${file}`);
		}
	}
	for (const route of activeRoutes.keys()) {
		for (const method of ["POST", "PUT", "PATCH", "DELETE", "OPTIONS"]) {
			const response = await request(route, method, `${route}/images/missing.webp`);
			assert.equal(response.status, 405, `${method} was not rejected on ${route}`);
			assert.equal(response.body.length, 0, `rejected ${method} leaked a body`);
		}
		const missing = await request(route, "GET", `${route}/images/definitely-missing.webp`);
		assert.equal(missing.status, 404, `missing resource did not return 404 on ${route}`);
		assert.equal(missing.body.length, 0, "missing resource leaked a body");
		for (const suffix of ["", "/"]) {
			const response = await request(route, "GET", route + suffix);
			assert.equal(response.status, 404, `route directory was exposed: ${route + suffix}`);
			assert.equal(response.body.length, 0, "directory request leaked a body");
		}
		for (const suffix of [
			"../package.json", "%2e%2e%2fpackage.json", "%2e%2e%5cpackage.json",
			"%2e%2e%2f%2e%2e%2fpackage.json", "%00package.json", "%ZZ", "/package.json",
		]) {
			const response = await request(route, "GET", `${route}/${suffix}`);
			assert.ok([400, 403, 404].includes(response.status), `unsafe URL was accepted: ${route}/${suffix}`);
			assert.equal(response.body.length, 0, `unsafe URL leaked file contents: ${route}/${suffix}`);
		}
	}
	for (const dispose of disposers) dispose();
	assert.equal(activeRoutes.size, 0, "host cleanup left static routes registered");
	console.log(`ok — ${pack.name}@${pack.version}: ${files.size} packed files, ${archiveBytes} compressed / ${unpackedBytes} unpacked bytes, ${browserAssets.size} artwork URLs, standalone CSS, GET/HEAD and read-only/path checks`);
} finally {
	await rm(temporary, { recursive: true, force: true });
}
