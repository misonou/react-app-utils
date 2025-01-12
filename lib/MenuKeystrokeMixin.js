import { position } from "@misonou/react-css-utils";
import { StatefulMixin, useMixin } from "brew-js-react";
import dom, { focus, retainFocus, textInputAllowed } from "zeta-dom/dom";
import { removeNode, scrollIntoView, selectIncludeSelf, setClass } from "zeta-dom/domUtil";
import { IS_IOS, IS_TOUCH } from "zeta-dom/env";
import { extend, makeArray, setTimeoutOnce } from "zeta-dom/util";

const showKeyboardOnFocus = !IS_TOUCH || IS_IOS || 'virtualKeyboardPolicy' in dom.root;
const currentElement = new WeakMap();
const collator = new Intl.Collator(undefined, {
    usage: 'search',
    sensitivity: 'base'
});

var currentInput;

function createDelegatedInput(container, onChange) {
    const input = document.createElement('input');
    input.virtualKeyboardPolicy = 'manual';
    extend(input.style, {
        position: 'fixed',
        width: '30px',
        opacity: 0
    });
    position(input, container, 'right top inset-y');
    retainFocus(container, input);
    focus(input);

    const clearInput = function () {
        input.value = '';
    };
    const unbind = dom.on(input, {
        input: function () {
            onChange(input.value);
            setTimeoutOnce(clearInput, 200);
        },
        focusout: function () {
            removeNode(input);
            unbind();
            currentInput = undefined;
        }
    });
    currentInput = input;
}

function selectElement(element) {
    var input = selectIncludeSelf('button,label,a', element)[0] || element;
    input.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
}

function initMenuKeystroke(container, options) {
    function moveNext(next) {
        var activeClass = options.activeClass || 'active';
        var prev = currentElement.get(container);
        if (prev !== next) {
            if (prev) {
                setClass(prev, activeClass, false);
            }
            currentElement.set(container, next);
            setClass(next, activeClass, true);
            scrollIntoView(next);
            if (options.autoSelect) {
                selectElement(next);
            }
            return true;
        }
    }

    function handleEvent(e) {
        const all = makeArray(container.querySelectorAll(options.selector));
        const index = all.indexOf(currentElement.get(container) || container.querySelector('.' + (options.selectedClass || 'selected')));
        const isTextInput = textInputAllowed(document.activeElement);
        switch (e.data) {
            case 'downArrow':
                return all[0] && moveNext(all[index + 1] || all[0]);
            case 'upArrow':
                return all[0] && moveNext(all[index - 1] || all[all.length - 1]);
            case 'space':
                if (isTextInput) {
                    return;
                }
            case 'enter':
                return all[index] && selectElement(all[index]);
        }
        if ((!e.data || e.data.length === 1) && showKeyboardOnFocus && !isTextInput && !currentInput) {
            createDelegatedInput(container, function (text) {
                const index = all.indexOf(currentElement.get(container)) + (text.length > 1 ? 0 : 1);
                const predicate = (v) => {
                    return collator.compare(text, v.textContent.slice(0, text.length)) === 0;
                };
                const next = all.slice(index).find(predicate) || all.slice(0, index).find(predicate);
                return next && moveNext(next);
            });
        }
    }

    return dom.on(container, {
        keystroke: handleEvent,
        focusin: handleEvent,
        focusout: function () {
            currentElement.delete(container);
        }
    });
}

export function useMenuKeystrokeMixin(options, autoSelect) {
    return useMixin(MenuKeystrokeMixin).withOptions(options, autoSelect);
}

export class MenuKeystrokeMixin extends StatefulMixin {
    withOptions(options, autoSelect) {
        if (typeof options === 'string') {
            options = {
                selector: options,
                autoSelect: autoSelect
            };
        }
        this.options = options;
        return this;
    }

    initElement(element, state) {
        const dispose = initMenuKeystroke(element, this.options);
        if (state.onDispose) {
            state.onDispose(dispose);
        } else {
            this.onDispose(dispose);
        }
    }
}
