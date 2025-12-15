import { expect } from 'chai';
import { mountPiece } from '../../src/mountPiece.js';
import type { CorePiece } from '../../src/types.js';

describe('mountPiece', () => {
    let target: HTMLElement;

    beforeEach(() => {
        target = document.createElement('div');
    });

    it('Should mount a simple piece successfully on the.', async () => {
        const testPiece: CorePiece<{ message?: string }> = {
            mount: async (target, props) => {
                const div = document.createElement('div');
                div.textContent = props?.message || 'Hello World';
                div.id = 'test-content';
                target.appendChild(div);
                
                return async () => {
                    div.remove();
                };
            }
        };

        const mountedPiece = await mountPiece(testPiece, target, { message: 'Test Message' });
        
        expect(target.children.length).to.equal(1);
        expect(target.querySelector('#test-content')?.textContent).to.equal('Test Message');
        expect(mountedPiece).to.have.property('unmount');
        expect(mountedPiece).to.have.property('update');
        expect(mountedPiece.mountPiece).to.be.a('function');
        
        await mountedPiece.unmount();
        expect(target.children.length).to.equal(0);
    });
});