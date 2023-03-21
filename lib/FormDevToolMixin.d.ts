import { StatefulMixin } from "brew-js-react";
import { } from "zeta-dom";

export default class FormDevToolMixin extends StatefulMixin {
    /**
     * Provides data for auto-filling.
     *
     * To enable form auto-filling in development environment, explicitly import `@misonou/react-app-utils/formAutofiller`.
     * When enabled, a data filling prompt can be triggered by clicking form area while `Ctrl` key is being pressed.
     * @param choices A dictionary, or a function that returns or resolves to a dictionary, or a function that imports a default-exported dictionary.
     */
    promptAutofill<T>(choices: Zeta.Dictionary<T> | (() => Zeta.Dictionary<T> | Promise<Zeta.Dictionary<T>> | Promise<{ default: Zeta.Dictionary<T> }>)): this;
}
