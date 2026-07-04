import type { CorePiece } from "./types.js";

const np = {
    mount: () => Promise.resolve(() => Promise.resolve()),
};

/**
 * Utility function that provides a no-op `CorePiece` object. This is useful for testing or when a placeholder piece is
 * needed.
 *
 * **⚠️IMPORTANT**:  The returned object is a singleton.  This is **not** a factory function that creates a new object
 * each time it is called.  If you need a new object, you should create your own.
 * @template TProps The type of the properties for the `CorePiece`. Defaults to `Record<string, any>`.
 * @template TCap The type of the capabilities for the `CorePiece`. Defaults to an empty object `{}`.
 * @returns {CorePiece<TProps, TCap>} A no-op `CorePiece` object properly typed.
 */
export function noopPiece<
    TProps extends Record<string, any> = Record<string, any>,
    TCap extends Record<string, any> = {},
    >() {
    return np as CorePiece<TProps, TCap>;
}
