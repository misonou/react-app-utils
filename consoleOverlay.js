import $ from "jquery";
import { IS_TOUCH } from "zeta-dom/env";
import dom from "zeta-dom/dom";
import { bind, getRect } from "zeta-dom/domUtil";
import { each } from "zeta-dom/util";
import { position } from "@misonou/react-css-utils";
import HTMLConsole from "./lib/HTMLConsole.js";

const resizeIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADFJREFUeNpi/P//PwM2wMjI6MsAkkTHQOALpnFJYEiiSADZOCXgOrFJwByKS8IXIMAAks1jQcRi9aQAAAAASUVORK5CYII=';
const overlayHTML = '<div style="position:fixed;width:100vw;height:30vh;box-sizing:border-box;border:1px solid #0001;background:white;font:400 12px / 1.5 Menlo,Consolas,SF Mono,Courier New,monospace;word-wrap:break-word;white-space:pre-wrap;z-index:100000;-webkit-text-size-adjust:none;opacity:0.9;"><div style="padding:5px;padding-left:10px;box-sizing:border-box;width:100%;height:100%;overflow:scroll;"><div style="transform-origin:0 0"></div></div><div style="position:absolute;right:0;bottom:0;width:7px;height:7px;pointer-events:none;background:url(' + resizeIcon + ')"></div></div>';

function minmax(v, min, max) {
    return Math.max(min, Math.min(v, max));
}

function initConsoleOverlay() {
    var div = $(overlayHTML)[0];
    var wrapper = div.firstChild;
    var htmlConsole = new HTMLConsole(wrapper.firstChild);

    each('log warn error clear', function (k, i) {
        var originalLog = console[i];
        console[i] = function () {
            originalLog.apply(console, arguments);
            try {
                htmlConsole[i].apply(htmlConsole, arguments);
            } catch { }
        };
    });

    dom.on(div, 'touchstart', function (e) {
        var rect = getRect(div);
        if (e.clientX - rect.left < 10) {
            var winRect = getRect();
            return dom.beginDrag(function (x, y, dx, dy) {
                div.style.left = minmax(rect.left + dx, 0, winRect.width - rect.width) + 'px';
                div.style.top = minmax(rect.top + dy, 0, winRect.height - rect.height) + 'px';
            });
        }
        if (rect.right - e.clientX < 30 && rect.bottom - e.clientY < 30) {
            return dom.beginDrag(function (x, y, dx, dy) {
                div.style.left = rect.left + 'px';
                div.style.top = rect.top + 'px';
                div.style.width = (rect.width + dx) + 'px';
                div.style.height = (rect.height + dy) + 'px';
            });
        }
    });
    dom.on(div, 'pinchZoom', function (e) {
        var content = htmlConsole.element;
        var initialScale = new DOMMatrix(getComputedStyle(content).transform).a;
        return dom.beginPinchZoom(function (deg, scale) {
            scale = Math.max(0.75, initialScale * scale);
            content.style.transform = 'scale(' + scale + ')';
            content.style.width = (100 / scale) + '%';
        });
    });
    dom.on('modalchange', function () {
        if (!dom.focusable(div)) {
            dom.retainFocus(dom.modalElement, div);
        }
    });
    bind(htmlConsole.element, 'console:append', () => {
        wrapper.scrollTop = wrapper.scrollHeight - wrapper.offsetHeight;
    });

    document.body.appendChild(div);
    position(div, dom.root, 'left bottom inset');
}

if (IS_TOUCH) {
    initConsoleOverlay();
}
