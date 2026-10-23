/** Accent presets leave host appearance mode, typography and semantic error colors alone. */
const PRESETS = Object.freeze({
	classic: { light: "#a51c15", dark: "#f3c46a", fill: ["#b3261e", "#b3261e"], hover: ["#8f1d16", "#8f1d16"], ink: ["#fff8ec", "#fff8ec"] },
	jade: { light: "#236454", dark: "#91d5b6", fill: ["#236454", "#236454"], hover: ["#194b3f", "#194b3f"], ink: ["#fff8ec", "#fff8ec"] },
	ink: { light: "#34485e", dark: "#b0c9e2", fill: ["#34485e", "#34485e"], hover: ["#25364a", "#25364a"], ink: ["#fff8ec", "#fff8ec"] }
});
function presetTokens(name) {
	const preset = PRESETS[name] || PRESETS.classic;
	const pair = { light: preset.light, dark: preset.dark };
	return {
		"--dsw-alias-state-business-primary": pair,
		"--dsw-alias-link": pair,
		"--shiki-token-link": pair,
		"--dsw-alias-brand-primary": { light: preset.fill[0], dark: preset.fill[1] },
		"--dsw-alias-button-primary-fill": { light: preset.fill[0], dark: preset.fill[1] },
		"--dsw-alias-button-primary-hover": { light: preset.hover[0], dark: preset.hover[1] },
		"--dsw-alias-button-info-fill": { light: preset.fill[0], dark: preset.fill[1] },
		"--dsw-alias-button-info-hover": { light: preset.hover[0], dark: preset.hover[1] },
		"--dsw-alias-label-primary-foreground": { light: preset.ink[0], dark: preset.ink[1] }
	};
}
module.exports = { PRESETS, presetTokens };
