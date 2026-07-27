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
    TMeta extends Record<string, any> = {}
>(
    this: MountedPiece<any, any> | undefined,
    piece: CorePiece<TProps, TMeta> | Promise<CorePiece<TProps, TMeta>>,
    target: AcceptableTarget,
    props?: TProps,
    MountedPieceClass: MountedPieceConstructor = MountedPiece
): Promise<MountedPiece<TProps, TMeta>> {
    if (piece instanceof Promise) {
        piece = await piece;
    }
    const mp = new MountedPieceClass(piece, mountPieceCore, this);
    await mp[mountKey](target, props);
    return mp as MountedPiece<TProps, TMeta>;
}

/**
 * Mounts the CollageJS piece as a child of the target element.
 * @param piece The CollageJS piece to mount.
 * @param target The target HTML element or shadow root where to mount the piece.
 * @param props The properties to pass to the piece.
 */
export function mountPiece<TProps extends Record<string, any> = Record<string, any>, TMeta extends Record<string, any> = {}>(
    piece: CorePiece<TProps, TMeta>,
    target: AcceptableTarget,
    props?: TProps,
) {
    return mountPieceCore.call<
        MountedPiece | undefined,
        [CorePiece<TProps, TMeta> | Promise<CorePiece<TProps, TMeta>>, AcceptableTarget, TProps?],
        Promise<MountedPiece<TProps, TMeta>>
    >(undefined, piece, target, props);
}
