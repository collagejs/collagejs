import { describe, test, expect } from "tstyche";
import type {
    CorePiece,
    MountFn,
    UpdateFn,
    Mount,
    Update,
    AcceptableTarget,
    RelocateFn,
    Relocate,
    FalsyLifecycle,
} from "../../src/types.js";

describe("CorePiece", () => {
    test("Should have mount property.", () => {
        const piece: CorePiece = {
            mount: async (target: AcceptableTarget) => async () => {}
        };
        expect(piece).type.toBe<CorePiece>();
    });

    test("Should have optional update property.", () => {
        const pieceWithUpdate: CorePiece = {
            mount: async (target: AcceptableTarget) => async () => {},
            update: async (props: any) => {}
        };
        expect(pieceWithUpdate).type.toBe<CorePiece>();
    });

    test("Should not accept invalid mount function.", () => {
        expect<CorePiece>().type.not.toBeAssignableTo({
            mount: "invalid"
        });
    });
});

describe("MountFn", () => {
    test("Should require AcceptableTarget as target parameter.", () => {
        const validMount: MountFn = async (target: AcceptableTarget) => async () => {};
        expect(validMount).type.toBe<MountFn>();
    });

    test("Should accept a function that returns nothing.", () => {
        const mountFn: MountFn = async (target: AcceptableTarget) => Promise.resolve();
        expect(mountFn).type.toBe<MountFn>();
    });

    test("Should accept a function that takes no parameters.", () => {
        const fn = async () => Promise.resolve();
        expect(fn).type.toBeAssignableTo<MountFn>();
    });

    test("Should accept a function that only takes the target parameter.", () => {
        const fn = async (target: AcceptableTarget) => Promise.resolve();
        expect(fn).type.toBeAssignableTo<MountFn>();
    });
});

describe("UpdateFn", () => {
    test("Should accept typed props.", () => {
        const typedUpdate = async (props: { message?: string }) => {};
        expect(typedUpdate).type.toBe<UpdateFn<{ message: string }>>();
    });

    test("Should not be callable without props.", () => {
        const updateFn = async (props: { message: string }) => {};
        expect(updateFn).type.not.toBeCallableWith();
    });

    test("Should be callable with correct props.", () => {
        let updateFn: UpdateFn<{ message: string }>;
        expect(updateFn!).type.toBeCallableWith({ message: "test" });
    });

    test("#30: Should allow required properties to be missing.", () => {
        let updateFn: UpdateFn<{ message: string, optionalB?: boolean; }>;
        expect(updateFn!).type.toBeCallableWith({ optionalB: true });
    });
});

describe("RelocateFn", () => {
    test("Should accept AcceptableTarget as source and target parameters.", () => {
        const relocateFn = async (source: AcceptableTarget, target: AcceptableTarget) => Promise.resolve('supported' as const);
        expect(relocateFn).type.toBeAssignableTo<RelocateFn>();
    });

    test("Should accept functions that returns 'supported'.", () => {
        const relocateFn = async (source: AcceptableTarget, target: AcceptableTarget) => 'supported' as const;
        expect(relocateFn).type.toBeAssignableTo<RelocateFn>();
    });

    test("Should accept functions that returns 'unsupported'.", () => {
        const relocateFn = async (source: AcceptableTarget, target: AcceptableTarget) => 'unsupported' as const;
        expect(relocateFn).type.toBeAssignableTo<RelocateFn>();
    });

    test("Should accept functions that returns 'done'.", () => {
        const relocateFn = async (source: AcceptableTarget, target: AcceptableTarget) => 'done' as const;
        expect(relocateFn).type.toBeAssignableTo<RelocateFn>();
    });

    test("Should accept functions that returns ['supported', RelocationRollbackFn]", () => {
        const relocateFn = async (source: AcceptableTarget, target: AcceptableTarget) => ['supported', async () => Promise.resolve()] as const;
        expect(relocateFn).type.toBeAssignableTo<RelocateFn>();
    });

    test("Should accept functions that returns ['done', RelocationRollbackFn]", () => {
        const relocateFn = async (source: AcceptableTarget, target: AcceptableTarget) => ['done', async () => Promise.resolve()] as const;
        expect(relocateFn).type.toBeAssignableTo<RelocateFn>();
    });

    test("Should not accept functions that returns ['unsupported', RelocationRollbackFn]", () => {
        const relocateFn = async (source: AcceptableTarget, target: AcceptableTarget) => ['unsupported', async () => {}];
        expect(relocateFn).type.not.toBeAssignableTo<RelocateFn>();
    });
});

describe("Mount", () => {
    test("Should accept single mount function.", () => {
        const singleMount: Mount = async (target: AcceptableTarget) => async () => {};
        expect(singleMount).type.toBeAssignableTo<Mount>();
    });

    test("Should accept array of mount functions.", () => {
        const arrayMount: Mount = [
            async (target: AcceptableTarget) => async () => {},
            async (target: AcceptableTarget) => async () => {}
        ];
        expect(arrayMount).type.toBeAssignableTo<Mount>();
    });

    test("Should accept falsy lifecycle values.", () => {
        const falsyMount: Mount = [undefined, null, false];
        expect(falsyMount).type.toBeAssignableTo<Mount>();
    });

    test("Should accept nested arrays of mount functions.", () => {
        const nestedMount: Mount = [
            async (target: AcceptableTarget) => async () => {},
            [
                async (target: AcceptableTarget) => async () => {},
                async (target: AcceptableTarget) => async () => {}
            ]
        ];
        expect(nestedMount).type.toBeAssignableTo<Mount>();
    });

    test("Should accept falsy lifecycle values in nested arrays.", () => {
        const nestedFalsyMount: Mount = [
            async (target: AcceptableTarget) => async () => {},
            [undefined, null, false]
        ];
        expect(nestedFalsyMount).type.toBeAssignableTo<Mount>();
    });

    test("Should accept Boolean assignment syntax.", () => {
        let maybe: boolean;
        expect(maybe! && (async (target: AcceptableTarget) => async () => {})).type.toBeAssignableTo<Mount>();
    });
});

describe("Update", () => {
    test("Should accept single update function.", () => {
        const singleUpdate: Update<{ message: string }> = async (props: { message?: string }) => {};
        expect(singleUpdate).type.toBeAssignableTo<Update<{ message: string }>>();
    });

    test("Should accept array of update functions.", () => {
        const arrayUpdate: Update<{ message: string }> = [
            async (props: { message?: string }) => {},
            async (props: { message?: string }) => {}
        ];
        expect(arrayUpdate).type.toBeAssignableTo<Update<{ message: string }>>();
    });

    test(`Should accept falsy lifecycle values.`, () => {
        let falsyUpdate: FalsyLifecycle;
        expect(falsyUpdate!).type.toBeAssignableTo<Update<{ message: string }>>();
    });

    test("Should accept Boolean assignment syntax.", () => {
        let maybe: boolean;
        expect(maybe! && (async (props: { message?: string }) => {})).type.toBeAssignableTo<Update<{ message: string }>>();
    });
});

describe("Relocate", () => {
    test("Should accept a single relocate function.", () => {
        let singleRelocate: RelocateFn;
        expect(singleRelocate!).type.toBeAssignableTo<Relocate>();
    });

    test("Should accept an array of relocate functions.", () => {
        let arrayRelocate: RelocateFn[];
        expect(arrayRelocate!).type.toBeAssignableTo<Relocate>();
    });

    test("Should accept nested arrays of relocate functions.", () => {
        let nestedRelocate: RelocateFn[][];
        expect(nestedRelocate!).type.toBeAssignableTo<Relocate>();
    });

    test("Should accept falsy lifecycle values.", () => {
        let falsyRelocate: FalsyLifecycle;
        expect(falsyRelocate!).type.toBeAssignableTo<Relocate>();
    });

    test("Should accept nested arrays with falsy lifecycle values.", () => {
        let nestedFalsyRelocate: (RelocateFn | FalsyLifecycle)[][];
        expect(nestedFalsyRelocate!).type.toBeAssignableTo<Relocate>();
    });

    test("Should accept Boolean assignment syntax.", () => {
        let maybe: boolean;
        expect(maybe! && (async (source: AcceptableTarget, target: AcceptableTarget) => 'supported' as const)).type.toBeAssignableTo<Relocate>();
    });
});
