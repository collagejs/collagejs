import { describe, test, expect } from "tstyche";
import type { Internal } from "../../src/internal-types.js";

describe("Internal.MountedPiece", () => {
    test("Should validate complete interface structure.", () => {
        const mountedPiece: Internal.MountedPiece = {
            update: async (props: any) => {},
            unmount: async () => {},
            childPieces: new Map()
        };
        expect(mountedPiece).type.toBe<Internal.MountedPiece>();
    });

    test("Should validate typed version.", () => {
        const typedMountedPiece: Internal.MountedPiece<{ message: string }> = {
            update: async (props: { message: string }) => {},
            unmount: async () => {},
            childPieces: new Map()
        };
        expect(typedMountedPiece).type.toBe<Internal.MountedPiece<{ message: string }>>();
    });

    test("Should require all properties.", () => {
        expect<Internal.MountedPiece>().type.not.toBeAssignableTo({
            update: async (props: any) => {},
            unmount: async () => {}
            // Missing childPieces
        });
    });

    test("Should require correct update function signature.", () => {
        expect<Internal.MountedPiece>().type.not.toBeAssignableTo({
            update: "invalid",
            unmount: async () => {},
            childPieces: new Map()
        });
    });

    test("Should require correct unmount function signature.", () => {
        expect<Internal.MountedPiece>().type.not.toBeAssignableTo({
            update: async (props: any) => {},
            unmount: "invalid",
            childPieces: new Map()
        });
    });
});