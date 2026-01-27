import { StatefulMixin } from "brew-js-react";

export interface UndoableState<T> {
    /**
     * Gets whether there are previous states in the history stack that can be restored.
     */
    readonly canUndo: boolean;

    /**
     * Gets whether there are next states in the history stack that can be reapplied.
     */
    readonly canRedo: boolean;

    /**
     * Gets the current state.
     */
    readonly value: T;

    /**
     * Restores the previous state in the history stack.
     */
    undo(): void;

    /**
     * Reapplies the next state in the history stack.
     */
    redo(): void;

    /**
     * Clears the history stack.
     * @param value Value to be set after reset. Defaults to the initial state.
     */
    reset(value?: T): void;

    /**
     * Updates current state.
     * @param value New state or a callback that returns new state.
     */
    pushState(value: T | ((prevState: T) => T)): void;
}

export interface UndoableInputMixinOptions {
    /**
     * Specifies initial value to be set when input element is mounted.
     */
    initialValue?: string;
    /**
     * Specifies minimum interval in milliseconds before next value change to be tracked.
     * It does not affect capturing selection change.
     */
    debounce?: number;
}

/**
 * Monitors value and selection range for input elements.
 *
 * It is primarily used for maintaining undoability when input is updated programatically,
 * which hinders native behavior.
 */
export class UndoableInputMixin extends StatefulMixin {
    /**
     * Sets options to the mixin.
     * @param options A dictionary specifying options.
     */
    withOptions(options: UndoableInputMixinOptions): this;

    /**
     * Adds an listener to be invoked when value is changed.
     * Changes caused by undo and redo are also monitored.
     * @param callback A callback the receives the new value and the triggering input element.
     */
    onChange(callback: (this: HTMLElement, value: string, element: HTMLElement) => void): Zeta.UnregisterCallback;
}

/**
 * Returns a mixin that monitors value and selection change for input elements.
 * @param initialValue Initial state.
 * @param debounce Minimum interval in milliseconds before next state to be tracked.
 */
export function useUndoableInputMixin(initialValue?: string, debounce?: number): UndoableInputMixin;

/**
 * Creates a React state that upon updates, old states are tracked and can be restored.
 * @param initialState Initial state.
 * @param debounce Minimum interval in milliseconds before next state to be tracked.
 */
export function useUndoableState<T>(initialState: T | (() => T), debounce?: number): readonly [T, React.Dispatch<React.SetStateAction<T>>, UndoableState<T>];
