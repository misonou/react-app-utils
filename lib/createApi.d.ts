interface ApiEventMap {
    error: Zeta.ZetaErrorEvent;
}

interface ApiEventListener<T> {
    on<E extends keyof ApiEventMap>(event: E, handler: Zeta.ZetaEventHandler<E, ApiEventMap, T>): Zeta.UnregisterCallback;
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
    mock?: T;
}

/**
 * Creates a wrapper that by condition executes mocked implementions.
 * @param options A dictionary specifying options. See {@link ApiOptions}.
 */
export default function createApi<T>(options: ApiOptions<T>): T & ApiEventListener<T>;
