import { expect } from 'chai';
import * as CollageCore from '../../src/index.js';

describe('index', () => {
    it('Should only export the expected objects.', () => {
        const expectedObjects = [
            'mountPiece',
            'mountPieceKey'
        ];

        for (const key of Object.keys(CollageCore)) {
            expect(expectedObjects).to.include(key);
        }
        for (const expectedObject of expectedObjects) {
            expect(CollageCore).to.have.property(expectedObject);
        }
    });
});
