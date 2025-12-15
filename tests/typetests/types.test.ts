import { describe, test, expect } from "tstyche";
import type { 
    CorePiece, 
    MountFn, 
    UpdateFn, 
    Mount, 
    Update, 
    CollageModule, 
    FactoryFnUntyped,
    Factories
} from "../../src/types.js";

describe("CorePiece", () => {
    test("Should have mount property.", () => {
        const piece: CorePiece = {
            mount: async (target: HTMLElement) => async () => {}
        };
        expect(piece).type.toBe<CorePiece>();
    });

    test("Should have optional update property.", () => {
        const pieceWithUpdate: CorePiece = {
            mount: async (target: HTMLElement) => async () => {},
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
    test("Should require HTMLElement as target parameter.", () => {
        const validMount: MountFn = async (target: HTMLElement) => async () => {};
        expect(validMount).type.toBe<MountFn>();
    });

    test("Should not accept string as target.", () => {
        expect<MountFn>().type.not.toBeAssignableTo(
            async (target: string) => async () => {}
        );
    });
});

describe("UpdateFn", () => {
    test("Should accept typed props.", () => {
        const typedUpdate: UpdateFn<{ message: string }> = async (props: { message: string }) => {};
        expect(typedUpdate).type.toBe<UpdateFn<{ message: string }>>();
    });

    test("Should not be callable without props.", () => {
        const updateFn: UpdateFn<{ message: string }> = async (props: { message: string }) => {};
        expect(updateFn).type.not.toBeCallableWith();
    });

    test("Should be callable with correct props.", () => {
        const updateFn: UpdateFn<{ message: string }> = async (props: { message: string }) => {};
        expect(updateFn).type.toBeCallableWith({ message: "test" });
    });
});

describe("Mount type", () => {
    test("Should accept single mount function.", () => {
        const singleMount: Mount = async (target: HTMLElement) => async () => {};
        expect(singleMount).type.toBeAssignableTo<Mount>();
    });

    test("Should accept array of mount functions.", () => {
        const arrayMount: Mount = [
            async (target: HTMLElement) => async () => {},
            async (target: HTMLElement) => async () => {}
        ];
        expect(arrayMount).type.toBeAssignableTo<Mount>();
    });
});

describe("Update type", () => {
    test("Should accept single update function.", () => {
        const singleUpdate: Update<{ message: string }> = async (props: { message: string }) => {};
        expect(singleUpdate).type.toBeAssignableTo<Update<{ message: string }>>();
    });

    test("Should accept array of update functions.", () => {
        const arrayUpdate: Update<{ message: string }> = [
            async (props: { message: string }) => {},
            async (props: { message: string }) => {}
        ];
        expect(arrayUpdate).type.toBeAssignableTo<Update<{ message: string }>>();
    });
});

describe("Factory functions", () => {
    test("Should validate FactoryFnUntyped.", () => {
        const untypedFactory: FactoryFnUntyped = async () => ({
            mount: async (target: HTMLElement) => async () => {}
        });
        expect(untypedFactory).type.toBe<FactoryFnUntyped>();
    });

    test("Should validate Factories record.", () => {
        const factories: Factories = {
            "component1": async () => ({
                mount: async (target: HTMLElement) => async () => {}
            })
        };
        expect(factories).type.toBe<Factories>();
    });
});

describe("CollageModule", () => {
    test("Should validate complete module structure.", () => {
        const module: CollageModule = {
            bootstrap: async () => {},
            unload: async () => {},
            factories: {
                "component1": async () => ({
                    mount: async (target: HTMLElement) => async () => {}
                })
            }
        };
        expect(module).type.toBe<CollageModule>();
    });

    test("Should require all properties.", () => {
        expect<CollageModule>().type.not.toBeAssignableTo({
            bootstrap: async () => {}
            // Missing unload and factories
        });
    });
});