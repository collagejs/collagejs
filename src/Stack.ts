/**
 * A generic stack implementation providing standard stack operations.
 * Follows LIFO (Last In, First Out) principle.
 * 
 * @template T The type of elements stored in the stack
 */
export class Stack<T> {
    #items: T[] = [];

    /**
     * Adds an element to the top of the stack.
     * 
     * @param item The item to push onto the stack
     * @returns The new size of the stack
     */
    push(item: T): number {
        return this.#items.push(item);
    }

    /**
     * Removes and returns the top element from the stack.
     * 
     * @returns The top element, or undefined if the stack is empty
     */
    pop(): T | undefined {
        return this.#items.pop();
    }

    /**
     * Returns the top element without removing it.
     * 
     * @returns The top element, or undefined if the stack is empty
     */
    peek(): T | undefined {
        return this.#items[this.#items.length - 1];
    }

    /**
     * Returns the top element without removing it.
     * Alias for peek() method.
     * 
     * @returns The top element, or undefined if the stack is empty
     */
    top(): T | undefined {
        return this.peek();
    }

    /**
     * Checks if the stack is empty.
     * 
     * @returns True if the stack contains no elements, false otherwise
     */
    isEmpty(): boolean {
        return this.#items.length === 0;
    }

    /**
     * Returns the number of elements in the stack.
     * 
     * @returns The size of the stack
     */
    get size(): number {
        return this.#items.length;
    }

    /**
     * Returns the number of elements in the stack.
     * Alias for size property.
     * 
     * @returns The length of the stack
     */
    get length(): number {
        return this.size;
    }

    /**
     * Removes all elements from the stack.
     */
    clear(): void {
        this.#items = [];
    }

    /**
     * Removes the first element that matches the predicate function.
     * Searches from top to bottom of the stack.
     * 
     * @param predicate Function that tests each element for removal
     * @returns True if an element was removed, false if no match was found
     */
    delete(predicate: (item: T) => boolean): boolean {
        for (let i = this.#items.length - 1; i >= 0; i--) {
            if (predicate(this.#items[i])) {
                this.#items.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    /**
     * Returns a shallow copy of the stack as an array.
     * The first element in the array represents the bottom of the stack.
     * 
     * @returns A copy of the internal array
     */
    toArray(): T[] {
        return [...this.#items];
    }

    /**
     * Creates a new stack from an array of items.
     * The first element in the array becomes the bottom of the stack.
     * 
     * @param items Array of items to initialize the stack with
     * @returns A new Stack instance
     */
    static fromArray<U>(items: U[]): Stack<U> {
        const stack = new Stack<U>();
        stack.#items = [...items];
        return stack;
    }

    /**
     * Returns a string representation of the stack.
     * 
     * @returns String representation showing stack contents
     */
    toString(): string {
        return `Stack[${this.#items.join(', ')}]`;
    }

    /**
     * Allows iteration over the stack from top to bottom.
     * 
     * @returns Iterator that yields elements from top to bottom
     */
    *[Symbol.iterator](): Iterator<T> {
        for (let i = this.#items.length - 1; i >= 0; i--) {
            yield this.#items[i];
        }
    }

    /**
     * Returns an iterator that yields elements from bottom to top.
     * 
     * @returns Iterator that yields elements from bottom to top
     */
    *bottomToTop(): Iterator<T> {
        for (let i = 0; i < this.#items.length; i++) {
            yield this.#items[i];
        }
    }
}