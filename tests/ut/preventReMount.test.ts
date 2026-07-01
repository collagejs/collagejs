import { describe, it, expect } from "vitest";
import { preventRemount } from "../../src/preventReMount.js";

const dummyEl = document.createElement("div");

describe("preventRemount", () => {
    it("Should allow the mount function to be called once.", async () => {
        const mountFn = preventRemount();
        await expect(mountFn(dummyEl)).resolves.toBeTypeOf("function");
    });

    it("Should throw an error if the mount function is called more than once.", async () => {
        const mountFn = preventRemount();
        await mountFn(dummyEl);
        expect(() => mountFn(dummyEl)).toThrow();
    });
});
