interface TextInputAutofillFix {
    /**
     * A ref object to get reference to input field.
     */
    readonly inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
    /**
     * Gets whether a fake input field would be required as
     * the original input field is being set to transparent.
     */
    readonly requireFakeInput: boolean;
}

/**
 * Allows fixing style issue of auto-completed input field arise from inconsistent state.
 *
 * Unless user has interacted with the page by mouse, touch or keyboard (see {@link UserActivation.hasBeenActive}),
 * auto-completed values are inaccessible from JavaScript, resulting in an empty state
 * while texts are auto-filled, which may for example overlaps with custom labels or placeholders.
 *
 * It will set target input field to transparent before any user interaction,
 * and reveal the input field once user has interacted. It is a no-op for new input fields
 * mounted after user has interacted.
 */
export default function useTextInputAutofillFix(): TextInputAutofillFix;
