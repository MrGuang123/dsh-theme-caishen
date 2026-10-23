/** Public prompt-card API; model and persistence remain independently testable. */
module.exports = { ...require("./prompt-model.cjs"), ...require("./prompt-store.cjs") };
