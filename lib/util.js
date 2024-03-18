import { bind } from "zeta-dom/domUtil";
import { combineFn, errorWithCode, isFunction, noop, reject, setIntervalSafe } from "zeta-dom/util";
import { cancelLock, lock, locked, preventLeave, runAsync } from "zeta-dom/domLock";

export { openDeferredURL as openDeferredLink } from "brew-js/util";

const AbortController = window.AbortController;

export function setIdleTimeout(ms, callback, options) {
    options = options || {};
    if (typeof options === 'boolean') {
        options = {
            crossFrame: options
        };
    }
    var key = 'app.lastInteract';
    var lastInteract = Date.now();
    var unbind = combineFn(
        bind(window, 'keydown mousedown touchstart wheel', function () {
            lastInteract = Date.now();
            if (options.crossFrame) {
                localStorage[key] = lastInteract;
            }
        }),
        setIntervalSafe(function () {
            if (options.crossFrame) {
                lastInteract = +localStorage[key] || lastInteract;
            }
            if (Date.now() - lastInteract > ms) {
                unbind();
                callback();
            }
        }, 10000)
    );
    return unbind;
}

export function createAsyncQueue() {
    let lastPromise;
    return async function (promise) {
        while (lastPromise) {
            let current = lastPromise;
            await current;
            // check if this invocation is the first being queued on the promise
            // to ensure each run is in sequence
            if (lastPromise === current) {
                break;
            }
        }
        lastPromise = promise();
        return lastPromise;
    };
}

export function handleUserAction(callback, options) {
    options = options || {};
    if (!isFunction(callback)) {
        return noop;
    }
    return function (event) {
        var self = this;
        var element = event.currentTarget;
        if (locked(element)) {
            if (options.lock) {
                return reject(errorWithCode('zeta/action-blocked'));
            }
            cancelLock(element, true);
        }
        var promise = runAsync(element, function (context) {
            return callback.call(self, event, AbortController && context.signal);
        });
        lock(element, promise, true);
        if (options.preventLeave) {
            preventLeave(promise);
        }
        return promise;
    };
}
