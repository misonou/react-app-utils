export interface MatchableItem<T = any> {
    /**
     * Specifies primary text to match against search keyword.
     * Primary text will have matched substring highlighted, accessible by {@link MatchedItem.formattedText}.
     */
    displayText: string;
    /**
     * Specifies additional texts to match against search keyword.
     */
    matchingText?: readonly string[];
    /**
     * User defined value representing the item.
     */
    value: T;
}

export type MatchedItem<T> = Readonly<T> & {
    /**
     * Gets the formatted text where matched substring found in {@link MatchableItem.displayText} is highlighted.
     */
    readonly formattedText: string
}

export interface MatchOptions {
    /**
     * Whether to sort the list of matched items by relevancy.
     * Items with longest matched substring will appear first.
     */
    sortByRelevancy?: boolean;
    /**
     * Whether to include all items in the returned list.
     * Items that have no matches will appear last when {@link MatchOptions.sortByRelevancy} is set.
     */
    returnAll?: boolean;
}

/**
 * Returns a list of matched items using fuzzy logic.
 * @param haystack A list of items to match against.
 * @param needle Keyword to be matched.
 * @param options A dictionary containing options specifying the matching behavior.
 */
export default function fuzzyMatch<T extends MatchableItem>(haystack: readonly T[], needle: string, options?: MatchOptions): MatchedItem<T>[];
