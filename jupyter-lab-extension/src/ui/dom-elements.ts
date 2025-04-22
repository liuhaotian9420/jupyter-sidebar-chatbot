// import { ReadonlyPartialJSONObject } from '@lumino/coreutils';

/**
 * Type definition for options used when creating HTML elements.
 */
export interface ElementOptions {
  id?: string;
  classes?: string | string[];
  text?: string;
  html?: string;
  attributes?: { [key: string]: string };
  style?: Partial<CSSStyleDeclaration>;
  children?: (HTMLElement | string)[];
}

/**
 * Generic function to create an HTMLElement.
 *
 * @param tagName - The HTML tag name (e.g., 'div', 'button').
 * @param options - Optional configuration for the element.
 * @returns The created HTMLElement.
 */
function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options: ElementOptions = {}
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);

  if (options.id) {
    element.id = options.id;
  }

  if (options.classes) {
    const classesToAdd = Array.isArray(options.classes)
      ? options.classes
      : options.classes.split(' ').filter(c => c);
    element.classList.add(...classesToAdd);
  }

  if (options.text) {
    element.textContent = options.text;
  } else if (options.html) {
    element.innerHTML = options.html; // Be cautious with HTML injection
  }

  if (options.attributes) {
    for (const key in options.attributes) {
      if (options.attributes.hasOwnProperty(key)) {
        element.setAttribute(key, options.attributes[key]);
      }
    }
  }

  if (options.style) {
    for (const key in options.style) {
      if (options.style.hasOwnProperty(key)) {
        element.style[key as any] = options.style[key] as string;
      }
    }
  }

  if (options.children) {
    options.children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
  }

  return element;
}

/** Creates a <div> element. */
export function createDiv(options: ElementOptions = {}): HTMLDivElement {
  return createElement('div', options);
}

/** Creates a <button> element. */
export function createButton(options: ElementOptions = {}): HTMLButtonElement {
  return createElement('button', options);
}

/** Creates a <span> element. */
export function createSpan(options: ElementOptions = {}): HTMLSpanElement {
  return createElement('span', options);
}

/** Creates a <textarea> element. */
export function createTextArea(
  options: ElementOptions = {}
): HTMLTextAreaElement {
  return createElement('textarea', options);
}

/** Creates an <input> element. */
export function createInputElement(
  options: ElementOptions = {}
): HTMLInputElement {
  // Ensure type is set if provided in attributes, otherwise default or leave unset
  if (options.attributes?.type) {
     // Type is already set in attributes, do nothing extra
  } else if (!options.attributes) {
    options.attributes = { type: 'text' }; // Default to text if no attributes specified
  } else if (!options.attributes.type) {
     options.attributes.type = 'text'; // Default to text if type is not in attributes
  }
  return createElement('input', options);
}

/** Creates an <img> element. */
export function createImageElement(
    options: ElementOptions & { src: string; alt?: string }
): HTMLImageElement {
    const imgOptions = { ...options };
    imgOptions.attributes = { ...options.attributes, src: options.src };
    if (options.alt) {
        imgOptions.attributes.alt = options.alt;
    }
    return createElement('img', imgOptions);
}

/** Creates an <a> element. */
export function createAnchorElement(
    options: ElementOptions & { href: string }
): HTMLAnchorElement {
    const anchorOptions = { ...options };
    anchorOptions.attributes = { ...options.attributes, href: options.href };
    return createElement('a', anchorOptions);
}

/** Creates a <label> element. */
export function createLabelElement(
    options: ElementOptions & { htmlFor?: string }
): HTMLLabelElement {
    const labelOptions = { ...options };
    if (options.htmlFor) {
      labelOptions.attributes = { ...options.attributes, for: options.htmlFor };
    }
    return createElement('label', labelOptions);
}

/** Creates a <form> element. */
export function createFormElement(options: ElementOptions = {}): HTMLFormElement {
    return createElement('form', options);
}