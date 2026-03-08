interface ApiEventMap {
    error: ApiErrorEvent;
}

interface ApiErrorEvent extends Zeta.ZetaErrorEvent {
    /**
     * Gets the function that triggered the error.
     *
     * Note that the callee returned will be the wrapper function returned from {@link createApi}
     * that forwards invocation to either real or mocked implementations.
     */
    readonly callee: Zeta.AnyFunction;
    /**
     * Get the arguments passed to the callee.
     */
    readonly arguments: any[];
}

interface ApiOptions<T> {
    /**
     * Specifies real implemenations.
     */
    implementation: T;
    /**
     * Specifies mocked implementions.
     *
     * Mock is used when `REACT_APP_MOCK` environment variable is set to `true`.
     */
    mock?: Partial<T> | ((implementation: T) => Partial<T>);
}

/**
 * Creates a wrapper that by condition executes mocked implementions.
 * @param options A dictionary specifying options. See {@link ApiOptions}.
 */
export default function createApi<T>(options: ApiOptions<T>): T & Zeta.ZetaEventDispatcher<ApiEventMap, T>;
