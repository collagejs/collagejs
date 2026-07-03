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
 * Defines the possible return values of `CorePiece.relocate`.
 */
export type RelocationResult = boolean | 'ready';
/**
 * Type that defines the signature of the functions accepted in `CorePiece.relocate`.
 * @param parent The current parent of the piece's root element(s).
 * @param newParent The new parent where the piece's root element(s) will be relocated.
 * @returns A promise that resolves to `true` if the relocation was successful, `false` if it failed or relocation
 * is disallowed, or `'ready'` if the piece is ready to be relocated, but the relocation must be performed by the
 * caller.
 */
export type RelocateFn = (parent: AcceptableTarget, newParent: AcceptableTarget) => Promise<RelocationResult>;
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
export type Update<TProps extends Record<string, any> = Record<string, any>> = UpdateFn<TProps> | UpdateFn<TProps>[] | Update<TProps>[];
/**
 * Defines the accepted shapes for `CorePiece.relocate`.
 */
export type Relocate = RelocateFn | RelocateFn[] | Relocate[];
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
     * Either relocates the root element(s) of the piece to a new parent, or prepares the piece for relocation.  This
     * is optional.  If not provided, the piece won't support relocation of its root element(s) to a new parent, and
     * the piece will be unmounted and remounted instead in the pertinent cases.
     *
     * ### Return Values
     *
     * + `true`:  The relocation was successful.
     * + `false`:  The relocation failed or is disallowed.
     * + `'ready'`:  The piece is ready to be relocated, but the relocation must be performed by the caller.
     *
     * ### When Using Multiple Relocation Functions
     *
     * If multiple relocation functions are provided, they will be called in order:
     *
     * + If the first of them returns `false`, the relocation process will stop.
     * + If all of them return `true`, the relocation is considered successful.
     * + If any of them returns `'ready'`, the remaining functions are still called, but the caller will
     * run its relocation process after all functions have been called.
     * + If any of them returns `false` after one or more of them returned `'ready'` or `true`, an error is thrown.
     */
    relocate?: Relocate;
    /**
     * Declares the capabilities of the piece.  This is optional.  If not provided, the piece will be assumed to have no
     * capabilities.
     *
     * ### Notable Exception
     *
     * The library defines the `remountable` capability, which is informative only.  The core library cannot enforce
     * this capability, so `CorePiece` developers should use the `preventRemount()` function (or equivalent) to throw an
     * error if the piece is mounted more than once for pieces that cannot withstand multiple mountings.
     *
     * Official framework adapters query the value of `capabilities.remountable` and act accordingly to their best
     * ability, and at least emit a warning if a non-remountable piece is mounted more than once.
     *
     * Only the author of a `CorePiece` object can guarantee that the piece is remountable.  We encourage developers to
     * be explicit about this capability when creating `CorePiece` objects.
     *
     * > ℹ️ **NOTE:**  Official framework adapters are free to choose which default value for `capabilities.remountable`
     * > they will use while creating `CorePiece` objects when the property is not provided in order to maximize
     * > framework feature usage (perhaps a framework can guarantee component state automatically, or perhaps it cannot).
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
     * Function used to relocate the `CorePiece` object to a new parent without unmounting.
     */
    relocate: RelocateFn;
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
