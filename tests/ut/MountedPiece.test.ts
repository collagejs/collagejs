import { describe, it, expect, vi } from 'vitest';
import { MountedPiece, mountKey } from '../../src/MountedPiece.js';
import type { AcceptableTarget, CorePiece } from '../../src/types.js';
import { mountPieceCore } from '../../src/mountPiece.js';

function createTarget(shadow: boolean = false): AcceptableTarget {
    const div = document.createElement('div');
    if (shadow) {
        return div.attachShadow({ mode: 'open' });
    }
    return div;
}

function testPrefix(shadow: boolean) {
    return shadow ? 'Shadow DOM: ' : '';
}

[false, true].forEach(shadow => {
    describe(`${testPrefix(shadow)}MountedPiece`, () => {
        it(`${testPrefix(shadow)}Should mount and unmount a piece correctly.`, async () => {
            const target = createTarget(shadow);
            const testPiece: CorePiece = {
                mount: async (target) => {
                    const div = document.createElement('div');
                    div.id = 'mounted-content';
                    target.appendChild(div);

                    return async () => {
                        div.remove();
                    };
                }
            };

            const mp = new MountedPiece(testPiece, mountPieceCore);
            await mp[mountKey](target);

            expect(target.children.length).to.equal(1);
            expect(target.querySelector('#mounted-content')).to.not.be.null;

            await mp.unmount();
            expect(target.children.length).to.equal(0);
        });

        it(`${testPrefix(shadow)}Should handle piece updates.`, async () => {
            const target = createTarget(shadow);
            const testPiece: CorePiece<{ message: string }> = {
                mount: async (target, props) => {
                    const div = document.createElement('div');
                    div.id = 'updateable-content';
                    div.textContent = props?.message || 'default';
                    target.appendChild(div);

                    return async () => {
                        div.remove();
                    };
                },
                update: async (props) => {
                    const div = target.querySelector('#updateable-content') as HTMLDivElement;
                    if (div) {
                        div.textContent = props.message;
                    }
                }
            };

            const mp = new MountedPiece(testPiece, mountPieceCore);
            await mp[mountKey](target, { message: 'initial' });

            expect(target.querySelector('#updateable-content')?.textContent).to.equal('initial');

            await mp.update({ message: 'updated' });
            expect(target.querySelector('#updateable-content')?.textContent).to.equal('updated');

            await mp.unmount();
        });

        it(`${testPrefix(shadow)}Should handle parent-child relationships with proper cleanup.`, async () => {
            const target = createTarget(shadow);

            const childPiece: CorePiece = {
                mount: async (target) => {
                    const childDiv = document.createElement('div');
                    childDiv.id = 'child-content';
                    childDiv.textContent = 'child';
                    target.appendChild(childDiv);

                    return async () => {
                        childDiv.remove();
                    };
                }
            };

            const parentPiece: CorePiece = {
                mount: async (target) => {
                    const parentDiv = document.createElement('div');
                    parentDiv.id = 'parent-content';
                    parentDiv.textContent = 'parent';
                    target.appendChild(parentDiv);

                    // Parent creates and manages child container
                    const childContainer = document.createElement('div');
                    childContainer.id = 'child-container';
                    target.appendChild(childContainer);

                    return async () => {
                        parentDiv.remove();
                        childContainer.remove(); // Parent cleans up child container
                    };
                }
            };

            // Mount parent
            const parentMp = new MountedPiece(parentPiece, mountPieceCore);
            await parentMp[mountKey](target);
            expect(target.children.length).to.equal(2); // parent-content + child-container
            expect(target.querySelector('#parent-content')).to.not.be.null;
            expect(target.querySelector('#child-container')).to.not.be.null;

            // Mount child as child of parent
            const childContainer = target.querySelector('#child-container') as HTMLElement;
            const childMp = new MountedPiece(childPiece, mountPieceCore, parentMp);
            await childMp[mountKey](childContainer);

            expect(childContainer.children.length).to.equal(1);
            expect(childContainer.querySelector('#child-content')).to.not.be.null;

            // Unmounting parent should also unmount child AND clean up the container
            await parentMp.unmount();
            expect(target.children.length).to.equal(0); // Everything should be gone
            expect(target.querySelector('#parent-content')).to.be.null;
            expect(target.querySelector('#child-container')).to.be.null;
            expect(target.querySelector('#child-content')).to.be.null;
        });

        it(`${testPrefix(shadow)}Should handle array of mount functions.`, async () => {
            const target = createTarget(shadow);
            const testPiece: CorePiece = {
                mount: [
                    async (target) => {
                        const div1 = document.createElement('div');
                        div1.id = 'mount-1';
                        target.appendChild(div1);
                        return async () => div1.remove();
                    },
                    async (target) => {
                        const div2 = document.createElement('div');
                        div2.id = 'mount-2';
                        target.appendChild(div2);
                        return async () => div2.remove();
                    }
                ]
            };

            const mp = new MountedPiece(testPiece, mountPieceCore);
            await mp[mountKey](target);

            expect(target.children.length).to.equal(2);
            expect(target.querySelector('#mount-1')).to.not.be.null;
            expect(target.querySelector('#mount-2')).to.not.be.null;

            await mp.unmount();
            expect(target.children.length).to.equal(0);
        });

        it(`${testPrefix(shadow)}Should handle nested arrays of mount functions.`, async () => {
            const target = createTarget(shadow);
            const testPiece: CorePiece = {
                mount: [
                    async (target) => {
                        const div1 = document.createElement('div');
                        div1.id = 'nested-1';
                        target.appendChild(div1);
                        return async () => div1.remove();
                    },
                    [
                        async (target) => {
                            const div2 = document.createElement('div');
                            div2.id = 'nested-2';
                            target.appendChild(div2);
                            return async () => div2.remove();
                        },
                        async (target) => {
                            const div3 = document.createElement('div');
                            div3.id = 'nested-3';
                            target.appendChild(div3);
                            return async () => div3.remove();
                        }
                    ]
                ]
            };

            const mp = new MountedPiece(testPiece, mountPieceCore);
            await mp[mountKey](target);

            expect(target.children.length).to.equal(3);
            expect(target.querySelector('#nested-1')).to.not.be.null;
            expect(target.querySelector('#nested-2')).to.not.be.null;
            expect(target.querySelector('#nested-3')).to.not.be.null;

            await mp.unmount();
            expect(target.children.length).to.equal(0);
        });

        it(`${testPrefix(shadow)}Should generate unique IDs for different instances.`, async () => {
            const createTestPiece = (id: string): CorePiece => ({
                mount: async (target) => {
                    const div = document.createElement('div');
                    div.id = id;
                    target.appendChild(div);
                    return async () => div.remove();
                }
            });

            const piece1 = createTestPiece('piece-1');
            const piece2 = createTestPiece('piece-2');

            const mp1 = new MountedPiece(piece1, mountPieceCore);
            const mp2 = new MountedPiece(piece2, mountPieceCore);

            // Each instance should be unique
            expect(mp1).to.not.equal(mp2);

            // Test that they behave independently
            const target1 = createTarget(shadow);
            const target2 = createTarget(shadow);

            await mp1[mountKey](target1);
            await mp2[mountKey](target2);

            expect(target1.children.length).to.equal(1);
            expect(target2.children.length).to.equal(1);

            await mp1.unmount();
            expect(target1.children.length).to.equal(0);
            expect(target2.children.length).to.equal(1); // Should still have content

            await mp2.unmount();
            expect(target2.children.length).to.equal(0);
        });
        describe(`${testPrefix(shadow)}relocate()`, () => {
            it(`${testPrefix(shadow)}Should handle relocation of a piece.`, async () => {
                const initialTarget = createTarget(shadow);
                const newTarget = createTarget(shadow);
                const piece = {
                    mount: vi.fn(),
                    relocate: vi.fn().mockReturnValue(Promise.resolve(true))
                };
                const mp = new MountedPiece(piece, mountPieceCore);
                await mp[mountKey](initialTarget);
                const result = await mp.relocate(initialTarget, newTarget);
                expect(result).to.be.true;
                expect(piece.relocate).toHaveBeenCalledWith(initialTarget, newTarget);
            });
            it(`${testPrefix(shadow)}Should return false when relocating a piece without a relocate function.`, async () => {
                const initialTarget = createTarget(shadow);
                const newTarget = createTarget(shadow);
                const piece = {
                    mount: vi.fn()
                };
                const mp = new MountedPiece(piece, mountPieceCore);
                await mp[mountKey](initialTarget);
                const result = await mp.relocate(initialTarget, newTarget);
                expect(result).to.be.false;
            });
            it(`${testPrefix(shadow)}Should handle array of relocation functions.`, async () => {
                const initialTarget = createTarget(shadow);
                const newTarget = createTarget(shadow);
                const relocateFn1 = vi.fn().mockResolvedValue(true);
                const relocateFn2 = vi.fn().mockResolvedValue(true);
                const piece = {
                    mount: vi.fn(),
                    relocate: [relocateFn1, relocateFn2]
                };
                const mp = new MountedPiece(piece, mountPieceCore);
                await mp[mountKey](initialTarget);
                const result = await mp.relocate(initialTarget, newTarget);
                expect(relocateFn1).toHaveBeenCalledWith(initialTarget, newTarget);
                expect(relocateFn2).toHaveBeenCalledWith(initialTarget, newTarget);
                expect(result).to.be.true;
            });
            it(`${testPrefix(shadow)}Should return false if the first relocation function returns false.`, async () => {
                const initialTarget = createTarget(shadow);
                const newTarget = createTarget(shadow);
                const relocateFn1 = vi.fn().mockResolvedValue(false);
                const relocateFn2 = vi.fn().mockResolvedValue(true);
                const piece = {
                    mount: vi.fn(),
                    relocate: [relocateFn1, relocateFn2]
                };
                const mp = new MountedPiece(piece, mountPieceCore);
                await mp[mountKey](initialTarget);
                const result = await mp.relocate(initialTarget, newTarget);
                expect(relocateFn1).toHaveBeenCalledWith(initialTarget, newTarget);
                expect(relocateFn2).not.toHaveBeenCalled();
                expect(result).to.be.false;
            });
            it(`${testPrefix(shadow)}Should return 'ready' even if not all relocation functions return it.`, async () => {
                const initialTarget = createTarget(shadow);
                const newTarget = createTarget(shadow);
                const relocateFn1 = vi.fn().mockResolvedValue('ready');
                const relocateFn2 = vi.fn().mockResolvedValue(true);
                const piece = {
                    mount: vi.fn(),
                    relocate: [relocateFn1, relocateFn2]
                };
                const mp = new MountedPiece(piece, mountPieceCore);
                await mp[mountKey](initialTarget);
                const result = await mp.relocate(initialTarget, newTarget);
                expect(relocateFn1).toHaveBeenCalledWith(initialTarget, newTarget);
                expect(relocateFn2).toHaveBeenCalledWith(initialTarget, newTarget);
                expect(result).to.equal('ready');
            });
            [true, 'ready'].forEach(tc => {
                it(`${testPrefix(shadow)}Should throw an error if a relocation function returns 'false' after another returned '${tc}'.`, async () => {
                    const initialTarget = createTarget(shadow);
                    const newTarget = createTarget(shadow);
                    const relocateFn1 = vi.fn().mockResolvedValue(tc);
                    const relocateFn2 = vi.fn().mockResolvedValue(false);
                    const piece = {
                        mount: vi.fn(),
                        relocate: [relocateFn1, relocateFn2]
                    };
                    const mp = new MountedPiece(piece, mountPieceCore);
                    await mp[mountKey](initialTarget);
                    await expect(mp.relocate(initialTarget, newTarget)).rejects.toThrow();
                });
            });
        });
        describe(`${testPrefix(shadow)}Capabilities`, () => {
            it("Should forward the capabilities of the mounted piece correctly.", async () => {
                const testPiece: CorePiece = {
                    mount: async (target) => {
                        const div = document.createElement('div');
                        div.id = 'capabilities-content';
                        target.appendChild(div);
                        return async () => div.remove();
                    },
                    capabilities: {
                        remountable: true,
                    }
                };

                const mp = new MountedPiece(testPiece, mountPieceCore);
                expect(mp.capabilities?.remountable).to.be.true;
            });
        });
    });
});
