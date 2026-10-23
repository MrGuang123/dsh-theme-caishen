const { createPromptCardStore } = require("./prompt-store.cjs");
const { createPromptPreferences } = require("./prompt-preferences.cjs");
const { LAYER } = require("../config.cjs");

const { projectForSession, useProjectContext } = require("../adapter/host.cjs");
function createPromptLibraries(globalStore, globalPreferences) {
	const projects = new Map();
	return {
		global: { cardStore: globalStore, preferences: globalPreferences },
		project(id) {
			if (typeof id !== "string" || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,199}$/.test(id)) throw Error("Invalid workspace identity");
			if (!projects.has(id)) {
				const prefix = LAYER + ":project:" + id;
				const cardStore = createPromptCardStore({ key: prefix + ":prompt-cards:v1", recoveryKey: prefix + ":recovery:v1", empty: [] });
				cardStore.scope = Object.freeze({ kind: "project", id });
				projects.set(id, { cardStore, preferences: createPromptPreferences(prefix + ":prompt-usage:v1") });
			}
			return projects.get(id);
		}
	};
}
module.exports = { projectForSession, useProjectContext, createPromptLibraries };
