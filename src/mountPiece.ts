import { MountedPiece, mountKey } from "./MountedPiece.js";
import type { CorePiece, MountPiece } from "./types.js";

/**
 * Constructor type for MountedPiece classes.
 * 
 * This exists merely to allow unit testing.
 */
export interface MountedPieceConstructor {
    new <TProps extends Record<string, any> = Record<string, any>>(
        piece: CorePiece<TProps>, 
        mountPiece: MountPiece<any>, 
        parent?: MountedPiece<any>
    ): MountedPiece<TProps>;
}

export async function mountPieceCore<TProps extends Record<string, any> = Record<string, any>>(
    this: MountedPiece | undefined,
    piece: CorePiece<TProps> | Promise<CorePiece<TProps>>,
    target: HTMLElement,
    props?: TProps,
    MountedPieceClass: MountedPieceConstructor = MountedPiece
): Promise<MountedPiece<TProps>> {
    if (piece instanceof Promise) {
        piece = await piece;
    }
    const mp = new MountedPieceClass(piece, mountPieceCore<TProps>, this);
    await mp[mountKey](target, props);
    return mp as MountedPiece<TProps>;
}

/**
 * Mounts the CollageJS piece as a child of the target element.
 * @param piece The CollageJS piece to mount.
 * @param target The target element to mount the piece to.
 * @param props The properties to pass to the piece.
 */
export function mountPiece<TProps extends Record<string, any> = Record<string, any>>(
    piece: CorePiece<TProps>,
    target: HTMLElement,
    props?: TProps,
) {
    return mountPieceCore.call<
        MountedPiece | undefined, 
        [CorePiece<TProps> | Promise<CorePiece<TProps>>, HTMLElement, TProps?], 
        Promise<MountedPiece<TProps>>
    >(undefined, piece, target, props);
}
