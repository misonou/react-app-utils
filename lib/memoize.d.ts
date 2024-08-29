declare const memoize: {
    /**
     * Creates memoized function that caches results for the given function.
     * @param fn A function.
     */
    <T extends Zeta.AnyFunction>(fn: T): T;

    /**
     * Creates memoized functions that caches results for all functions on the given object.
     * @param obj An object.
     * @returns A new object containing the memoized functions.
     */
    <T extends Zeta.Dictionary<Zeta.AnyFunction>>(obj: T): T;

    /**
     * Creates memoized functions that caches results for specific functions on the given object.
     * @param obj An object.
     * @param keys Lists of keys for which memoized functions will be generated.
     * @returns A new object containing the memoized functions.
     */
    <T, K extends (keyof T)[]>(obj: T, keys: K): Pick<T, Zeta.ArrayMember<K>>;

    /**
     * Gets whether result is cached for a specific set of arguments.
     * @param fn Memoized function returned by {@link memoize}.
     * @param args List of arguments.
     */
    has<T extends Zeta.AnyFunction>(fn: T, args: Parameters<T>): boolean;

    /**
     * Updates cached result for the given function with specific arguments.
     * @param fn Memoized function returned by {@link memoize}.
     * @param args List of arguments.
     * @param value Value to be returned as the cached result.
     */
    put<T extends Zeta.AnyFunction>(fn: T, args: Parameters<T>, value: ReturnType<T>): void;

    /**
     * Deletes cached result for the given function when called with the specified arguments.
     * @param fn Memoized function returned by {@link memoize}.
     * @param args List of arguments.
     */
    delete<T extends Zeta.AnyFunction>(fn: T, args: Parameters<T>): void;

    /**
     * Clears cached results for all memoized function in the object.
     * @param obj Object containing memoized function returned by {@link memoize}.
     */
    clear(obj: Zeta.Dictionary<Zeta.AnyFunction>): void;

    /**
     * Clears cached results for the given memoized functions.
     * @param fn One or more memoized functions returned by {@link memoize}.
     */
    clear(...fn: Zeta.AnyFunction[]): void;
}

export default memoize;
