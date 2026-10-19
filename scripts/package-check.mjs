/**
 * Verify the actual npm tarball, then smoke-test its relocated artwork server.
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
	const forbidden = /(?:^|\/)(?:\.DS_Store|__MACOSX|output|node_modules|\.git|\.dsh|\.ssh|\.aws|\.npmrc|\.env(?:\.[^/]*)?)(?:\/|$)|\.(?:pem|key|p12|pfx)$|\.(?:tgz|log)$/i;
	for (const file of files) {
		assert.equal(posix.normalize(file), file, `non-canonical package path: ${file}`);
		assert.ok(!posix.isAbsolute(file) && !file.startsWith("../") && !file.includes("\\"),
			`unsafe package path: ${file}`);
		assert.ok(!forbidden.test(file), `development/private file leaked into package: ${file}`);
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
	for (const required of ["README.md", "LICENSE", "locale/en.json", "locale/zh.json"]) {
		assert.ok(files.has(required), `release metadata missing: ${required}`);
	}
	const patch = await readFile(join(unpacked, manifest.dsh.bundle.patch), "utf8");
	const insertedNames = [...patch.matchAll(/^\s{4,}name:\s*(?:"([^"]+)"|'([^']+)'|([^\s#]+))\s*(?:#.*)?$/gm)]
		.map((match) => match[1] ?? match[2] ?? match[3]);
	assert.ok(insertedNames.includes(manifest.name), "bundle patch does not insert this package name");
	const clientFile = manifest.exports["./client"];
	assert.equal(typeof clientFile, "string", "client export must identify the browser entry");
	const clientSource = await readFile(join(unpacked, clientFile), "utf8");
	let registration;
	runInNewContext(clientSource, {
		window: { __ModuleLoader__: { load(value) { registration = value; } } },
	}, { filename: clientFile, timeout: 1000 });
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
	const routeDirectories = new Map([
		["/theme-caishen/assets/", "caishen-assets"],
		["/theme-caishen/extra/", "caishen-extra-assets"],
	]);
	const browserAssets = new Set();
	for (const [helper, constant] of [["asset", "ASSET_BASE"], ["extra", "EXTRA_BASE"]]) {
		const base = clientSource.match(new RegExp(`\\bconst\\s+${constant}\\s*=\\s*["']([^"']+)["']`))?.[1];
		assert.ok(routeDirectories.has(base), `unrecognized ${constant} URL`);
		const calls = [...clientSource.matchAll(new RegExp(`\\b${helper}\\s*\\(\\s*["']([^"']+)["']\\s*\\)`, "g"))];
		assert.equal(calls.length, [...clientSource.matchAll(new RegExp(`\\b${helper}\\s*\\(`, "g"))].length,
			`dynamic ${helper}() call needs package-check support`);
		for (const call of calls) browserAssets.add(base + call[1]);
	}
	for (const match of clientSource.matchAll(/(\/theme-caishen\/(?:assets|extra)\/[^"'`\s)]+\.[a-z0-9]+)(?=["'`\s)])/gi)) {
		browserAssets.add(match[1]);
	}
	assert.ok(browserAssets.size >= 10, "too few browser artwork references found");
	for (const url of browserAssets) {
		const prefix = [...routeDirectories.keys()].find((candidate) => url.startsWith(candidate));
		assert.ok(prefix, `unknown browser artwork route: ${url}`);
		const relative = `${routeDirectories.get(prefix)}/${url.slice(prefix.length)}`;
		assert.ok(files.has(relative), `browser artwork absent from tarball: ${url}`);
		assert.ok((await stat(join(unpacked, relative))).size > 0, `empty artwork: ${relative}`);
	}
	const host = await import(pathToFileURL(join(unpacked, manifest.main)).href);
	assert.equal(typeof host.apply, "function", "relocated host entry has no apply()");
	const activeRoutes = new Map();
	const disposers = [];
	const scope = {
		webServer: {
			register(route) {
				assert.equal(route.kind, "prefix", "artwork route must be scoped by prefix");
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
	assert.equal(activeRoutes.size, routeDirectories.size, "host did not mount both artwork routes");
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
	for (const url of browserAssets) {
		const prefix = [...routeDirectories.keys()].find((candidate) => url.startsWith(candidate));
		const response = await request(prefix.slice(0, -1), "GET", url);
		assert.equal(response.status, 200, `relocated artwork GET failed: ${url}`);
		const expected = await readFile(join(unpacked, routeDirectories.get(prefix), url.slice(prefix.length)));
		assert.deepEqual(response.body, expected, `artwork bytes differ: ${url}`);
		assert.equal(Number(response.headers["content-length"]), expected.length, `artwork length differs: ${url}`);
		assert.ok(/^image\//.test(response.headers["content-type"]), `wrong artwork MIME type: ${url}`);
	}
	for (const url of [
		"/theme-caishen/assets/images/caishen-scene-lettered.webp",
		"/theme-caishen/extra/images/merit-badge.webp",
	]) {
		const route = [...activeRoutes.keys()].find((candidate) => url.startsWith(candidate + "/"));
		const response = await request(route, "HEAD", `${url}?release-check=1`);
		assert.equal(response.status, 200, `relocated artwork HEAD failed: ${url}`);
		assert.equal(response.body.length, 0, `HEAD sent a body: ${url}`);
		assert.ok(Number(response.headers["content-length"]) > 0, `HEAD lost content length: ${url}`);
		assert.equal(response.headers["content-type"], "image/webp", `wrong WebP MIME type: ${url}`);
	}
	for (const route of activeRoutes.keys()) {
		for (const method of ["POST", "PUT", "PATCH", "DELETE", "OPTIONS"]) {
			const response = await request(route, method, `${route}/images/missing.webp`);
			assert.equal(response.status, 405, `${method} was not rejected on ${route}`);
			assert.equal(response.body.length, 0, `rejected ${method} leaked a body`);
		}
		const missing = await request(route, "GET", `${route}/images/definitely-missing.webp`);
		assert.equal(missing.status, 404, `missing artwork did not return 404 on ${route}`);
		assert.equal(missing.body.length, 0, "missing artwork leaked a body");
		for (const suffix of [
			"../package.json", "%2e%2e%2fpackage.json", "%2e%2e%5cpackage.json",
			"%2e%2e%2f%2e%2e%2fpackage.json", "%00package.json", "%ZZ",
		]) {
			const response = await request(route, "GET", `${route}/${suffix}`);
			assert.ok([400, 403, 404].includes(response.status), `unsafe URL was accepted: ${route}/${suffix}`);
			assert.equal(response.body.length, 0, `unsafe URL leaked file contents: ${route}/${suffix}`);
		}
	}
	for (const dispose of disposers) dispose();
	assert.equal(activeRoutes.size, 0, "host cleanup left artwork routes registered");
	console.log(`ok — ${pack.name}@${pack.version}: ${files.size} packed files, ${browserAssets.size} relocated artwork URLs, GET/HEAD and read-only/path checks`);
} finally {
	await rm(temporary, { recursive: true, force: true });
}
