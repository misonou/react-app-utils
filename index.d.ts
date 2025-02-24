import FormDevToolMixin from "./lib/FormDevToolMixin";
import HTMLConsole from "./lib/HTMLConsole";
import { useMenuKeystrokeMixin, MenuKeystrokeMixin } from "./lib/MenuKeystrokeMixin";
import createApi from "./lib/createApi";
import fuzzyMatch from "./lib/fuzzyMatch";
import memoize from "./lib/memoize";
import promptForChoice from "./lib/promptForChoice";
import { useUndoableInputMixin, useUndoableState, UndoableInputMixin } from "./lib/undoable";
import useTextInputAutofillFix from "./lib/useTextInputAutofillFix";

export type { IConsole } from "./lib/HTMLConsole";
export type { MatchableItem, MatchedItem, MatchOptions } from "./lib/fuzzyMatch";
export type { MenuKeystrokeOptions } from "./lib/MenuKeystrokeMixin";
export type { PromptOptions } from "./lib/promptForChoice";
export type { UndoableInputMixinOptions, UndoableState } from "./lib/undoable";
export * from "./lib/util.js";

export {
    createApi,
    fuzzyMatch,
    memoize,
    promptForChoice,
    useMenuKeystrokeMixin,
    useTextInputAutofillFix,
    useUndoableInputMixin,
    useUndoableState,
    FormDevToolMixin,
    HTMLConsole,
    MenuKeystrokeMixin,
    UndoableInputMixin
}
