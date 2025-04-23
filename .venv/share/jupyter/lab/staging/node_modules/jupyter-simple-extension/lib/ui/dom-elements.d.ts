/**
 * Type definition for options used when creating HTML elements.
 */
export interface ElementOptions {
    id?: string;
    classes?: string | string[];
    text?: string;
    html?: string;
    attributes?: {
        [key: string]: string;
    };
    style?: Partial<CSSStyleDeclaration>;
    children?: (HTMLElement | string)[];
}
/** Creates a <div> element. */
export declare function createDiv(options?: ElementOptions): HTMLDivElement;
/** Creates a <button> element. */
export declare function createButton(options?: ElementOptions): HTMLButtonElement;
/** Creates a <span> element. */
export declare function createSpan(options?: ElementOptions): HTMLSpanElement;
/** Creates a <textarea> element. */
export declare function createTextArea(options?: ElementOptions): HTMLTextAreaElement;
/** Creates an <input> element. */
export declare function createInputElement(options?: ElementOptions): HTMLInputElement;
/** Creates an <img> element. */
export declare function createImageElement(options: ElementOptions & {
    src: string;
    alt?: string;
}): HTMLImageElement;
/** Creates an <a> element. */
export declare function createAnchorElement(options: ElementOptions & {
    href: string;
}): HTMLAnchorElement;
/** Creates a <label> element. */
export declare function createLabelElement(options: ElementOptions & {
    htmlFor?: string;
}): HTMLLabelElement;
/** Creates a <form> element. */
export declare function createFormElement(options?: ElementOptions): HTMLFormElement;
