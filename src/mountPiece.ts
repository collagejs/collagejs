import { MountedPiece, mountKey } from "./MountedPiece.js";
import type { CorePiece, MountPiece } from "./types.js";

export async function mountPieceCore<TProps extends Record<string, any> = Record<string, any>>(
    this: MountedPiece | undefined,
    piece: CorePiece<TProps>,
    target: HTMLElement,
    props?: TProps,
): Promise<MountedPiece<TProps>> {
    const mp = new MountedPiece(piece, mountPieceCore<TProps>, this);
    await mp[mountKey](target, props);
    return mp;
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
    return (mountPieceCore.bind<MountPiece<TProps>>(undefined))(piece, target, props);
}
