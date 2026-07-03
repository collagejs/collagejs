import { mountPieceKey } from "./common.js";
import { Stack } from "./Stack.js";
import type { Mount, CorePiece, UnmountFn, Update, MountPiece, AcceptableTarget, CorePieceCapabilities, Relocate, RelocationResult } from "./types.js";

export const mountKey = Symbol();

let pieceIdCounter = 0;
function generatePieceId(): string {
    return `cjsp-${++pieceIdCounter}-${Date.now().toString(36)}`;
}

async function doMount<TProps extends Record<string, any> = Record<string, any>>(mount: Mount<TProps>, target: AcceptableTarget, props?: TProps): Promise<UnmountFn> {
    if (Array.isArray(mount)) {
        const unmountFns = new Stack<UnmountFn>();
        for (const m of mount) {
            unmountFns.push(await doMount(m, target, props));
        }
        return async () => {
            for (const u of unmountFns) {
                await u();
            }
        };
    }
    return await mount(target, props);
}

async function doUpdate<TProps extends Record<string, any> = Record<string, any>>(update: Update<TProps> | undefined, props: TProps) {
    if (!update) return;
    if (Array.isArray(update)) {
        for (const u of update) {
            await doUpdate(u, props);
        }
        return;
    }
    return await update(props);
}

async function doRelocate(relocate: Relocate, target: AcceptableTarget, newTarget: AcceptableTarget): Promise<RelocationResult> {
    if (Array.isArray(relocate)) {
        let first = true;
        let ready = false;
        for (const fn of relocate) {
            const r = await doRelocate(fn, target, newTarget);
            if (r === 'ready') {
                ready = true;
            } else if (!r) {
                if (first) {
                    return false;
                }
                throw new Error("Relocation function returned 'false' after another relocation function returned 'ready' or 'true'.  The piece's state is now inconsistent.");
            }
            first = false;
        }
        return ready ? 'ready' : true;
    }
    return await relocate(target, newTarget);
}

export class MountedPiece<
    TProps extends Record<string, any> = Record<string, any>,
    TCap extends Record<string, any> = {}
> {
    #piece: CorePiece<TProps, TCap>;
    #id: string;
    #childPieces: Stack<MountedPiece<any, any>>;
    #parent: MountedPiece<any, any> | undefined;
    #cleanup: UnmountFn | undefined;
    #mountPiece: MountPiece<any, any>;

    get mountPiece() {
        return this.#mountPiece as <UProps extends Record<string, any> = Record<string, any>, UCap extends CorePieceCapabilities = CorePieceCapabilities>(
            piece: CorePiece<UProps, UCap> | Promise<CorePiece<UProps, UCap>>,
            target: AcceptableTarget,
            props?: UProps
        ) => Promise<MountedPiece<UProps, UCap>>;
    }

    constructor(piece: CorePiece<TProps, TCap>, mountPiece: MountPiece<TProps, TCap>, parent?: MountedPiece) {
        this.#piece = piece;
        this.#parent = parent;
        this.#id = generatePieceId();
        this.#childPieces = new Stack<MountedPiece<any, any>>();
        this.#mountPiece = mountPiece.bind(this);
    }

    async [mountKey](target: AcceptableTarget, props?: TProps) {
        this.#cleanup = await doMount(this.#piece.mount, target, {...(props as TProps), [mountPieceKey]: this.#mountPiece});
        if (this.#parent) {
            this.#parent.#childPieces.push(this);
        }
    }

    async unmount() {
        if (this.#childPieces.size) {
            for (const childPiece of this.#childPieces) {
                await childPiece.unmount();
            }
        }
        await this.#cleanup?.();
        if (this.#parent) {
            this.#parent.#childPieces.delete((item) => item.#id === this.#id);
        }
        this.#cleanup = undefined;
    }

    update(props: TProps) {
        return doUpdate(this.#piece.update, props);
    }

    relocate(target: AcceptableTarget, newTarget: AcceptableTarget) {
        if (!this.#piece.relocate) {
            return Promise.resolve(false);
        }
        return doRelocate(this.#piece.relocate, target, newTarget);
    }

    get capabilities() {
        return this.#piece.capabilities as (CorePieceCapabilities & TCap) | undefined;
    }
}
