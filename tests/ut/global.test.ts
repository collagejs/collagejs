import { describe, it } from "mocha";
import { ensureGlobalCollageJs } from "../../src/global.js";
import { expect } from "chai";
import "../../src/types.js";

describe("ensureGlobalCollageJs", () => {
    it("Should ensure that the global CollageJs object exists.", () => {
        // @ts-expect-error ts2790 - Variable not declared as optional.
        delete globalThis.CollageJs;
        ensureGlobalCollageJs();
        expect(globalThis.CollageJs).to.exist;
    });
});
