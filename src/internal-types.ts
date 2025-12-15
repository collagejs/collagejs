import type { UnmountFn, UpdateFn } from "./types.js";

export namespace Internal {
    export type MountedPiece<TProps extends Record<string, any> = Record<string, any>> = {
        update: UpdateFn<TProps>;
        unmount: UnmountFn;
        childPieces: Map<string, MountedPiece>;
    };
}
