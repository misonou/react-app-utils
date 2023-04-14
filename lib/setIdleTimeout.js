import { bind } from "zeta-dom/domUtil";
import { combineFn, extend, setIntervalSafe } from "zeta-dom/util";

const STORAGE_KEY = 'app.lastInteract';

function normalizeOptions(options) {
    if (typeof options === 'boolean') {
        options = {
            crossFrame: options
        };
    }
    return extend({}, options);
}

export default function setIdleTimeout(ms, callback, options) {
    options = normalizeOptions(options);
    var lastInteract = Date.now();
    var unbind = combineFn(
        bind(window, 'keydown mousedown touchstart wheel', function () {
            lastInteract = Date.now();
            if (options.crossFrame) {
                localStorage[STORAGE_KEY] = lastInteract;
            }
        }),
        setIntervalSafe(function () {
            if (options.crossFrame) {
                lastInteract = +localStorage[STORAGE_KEY] || lastInteract;
            }
            if (Date.now() - lastInteract > ms) {
                unbind();
                callback();
            }
        }, 10000)
    );
    return unbind;
}
