import { mountPieceKey } from "./common.js";
import { Stack } from "./Stack.js";
import type { Mount, CorePiece, UnmountFn, Update, MountPiece, AcceptableTarget, CorePieceCapabilities, Relocate, RelocationResult, RelocationRollbackFn, RelocationResultValue } from "./types.js";

export const mountKey = Symbol();

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

function relocationResultValue(result: RelocationResult): RelocationResultValue {
    if (Array.isArray(result)) {
        return result[0];
    }
    return result;
}

async function doRelocate(relocate: Relocate, target: AcceptableTarget, newTarget: AcceptableTarget): Promise<RelocationResultValue | Stack<RelocationRollbackFn>> {
    const rollbackFns: Stack<RelocationRollbackFn> = new Stack<RelocationRollbackFn>();
    let safeState = true;
    const doRelocateInternal = async (rel: Relocate): Promise<RelocationResultValue> => {
        const maybePushRollback = (result: RelocationResult) => {
            if (Array.isArray(result) && (result[0] === 'done' || result[0] === 'supported')) {
                rollbackFns.push(result[1]);
            }
            else if (result === 'done') {
                safeState = false;
            }
        };
        if (Array.isArray(rel)) {
            let supported = false;
            for (const fn of rel) {
                const r = await doRelocateInternal(fn);
                const rValue = relocationResultValue(r);
                if (rValue === 'supported') {
                    supported = true;
                } else if (rValue === 'unsupported') {
                    if (safeState) {
                        while (rollbackFns.size) {
                            await rollbackFns.pop()?.();
                        }
                        return 'unsupported';
                    }
                    throw new Error("Relocation function returned 'unsupported' after another relocation function returned 'done' without a rollback.  The piece's state is now inconsistent.");
                }
            }
            return supported ? 'supported' : 'done';
        }
        try {
            const r = await rel(target, newTarget);
            maybePushRollback(r);
            return relocationResultValue(r);
        }
        catch (error) {
            if (safeState) {
                while (rollbackFns.size) {
                    await rollbackFns.pop()?.();
                }
                console.warn("Relocation function failed.  Piece relocation has been rolled back.", error);
                return 'unsupported';
            }
            throw new Error("Relocation function failed after another relocation function returned 'done' without a rollback.  The piece's state is now inconsistent.");
        }
    };
    const internalResult = await doRelocateInternal(relocate);
    if (rollbackFns.size > 0 && relocationResultValue(internalResult) === 'supported' && safeState) {
        return rollbackFns;
    }
    return internalResult;
}

export class MountedPiece<
    TProps extends Record<string, any> = Record<string, any>,
    TCap extends Record<string, any> = {}
> {
    #piece: CorePiece<TProps, TCap>;
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
        this.#childPieces = new Stack<MountedPiece<any, any>>();
        this.#mountPiece = mountPiece.bind(this);
    }

    async [mountKey](target: AcceptableTarget, props?: TProps) {
        this.#cleanup = await doMount(this.#piece.mount, target, { ...(props as TProps), [mountPieceKey]: this.#mountPiece });
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
            this.#parent.#childPieces.delete((item) => item === this);
        }
        this.#cleanup = undefined;
    }

    update(props: TProps) {
        return doUpdate(this.#piece.update, props);
    }

    async relocate(target: AcceptableTarget, newTarget: AcceptableTarget, customRelocate?: (source: AcceptableTarget, target: AcceptableTarget) => Promise<boolean>) {
        if (!this.#piece.relocate) {
            return Promise.resolve(false);
        }
        const result = await doRelocate(this.#piece.relocate, target, newTarget);
        if (result === 'done') {
            return true;
        }
        if (result === 'unsupported') {
            return false;
        }
        // At this point, custom relocation must finish the job.
        if (!customRelocate) {
            throw new Error("Relocation of this piece is 'supported', but no custom relocation function was provided.");
        }
        if (result === 'supported') {
            return await customRelocate(target, newTarget);
        }
        try {
            return await customRelocate(target, newTarget);
        }
        catch (error) {
            while (result.size) {
                await result.pop()?.();
            }
            console.warn("Custom relocation function failed.  Piece relocation has been rolled back.", error);
            return false;
        }
    }

    get capabilities() {
        return this.#piece.capabilities as (CorePieceCapabilities & TCap) | undefined;
    }
}
