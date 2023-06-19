import { bind } from "zeta-dom/domUtil";
import { combineFn, setIntervalSafe } from "zeta-dom/util";

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
