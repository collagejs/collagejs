import { describe, test, expect } from "tstyche";
import type { noopPiece } from "../../src/noopPiece.js";
import type { CorePiece } from "../../src/types.js";

describe("noopPiece", () => {
    test("Should return a CorePiece object typed with the default types when not specified.", () => {
        expect<ReturnType<typeof noopPiece>>().type.toBeAssignableTo<CorePiece<Record<string, any>, {}>>();
    });
    test("Should propagate tye properties and capabilities type to the returned CorePiece object.", () => {
        type Props = { a: string; };
        type Cap = { b: number; };
        expect<ReturnType<typeof noopPiece<Props, Cap>>>().type.toBeAssignableTo<CorePiece<Props, Cap>>();
    });
});
