import { define, defineOwnProperty, each, extend, map } from "zeta-dom/util";

function match(str, needle) {
    var chars;
    str = str || '';
    chars = str.toLowerCase();

    function matchAt(j) {
        var vector = [];
        for (var i = 0, lastpos = -1, len = needle.length; i < len; i++) {
            var l = needle[i];
            if (l === ' ') {
                continue;
            }
            j = chars.indexOf(l, j);
            if (j === -1) {
                vector.length = 0;
                break;
            }
            vector[vector.length] = j - lastpos - 1;
            lastpos = j++;
        }
        if (!vector.length) {
            return {
                firstIndex: Infinity,
                consecutiveMatches: -1,
                formattedText: str
            };
        }
        var consecutiveMatches = vector.filter(function (v) {
            return v === 0;
        }).length + 1;
        return {
            firstIndex: vector[0],
            consecutiveMatches: consecutiveMatches,
            get formattedText() {
                var formattedText = '';
                for (var i = 0, k = 0; i < vector.length; i++) {
                    formattedText += str.substr(k, vector[i]).replace(/</g, '&lt;') + '<b>' + str[k + vector[i]].replace(/</g, '&lt;') + '</b>';
                    k += vector[i] + 1;
                }
                formattedText += str.slice(j);
                formattedText = formattedText.replace(/<\/b><b>/g, '');
                defineOwnProperty(this, 'formattedText', formattedText, true);
                return formattedText;
            }
        };
    }

    var cur = matchAt(0);
    var result = cur;
    while (cur.firstIndex !== Infinity) {
        cur = matchAt(cur.firstIndex + 1);
        if (cur.consecutiveMatches > result.consecutiveMatches) {
            result = cur;
        }
    }
    return result;
}

export default function fuzzyMatch(suggestions, needle, options) {
    if (!needle) {
        return [];
    }
    needle = needle.toLowerCase();
    options = options || {};

    var filteredItems = map(suggestions, function (v) {
        var result = match(v.displayText, needle);
        each(v.matchingText, function (i, v) {
            var m = match(v, needle);
            result.firstIndex = Math.min(result.firstIndex, m.firstIndex);
            result.consecutiveMatches = Math.max(result.consecutiveMatches, m.consecutiveMatches);
        });
        if (result.firstIndex !== Infinity || options.returnAll) {
            var matchedItem = extend({}, v);
            define(matchedItem, result);
            return matchedItem;
        }
    });
    if (options.sortByRelevancy) {
        filteredItems.sort(function (a, b) {
            return (b.consecutiveMatches - a.consecutiveMatches) || (a.firstIndex - b.firstIndex) || a.displayText.localeCompare(b.displayText);
        });
    }
    return filteredItems;
}
