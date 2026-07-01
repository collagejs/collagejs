/**
 * Defines the type for acceptable targets for mounting *CollageJS* pieces.
 */
export type AcceptableTarget = HTMLElement | ShadowRoot;
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
 * @param target The HTML or shadow root target where the piece will be mounted as a child.
 * @param props The piece's initial property values.
 * @returns A promise to the cleanup function that unmounts the piece.
 */
export type MountFn<TProps extends Record<string, any> = Record<string, any>> = (target: AcceptableTarget, props?: MountProps<TProps>) => Promise<UnmountFn>;
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
 * Defines the capabilities of a `CorePiece` object recognized by the core *CollageJS* library.  These capabilities are
 * used to determine how the core library should handle the piece's lifecycle, or whether a particular action or
 * feature can be enabled or allowed.
 */
export type CorePieceCapabilities = {
    /**
     * Informative only:  Indicates that the piece can be mounted more than once.
     *
     * Since `@collagejs/core` never injects code into `CorePiece` objects, it cannot enforce this capability.  The
     * only place where this can be enforced is at `CorePiece.mount`.  The core library provides the `preventRemount()`
     * function to help developers create mount functions that throw an error if called more than once.
     *
     * **💡TIP**:  Official framework adapters provide this functionality.
     */
    remountable?: boolean;
    /**
     * Indicates that the piece allows relocation of its HTML markup to a new parent without unmounting.  For the best
     * development experience, piece objects should always strive to be relocatable.
     *
     * If `false`, `Piece` components created with official framework adapters will most likely have to ask HMR to
     * perform a full page reload whenever the developer changes shadow DOM options, like moving from an open to a
     * closed shadow root.
     *
     * If `true` **and if the framework is capable** (i. e. Svelte), the piece can be relocated without unmounting, and
     * HMR will be able to update the shadow root options without a full page reload.
     */
    relocatable?: boolean;
}
/**
 * Defines the contract that objects must follow in order to be mountable as *CollageJS* pieces (micro-frontends).
 */
export interface CorePiece<
    TProps extends Record<string, any> = Record<string, any>,
    TCap extends Record<string, any> = {}
> {
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
    /**
     * Declares the capabilities of the piece.  This is optional.  If not provided, the piece will be assumed to have no
     * capabilities, and the core library will treat it as a simple piece that can be mounted once and unmounted once, and
     * that cannot be relocated or re-mounted.
     *
     * **💡TIP**: Always try to at least create pieces that are relocatable by not storing the original target element in
     * the piece's state.  Instead, just use the piece's root element's `parentElement` property to determine the
     * current parent element.
     */
    readonly capabilities?: CorePieceCapabilities & TCap;
};
/**
 * Defines the shape of the object returned by the process of mounting a `CorePiece` object.
 */
export interface MountedPiece<
    TProps extends Record<string, any> = Record<string, any>,
    TCap extends Record<string, any> = {}
> {
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
    mountPiece<UProps extends Record<string, any> = Record<string, any>, UCap extends CorePieceCapabilities = CorePieceCapabilities>(
        piece: CorePiece<UProps, UCap> | Promise<CorePiece<UProps, UCap>>,
        target: AcceptableTarget,
        props?: UProps
    ): Promise<MountedPiece<UProps, UCap>>;
    /**
     * The declared capabilities of the mounted `CorePiece` object.
     */
    readonly capabilities: (CorePieceCapabilities & TCap) | undefined;
};
/**
 * Type definition for the `mountPiece` functions that mount *CollageJS* pieces in the HTML document.
 *
 * **NOTE:**  There is a global `mountPiece` function, and then every mounted *CollageJS* piece that gets mounted
 * generates a version of the global function that works identically, except that it tracks the `CollageJS` pieces
 * mounted with it so these are unmounted automatically as soon as the parent is unmounted.
 * @param piece `CorePiece` object to mount in the provided target, or a promise that resolves said object.
 * @param target HTML element or shadow root where to mount.
 * @param props Optional properties for the `CorePiece` object.
 */
export type MountPiece<
    TProps extends Record<string, any> = Record<string, any>,
    TCap extends Record<string, any> = {}
> = (
    piece: CorePiece<TProps, TCap> | Promise<CorePiece<TProps, TCap>>,
    target: AcceptableTarget,
    props?: TProps
) => Promise<MountedPiece<TProps, TCap>>;

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
