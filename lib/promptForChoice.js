import { position } from "@misonou/react-css-utils";
import $ from "jquery";
import waterpipe from "waterpipe";
import dom from "zeta-dom/dom";
import { bind, removeNode } from "zeta-dom/domUtil";
import createAsyncQueue from "./util/createAsyncQueue.js";

const queue = createAsyncQueue();

export default async function promptForChoice(label, choices, options) {
    var value = Object.values(choices)[0];
    options = options || {};
    if (!options.metaKey || dom.metaKey === options.metaKey) {
        const activeElement = dom.activeElement || dom.root;
        value = await queue(function () {
            return new Promise(function (resolve) {
                const select = $(waterpipe(`
                <select style="font-size:24px;z-index:10000;min-height:1.5em;">
                    <option>Select result for {{label}}</option>
                    {{foreach choices}}
                        <option>{{#key}}</option>
                    {{/foreach}}
                    {{if options.unknownError}}
                        <option>Unknown error</option>
                    {{/if}}
                </select>`, { label, choices, options }))[0];
                bind(select, 'change', function () {
                    resolve(Object.values(choices).concat(new Error('Unknown error'))[select.selectedIndex - 1]);
                    select.selectedIndex = 0;
                    removeNode(select);
                });
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