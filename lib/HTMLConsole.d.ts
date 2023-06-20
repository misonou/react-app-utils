export interface IConsole {
    log(...args: any): void;
    warn(...args: any): void;
    error(...args: any): void;
    clear(): void;
}

export default class HTMLConsole implements IConsole {
    constructor(element: HTMLElement);
    readonly element: HTMLElement;
    log(...args: any): void;
    warn(...args: any): void;
    error(...args: any): void;
    clear(): void;
}
