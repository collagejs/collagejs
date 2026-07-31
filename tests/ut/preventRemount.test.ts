import { describe, it, expect } from "vitest";
import { preventRemount } from "../../src/preventRemount.js";

describe("preventRemount", () => {
    it("Should allow the mount function to be called once.", async () => {
        const mountFn = preventRemount();
        await expect(mountFn()).resolves.toBeTypeOf("function");
    });

    it("Should throw an error if the mount function is called more than once.", async () => {
        const mountFn = preventRemount();
        await mountFn();
        expect(() => mountFn()).toThrow();
    });
});
