import { describe, it, expect } from "vitest";
import { preventReMount } from "../../src/preventReMount.js";

describe("preventReMount", () => {
    it("Should allow the mount function to be called once.", async () => {
        const mountFn = preventReMount();
        // @ts-expect-error TS2554:  Args are not used.
        await expect(mountFn()).resolves;
    });

    it("Should throw an error if the mount function is called more than once.", async () => {
        const mountFn = preventReMount();
        // @ts-expect-error TS2554:  Args are not used.
        await mountFn();
        // @ts-expect-error TS2554:  Args are not used.
        expect(() => mountFn()).toThrow();
    });
});
