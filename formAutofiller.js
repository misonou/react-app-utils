import dom from "zeta-dom/dom";
import { each, isArray, isPlainObject, resolve } from "zeta-dom/util";
import { FormContext } from "zeta-dom-react";
import promptForChoice from "./lib/promptForChoice.js";

/**
 * @param {FormContext} form
 * @param {any} data
 * @param {string} prefix
 */
function fillData(form, data, prefix) {
    var updated = false;
    each(data, function (i, v) {
        var path = prefix ? prefix + '.' + i : i + '';
        if (isPlainObject(v) || isArray(v)) {
            updated = fillData(form, v, path) || updated;
        } else if (form.element(path)) {
            var prev = form.getValue(path);
            if (prev !== v) {
                form.setValue(path, v);
                updated = updated || form.getValue(path) !== prev;
            }
        }
    });
    return updated;
}

/**
 * @param {FormContext} form
 */
async function promptAutofill(form) {
    var data = await dom.emit('requestAutofillPrompt', form.element());
    if (data && data.__esModule) {
        data = data.default;
    }
    data = data && await promptForChoice('autofill', {
        '(No autofill)': null,
        ...data
    });
    if (data) {
        var count = 0;
        console.log('[Autofill]', data);
        while (fillData(form, data, '') && ++count < 10) {
            await resolve();
            await resolve();
        }
    }
}

dom.on('ctrlClick', function (e) {
    var form = e.target.closest('form');
    var context = form && FormContext.get(form);
    return context && promptAutofill(context);
});
