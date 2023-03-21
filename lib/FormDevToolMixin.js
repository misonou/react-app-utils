import { StatefulMixin } from "brew-js-react";
import dom from "zeta-dom/dom";
import { isFunction } from "zeta-dom/util";

export default class FormDevToolMixin extends StatefulMixin {
    promptAutofill(choices) {
        this.autofillChoices = choices;
        return this;
    }

    initElement(element) {
        dom.on(element, 'requestAutofillPrompt', () => {
            var choices = this.autofillChoices;
            return isFunction(choices) ? choices() : choices;
        });
    }
}
