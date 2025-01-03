import { ZetaEventContainer } from "zeta-dom/events";
import { defineGetterProperty, each, extend, isFunction, noop } from "zeta-dom/util";

const emitter = new ZetaEventContainer();
const console = process.env.NODE_ENV === 'development' ? window.console : { log: noop };

function shouldMock() {
    if (import.meta.env) {
        return import.meta.env.VITE_MOCK === 'true';
    }
    try {
        const env = process.env;
        return env.REACT_APP_MOCK === 'true' || env.MOCK === 'true';
    } catch { }
}

function createMock(mock, implementation) {
    return isFunction(mock) ? mock(implementation) : mock;
}

export default function createApi(options) {
    const implementation = options.implementation;
    const target = (shouldMock() && createMock(options.mock, implementation)) || implementation;
    const api = {};
    each(implementation, function (i, fn) {
        if (isFunction(fn)) {
            fn = isFunction(target[i]) || fn;
            api[i] = function callee(...args) {
                console.log('[API]', i, ...args);
                const result = fn.apply(target, args);
                Promise.resolve(result).then(function (v) {
                    console.log('[API] >>', i, v);
                }, function (e) {
                    console.log('[API] >>', i, e);
                    emitter.emit('error', api, { error: e, callee, arguments: args });
                });
                return result;
            };
        } else {
            defineGetterProperty(api, i, function () {
                return target[i]
            }, function (v) {
                target[i] = v;
            });
        }
    });
    return extend(api, {
        on(event, handler) {
            return emitter.add(api, event, handler);
        }
    });
}
