import { describe, test, expect } from "tstyche";
import type { preventRemount } from "../../src/preventRemount.js";
import { MountFn } from "../../src/types.js";

describe("preventRemount", () => {
    test("Should return a function that is assignable to MountFn.", () => {
        expect<ReturnType<typeof preventRemount>>().type.toBeAssignableTo<MountFn>();
    });
    test("Should return a function that is assignable to MountFn<TProps>.", () => {
        type TProps = { a: string; };
        expect<ReturnType<typeof preventRemount>>().type.toBeAssignableTo<MountFn<TProps>>();
    });
});
