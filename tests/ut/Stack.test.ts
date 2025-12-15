import { expect } from 'chai';
import { Stack } from '../../src/Stack.js';

describe('Stack', () => {
    let stack: Stack<number>;

    beforeEach(() => {
        stack = new Stack<number>();
    });

    describe('push()', () => {
        it('Should add an element to the top of the stack.', () => {
            const result = stack.push(1);
            
            expect(result).to.equal(1);
            expect(stack.size).to.equal(1);
            expect(stack.peek()).to.equal(1);
        });

        it('Should return the new size of the stack.', () => {
            stack.push(1);
            stack.push(2);
            const result = stack.push(3);
            
            expect(result).to.equal(3);
        });

        it('Should maintain LIFO order when pushing multiple elements.', () => {
            stack.push(1);
            stack.push(2);
            stack.push(3);
            
            expect(stack.peek()).to.equal(3);
            expect(stack.size).to.equal(3);
        });
    });

    describe('pop()', () => {
        it('Should remove and return the top element from the stack.', () => {
            stack.push(1);
            stack.push(2);
            stack.push(3);
            
            const result = stack.pop();
            
            expect(result).to.equal(3);
            expect(stack.size).to.equal(2);
            expect(stack.peek()).to.equal(2);
        });

        it('Should return undefined when popping from an empty stack.', () => {
            const result = stack.pop();
            
            expect(result).to.be.undefined;
            expect(stack.size).to.equal(0);
        });

        it('Should follow LIFO order when popping multiple elements.', () => {
            stack.push(1);
            stack.push(2);
            stack.push(3);
            
            expect(stack.pop()).to.equal(3);
            expect(stack.pop()).to.equal(2);
            expect(stack.pop()).to.equal(1);
            expect(stack.pop()).to.be.undefined;
        });
    });

    describe('LIFO behavior verification', () => {
        it('Should demonstrate proper LIFO behavior with push and pop operations.', () => {
            // Push elements in order
            stack.push(10);
            stack.push(20);
            stack.push(30);
            stack.push(40);
            
            // Verify they come out in reverse order
            const results: number[] = [];
            while (!stack.isEmpty()) {
                results.push(stack.pop()!);
            }
            
            expect(results).to.deep.equal([40, 30, 20, 10]);
        });

        it('Should maintain LIFO order when interleaving push and pop operations.', () => {
            stack.push(1);
            stack.push(2);
            expect(stack.pop()).to.equal(2);
            
            stack.push(3);
            stack.push(4);
            expect(stack.pop()).to.equal(4);
            expect(stack.pop()).to.equal(3);
            expect(stack.pop()).to.equal(1);
        });
    });

    describe('peek()', () => {
        it('Should return the top element without removing it.', () => {
            stack.push(1);
            stack.push(2);
            
            const result = stack.peek();
            
            expect(result).to.equal(2);
            expect(stack.size).to.equal(2);
        });

        it('Should return undefined for an empty stack.', () => {
            const result = stack.peek();
            
            expect(result).to.be.undefined;
        });
    });

    describe('top()', () => {
        it('Should return the top element without removing it (alias for peek).', () => {
            stack.push(1);
            stack.push(2);
            
            const result = stack.top();
            
            expect(result).to.equal(2);
            expect(stack.size).to.equal(2);
        });

        it('Should return undefined for an empty stack.', () => {
            const result = stack.top();
            
            expect(result).to.be.undefined;
        });
    });

    describe('isEmpty()', () => {
        it('Should return true for an empty stack.', () => {
            expect(stack.isEmpty()).to.be.true;
        });

        it('Should return false for a non-empty stack.', () => {
            stack.push(1);
            
            expect(stack.isEmpty()).to.be.false;
        });
    });

    describe('size', () => {
        it('Should return 0 for an empty stack.', () => {
            expect(stack.size).to.equal(0);
        });

        it('Should return the correct size for a non-empty stack.', () => {
            stack.push(1);
            stack.push(2);
            stack.push(3);
            
            expect(stack.size).to.equal(3);
        });

        it('Should update correctly after operations.', () => {
            stack.push(1);
            expect(stack.size).to.equal(1);
            
            stack.push(2);
            expect(stack.size).to.equal(2);
            
            stack.pop();
            expect(stack.size).to.equal(1);
            
            stack.clear();
            expect(stack.size).to.equal(0);
        });
    });

    describe('length', () => {
        it('Should return the same value as size (alias).', () => {
            stack.push(1);
            stack.push(2);
            
            expect(stack.length).to.equal(stack.size);
            expect(stack.length).to.equal(2);
        });
    });

    describe('clear()', () => {
        it('Should remove all elements from the stack.', () => {
            stack.push(1);
            stack.push(2);
            stack.push(3);
            
            stack.clear();
            
            expect(stack.size).to.equal(0);
            expect(stack.isEmpty()).to.be.true;
            expect(stack.peek()).to.be.undefined;
        });

        it('Should work correctly on an already empty stack.', () => {
            stack.clear();
            
            expect(stack.size).to.equal(0);
            expect(stack.isEmpty()).to.be.true;
        });
    });

    describe('delete()', () => {
        it('Should remove the first element that matches the predicate from top to bottom.', () => {
            stack.push(1);
            stack.push(2);
            stack.push(3);
            stack.push(2);
            
            const result = stack.delete(item => item === 2);
            
            expect(result).to.be.true;
            expect(stack.size).to.equal(3);
            expect(stack.toArray()).to.deep.equal([1, 2, 3]);
        });

        it('Should return false if no matching element is found.', () => {
            stack.push(1);
            stack.push(2);
            stack.push(3);
            
            const result = stack.delete(item => item === 4);
            
            expect(result).to.be.false;
            expect(stack.size).to.equal(3);
        });

        it('Should search from top to bottom of the stack.', () => {
            stack.push(1);
            stack.push(2);
            stack.push(3);
            stack.push(2);
            
            stack.delete(item => item === 2);
            
            // Should remove the top occurrence of 2
            expect(stack.toArray()).to.deep.equal([1, 2, 3]);
        });
    });

    describe('toArray()', () => {
        it('Should return a copy of the internal array with bottom element first.', () => {
            stack.push(1);
            stack.push(2);
            stack.push(3);
            
            const array = stack.toArray();
            
            expect(array).to.deep.equal([1, 2, 3]);
        });

        it('Should return a shallow copy (not modify original).', () => {
            stack.push(1);
            stack.push(2);
            
            const array = stack.toArray();
            array.push(3);
            
            expect(stack.size).to.equal(2);
            expect(stack.toArray()).to.deep.equal([1, 2]);
        });

        it('Should return an empty array for an empty stack.', () => {
            const array = stack.toArray();
            
            expect(array).to.deep.equal([]);
        });
    });

    describe('fromArray()', () => {
        it('Should create a new stack from an array with first element as bottom.', () => {
            const array = [1, 2, 3, 4];
            const newStack = Stack.fromArray(array);
            
            expect(newStack.size).to.equal(4);
            expect(newStack.peek()).to.equal(4);
            expect(newStack.toArray()).to.deep.equal([1, 2, 3, 4]);
        });

        it('Should create an empty stack from an empty array.', () => {
            const newStack = Stack.fromArray([]);
            
            expect(newStack.size).to.equal(0);
            expect(newStack.isEmpty()).to.be.true;
        });

        it('Should work with different types.', () => {
            const stringStack = Stack.fromArray(['a', 'b', 'c']);
            
            expect(stringStack.peek()).to.equal('c');
            expect(stringStack.toArray()).to.deep.equal(['a', 'b', 'c']);
        });
    });

    describe('toString()', () => {
        it('Should return a string representation of the stack.', () => {
            stack.push(1);
            stack.push(2);
            stack.push(3);
            
            const result = stack.toString();
            
            expect(result).to.equal('Stack[1, 2, 3]');
        });

        it('Should return "Stack[]" for an empty stack.', () => {
            const result = stack.toString();
            
            expect(result).to.equal('Stack[]');
        });
    });

    describe('Iterator (Symbol.iterator)', () => {
        it('Should iterate from top to bottom of the stack.', () => {
            stack.push(1);
            stack.push(2);
            stack.push(3);
            stack.push(4);
            
            const results: number[] = [];
            for (const item of stack) {
                results.push(item);
            }
            
            expect(results).to.deep.equal([4, 3, 2, 1]);
        });

        it('Should work with for...of loop.', () => {
            stack.push(10);
            stack.push(20);
            stack.push(30);
            
            const items: number[] = [];
            for (const item of stack) {
                items.push(item);
            }
            
            expect(items).to.deep.equal([30, 20, 10]);
        });

        it('Should work with Array.from().', () => {
            stack.push(5);
            stack.push(10);
            stack.push(15);
            
            const array = Array.from(stack);
            
            expect(array).to.deep.equal([15, 10, 5]);
        });

        it('Should work with spread operator.', () => {
            stack.push(100);
            stack.push(200);
            stack.push(300);
            
            const array = [...stack];
            
            expect(array).to.deep.equal([300, 200, 100]);
        });

        it('Should iterate correctly on an empty stack.', () => {
            const results: number[] = [];
            for (const item of stack) {
                results.push(item);
            }
            
            expect(results).to.deep.equal([]);
        });

        it('Should demonstrate proper top-to-bottom iteration order.', () => {
            // Build stack with known order
            const pushOrder = ['first', 'second', 'third', 'fourth'];
            const stringStack = new Stack<string>();
            
            for (const item of pushOrder) {
                stringStack.push(item);
            }
            
            // Iterate should yield in reverse order (top to bottom)
            const iterateOrder: string[] = [];
            for (const item of stringStack) {
                iterateOrder.push(item);
            }
            
            expect(iterateOrder).to.deep.equal(['fourth', 'third', 'second', 'first']);
        });

        it('Should be independent of other stack operations.', () => {
            stack.push(1);
            stack.push(2);
            stack.push(3);
            
            const iterator = stack[Symbol.iterator]();
            
            expect(iterator.next().value).to.equal(3);
            stack.push(4);
            expect(iterator.next().value).to.equal(2);
            stack.pop();
            expect(iterator.next().value).to.equal(1);
        });
    });

    describe('bottomToTop()', () => {
        it('Should iterate from bottom to top of the stack.', () => {
            stack.push(1);
            stack.push(2);
            stack.push(3);
            stack.push(4);
            
            const results: number[] = [];
            const iterator = stack.bottomToTop();
            let result = iterator.next();
            while (!result.done) {
                results.push(result.value);
                result = iterator.next();
            }
            
            expect(results).to.deep.equal([1, 2, 3, 4]);
        });

        it('Should work correctly on an empty stack.', () => {
            const results: number[] = [];
            const iterator = stack.bottomToTop();
            let result = iterator.next();
            while (!result.done) {
                results.push(result.value);
                result = iterator.next();
            }
            
            expect(results).to.deep.equal([]);
        });
    });

    describe('Generic type support', () => {
        it('Should work with string types.', () => {
            const stringStack = new Stack<string>();
            stringStack.push('hello');
            stringStack.push('world');
            
            expect(stringStack.peek()).to.equal('world');
            expect(stringStack.pop()).to.equal('world');
            expect(stringStack.pop()).to.equal('hello');
        });

        it('Should work with object types.', () => {
            interface TestObject {
                id: number;
                name: string;
            }
            
            const objectStack = new Stack<TestObject>();
            const obj1 = { id: 1, name: 'first' };
            const obj2 = { id: 2, name: 'second' };
            
            objectStack.push(obj1);
            objectStack.push(obj2);
            
            expect(objectStack.peek()).to.equal(obj2);
            expect(objectStack.pop()).to.equal(obj2);
            expect(objectStack.pop()).to.equal(obj1);
        });
    });
});