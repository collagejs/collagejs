/**
 * Ensures that the global CollageJs object exists.
 */
export function ensureGlobalCollageJs() {
    if (!globalThis.CollageJs) {
        globalThis.CollageJs = {};
    }
}
