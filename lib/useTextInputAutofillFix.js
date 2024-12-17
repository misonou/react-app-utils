import { useLayoutEffect, useRef } from "react";
import { bindOnce } from "zeta-dom/domUtil";
import { makeArray, setAdd } from "zeta-dom/util";

var dimmedInput = new Set();
var userActivation = navigator.userActivation && navigator.userActivation.hasBeenActive;

bindOnce(window, 'touchstart mousedown keydown', function () {
    userActivation = true;
    makeArray(dimmedInput).forEach(resetInput);
});

function resetInput(input) {
    if (dimmedInput.delete(input)) {
        input.style.opacity = '';
    }
}

export default function useTextInputAutofillFix() {
    var inputRef = useRef(null);
    useLayoutEffect(function () {
        var input = inputRef.current;
        if (!userActivation && input) {
            if (input.value) {
                resetInput(input);
            } else if (setAdd(dimmedInput, input)) {
                bindOnce(input, 'change', function () {
                    resetInput(input);
                });
                input.style.opacity = '0';
            }
        }
    });
    return {
        inputRef,
        requireFakeInput: !userActivation && (!inputRef.current || !inputRef.current.value)
    };
}
