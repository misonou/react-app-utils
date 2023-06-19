interface SetIdleTimeoutOptions {
    /**
     * Whether user interaction is counted across multiple frames.
     */
    crossFrame?: boolean;
}

/**
 * Sets a timer and fires callback when there is no user interaction after a specific period of time.
 * @param ms Idle time limit in milliseconds.
 * @param callback Action to perform when idle time limit is reached.
 * @returns Callback to clear the timer.
 */
export function setIdleTimeout(ms: number, callback: () => void): Zeta.UnregisterCallback;

/**
 * Sets a timer and fires callback when there is no user interaction after a specific period of time.
 * @param ms Idle time limit in milliseconds.
 * @param callback Action to perform when idle time limit is reached.
 * @param crossFrame Whether user interaction is counted across multiple frames.
 * @returns Callback to clear the timer.
 */
export function setIdleTimeout(ms: number, callback: () => void, crossFrame: boolean): Zeta.UnregisterCallback;

/**
 * Sets a timer and fires callback when there is no user interaction after a specific period of time.
 * @param ms Idle time limit in milliseconds.
 * @param callback Action to perform when idle time limit is reached.
 * @param options See {@link SetIdleTimeoutOptions}.
 * @returns Callback to clear the timer.
 */
export function setIdleTimeout(ms: number, callback: () => void, options: SetIdleTimeoutOptions): Zeta.UnregisterCallback;

/**
 * Creates a queue that asynchronous callbacks are executed in sequence, after the previous one has either fulfilled or rejected.
 * @returns A function that pushes the intake callback to the queue.
 */
export function createAsyncQueue(): <T>(callback: () => T | Promise<T>) => Promise<T>;
