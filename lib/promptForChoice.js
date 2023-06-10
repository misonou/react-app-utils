import { position } from "@misonou/react-css-utils";
import $ from "jquery";
import waterpipe from "waterpipe";
import dom, { focusable } from "zeta-dom/dom";
import { bind, removeNode } from "zeta-dom/domUtil";
import createAsyncQueue from "./util/createAsyncQueue.js";

var queue = createAsyncQueue();
var select, resolveIndex;

export default async function promptForChoice(label, choices, options) {
    var value = Object.values(choices)[0];
    options = options || {};
    if (!options.metaKey || dom.metaKey === options.metaKey) {
        var activeElement = dom.activeElement || dom.root;
        value = await queue(function () {
            return new Promise(function (resolve) {
                select = $(waterpipe(`
                <select style="font-size:24px;z-index:10000;min-height:1.5em;">
                    <option>Select result for {{label}}</option>
                    {{foreach choices}}
                        <option>{{#key}}</option>
                    {{/foreach}}
                    {{if options.unknownError}}
                        <option>Unknown error</option>
                    {{/if}}
                </select>`, { label, choices, options }))[0];
                resolveIndex = function (index) {
                    resolve(Object.values(choices).concat(new Error('Unknown error'))[index - 1]);
                    removeNode(select);
                    select = null;
                    resolve = null;
                };
                bind(select, 'change', function () {
                    resolveIndex(select.selectedIndex);
                });
                if (!focusable(activeElement)) {
                    activeElement = dom.activeElement;
                }
                position(select, activeElement, 'left top');
                dom.retainFocus(activeElement, select);
                dom.focus(select);
            });
        });
    }
    if (value instanceof Error) {
        throw value;
    }
    return value;
}

dom.on('escape', function (e) {
    if (select) {
        resolveIndex(1);
        e.handled();
    }
});

dom.on('modalchange', function () {
    if (select && !dom.focusable(select)) {
        dom.retainFocus(dom.modalElement, select);
        dom.focus(select);
    }
});
