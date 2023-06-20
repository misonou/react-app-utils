import $ from "jquery";

const ARROW_CHAR = '\u25B6';
const ARROW = '<span style="position:absolute;color:#808080;width:15px;height:15px;left:0;font-size:90%;text-align:center;cursor:pointer;">' + ARROW_CHAR + '</span>';
const ARROW_HIDDEN = ARROW.replace('">', 'visibility:hidden;">');

const COLOR_DEFAULT = 'var(--console-color-default, black)';
const COLOR_NULL = 'var(--console-color-null, #808080)';
const COLOR_UNDEFINED = 'var(--console-color-undef, #808080)';
const COLOR_BOOL = 'var(--console-color-bool, #1c00cf)';
const COLOR_NUMBER = 'var(--console-color-number, #1c00cf)';
const COLOR_STRING = 'var(--console-color-string, #c51916)';
const COLOR_REGEXP = 'var(--console-color-regexp, #c51916)';
const COLOR_SYMBOL = 'var(--console-color-symbol, #c51916)';
const COLOR_BIGINT = 'var(--console-color-bigint, #008000)';
const COLOR_PROPERTY = 'var(--console-color-property, #ab0d90)';
const COLOR_PROPERTY_INLINE = 'var(--console-color-property-inline, #515151)';
const COLOR_INTERNAL = 'var(--console-color-internal, #808080)';
const COLOR_KEYWORD = 'var(--console-color-keyword, #1c00cf)';
const COLOR_ELEMENT = 'var(--console-color-element, #8e004b)';
const COLOR_PSEUDO_ELM = 'var(--console-color-pseudoelm, #0b57d0)';
const COLOR_DOCTYPE = 'var(--console-color-doctype, #8f8f8f)';
const COLOR_NODENAME = 'var(--console-color-nodename, #8e004b)';
const COLOR_ATTRNAME = 'var(--console-color-attrname, #9f4312)';
const COLOR_ATTRVAL = 'var(--console-color-attrval, #0842a0)';
const COLOR_COMMENT = 'var(--console-color-comment, #008000)';

const ESCAPE_CHAR = {};
const VOID_TAG = {};
'area base br col command embed hr img input keygen link meta param source track wbr'.split(' ').forEach(function (v) {
    VOID_TAG[v] = true;
});
for (var i = 0; i <= 0x1f; i++) {
    ESCAPE_CHAR[String.fromCharCode(i)] = '\\x' + ('0' + i).slice(-2);
}
Object.assign(ESCAPE_CHAR, {
    '\b': "\\b",
    '\t': "\\t",
    '\n': "\\n",
    '\v': "\\v",
    '\f': "\\f",
    '\r': "\\r",
    '"': "\\\"",
    '\'': "\\'",
    '\\': "\\\\"
});

const lines = [];
const objectProto = Object.prototype;
const collator = new Intl.Collator('en-US', { caseFirst: 'upper' });

function sortPropertyName(a, b) {
    var len = Math.min(a.length, b.length);
    return collator.compare(a.slice(0, len), b.slice(0, len)) || (a.length - b.length);
}

function escapeString(str) {
    return str.replace(/[\b\t\n\v\f\r"'\\\u0000-\u001f]/g, function (v) {
        return ESCAPE_CHAR[v];
    });
}

function isArrayLike(obj, thisWin) {
    return Array.isArray(obj) || obj instanceof thisWin.NodeList || obj instanceof thisWin.HTMLCollection || obj instanceof thisWin.DOMTokenList || obj instanceof thisWin.NamedNodeMap;
}

function isExpandableNode(node) {
    return node.textContent.indexOf(ARROW_CHAR) === 0;
}

function getStringTag(obj) {
    return /\[object (.+)\]/.test(objectProto.toString.call(obj)) ? RegExp.$1 : '';
}

function getObjectTag(obj, thisWin, mode) {
    var proto = Object.getPrototypeOf(obj);
    var arrayProto = thisWin.Array.prototype;
    if (proto === arrayProto) {
        if (mode === 'literal') {
            return obj.length ? '(' + obj.length + ')' : '';
        }
        if (mode === 'propValue') {
            return '';
        }
    }
    var tag = obj[Symbol.toStringTag] || '';
    if (!tag) {
        if (obj === arrayProto || proto === arrayProto) {
            tag = 'Array';
        } else if (proto && proto !== thisWin.Object.prototype && typeof proto.constructor === 'function') {
            if (objectProto.hasOwnProperty.call(proto.constructor, 'name')) {
                tag = proto.constructor.name;
            } else {
                tag = /^\s*function\s([^(]*)|\[object ([^\]]+)\]/.test(proto.constructor.toString()) ? RegExp.$1 || RegExp.$2 : '';
            }
        }
    }
    if (isArrayLike(obj, thisWin)) {
        tag += '(' + obj.length + ')';
    } else if (obj instanceof Map || obj instanceof Set) {
        tag += '(' + obj.size + ')';
    }
    return tag;
}

function hasPseudoElement(element, pseudo) {
    var style = getComputedStyle(element, pseudo);
    return style.display !== 'none' && style.content !== 'none';
}

/**
 * @param {Element | DocumentFragment} node
 */
function append(node) {
    for (var i = 1, len = arguments.length; i < len; i++) {
        var v = arguments[i];
        node.appendChild(typeof v === 'string' ? document.createTextNode(v) : v);
    }
    return node;
}

/**
 * @param {string} name
 * @param {string=} style
 * @param {string=} className
 */
function createElement(name, style, className) {
    var node = document.createElement(name);
    if (className) {
        node.setAttribute('class', className);
    }
    if (style) {
        node.setAttribute('style', style);
    }
    return node;
}

function createFragment() {
    return document.createDocumentFragment();
}

function newLine(className) {
    return createElement('span', 'position:relative;display:block', className);
}

function newBlock(className) {
    return createElement('span', 'position:relative;display:inline-block', className);
}

function appendHiddenArrow(container) {
    container.style.paddingLeft = '15px';
    append(container, $(ARROW_HIDDEN)[0]);
}

/**
 * @param {string} str
 * @param {string} color
 * @param {string} type
 */
function colorize(str, color, type) {
    var span = createElement('span', 'color:' + (color || COLOR_DEFAULT), 'token ' + (type || 'misc'));
    span.textContent = String(str);
    return span;
}

function createFakeEntry(owner, name, value, order, orderName, hidden) {
    return {
        fake: true,
        owner: owner,
        name: name,
        order: order,
        orderName: orderName || name,
        desc: {
            enumerable: !hidden,
            value: value
        }
    };
}

function listProperties(obj, thisWin, sort) {
    var arrayLike = isArrayLike(obj, thisWin);
    var visitedProps = Object.create(null);
    var entries = [];

    function createEntry(cur, i) {
        var desc = Object.getOwnPropertyDescriptor(cur, i);
        if (!desc || visitedProps[i] || (i === '__proto__' && cur !== obj)) {
            return;
        }
        var isStringKey = typeof i === 'string';
        var order = (
            (isStringKey && i[0] === '_' ? 4 : 0) |
            (!isStringKey ? 8 : 0) |
            (cur !== obj ? 16 : 0) |
            (!desc.enumerable ? 32 : 0)
        );
        var key = String(i);
        if (desc.get || cur === obj) {
            var isIndex = arrayLike && isStringKey && !isNaN(parseInt(i));
            entries.push({
                owner: cur,
                name: i,
                desc: desc,
                order: isIndex ? -1 : order,
                orderName: isIndex ? parseInt(i) : key
            });
        }
        // list getter and setter defined on current object
        if (cur === obj) {
            if (desc.get) {
                entries.push(createFakeEntry(obj, 'get ' + key, desc.get, order | 64, key + ' get', true));
            }
            if (desc.set) {
                entries.push(createFakeEntry(obj, 'set ' + key, desc.set, order | 64, key + ' set', true));
            }
        }
        visitedProps[i] = true;
    }

    // list all own properties as well as getter properties from prototype
    for (var cur = obj; cur; cur = Object.getPrototypeOf(cur)) {
        Object.getOwnPropertyNames(cur).forEach(function (i) {
            createEntry(cur, i);
        });
        Object.getOwnPropertySymbols(cur).forEach(function (i) {
            createEntry(cur, i);
        });
    }
    if (sort) {
        entries.sort(function (a, b) {
            return (a.order - b.order) || (a.order < 0 ? a.orderName - b.orderName : sortPropertyName(a.orderName, b.orderName));
        });
    }
    return entries;
}

function createExpandableNode(content, obj, thisArg, contentWhenExpand, mode) {
    var span = createElement('span', 'position:relative;display:inline-block;vertical-align:top;padding-left:15px', 'expandable');
    var arrow = $(ARROW)[0];
    var preview = createElement('span', 'cursor:pointer', 'expandable-preview');
    var detailView;

    append(span, arrow, preview);
    append(preview, content);
    if (contentWhenExpand) {
        contentWhenExpand.style.display = 'none';
        append(preview, contentWhenExpand);
    }
    $(span).on('click', function (e) {
        e.stopPropagation();
        if (!detailView) {
            detailView = createElement('span', 'position:relative;display:none', 'expandable-content');
            append(span, detailView);
            writeObject(detailView, obj, mode || 'propList', thisArg || obj);
        }
        if (detailView.style.display === 'none') {
            detailView.style.display = 'block';
            arrow.style.transform = 'rotate(90deg)';
            if (contentWhenExpand) {
                content.style.display = 'none';
                contentWhenExpand.style.display = '';
            }
        } else if (!detailView.contains(e.target)) {
            detailView.style.display = 'none';
            arrow.style.transform = 'none';
            if (contentWhenExpand) {
                content.style.display = '';
                contentWhenExpand.style.display = 'none';
            }
        }
    });
    return span;
}

function renderProperty(obj, prop) {
    try {
        return render(obj[prop], 'propValue');
    } catch (e) {
        return render('[Exception: ' + e.message + ']', 'literal');
    }
}

/**
 * @param {any} obj
 * @param {'collapsed' | 'literal' | 'propValue' | 'propList' | 'childNodes'} mode
 * @param {any=} thisArg
 */
function render(obj, mode, thisArg) {
    if (arguments.length < 3) {
        thisArg = obj;
    }

    // standard JavaScript objects
    if (obj === null) {
        return colorize(obj, COLOR_NULL, 'null');
    }
    switch (typeof obj) {
        case 'undefined':
            return colorize('' + obj, COLOR_UNDEFINED, 'undefined');
        case 'boolean':
            return colorize('' + obj, COLOR_BOOL, 'boolean');
        case 'symbol':
            return colorize(obj.toString(), COLOR_SYMBOL, 'symbol');
        case 'bigint':
            return colorize(obj + 'n', COLOR_BIGINT, 'bigint');
        case 'string':
            if (mode === 'collapsed' || mode === 'propValue') {
                if (obj.length > 100) {
                    obj = obj.slice(0, 100) + "…";
                }
                return colorize('"' + escapeString(obj) + '"', COLOR_STRING, 'string');
            }
            return colorize(obj || '\u200b', 'inherit', 'string');
        case 'number':
            if (obj === 0 && 1 / obj < 0) {
                // sign does not reflect in toString()
                obj = '-0';
            }
            return colorize(obj, COLOR_NUMBER, 'number');
        case 'function':
            if (mode === 'propList') {
                break;
            }
            var source = obj.toString().replace(/^\s*(function|class)\s|\s+$/g, '');
            var funcSym = RegExp.$1 === 'class' ? 'class' : 'ƒ';
            var funcBlock = createElement('span', 'font-style:italic', 'func-block');
            if (mode === 'propValue') {
                append(funcBlock, colorize(funcSym, COLOR_KEYWORD, 'keyword'), ' ', funcSym === 'class' ? source.slice(0, source.indexOf('{') - 1) : source.slice(0, source.indexOf(')') + 1));
                return createExpandableNode(funcBlock, obj, thisArg);
            }
            if (mode === 'literal') {
                return append(funcBlock, colorize(funcSym, COLOR_KEYWORD, 'keyword'), ' ', source);
            }
            return append(funcBlock, 'ƒ');
    }

    // get the current Window object in case object beings to cross-frame
    var stringTag = getStringTag(obj);
    var thisWin = window;
    var domClass;
    try {
        var defaultView = (obj.ownerDocument || obj).defaultView;
        if (defaultView && getStringTag(defaultView) === 'Window') {
            thisWin = defaultView;
        }
        domClass = stringTag !== 'Object' && stringTag !== 'Function' && thisWin[stringTag.replace(/Prototype$/, '')];
    } catch { }

    // helper promise to extract current promise state
    var promise = obj instanceof Promise && new Promise(function (resolve) {
        obj.then(function (v) {
            resolve(['fulfilled', v]);
        }, function (v) {
            resolve(['rejected', v]);
        });
        Promise.resolve().then(function () {
            resolve(['pending', undefined]);
        });
    });

    // render expanded property list
    if (mode === 'propList') {
        var line = newBlock('prop-list');
        var entries = listProperties(obj, thisWin, true);
        var proto = Object.getPrototypeOf(obj);
        if (proto) {
            entries.push(createFakeEntry(obj, '[[Prototype]]', proto, 128));
        }
        if (obj instanceof Map) {
            var arr = [];
            obj.forEach(function (v, i) {
                var obj = Object.create(null);
                obj.key = i;
                obj.value = v;
                arr.push(obj);
            });
            entries.push(createFakeEntry(obj, '[[Entries]]', arr, 256));
        } else if (obj instanceof Set) {
            var arr = [];
            obj.forEach(function (v, i) {
                arr.push(v);
            });
            entries.push(createFakeEntry(obj, '[[Entries]]', arr, 256));
        } else if (promise) {
            entries.push(createFakeEntry(obj, '[[PromiseState]]', '', 256));
            entries.push(createFakeEntry(obj, '[[PromiseResult]]', '', 256));
        }
        entries.forEach(function (v) {
            var cur = newLine('prop');
            var value = v.desc.value;
            var detail;
            if (v.fake) {
                if (v.name === '[[Prototype]]') {
                    detail = createExpandableNode(colorize(getObjectTag(value, thisWin, 'propValue') || 'Object', COLOR_DEFAULT, 'tag'), value, thisArg);
                } else if (v.name === '[[PromiseState]]') {
                    detail = render(value, 'propValue');
                    promise.then(function (v) {
                        $(detail).replaceWith(render(v[0], 'propValue'));
                    });
                } else if (v.name === '[[PromiseResult]]') {
                    detail = render(value, 'propValue');
                    promise.then(function (v) {
                        $(detail).replaceWith(render(v[1], 'propValue'));
                    });
                }
            }
            if (!detail) {
                if ('value' in v.desc) {
                    detail = render(value, 'propValue');
                } else if (domClass && obj !== domClass.prototype) {
                    // resolve all properties for DOM nodes even though they are defined as getters
                    detail = renderProperty(thisArg, v.name);
                } else if (v.desc.get) {
                    detail = createElement('span', 'cursor:pointer');
                    append(detail, '(...)');
                    $(detail).on('click', function (e) {
                        var node = renderProperty(thisArg, v.name);
                        if (isExpandableNode(node) && isExpandableNode(this.parentNode)) {
                            // replace current horizontal entry with the new expandable node
                            $(this).parent().replaceWith(node);
                            // place the property name after arrow
                            $([this.previousElementSibling, this.previousSibling]).insertAfter(node.children[0]);
                            node.style.display = 'block';
                        } else {
                            // place (...) with the resolved value
                            $(this).replaceWith(node);
                        }
                        // prevent toggling parent entry
                        e.stopPropagation();
                    });
                }
            }
            var propName = v.fake && v.name.substr(0, 2) === '[[' ?
                colorize('span', COLOR_INTERNAL, 'internal') :
                createElement('span', 'color:' + COLOR_PROPERTY + ';' + (v.owner === obj ? 'font-weight:bold;' : '') + (v.desc.enumerable ? '' : 'opacity:0.5'), 'token property');
            propName.textContent = String(v.name);
            propName = append(createFragment(), propName, ': ');
            if (isExpandableNode(detail)) {
                $(detail).children().eq(1).prepend(propName);
                append(cur, detail);
            } else {
                appendHiddenArrow(cur);
                append(cur, propName, detail);
            }
            append(line, cur);
        });
        if (!line.childNodes[0]) {
            appendHiddenArrow(line);
            append(line, append(createElement('span', 'font-style:italic;color:' + COLOR_INTERNAL), 'No properties'));
        }
        return line;
    }

    // special representation for DOM nodes
    if (obj instanceof thisWin.Node && domClass && obj !== domClass.prototype) {
        return renderDOMNode(obj, mode);
    }

    // special representation for built-in object
    var protoName = getObjectTag(obj, thisWin, mode);
    var prefix;
    if (stringTag === 'Date') {
        prefix = colorize(obj.toString(), COLOR_DEFAULT, 'date');
    } else if (stringTag === 'RegExp') {
        prefix = colorize(obj.toString(), COLOR_REGEXP, 'regexp');
    } else if (stringTag.slice(-5) === 'Error') {
        var message = obj.toString();
        if (obj.stack.slice(0, message.length) === message) {
            message = obj.stack;
        } else {
            // handle firefox which has different content in stack
            message += '\r\n    ' + obj.stack.replace(/\n(.)/g, '\n    $1');
        }
        if (mode === 'collapsed' && message > 50) {
            message = message.substr(0, 50) + '…';
        }
        prefix = colorize(message, 'inherit', 'error');
    }
    if (mode === 'literal' && prefix) {
        return prefix;
    }
    if (mode === 'collapsed') {
        return prefix || colorize(protoName || '{…}', COLOR_DEFAULT, 'object');
    }

    // render collapsed property list
    var arrayLike = isArrayLike(obj, thisWin);
    var propList = createFragment();
    var forEach = function (arr, callback) {
        var stop, count = 0;
        arr.forEach(function (v, i) {
            if (stop) {
                return;
            }
            if (count++) {
                append(propList, ', ');
            }
            if (propList.textContent.length > 100) {
                append(propList, '…');
                stop = true;
                return;
            }
            callback(i, v);
        });
    };
    if (obj instanceof Set) {
        forEach(obj, function (v) {
            append(propList, render(v, 'collapsed'));
        });
    } else if (obj instanceof Map) {
        forEach(obj, function (i, v) {
            append(propList, render(i, 'collapsed'), ' => ', render(v, 'collapsed'));
        });
    } else {
        var entries = listProperties(obj, thisWin).filter(function (v) {
            // only show value properties for object and visible value properties for array-like object
            return (v.order <= 4 && 'value' in v.desc);
        });
        if (promise) {
            entries.unshift(createFakeEntry(obj, '[[PromiseState]]', 'pending', 256));
        }
        var innerMode = mode === 'literal' || mode === 'propValue' ? 'collapsed' : 'literal';
        var lastIndex = -1;
        forEach(entries, function (i, v) {
            var cur = v.order <= 0 || v.fake ? propList : $(createElement('span', 'opacity:0.5')).appendTo(propList)[0];
            if (v.fake && v.name === '[[PromiseState]]') {
                var placeholder = createElement('span');
                promise.then(function (v) {
                    var detail = createFragment();
                    append(detail, colorize('<' + v[0] + '>', COLOR_INTERNAL, 'internal'));
                    if (v[0] !== 'pending') {
                        append(detail, ': ', render(v[1], innerMode));
                    }
                    $(placeholder).replaceWith(detail);
                });
                append(cur, placeholder);
                return;
            }
            if (v.order >= 0) {
                append(cur, colorize(v.name, COLOR_PROPERTY_INLINE, 'property'), ': ');
            } else if (v.name - 1 > lastIndex) {
                append(propList, colorize('empty \u00d7 ' + (v.name - lastIndex - 1), COLOR_UNDEFINED, 'internal'), ', ');
            }
            lastIndex = v.name;
            append(cur, render(v.desc.value, innerMode));
        });
    }

    var contentWhenExpand;
    var content = createElement('span', mode === 'propValue' ? '' : 'font-style:italic', 'object-block');
    prefix = prefix || (protoName && colorize(protoName, COLOR_DEFAULT, 'tag'));
    if (prefix) {
        append(content, prefix, ' ');
    }
    if (mode === 'propValue') {
        contentWhenExpand = prefix ? prefix.cloneNode(true) : colorize(getObjectTag(obj, thisWin, '') || 'Object', COLOR_DEFAULT, 'tag');
    }
    append(content, arrayLike ? '[' : '{', propList, arrayLike ? ']' : '}');
    return createExpandableNode(content, obj, thisArg, contentWhenExpand);
}

/**
 * @param {any} obj
 * @param {'collapsed' | 'literal' | 'propValue' | 'childNodes'} mode
 */
function renderDOMNode(obj, mode) {
    var nodeName = obj.nodeName.toLowerCase();
    var nodeType = obj.nodeType;
    if (nodeType === 10) {
        nodeName = '<!DOCTYPE ' + nodeName + '>';
    }
    if (mode === 'collapsed' || mode === 'propValue') {
        var span = colorize(nodeName.replace('#', ''), COLOR_NODENAME, 'node');
        if (nodeType === 1 && obj.id) {
            append(span, colorize('#' + obj.id, COLOR_ATTRVAL, 'attr-value'));
        }
        return mode === 'propValue' ? createExpandableNode(span, obj) : span;
    }

    // element, document and document fragment
    if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
        var childNodes = obj.childNodes;
        if (mode === 'literal') {
            if (nodeType !== 1) {
                return createExpandableNode(colorize(nodeName, COLOR_DEFAULT, 'node'), obj, null, null, 'childNodes');
            }
            var span = newBlock('node-block');
            append(span, colorize('<' + nodeName, COLOR_ELEMENT, 'element'));

            for (var i = 0, arr = obj.attributes, len = arr.length; i < len; i++) {
                append(span, ' ');
                writeDOMAttribute(span, arr[i]);
            }
            append(span, colorize('>', COLOR_ELEMENT, 'element'));

            var childCount = childNodes.length + hasPseudoElement(obj, '::before') + hasPseudoElement(obj, '::after');
            if (nodeName !== 'iframe') {
                if (childCount === 0) {
                    if (!VOID_TAG[nodeName]) {
                        writeDOMEndTag(span, nodeName);
                    }
                    return span;
                }
                if (childCount === 1 && (nodeName !== 'style' && nodeName !== 'script') && childNodes[0] instanceof Text) {
                    append(span, childNodes[0].data.replace(/^[\r\n\t ]+|[\r\n\t ]+$/g, ' '));
                    writeDOMEndTag(span, nodeName);
                    return span;
                }
            }
            var copy = span.cloneNode(true);
            append(span, '…');
            writeDOMEndTag(span, nodeName);
            return createExpandableNode(span, obj, null, copy, 'childNodes');
        }
        if (mode === 'childNodes') {
            var span = newBlock('node-block');
            if (nodeName === 'iframe') {
                try {
                    writeChildNode(span, obj.contentWindow.document);
                } catch (e) {
                    writeChildNode(span, '[Exception: ' + e.message + ']');
                }
            } else {
                var isScriptOrStyle = nodeName === 'style' || nodeName === 'script';
                if (nodeType === 1 && hasPseudoElement(obj, '::before')) {
                    writeChildNodeImpl(span, colorize('::before', COLOR_PSEUDO_ELM, 'pseudo-elm'));
                }
                for (var i = 0, len = childNodes.length; i < len; i++) {
                    if (childNodes[i].nodeType === 3 && /^[\r\n\t ]+$/.test(childNodes[i].data)) {
                        // skip empty text node
                        continue;
                    }
                    if (isScriptOrStyle) {
                        writeChildNode(span, childNodes[i].data.replace(/^\r?\n|\r?\n$/g, ''));
                    } else {
                        writeChildNode(span, childNodes[i]);
                    }
                }
                if (nodeType === 1 && hasPseudoElement(obj, '::after')) {
                    writeChildNodeImpl(span, colorize('::after', COLOR_PSEUDO_ELM, 'pseudo-elm'));
                }
            }
            if (nodeType === 1) {
                writeDOMEndTag(span, nodeName);
            }
            return span;
        }
    }

    var span = createElement('span', '', 'node-block');
    appendHiddenArrow(span);
    switch (nodeType) {
        case 2:
            return writeDOMAttribute(span, obj, true);
        case 3:
            return append(span, colorize('"' + obj.data + '"', COLOR_DEFAULT, 'text'));
        case 8:
            return append(span, colorize('<!--' + obj.nodeValue + '-->', COLOR_COMMENT, 'comment'));
        case 10:
            return append(span, colorize(nodeName, COLOR_DOCTYPE, 'doctype'));
    }
    return append(span, colorize(obj.data, COLOR_DEFAULT, 'text'));
}

function writeChildNode(container, node) {
    return writeChildNodeImpl(container, render(node, 'literal'));
}

function writeChildNodeImpl(container, inner) {
    var cur = newLine('child-node');
    if (!isExpandableNode(inner)) {
        appendHiddenArrow(cur);
    }
    append(cur, inner);
    append(container, cur);
    return container;
}

function writeDOMAttribute(container, attr, forceValue) {
    append(container, colorize(attr.nodeName, COLOR_ATTRNAME, 'attr-name'));
    if (attr.nodeValue || forceValue) {
        append(container,
            colorize('="', COLOR_ELEMENT, 'element'),
            colorize(attr.nodeValue, COLOR_ATTRVAL, 'attr-value'),
            colorize('"', COLOR_ELEMENT, 'element'));
    }
    return container;
}

function writeDOMEndTag(container, nodeName) {
    return append(container, colorize('</' + nodeName + '>', COLOR_ELEMENT, 'element'));
}

function writeObject(container, obj, mode, thisArg) {
    return append(container, render(obj, mode, arguments.length < 4 ? obj : thisArg));
}

function writeArguments(container, args) {
    var span;
    for (var i = 0; i < args.length; i++) {
        if (i) {
            append(span || container, ' ');
        } else if (typeof args[i] === 'string') {
            var str = args[i];
            var lastIndex = 0;
            var m, re = /%([sidfoOc])/g;
            while (m = re.exec(str)) {
                if (m.index > lastIndex) {
                    writeObject(span || container, str.slice(lastIndex, m.index), 'literal');
                }
                var value = args.splice(1, 1)[0];
                switch (m[1]) {
                    case 's':
                        writeObject(span || container, String(value), 'literal');
                        break;
                    case 'i':
                    case 'd':
                        writeObject(span || container, String(Math.floor(+value)), 'literal');
                        break;
                    case 'f':
                        writeObject(span || container, String(+value), 'literal');
                        break;
                    case 'o':
                    case 'O':
                        writeObject(span || container, value, 'propValue');
                        break;
                    case 'c':
                        span = createElement('span', value);
                        append(container, span);
                        break;
                }
                lastIndex = m.index + m[0].length;
            }
            if (str.length > lastIndex) {
                writeObject(span || container, str.slice(lastIndex), 'literal');
            }
            continue;
        }
        writeObject(span || container, args[i], 'literal');
    }
    return container;
}

function createAppendCallback(type, backgroundColor, borderColor, textColor, zIndex) {
    var style = 'position:relative;padding:0.25em 0.5em;background-color:var(--console-color-background-' + type + ', ' + backgroundColor + ');border-bottom:1px solid var(--console-color-border-' + type + ', ' + borderColor + ');color:var(--console-color-' + type + ', ' + textColor + ');z-index:' + zIndex;
    var className = 'console-output ' + type;
    return function () {
        var element = this.element;
        var args = [].slice.apply(arguments);
        var line = createElement('div', style, className);
        append(element, line);
        append(line, '\u200b');
        if (!lines.length) {
            setTimeout(commitLines);
        }
        lines.push({ element, line, args });
    };
}

function commitLines() {
    lines.splice(0).forEach(function (v) {
        try {
            var element = v.element;
            writeArguments(v.line, v.args);
            element.scrollTop = element.scrollHeight - element.offsetHeight;
            element.dispatchEvent(new Event('console:append'));
        } catch { }
    });
}

function HTMLConsole(element) {
    this.element = element;
    $(element).css({
        font: '12px/1.4 Consolas,Monaco,monospace',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
    });
}
HTMLConsole.prototype.log = createAppendCallback('log', 'white', '#f0f0f0', 'black', '0');
HTMLConsole.prototype.warn = createAppendCallback('warn', '#fffbe6', '#fff4c5', 'black', '1');
HTMLConsole.prototype.error = createAppendCallback('error', '#fff0f0', '#fed6d7', 'red', '1');
HTMLConsole.prototype.clear = function () {
    this.element.innerHTML = '';
};

export default HTMLConsole;
