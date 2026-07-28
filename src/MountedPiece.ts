import { mountPieceKey } from "./common.js";
import { Stack } from "./Stack.js";
import type {
    Mount,
    CorePiece,
    UnmountFn,
    Update,
    MountPiece,
    AcceptableTarget,
    CorePieceMeta,
    Relocate,
    RelocationResult,
    RelocationRollbackFn,
    RelocationResultValue,
} from "./types.js";

export const mountKey = Symbol();

async function doMount<
    TProps extends Record<string, any> = Record<string, any>,
>(
    mount: Mount<TProps>,
    target: AcceptableTarget,
    props?: TProps,
) {
    if (Array.isArray(mount)) {
        const unmountFns = new Stack<UnmountFn>();
        for (const m of mount) {
            const unmountFn = await doMount(m, target, props);
            if (unmountFn) {
                unmountFns.push(unmountFn);
            }
        }
        if (!unmountFns.size) {
            return null;
        }
        return async () => {
            for (const u of unmountFns) {
                await u();
            }
        };
    }
    if (!mount) {
        return null;
    }
    return await mount(target, props);
}

async function doUpdate<
    TProps extends Record<string, any> = Record<string, any>,
>(update: Update<TProps> | undefined, props: TProps) {
    if (!update) return;
    if (Array.isArray(update)) {
        for (const u of update) {
            await doUpdate(u, props);
        }
        return;
    }
    return await update(props);
}

function isReadonlyArray<T>(value: unknown): value is readonly T[] {
    return Array.isArray(value);
}

function relocationResultValue(
    result: RelocationResult,
): RelocationResultValue {
    if (isReadonlyArray(result)) {
        return result[0];
    }
    return result;
}

async function doRelocate(
    relocate: Relocate,
    target: AcceptableTarget,
    newTarget: AcceptableTarget,
): Promise<RelocationResultValue | Stack<RelocationRollbackFn>> {
    let allFalsy = true;
    const rollbackFns: Stack<RelocationRollbackFn> =
        new Stack<RelocationRollbackFn>();
    let safeState = true;
    const doRelocateInternal = async (
        rel: Relocate,
    ): Promise<RelocationResultValue> => {
        const maybePushRollback = (result: RelocationResult) => {
            if (
                isReadonlyArray(result) &&
                (result[0] === "done" || result[0] === "supported")
            ) {
                rollbackFns.push(result[1]);
            } else if (result === "done") {
                safeState = false;
            }
        };
        if (Array.isArray(rel)) {
            let supported = false;
            for (const fn of rel) {
                const r = await doRelocateInternal(fn);
                const rValue = relocationResultValue(r);
                if (rValue === "supported") {
                    supported = true;
                } else if (rValue === "unsupported") {
                    if (safeState) {
                        while (rollbackFns.size) {
                            await rollbackFns.pop()?.();
                        }
                        return "unsupported";
                    }
                    throw new Error(
                        "Relocation function returned 'unsupported' after another relocation function returned 'done' without a rollback.  The piece's state is now inconsistent.",
                    );
                }
            }
            return supported ? "supported" : "done";
        }
        try {
            if (rel) {
                allFalsy = false;
            }
            const r = !rel ? 'supported' : await rel?.(target, newTarget);
            maybePushRollback(r);
            return relocationResultValue(r);
        } catch (error) {
            if (safeState) {
                while (rollbackFns.size) {
                    await rollbackFns.pop()?.();
                }
                console.warn(
                    "Relocation function failed.  Piece relocation has been rolled back.",
                    error,
                );
                return "unsupported";
            }
            throw new Error(
                "Relocation function failed after another relocation function returned 'done' without a rollback.  The piece's state is now inconsistent.",
            );
        }
    };
    const internalResult = await doRelocateInternal(relocate);
    if (allFalsy) {
        return "unsupported";
    }
    if (
        rollbackFns.size > 0 &&
        relocationResultValue(internalResult) === "supported" &&
        safeState
    ) {
        return rollbackFns;
    }
    return internalResult;
}

export class MountedPiece<
    TProps extends Record<string, any> = Record<string, any>,
    TMeta extends Record<string, any> = {},
> {
    #piece: CorePiece<TProps, TMeta>;
    #childPieces: Stack<MountedPiece<any, any>>;
    #parent: MountedPiece<any, any> | undefined;
    #cleanup: UnmountFn | undefined;
    #mountPiece: MountPiece<any, any>;

    get mountPiece() {
        return this.#mountPiece as <
            UProps extends Record<string, any> = Record<string, any>,
            UMeta extends Record<string, any> = {},
        >(
            piece: CorePiece<UProps, UMeta> | Promise<CorePiece<UProps, UMeta>>,
            target: AcceptableTarget,
            props?: UProps,
        ) => Promise<MountedPiece<UProps, UMeta>>;
    }

    constructor(
        piece: CorePiece<TProps, TMeta>,
        mountPiece: MountPiece<TProps, TMeta>,
        parent?: MountedPiece,
    ) {
        this.#piece = piece;
        this.#parent = parent;
        this.#childPieces = new Stack<MountedPiece<any, any>>();
        this.#mountPiece = mountPiece.bind(this);
    }

    async [mountKey](target: AcceptableTarget, props?: TProps) {
        this.#cleanup = await doMount(this.#piece.mount, target, {
            ...(props as TProps),
            [mountPieceKey]: this.#mountPiece,
        }) ?? undefined;
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

    async relocate(
        target: AcceptableTarget,
        newTarget: AcceptableTarget,
        customRelocate?: (
            source: AcceptableTarget,
            target: AcceptableTarget,
        ) => Promise<boolean>,
    ) {
        if (!this.#piece.relocate) {
            return Promise.resolve(false);
        }
        const result = await doRelocate(
            this.#piece.relocate,
            target,
            newTarget,
        );
        if (result === "done") {
            return true;
        }
        if (result === "unsupported") {
            return false;
        }
        // At this point, custom relocation must finish the job.
        if (!customRelocate) {
            throw new Error(
                "Relocation of this piece is 'supported', but no custom relocation function was provided.",
            );
        }
        if (result === "supported") {
            return await customRelocate(target, newTarget);
        }
        try {
            return await customRelocate(target, newTarget);
        } catch (error) {
            while (result.size) {
                await result.pop()?.();
            }
            console.warn(
                "Custom relocation function failed.  Piece relocation has been rolled back.",
                error,
            );
            return false;
        }
    }

    get meta() {
        return this.#piece.meta as (CorePieceMeta & TMeta) | undefined;
    }
}
