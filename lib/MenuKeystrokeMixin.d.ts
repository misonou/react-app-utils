import { StatefulMixin } from "brew-js-react";

export interface MenuKeystrokeOptions {
    /**
     * Specifies the menu element containing menu items. It can be a DOM element, a selector to a DOM element, or a React ref object.
     * Default to element which the mixin is applied to.
     */
    menuElement?: HTMLElement | string | React.RefObject<HTMLElement>;
    /**
     * CSS selector which specifies elements as traversable menu items.
     */
    selector: string;
    /**
     * CSS class name to be applied to item during traversal for highlighting.
     * Default is `active`.
     */
    activeClass?: string;
    /**
     * CSS class name indicating that item is selected.
     * Default is `selected`.
     *
     * Traversal of elements will start from the item having the specified CSS class name.
     * If there is no such element, traversal will start from the first item.
     */
    selectedClass?: string;
    /**
     * Whether to select current item while user is traversing by arrow keys or jumping by typing characters.
     * Default is `false`.
     */
    autoSelect?: boolean;
    /**
     * Whether to traverse back to start (or end) after reaching the last (or first) menu item.
     * Default is `false`.
     */
    wrapAround?: boolean;
}

/**
 * @see {@link useMenuKeystrokeMixin}
 */
export class MenuKeystrokeMixin extends StatefulMixin {
    /**
     * Selects the current menu item.
     * @returns Whether an item is selected.
     */
    select(): boolean;
}

/**
 * Returns a mixin that allows selecting menu items by keyboard.
 *
 * It supports traversing by up/down arrow key, selecting by space/enter key, and jumping by typing characters,
 * like most native dropdowns and menus.
 *
 * @param options A dictionary containing options to be passed to mixin.
 */
export function useMenuKeystrokeMixin(options: MenuKeystrokeOptions): MenuKeystrokeMixin;

/**
 * Returns a mixin that allows selecting menu items by keyboard.
 *
 * It supports traversing by up/down arrow key, selecting by space/enter key, and jumping by typing characters,
 * like most native dropdowns and menus.
 *
 * @param selector CSS selector which specifies elements as traversable menu items.
 * @param autoSelect Whether to select current item while user is traversing by arrow keys or jumping by typing characters. Default is `false`.
 */
export function useMenuKeystrokeMixin(selector: string, autoSelect?: boolean): MenuKeystrokeMixin;
