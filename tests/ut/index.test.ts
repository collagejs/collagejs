import { describe, it, expect } from 'vitest';
import * as CollageCore from '../../src/index.js';

describe('index', () => {
    it('Should only export the expected objects.', () => {
        const expectedObjects = [
            'mountPiece',
            'mountPieceKey',
            'ensureGlobalCollageJs',
            'preventRemount',
            'noopPiece',
            'Stack',
        ];
        expect(Object.keys(CollageCore)).toEqual(expect.arrayContaining(expectedObjects));
        expect(expectedObjects).toEqual(expect.arrayContaining(Object.keys(CollageCore)));
    });
});
