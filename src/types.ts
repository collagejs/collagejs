/**
 * Properties passed to `mount()` functions of `CorePiece` objects.  It extends the piece's supported objects with a
 * property of type `symbol` that carries the piece parent's `mountPiece()` function.
 */
export type MountProps<TProps extends Record<string, any> = Record<string, any>> = TProps & {
    [x: symbol]: MountPiece<TProps>;
};
/**
 * Signature for unmount (cleanup) functions, including the ones returned by `CorePiece.mount()`.
 */
export type UnmountFn = () => Promise<void>;
/**
 * Type that defines the signature of the functions accepted in `CorePiece.mount`.
 * @param target The HTML target where the piece will be mounted as a child.
 * @param props The piece's initial property values.
 * @returns A promise to the cleanup function that unmounts the piece.
 */
export type MountFn<TProps extends Record<string, any> = Record<string, any>> = (target: HTMLElement, props?: MountProps<TProps>) => Promise<UnmountFn>;
/**
 * Type that defines the signature of the functions accepted in `CorePiece.update`.
 * @param props The new property values for the mounted piece.
 * @returns A promise that resolves once the process of updating property values concludes.
 */
export type UpdateFn<TProps extends Record<string, any> = Record<string, any>> = (props: TProps) => Promise<void>;
/**
 * Defines the accepted shapes for `CorePiece.mount`.
 */
export type Mount<TProps extends Record<string, any> = Record<string, any>> = MountFn<TProps> | MountFn<TProps>[] | Mount<TProps>[];
/**
 * Defines the accepted shapes for `CorePiece.update`.
 */
export type Update<TProps extends Record<string, any> = Record<string, any>> = UpdateFn<TProps> | UpdateFn<TProps>[] | Update[];
/**
 * Defines the contract that objects must follow in order to be mountable as *CollageJS* pieces (micro-frontends).
 */
export interface CorePiece<TProps extends Record<string, any> = Record<string, any>> {
    /**
     * Mounts the piece (micro-frontend) in the document.  Every mount function should always return a cleanup function
     * that, when called, unmounts the piece.
     */
    mount: Mount<TProps>;
    /**
     * Updates the piece property values.  This is optional.  If not provided, the piece won't support property updates
     * while mounted in the document, and all property values must have been passed during mounting.
     */
    update?: Update<TProps>;
};
/**
 * Defines the shape of the object returned by the process of mounting a `CorePiece` object.
 */
export interface MountedPiece<TProps extends Record<string, any> = Record<string, any>> {
    /**
     * Function used to apply updated property values to the mounted `CorePiece` object.
     */
    update: UpdateFn<TProps>;
    /**
     * Function used to unmount the `CorePiece` object.
     */
    unmount: UnmountFn;
    /**
     * The version of the global `mountPiece` function that tracks mounted children so their unmounting is
     * synchronized with this piece's unmount event.
     *
     * **IMPORTANT:**  Always use this function instead of the global `mountPiece` function when mounting other
     * `CorePiece` objects inside the mounted `CorePiece` object to prevent lifecycle issues.
     */
    mountPiece: MountPiece<TProps>;
};
/**
 * Type definition for the `mountPiece` functions that mount *CollageJS* pieces in the HTML document.
 *
 * **NOTE:**  There is a global `mountPiece` function, and then every mounted *CollageJS* piece that gets mounted
 * generates a version of the global function that works identically, except that it tracks the `CollageJS` pieces
 * mounted with it so these are unmounted automatically as soon as the parent is unmounted.
 * @param piece `CorePiece` object to mount in the provided target, or a promise that resolves said object.
 * @param target HTML element where to mount
 * @param props Optional properties for the `CorePiece` object.
 */
export type MountPiece<TProps extends Record<string, any> = Record<string, any>>
    = (
        piece: CorePiece<TProps> | Promise<CorePiece<TProps>>,
        target: HTMLElement,
        props?: TProps
    ) => Promise<MountedPiece<TProps>>;

declare global {
    /**
     * Defines the capabilities in the global `CollageJs` object.
     */
    interface CollageJs { }

    /**
     * Global object that provides functionality outside bundling.
     */
    var CollageJs: CollageJs;
}
