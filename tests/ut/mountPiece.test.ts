import { expect } from 'chai';
import * as sinon from 'sinon';
import { mountPiece, mountPieceCore } from '../../src/mountPiece.js';
import { mountKey } from '../../src/MountedPiece.js';
import type { CorePiece } from '../../src/types.js';

describe('mountPiece', () => {
    let target: HTMLElement;

    beforeEach(() => {
        target = document.createElement('div');
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('mountPieceCore', () => {
        it('Should create MountedPiece with correct parameters and call mount method.', async () => {
            const testPiece: CorePiece = {
                mount: sinon.stub().resolves(sinon.stub())
            };
            const props = { message: 'test' };

            // Create a mock MountedPiece constructor
            const mockInstance = {
                unmount: sinon.stub().resolves(),
                update: sinon.stub().resolves(),
                mountPiece: sinon.stub(),
                [mountKey]: sinon.stub().resolves()
            };

            const MockMountedPiece = sinon.stub().returns(mockInstance);

            const result = await mountPieceCore.call(undefined, testPiece, target, props, MockMountedPiece as any);

            // Verify constructor was called with correct arguments
            expect(MockMountedPiece.calledOnce).to.be.true;
            expect(MockMountedPiece.firstCall.args[0]).to.equal(testPiece);
            expect(MockMountedPiece.firstCall.args[1]).to.be.a('function'); // mountPieceCore function
            expect(MockMountedPiece.firstCall.args[2]).to.be.undefined; // parent

            // Verify it returns the mock instance
            expect(result).to.equal(mockInstance);
        });

        it('Should await promise piece before processing.', async () => {
            const testPiece: CorePiece = {
                mount: sinon.stub().resolves(sinon.stub())
            };
            
            const piecePromise = Promise.resolve(testPiece);

            const mockInstance = {
                unmount: sinon.stub().resolves(),
                update: sinon.stub().resolves(),
                mountPiece: sinon.stub(),
                [mountKey]: sinon.stub().resolves()
            };
            const MockMountedPiece = sinon.stub().returns(mockInstance);

            await mountPieceCore.call(undefined, piecePromise, target, undefined, MockMountedPiece as any);

            // Verify the resolved piece was passed to constructor
            expect(MockMountedPiece.firstCall.args[0]).to.equal(testPiece);
        });

        it('Should pass parent context when called with this binding.', async () => {
            const testPiece: CorePiece = {
                mount: sinon.stub().resolves(sinon.stub())
            };
            
            const parentMounted = {
                unmount: sinon.stub(),
                update: sinon.stub(),
                mountPiece: sinon.stub()
            };

            const mockInstance = {
                unmount: sinon.stub().resolves(),
                update: sinon.stub().resolves(),
                mountPiece: sinon.stub(),
                [mountKey]: sinon.stub().resolves()
            };
            const MockMountedPiece = sinon.stub().returns(mockInstance);

            await mountPieceCore.call(parentMounted as any, testPiece, target, undefined, MockMountedPiece as any);

            // Verify parent was passed to constructor
            expect(MockMountedPiece.firstCall.args[2]).to.equal(parentMounted);
        });
    });
});
