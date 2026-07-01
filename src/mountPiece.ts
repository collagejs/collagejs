import { MountedPiece, mountKey } from "./MountedPiece.js";
import type { AcceptableTarget, CorePiece, MountPiece } from "./types.js";

/**
 * Constructor type for MountedPiece classes.
 *
 * This exists merely to allow unit testing.
 */
export interface MountedPieceConstructor {
    new (
        piece: CorePiece<any, any>,
        mountPiece: MountPiece<any, any>,
        parent?: MountedPiece<any, any>
    ): MountedPiece<any, any>;
}

export async function mountPieceCore<
    TProps extends Record<string, any> = Record<string, any>,
    TCap extends Record<string, any> = {}
>(
    this: MountedPiece<any, any> | undefined,
    piece: CorePiece<TProps, TCap> | Promise<CorePiece<TProps, TCap>>,
    target: AcceptableTarget,
    props?: TProps,
    MountedPieceClass: MountedPieceConstructor = MountedPiece
): Promise<MountedPiece<TProps, TCap>> {
    if (piece instanceof Promise) {
        piece = await piece;
    }
    const mp = new MountedPieceClass(piece, mountPieceCore, this);
    await mp[mountKey](target, props);
    return mp as MountedPiece<TProps, TCap>;
}

/**
 * Mounts the CollageJS piece as a child of the target element.
 * @param piece The CollageJS piece to mount.
 * @param target The target HTML element or shadow root where to mount the piece.
 * @param props The properties to pass to the piece.
 */
export function mountPiece<TProps extends Record<string, any> = Record<string, any>, TCap extends Record<string, any> = {}>(
    piece: CorePiece<TProps, TCap>,
    target: AcceptableTarget,
    props?: TProps,
) {
    return mountPieceCore.call<
        MountedPiece | undefined,
        [CorePiece<TProps, TCap> | Promise<CorePiece<TProps, TCap>>, AcceptableTarget, TProps?],
        Promise<MountedPiece<TProps, TCap>>
    >(undefined, piece, target, props);
}
