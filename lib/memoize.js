import { createPrivateStore, define, each, isFunction, isThenable, keys } from "zeta-dom/util";

const _ = createPrivateStore();

function getKey(args) {
    if (!args || !args.length) {
        return '[]';
    }
    if (args.length === 1) {
        var value = args[0];
        if (typeof value === 'string') {
            return '#' + value;
        }
        if (!value || typeof value !== 'object') {
            return value;
        }
    }
    return JSON.stringify(args);
}

function wrap(fn) {
    var values = new Map();
    var wrapper = function () {
        var args = [].slice.call(arguments);
        var key = getKey(args);
        if (!values.has(key)) {
            var value = fn.apply(this, args);
            if (isThenable(value)) {
                value.then(null, function () {
                    values.delete(key);
                });
            }
            values.set(key, value);
        }
        return values.get(key);
    };
    _(wrapper, values);
    return wrapper;
}

export default function memoize(obj, props) {
    if (isFunction(obj) && !props) {
        return wrap(obj);
    }
    var wrapped = {};
    each(props || keys(obj), function (i, v) {
        wrapped[v] = wrap(obj[v].bind(obj));
    });
    return wrapped;
}

define(memoize, {
    has: function (fn, args) {
        return _(fn).has(getKey(args));
    },
    put: function (fn, args, value) {
        _(fn).set(getKey(args), value);
    },
    delete: function (fn, args) {
        _(fn).delete(getKey(args));
    },
    clear: function () {
        var args = [].slice.call(arguments);
        each(_(args[0]) ? args : args[0], function (i, v) {
            _(v).clear();
        });
    }
});
