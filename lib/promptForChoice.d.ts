import { } from "zeta-dom";

export interface PromptOptions {
    /**
     * Displays dropdown only while the specified keys are pressed.
     */
    metaKey?: "" | Zeta.KeyNameModifier;
    /**
     * Specifies whether an option of unknown error is appended to the dropdown.
     */
    unknownError?: boolean;
}

/**
 * Displays a dropdown to select different outcomes.
 * @param label A user-friendly label to indicate what data is expected to be chosen.
 * @param choices A dictionary which the keys will be displayed as options. If the associated value is an Error object, the error will be thrown, resulting in a rejected promise.
 * @param options A dictionary specifying options. See {@link PromptOptions}.
 * @returns A promise resolves to the chosen value, or rejects with the chosen error.
 */
export default function promptForChoice<T>(label: string, choices: Zeta.Dictionary<T | Error>, options?: PromptOptions): Promise<Exclude<T, Error>>;
