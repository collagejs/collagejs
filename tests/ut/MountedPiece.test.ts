import { expect } from 'chai';
import { MountedPiece, mountKey } from '../../src/MountedPiece.js';
import type { CorePiece } from '../../src/types.js';
import { mountPieceCore } from '../../src/mountPiece.js';

describe('MountedPiece', () => {
    let target: HTMLElement;

    beforeEach(() => {
        target = document.createElement('div');
    });

    it('Should mount and unmount a piece correctly.', async () => {
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

    it('Should handle piece updates.', async () => {
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

    it('Should handle parent-child relationships with proper cleanup.', async () => {
        let childMountFunction: any;
        
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

    it('Should handle array of mount functions.', async () => {
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

    it('Should handle nested arrays of mount functions.', async () => {
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

    it('Should generate unique IDs for different instances.', async () => {
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
        const target1 = document.createElement('div');
        const target2 = document.createElement('div');
        
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
});

// function mountPieceCore(piece: CorePiece<Record<string, any>>, target: HTMLElement, props?: Record<string, any> | undefined): Promise<MountedPiece<Record<string, any>>> {
//     throw new Error('Function not implemented.');
// }
