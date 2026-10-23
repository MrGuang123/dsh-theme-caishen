/** Stable public identity, local persistence namespace and browser resource URLs. */
const LAYER = "dsh-theme-caishen";
const NS = "theme-caishen";
const ASSET_BASE = "/theme-caishen/assets/";
const STYLESHEET_URL = "/theme-caishen/styles/client.css";
const CARD_TONES = Object.freeze(["red", "green", "gold", "teal", "blue", "purple", "rose", "brown"]);
const asset = (path) => ASSET_BASE + path;

module.exports = { LAYER, NS, ASSET_BASE, STYLESHEET_URL, CARD_TONES, asset };
