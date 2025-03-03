import { StatefulMixin, useMixin } from "brew-js-react";
import { useState } from "react";
import { useValueTrigger } from "zeta-dom-react";
import dom from "zeta-dom/dom";
import { bind } from "zeta-dom/domUtil";
import { ZetaEventContainer } from "zeta-dom/events";
import { combineFn, extend, isFunction, isUndefinedOrNull, sameValue, throwNotFunction } from "zeta-dom/util";

const emitter = /*#__PURE__*/ new ZetaEventContainer();

function getInputState(element) {
    return {
        value: element.value,
        selectionStart: element.selectionStart,
        selectionEnd: element.selectionEnd
    };
}

function createUndoable(initialValue, debounce, callback) {
    var snapshots = [initialValue];
    var index = 0;
    var debouncing = false;
    return {
        get canUndo() {
            return index > 0;
        },
        get canRedo() {
            return index < snapshots.length - 1;
        },
        get value() {
            return snapshots[index];
        },
        undo: function () {
            index = Math.max(0, index - 1);
            callback(snapshots[index]);
        },
        redo: function () {
            index = Math.min(snapshots.length, index + 1);
            callback(snapshots[index]);
        },
        reset: function (value) {
            snapshots.splice(0, snapshots.length, isUndefinedOrNull(value) ? initialValue : value);
            index = 0;
            callback(snapshots[index]);
        },
        pushState: function (value) {
            value = isFunction(value) ? value(snapshots[index]) : value;
            if (!sameValue(value, snapshots[index])) {
                index = debouncing ? index : index + 1;
                snapshots.splice(index, snapshots.length, value);
                callback(snapshots[index]);
                if (debounce && !debouncing) {
                    debouncing = true;
                    setTimeout(function () {
                        debouncing = false;
                    }, debounce);
                }
            }
        }
    };
}

export function useUndoableState(initialState, debounce) {
    const undoable = useState(function () {
        var initialValue = isFunction(initialState) ? initialState() : initialState;
        return createUndoable(initialValue, debounce, function (value) {
            notifyChanges(value);
        });
    })[0];
    const notifyChanges = useValueTrigger(undoable.value);
    return [undoable.value, undoable.pushState, undoable];
}

export function useUndoableInputMixin(initialValue, debounce) {
    return useMixin(UndoableInputMixin).withOptions({ initialValue, debounce });
}

export class UndoableInputMixin extends StatefulMixin {
    withOptions(options) {
        return extend(this, options);
    }

    initElement(element, state) {
        var self = this;
        if (self.initialValue !== undefined) {
            element.value = self.initialValue;
        }
        var undoable = createUndoable(getInputState(element), self.debounce, function (state) {
            element.value = state.value;
            element.setSelectionRange(state.selectionStart, state.selectionEnd);
            emitter.emit('change', self, { element });
        });
        state.onDispose(combineFn(
            bind(element, 'input', function () {
                undoable.pushState(getInputState(element))
            }),
            bind(element, 'selectionchange', function () {
                extend(undoable.value, getInputState(element));
            }),
            dom.on('undo', function (e) {
                undoable.undo();
                e.handled();
            }),
            dom.on('redo', function (e) {
                undoable.redo();
                e.handled();
            })
        ));
    }

    onChange(callback) {
        throwNotFunction(callback);
        return emitter.add(this, 'change', function (e) {
            var element = e.element;
            callback.call(element, element.value, element);
        });
    }
}
