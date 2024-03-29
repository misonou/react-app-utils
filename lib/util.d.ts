export { openDeferredURL as openDeferredLink } from "brew-js/util";

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

export interface UserActionOptions {
    /**
     * Prevents the handler being invoked again while the last invocation is still in progress.
     */
    lock?: boolean;
    /**
     * Prompts leave confirmation when the operation is in progress.
     */
    preventLeave?: boolean;
}

/**
 * Wraps handler to be invoked by user interaction.
 *
 * The wrapper callback will
 * - send `asyncStart`, `asyncEnd` and `error` event through Zeta DOM
 * - send `abort` signal when the same handler on the same element is invoked again while the last invocation is still in progress
 * - send `abort` signal when the element is removed from document
 */
export function handleUserAction<T extends { currentTarget: EventTarget }>(callback?: (event: T, signal: AbortSignal) => any, options?: UserActionOptions): (event: T) => Promise<any>;
