import { ZetaEventContainer } from "zeta-dom/events";
import { each, extend, noop } from "zeta-dom/util";

const emitter = new ZetaEventContainer();
const log = process.env.NODE_ENV === 'development' ? console.log.bind(console) : noop;

export default function createApi(options) {
    const api = extend({}, options.implementation);
    if (process.env.REACT_APP_MOCK === 'true' || process.env.MOCK === 'true') {
        extend(api, options.mock);
    }
    each(api, function (i, fn) {
        api[i] = function (...args) {
            log('[API]', i, ...args);
            const result = fn.apply(api, args);
            Promise.resolve(result).then(function (v) {
                log('[API] >>', i, v);
            }, function (e) {
                emitter.emit('error', api, { error: e });
            });
            return result;
        };
    });
    return extend(api, {
        on(event, handler) {
            return emitter.add(api, event, handler);
        }
    });
}
