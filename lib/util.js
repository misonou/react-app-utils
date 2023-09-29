import { bind } from "zeta-dom/domUtil";
import { combineFn, errorWithCode, isFunction, makeAsync, noop, reject, resolve, setIntervalSafe } from "zeta-dom/util";
import { cancelLock, lock, locked, notifyAsync, preventLeave } from "zeta-dom/domLock";

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
    if (!isFunction(callback)) {
        return noop;
    }
    return function (event) {
        var element = event.currentTarget;
        if (!callback) {
            return resolve();
        }
        options = options || {};
        if (locked(element)) {
            if (options.lock) {
                return reject(errorWithCode('zeta/action-blocked'));
            }
            cancelLock(element, true);
        }
        var controller = AbortController ? new AbortController() : { abort: noop };
        var promise = makeAsync(callback).call(this, event, controller.signal);
        notifyAsync(element, promise, function () {
            controller.abort(errorWithCode('zeta/cancelled'));
        });
        lock(element, promise, true);
        if (options.preventLeave) {
            preventLeave(promise);
        }
        return promise;
    };
}
