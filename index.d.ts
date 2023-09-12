import FormDevToolMixin from "./lib/FormDevToolMixin";
import HTMLConsole from "./lib/HTMLConsole";
import createApi from "./lib/createApi";
import fuzzyMatch from "./lib/fuzzyMatch";
import memoize from "./lib/memoize";
import promptForChoice from "./lib/promptForChoice";

export type { IConsole } from "./lib/HTMLConsole";
export type { MatchableItem, MatchedItem, MatchOptions } from "./lib/fuzzyMatch";
export * from "./lib/util.js";

export {
    createApi,
    fuzzyMatch,
    memoize,
    promptForChoice,
    FormDevToolMixin,
    HTMLConsole
}
