import { describe, it, expect, vi } from "vitest";
import { MountedPiece, mountKey } from "../../src/MountedPiece.js";
import type { AcceptableTarget, CorePiece } from "../../src/types.js";
import { mountPieceCore } from "../../src/mountPiece.js";

function createTarget(shadow: boolean = false): AcceptableTarget {
    const div = document.createElement("div");
    if (shadow) {
        return div.attachShadow({ mode: "open" });
    }
    return div;
}

function testPrefix(shadow: boolean) {
    return shadow ? "Shadow DOM: " : "";
}

[false, true].forEach((shadow) => {
    describe(`${testPrefix(shadow)}MountedPiece`, () => {
        describe("mount", () => {
            it(`${testPrefix(shadow)}Should mount and unmount a piece correctly.`, async () => {
                const target = createTarget(shadow);
                const testPiece: CorePiece = {
                    mount: async (target) => {
                        const div = document.createElement("div");
                        div.id = "mounted-content";
                        target.appendChild(div);

                        return async () => {
                            div.remove();
                        };
                    },
                };

                const mp = new MountedPiece(testPiece, mountPieceCore);
                await mp[mountKey](target);

                expect(target.children.length).to.equal(1);
                expect(target.querySelector("#mounted-content")).to.not.be.null;

                await mp.unmount();
                expect(target.children.length).to.equal(0);
            });
            it(`${testPrefix(shadow)}Should handle arrays of mount functions.`, async () => {
                const target = createTarget(shadow);
                const testPiece: CorePiece = {
                    mount: [
                        async (target) => {
                            const div1 = document.createElement("div");
                            div1.id = "mount-1";
                            target.appendChild(div1);
                            return async () => div1.remove();
                        },
                        async (target) => {
                            const div2 = document.createElement("div");
                            div2.id = "mount-2";
                            target.appendChild(div2);
                            return async () => div2.remove();
                        },
                    ],
                };

                const mp = new MountedPiece(testPiece, mountPieceCore);
                await mp[mountKey](target);

                expect(target.children.length).to.equal(2);
                expect(target.querySelector("#mount-1")).to.not.be.null;
                expect(target.querySelector("#mount-2")).to.not.be.null;

                await mp.unmount();
                expect(target.children.length).to.equal(0);
            });
            it(`${testPrefix(shadow)}Should handle nested arrays of mount functions.`, async () => {
                const target = createTarget(shadow);
                const testPiece: CorePiece = {
                    mount: [
                        async (target) => {
                            const div1 = document.createElement("div");
                            div1.id = "nested-1";
                            target.appendChild(div1);
                            return async () => div1.remove();
                        },
                        [
                            async (target) => {
                                const div2 = document.createElement("div");
                                div2.id = "nested-2";
                                target.appendChild(div2);
                                return async () => div2.remove();
                            },
                            async (target) => {
                                const div3 = document.createElement("div");
                                div3.id = "nested-3";
                                target.appendChild(div3);
                                return async () => div3.remove();
                            },
                        ],
                    ],
                };

                const mp = new MountedPiece(testPiece, mountPieceCore);
                await mp[mountKey](target);

                expect(target.children.length).to.equal(3);
                expect(target.querySelector("#nested-1")).to.not.be.null;
                expect(target.querySelector("#nested-2")).to.not.be.null;
                expect(target.querySelector("#nested-3")).to.not.be.null;

                await mp.unmount();
                expect(target.children.length).to.equal(0);
            });
            it(`${testPrefix(shadow)}Should handle mount functions that don't return an unmount function.`, async () => {
                const target = createTarget(shadow);
                const testPiece: CorePiece = {
                    mount: async (target) => {
                        // This mount function does nothing and returns null
                        return;
                    },
                };
                const mp = new MountedPiece(testPiece, mountPieceCore);
                await mp[mountKey](target);
                expect(target.children.length).to.equal(0);
            });
            it(`${testPrefix(shadow)}Should ignore falsy mount functions.`, async () => {
                const target = createTarget(shadow);
                const testPiece: CorePiece = {
                    mount: [
                        null,
                        async (target) => {
                            const div = document.createElement("div");
                            div.id = "valid-mount";
                            target.appendChild(div);
                            return async () => div.remove();
                        },
                        undefined,
                        false as const,
                    ],
                };

                const mp = new MountedPiece(testPiece, mountPieceCore);
                await mp[mountKey](target);

                expect(target.children.length).to.equal(1);
                expect(target.querySelector("#valid-mount")).to.not.be.null;

                await mp.unmount();
                expect(target.children.length).to.equal(0);
            });

            it(`${testPrefix(shadow)}Should handle parent-child relationships with proper cleanup.`, async () => {
                const target = createTarget(shadow);

                const childPieceFactory = (
                    unmountCb: () => void,
                ): CorePiece => ({
                    mount: async (target) => {
                        const childDiv = document.createElement("div");
                        childDiv.id = "child-content";
                        childDiv.textContent = "child";
                        target.appendChild(childDiv);

                        return async () => {
                            unmountCb();
                            childDiv.remove();
                        };
                    },
                });

                const parentPiece: CorePiece = {
                    mount: async (target) => {
                        const parentDiv = document.createElement("div");
                        parentDiv.id = "parent-content";
                        parentDiv.textContent = "parent";
                        target.appendChild(parentDiv);

                        // Parent creates and manages child container
                        const childContainer = document.createElement("div");
                        childContainer.id = "child-container";
                        target.appendChild(childContainer);

                        return async () => {
                            parentDiv.remove();
                            childContainer.remove(); // Parent cleans up child container
                        };
                    },
                };

                let unmountCount = 0;
                const unmountCb = () => {
                    unmountCount++;
                };

                // Mount parent
                const parentMp = new MountedPiece(parentPiece, mountPieceCore);
                await parentMp[mountKey](target);
                expect(target.children.length).to.equal(2); // parent-content + child-container
                expect(target.querySelector("#parent-content")).to.not.be.null;
                expect(target.querySelector("#child-container")).to.not.be.null;

                // Mount children inside parent
                const childContainer = target.querySelector(
                    "#child-container",
                ) as HTMLElement;
                const childMp1 = new MountedPiece(
                    childPieceFactory(unmountCb),
                    mountPieceCore,
                    parentMp,
                );
                await childMp1[mountKey](childContainer);

                expect(childContainer.children.length).to.equal(1);
                expect(childContainer.querySelector("#child-content")).to.not.be
                    .null;

                const childMp2 = new MountedPiece(
                    childPieceFactory(unmountCb),
                    mountPieceCore,
                    parentMp,
                );
                await childMp2[mountKey](childContainer);

                expect(childContainer.children.length).to.equal(2); // Both children should be present

                // Unmounting parent should also unmount child AND clean up the container
                await parentMp.unmount();
                expect(target.children.length).to.equal(0); // Everything should be gone
                expect(target.querySelector("#parent-content")).to.be.null;
                expect(target.querySelector("#child-container")).to.be.null;
                expect(target.querySelector("#child-content")).to.be.null;
                expect(unmountCount).to.equal(2); // Both children should have been unmounted
            });
        });
        describe("update", () => {
            it(`${testPrefix(shadow)}Should handle piece updates.`, async () => {
                const target = createTarget(shadow);
                const testPiece: CorePiece<{ message: string }> = {
                    mount: async (target, props) => {
                        const div = document.createElement("div");
                        div.id = "updateable-content";
                        div.textContent = props?.message || "default";
                        target.appendChild(div);

                        return async () => {
                            div.remove();
                        };
                    },
                    update: async (props) => {
                        if (!props.message) return;
                        const div = target.querySelector(
                            "#updateable-content",
                        ) as HTMLDivElement;
                        if (div) {
                            div.textContent = props.message;
                        }
                    },
                };

                const mp = new MountedPiece(testPiece, mountPieceCore);
                await mp[mountKey](target, { message: "initial" });

                expect(
                    target.querySelector("#updateable-content")?.textContent,
                ).to.equal("initial");

                await mp.update({ message: "updated" });
                expect(
                    target.querySelector("#updateable-content")?.textContent,
                ).to.equal("updated");

                await mp.unmount();
            });
            it(`${testPrefix(shadow)}Should handle arrays of update functions.`, async () => {
                const target = createTarget(shadow);
                const testPiece: CorePiece<{ message: string }> = {
                    mount: async (target, props) => {
                        const div1 = document.createElement("div");
                        div1.id = "updateable-content-1";
                        div1.textContent = props?.message || "default-1";
                        target.appendChild(div1);

                        const div2 = document.createElement("div");
                        div2.id = "updateable-content-2";
                        div2.textContent = props?.message || "default-2";
                        target.appendChild(div2);
                        return async () => {
                            div1.remove();
                            div2.remove();
                        };
                    },
                    update: [
                        async (props) => {
                            if (!props.message) return;
                            const div1 = target.querySelector(
                                "#updateable-content-1",
                            ) as HTMLDivElement;
                            if (div1) {
                                div1.textContent = props.message;
                            }
                        },
                        async (props) => {
                            if (!props.message) return;
                            const div2 = target.querySelector(
                                "#updateable-content-2",
                            ) as HTMLDivElement;
                            if (div2) {
                                div2.textContent = props.message;
                            }
                        },
                    ],
                };

                const mp = new MountedPiece(testPiece, mountPieceCore);
                await mp[mountKey](target);

                expect(target.querySelector("#updateable-content-1")).to.not.be.null;
                expect(target.querySelector("#updateable-content-2")).to.not.be.null;

                await mp.update({ message: "updated" });
                expect(target.querySelector("#updateable-content-1")?.textContent).to.equal("updated");
                expect(target.querySelector("#updateable-content-2")?.textContent).to.equal("updated");

                await mp.unmount();
                expect(target.querySelector("#updateable-content-1")).to.be.null;
                expect(target.querySelector("#updateable-content-2")).to.be.null;
            });
            it(`${testPrefix(shadow)}Should ignore falsy update functions.`, async () => {
                const target = createTarget(shadow);
                const testPiece: CorePiece<{ message: string }> = {
                    mount: async (target, props) => {
                        const div1 = document.createElement("div");
                        div1.id = "updateable-content-1";
                        div1.textContent = props?.message || "default-1";
                        target.appendChild(div1);

                        const div2 = document.createElement("div");
                        div2.id = "updateable-content-2";
                        div2.textContent = props?.message || "default-2";
                        target.appendChild(div2);
                        return async () => {
                            div1.remove();
                            div2.remove();
                        };
                    },
                    update: [
                        false as const,
                        async (props) => {
                            if (!props.message) return;
                            const div1 = target.querySelector(
                                "#updateable-content-1",
                            ) as HTMLDivElement;
                            if (div1) {
                                div1.textContent = props.message;
                            }
                        },
                        async (props) => {
                            if (!props.message) return;
                            const div2 = target.querySelector(
                                "#updateable-content-2",
                            ) as HTMLDivElement;
                            if (div2) {
                                div2.textContent = props.message;
                            }
                        },
                        [undefined, null],
                    ],
                };

                const mp = new MountedPiece(testPiece, mountPieceCore);
                await mp[mountKey](target);

                expect(target.querySelector("#updateable-content-1")).to.not.be.null;
                expect(target.querySelector("#updateable-content-2")).to.not.be.null;

                await mp.update({ message: "updated" });
                expect(target.querySelector("#updateable-content-1")?.textContent).to.equal("updated");
                expect(target.querySelector("#updateable-content-2")?.textContent).to.equal("updated");

                await mp.unmount();
                expect(target.querySelector("#updateable-content-1")).to.be.null;
                expect(target.querySelector("#updateable-content-2")).to.be.null;
            });
        });
        describe(`${testPrefix(shadow)}relocate`, () => {
            it(`${testPrefix(shadow)}Should return true when relocation is done by the piece.`, async () => {
                const initialTarget = createTarget(shadow);
                const newTarget = createTarget(shadow);
                const piece = {
                    mount: vi.fn(),
                    relocate: vi.fn().mockResolvedValue("done"),
                };
                const mp = new MountedPiece(piece, mountPieceCore);
                await mp[mountKey](initialTarget);
                const result = await mp.relocate(initialTarget, newTarget);
                expect(result).to.be.true;
                expect(piece.relocate).toHaveBeenCalledWith(
                    initialTarget,
                    newTarget,
                );
            });

            it(`${testPrefix(shadow)}Should return false when relocating a piece without a relocate function.`, async () => {
                const initialTarget = createTarget(shadow);
                const newTarget = createTarget(shadow);
                const piece = {
                    mount: vi.fn(),
                };
                const mp = new MountedPiece(piece, mountPieceCore);
                await mp[mountKey](initialTarget);
                const result = await mp.relocate(initialTarget, newTarget);
                expect(result).to.be.false;
            });

            it(`${testPrefix(shadow)}Should return false when all relocation functions are falsy values.`, async () => {
                const initialTarget = createTarget(shadow);
                const newTarget = createTarget(shadow);
                const piece = {
                    mount: vi.fn(),
                    relocate: [null, [undefined, null], false as const],
                };
                const mp = new MountedPiece(piece, mountPieceCore);
                await mp[mountKey](initialTarget);
                const result = await mp.relocate(initialTarget, newTarget);
                expect(result).to.be.false;
            });

            it(`${testPrefix(shadow)}Should return false when the piece declares itself as not relocatable in metadata.`, async () => {
                const initialTarget = createTarget(shadow);
                const newTarget = createTarget(shadow);
                const piece = {
                    mount: vi.fn(),
                    meta: {
                        relocatable: false,
                    },
                    relocate: vi.fn().mockResolvedValue("done"),
                };
                const mp = new MountedPiece(piece, mountPieceCore);
                await mp[mountKey](initialTarget);
                const result = await mp.relocate(initialTarget, newTarget);
                expect(result).to.be.false;
            });

            it(`${testPrefix(shadow)}Should return false when the piece doesn't declare relocatable support in metadata and has no relocate function.`, async () => {
                const initialTarget = createTarget(shadow);
                const newTarget = createTarget(shadow);
                const piece = {
                    mount: vi.fn(),
                    meta: {
                        relocatable: undefined,
                    },
                };
                const mp = new MountedPiece(piece, mountPieceCore);
                await mp[mountKey](initialTarget);
                const result = await mp.relocate(initialTarget, newTarget);
                expect(result).to.be.false;
            });

            it(`${testPrefix(shadow)}Should attempt relocation when the piece doesn't declare relocatable support in metadata but has a relocate function.`, async () => {
                const initialTarget = createTarget(shadow);
                const newTarget = createTarget(shadow);
                const piece = {
                    mount: vi.fn(),
                    meta: {
                        relocatable: undefined,
                    },
                    relocate: vi.fn().mockResolvedValue("done"),
                };
                const mp = new MountedPiece(piece, mountPieceCore);
                await mp[mountKey](initialTarget);
                const result = await mp.relocate(initialTarget, newTarget);
                expect(result).to.be.true;
                expect(piece.relocate).toHaveBeenCalledWith(
                    initialTarget,
                    newTarget,
                );
            });

            it(`${testPrefix(shadow)}Should return false when all relocation functions return 'unsupported'.`, async () => {
                const initialTarget = createTarget(shadow);
                const newTarget = createTarget(shadow);
                const piece = {
                    mount: vi.fn(),
                    relocate: [
                        vi.fn().mockResolvedValue("unsupported"),
                        [vi.fn().mockResolvedValue("unsupported")],
                    ],
                };
                const mp = new MountedPiece(piece, mountPieceCore);
                await mp[mountKey](initialTarget);
                const result = await mp.relocate(initialTarget, newTarget);
                expect(result).to.be.false;
            });

            it(`${testPrefix(shadow)}Should return true when all relocation functions return 'supported' or 'done' with at least one falsy function.`, async () => {
                const initialTarget = createTarget(shadow);
                const newTarget = createTarget(shadow);
                const piece = {
                    mount: vi.fn(),
                    relocate: [
                        null,
                        [undefined, vi.fn().mockResolvedValue("supported")],
                        false as const,
                        vi.fn().mockResolvedValue("done"),
                    ],
                };
                const mp = new MountedPiece(piece, mountPieceCore);
                await mp[mountKey](initialTarget);
                const result = await mp.relocate(
                    initialTarget,
                    newTarget,
                    vi.fn().mockResolvedValue(true),
                );
                expect(result).to.be.true;
            });

            it(`${testPrefix(shadow)}Should throw when caller relocation is required but not provided.`, async () => {
                const initialTarget = createTarget(shadow);
                const newTarget = createTarget(shadow);
                const piece = {
                    mount: vi.fn(),
                    relocate: vi.fn().mockResolvedValue("supported"),
                };

                const mp = new MountedPiece(piece, mountPieceCore);
                await mp[mountKey](initialTarget);

                await expect(
                    mp.relocate(initialTarget, newTarget),
                ).rejects.toThrow(
                    /no custom relocation function was provided/i,
                );
            });

            it(`${testPrefix(shadow)}Should return the caller relocation result when the piece supports relocation.`, async () => {
                const initialTarget = createTarget(shadow);
                const newTarget = createTarget(shadow);
                const customRelocate = vi.fn().mockResolvedValue(true);
                const piece = {
                    mount: vi.fn(),
                    relocate: vi.fn().mockResolvedValue("supported"),
                };

                const mp = new MountedPiece(piece, mountPieceCore);
                await mp[mountKey](initialTarget);

                const result = await mp.relocate(
                    initialTarget,
                    newTarget,
                    customRelocate,
                );

                expect(result).to.be.true;
                expect(customRelocate).toHaveBeenCalledWith(
                    initialTarget,
                    newTarget,
                );
            });

            it(`${testPrefix(shadow)}Should handle arrays when every relocation function returns 'done'.`, async () => {
                const initialTarget = createTarget(shadow);
                const newTarget = createTarget(shadow);
                const relocateFn1 = vi.fn().mockResolvedValue("done");
                const relocateFn2 = vi.fn().mockResolvedValue("done");
                const piece = {
                    mount: vi.fn(),
                    relocate: [relocateFn1, relocateFn2],
                };
                const mp = new MountedPiece(piece, mountPieceCore);
                await mp[mountKey](initialTarget);
                const result = await mp.relocate(initialTarget, newTarget);
                expect(relocateFn1).toHaveBeenCalledWith(
                    initialTarget,
                    newTarget,
                );
                expect(relocateFn2).toHaveBeenCalledWith(
                    initialTarget,
                    newTarget,
                );
                expect(result).to.be.true;
            });

            it(`${testPrefix(shadow)}Should stop early when the first relocation function returns 'unsupported'.`, async () => {
                const initialTarget = createTarget(shadow);
                const newTarget = createTarget(shadow);
                const relocateFn1 = vi.fn().mockResolvedValue("unsupported");
                const relocateFn2 = vi.fn().mockResolvedValue("done");
                const piece = {
                    mount: vi.fn(),
                    relocate: [relocateFn1, relocateFn2],
                };
                const mp = new MountedPiece(piece, mountPieceCore);
                await mp[mountKey](initialTarget);
                const result = await mp.relocate(initialTarget, newTarget);
                expect(relocateFn1).toHaveBeenCalledWith(
                    initialTarget,
                    newTarget,
                );
                expect(relocateFn2).not.toHaveBeenCalled();
                expect(result).to.be.false;
            });

            it(`${testPrefix(shadow)}Should call the caller relocation after 'supported' and 'done' results are combined.`, async () => {
                const initialTarget = createTarget(shadow);
                const newTarget = createTarget(shadow);
                const customRelocate = vi.fn().mockResolvedValue(true);
                const relocateFn1 = vi.fn().mockResolvedValue("supported");
                const relocateFn2 = vi.fn().mockResolvedValue("done");
                const piece = {
                    mount: vi.fn(),
                    relocate: [relocateFn1, relocateFn2],
                };
                const mp = new MountedPiece(piece, mountPieceCore);
                await mp[mountKey](initialTarget);
                const result = await mp.relocate(
                    initialTarget,
                    newTarget,
                    customRelocate,
                );
                expect(relocateFn1).toHaveBeenCalledWith(
                    initialTarget,
                    newTarget,
                );
                expect(relocateFn2).toHaveBeenCalledWith(
                    initialTarget,
                    newTarget,
                );
                expect(customRelocate).toHaveBeenCalledWith(
                    initialTarget,
                    newTarget,
                );
                expect(result).to.be.true;
            });

            it(`${testPrefix(shadow)}Should rollback and return false when 'unsupported' happens after reversible 'supported'.`, async () => {
                const initialTarget = createTarget(shadow);
                const newTarget = createTarget(shadow);
                const rollback = vi.fn().mockResolvedValue(undefined);
                const relocateFn1 = vi
                    .fn()
                    .mockResolvedValue(["supported", rollback]);
                const relocateFn2 = vi.fn().mockResolvedValue("unsupported");
                const customRelocate = vi.fn().mockResolvedValue(true);
                const piece = {
                    mount: vi.fn(),
                    relocate: [relocateFn1, relocateFn2],
                };

                const mp = new MountedPiece(piece, mountPieceCore);
                await mp[mountKey](initialTarget);

                const result = await mp.relocate(
                    initialTarget,
                    newTarget,
                    customRelocate,
                );

                expect(result).to.be.false;
                expect(rollback).toHaveBeenCalledOnce();
                expect(customRelocate).not.toHaveBeenCalled();
            });

            it(`${testPrefix(shadow)}Should rollback and return false when 'unsupported' happens after reversible done.`, async () => {
                const initialTarget = createTarget(shadow);
                const newTarget = createTarget(shadow);
                const rollback = vi.fn().mockResolvedValue(undefined);
                const relocateFn1 = vi
                    .fn()
                    .mockResolvedValue(["done", rollback]);
                const relocateFn2 = vi.fn().mockResolvedValue("unsupported");
                const piece = {
                    mount: vi.fn(),
                    relocate: [relocateFn1, relocateFn2],
                };

                const mp = new MountedPiece(piece, mountPieceCore);
                await mp[mountKey](initialTarget);

                const result = await mp.relocate(initialTarget, newTarget);

                expect(result).to.be.false;
                expect(rollback).toHaveBeenCalledOnce();
            });

            it(`${testPrefix(shadow)}Should throw when 'unsupported' happens after 'done' without rollback.`, async () => {
                const initialTarget = createTarget(shadow);
                const newTarget = createTarget(shadow);
                const relocateFn1 = vi.fn().mockResolvedValue("done");
                const relocateFn2 = vi.fn().mockResolvedValue("unsupported");
                const piece = {
                    mount: vi.fn(),
                    relocate: [relocateFn1, relocateFn2],
                };

                const mp = new MountedPiece(piece, mountPieceCore);
                await mp[mountKey](initialTarget);

                await expect(
                    mp.relocate(initialTarget, newTarget),
                ).rejects.toThrow(/state is now inconsistent/i);
            });

            it(`${testPrefix(shadow)}Should rollback and return false when a relocation function throws in a safe state.`, async () => {
                const initialTarget = createTarget(shadow);
                const newTarget = createTarget(shadow);
                const rollback = vi.fn().mockResolvedValue(undefined);
                const warnSpy = vi
                    .spyOn(console, "warn")
                    .mockImplementation(() => undefined);
                const relocateFn1 = vi
                    .fn()
                    .mockResolvedValue(["supported", rollback]);
                const relocateFn2 = vi
                    .fn()
                    .mockRejectedValue(new Error("boom"));
                const piece = {
                    mount: vi.fn(),
                    relocate: [relocateFn1, relocateFn2],
                };

                const mp = new MountedPiece(piece, mountPieceCore);
                await mp[mountKey](initialTarget);

                const result = await mp.relocate(initialTarget, newTarget);

                expect(result).to.be.false;
                expect(rollback).toHaveBeenCalledOnce();
                expect(warnSpy).toHaveBeenCalledOnce();
                warnSpy.mockRestore();
            });

            it(`${testPrefix(shadow)}Should throw when a relocation function throws after done without rollback.`, async () => {
                const initialTarget = createTarget(shadow);
                const newTarget = createTarget(shadow);
                const relocateFn1 = vi.fn().mockResolvedValue("done");
                const relocateFn2 = vi
                    .fn()
                    .mockRejectedValue(new Error("boom"));
                const piece = {
                    mount: vi.fn(),
                    relocate: [relocateFn1, relocateFn2],
                };

                const mp = new MountedPiece(piece, mountPieceCore);
                await mp[mountKey](initialTarget);

                await expect(
                    mp.relocate(initialTarget, newTarget),
                ).rejects.toThrow(/state is now inconsistent/i);
            });

            it(`${testPrefix(shadow)}Should rollback caller relocation failures in LIFO order.`, async () => {
                const initialTarget = createTarget(shadow);
                const newTarget = createTarget(shadow);
                const callOrder: string[] = [];
                const rollback1 = vi.fn().mockImplementation(async () => {
                    callOrder.push("rollback-1");
                });
                const rollback2 = vi.fn().mockImplementation(async () => {
                    callOrder.push("rollback-2");
                });
                const customRelocate = vi
                    .fn()
                    .mockRejectedValue(new Error("custom-boom"));
                const warnSpy = vi
                    .spyOn(console, "warn")
                    .mockImplementation(() => undefined);
                const piece = {
                    mount: vi.fn(),
                    relocate: [
                        vi.fn().mockResolvedValue(["supported", rollback1]),
                        vi.fn().mockResolvedValue(["done", rollback2]),
                    ],
                };

                const mp = new MountedPiece(piece, mountPieceCore);
                await mp[mountKey](initialTarget);

                const result = await mp.relocate(
                    initialTarget,
                    newTarget,
                    customRelocate,
                );

                expect(result).to.be.false;
                expect(callOrder).to.deep.equal(["rollback-2", "rollback-1"]);
                expect(warnSpy).toHaveBeenCalledOnce();
                warnSpy.mockRestore();
            });

            it(`${testPrefix(shadow)}Should not expose rollback stack when state became unsafe before 'supported' result.`, async () => {
                const initialTarget = createTarget(shadow);
                const newTarget = createTarget(shadow);
                const rollback = vi.fn().mockResolvedValue(undefined);
                const customRelocate = vi
                    .fn()
                    .mockRejectedValue(new Error("custom-boom"));
                const piece = {
                    mount: vi.fn(),
                    relocate: [
                        vi.fn().mockResolvedValue(["supported", rollback]),
                        vi.fn().mockResolvedValue("done"),
                    ],
                };

                const mp = new MountedPiece(piece, mountPieceCore);
                await mp[mountKey](initialTarget);

                await expect(
                    mp.relocate(initialTarget, newTarget, customRelocate),
                ).rejects.toThrow("custom-boom");
                expect(customRelocate).toHaveBeenCalledOnce();
                expect(rollback).not.toHaveBeenCalled();
            });
        });
        describe(`${testPrefix(shadow)}Metadata`, () => {
            it("Should forward the metadata of the mounted piece correctly.", async () => {
                const testPiece: CorePiece = {
                    mount: async (target) => {
                        const div = document.createElement("div");
                        div.id = "meta-content";
                        target.appendChild(div);
                        return async () => div.remove();
                    },
                    meta: {
                        remountable: true,
                        relocatable: false,
                    },
                };

                const mp = new MountedPiece(testPiece, mountPieceCore);
                expect(mp.meta?.remountable).to.be.true;
                expect(mp.meta?.relocatable).to.be.false;
            });
        });
    });
});
