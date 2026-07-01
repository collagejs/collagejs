import type { Mount, MountFn } from "./types.js";

/**
 * Creates a mount function that can only be called once. If the mount function is called more than once, it will throw
 * an error. This effectively prevents a piece from being mounted more than once.
 *
 * Use this on core piece objects that cannot guarantee the integrity of their state after they unmount.
 *
 * @example
 * import { preventRemount } from "@collagejs/core";
 *
 * export function myCorePieceFactory() {
 *   ...
 *   return {
 *     // The most logical place is at the very beginning of the mount array.
 *     mount: [preventRemount(), myMount],
 *     update: ...,
 *     capabilities: {
 *       // Informational only:  Allow the core piece object to answer the question.
 *       remountable: false,
 *     }
 *   };
 * }
 *
 * ### 💡 Tips
 *
 * - Try to always follow the "fail fast" principle, so call `preventRemount()` as early as possible in the mount array.
 * - If for any reason the mount operation is expected to fail (for whatever needed reason), consider moving the call
 * to `preventRemount()` after the mount operation that may fail, so that the piece object does not have to be
 * discarded unnecessarily.
 * @returns A mount function that throws an error if called more than once.
 */
export function preventRemount<TProps extends Record<string, any> = Record<string, any>>(): MountFn<TProps> {
    let mountCount = 0;
    return () => {
        if (mountCount > 0) {
            throw new Error("This piece cannot be mounted more than once.  If this is unexpected, you might be unknowingly sharing the same piece object in different places or Piece components.");
        }
        ++mountCount;
        return Promise.resolve(() => Promise.resolve());
    };
}
