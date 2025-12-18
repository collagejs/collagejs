export type MountProps<TProps extends Record<string, any> = Record<string, any>> = TProps & {
    [x: symbol]: MountPiece<TProps>;
};
export type UnmountFn = () => Promise<void>;
export type MountFn<TProps extends Record<string, any> = Record<string, any>> = (target: HTMLElement, props?: MountProps<TProps>) => Promise<UnmountFn>;
export type UpdateFn<TProps extends Record<string, any> = Record<string, any>> = (props: TProps) => Promise<void>;
export type Mount<TProps extends Record<string, any> = Record<string, any>> = MountFn<TProps> | MountFn<TProps>[] | Mount<TProps>[];
export type Update<TProps extends Record<string, any> = Record<string, any>> = UpdateFn<TProps> | UpdateFn<TProps>[] | Update[];

export interface CorePiece<TProps extends Record<string, any> = Record<string, any>> {
    mount: Mount<TProps>;
    update?: Update<TProps>;
};

export type FactoryFnUntyped = () => Promise<CorePiece>;
export type Factories = Record<string, FactoryFnUntyped>;
export type CollageModule = {
    bootstrap: UnmountFn;
    unload: UnmountFn;
    factories: Factories;
};

export interface MountedPiece<TProps extends Record<string, any> = Record<string, any>> {
    update: UpdateFn<TProps>;
    unmount: UnmountFn;
    mountPiece: MountPiece<TProps>;
};

export type MountPiece<TProps extends Record<string, any> = Record<string, any>>
    = (
        piece: CorePiece<TProps> | Promise<CorePiece<TProps>>,
        target: HTMLElement,
        props?: TProps
    ) => Promise<MountedPiece<TProps>>;
