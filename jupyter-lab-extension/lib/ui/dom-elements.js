"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDiv = createDiv;
exports.createButton = createButton;
exports.createSpan = createSpan;
exports.createTextArea = createTextArea;
exports.createInputElement = createInputElement;
exports.createImageElement = createImageElement;
exports.createAnchorElement = createAnchorElement;
exports.createLabelElement = createLabelElement;
exports.createFormElement = createFormElement;
/**
 * Generic function to create an HTMLElement.
 *
 * @param tagName - The HTML tag name (e.g., 'div', 'button').
 * @param options - Optional configuration for the element.
 * @returns The created HTMLElement.
 */
function createElement(tagName, options = {}) {
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
    }
    else if (options.html) {
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
                element.style[key] = options.style[key];
            }
        }
    }
    if (options.children) {
        options.children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            }
            else {
                element.appendChild(child);
            }
        });
    }
    return element;
}
/** Creates a <div> element. */
function createDiv(options = {}) {
    return createElement('div', options);
}
/** Creates a <button> element. */
function createButton(options = {}) {
    return createElement('button', options);
}
/** Creates a <span> element. */
function createSpan(options = {}) {
    return createElement('span', options);
}
/** Creates a <textarea> element. */
function createTextArea(options = {}) {
    return createElement('textarea', options);
}
/** Creates an <input> element. */
function createInputElement(options = {}) {
    var _a;
    // Ensure type is set if provided in attributes, otherwise default or leave unset
    if ((_a = options.attributes) === null || _a === void 0 ? void 0 : _a.type) {
        // Type is already set in attributes, do nothing extra
    }
    else if (!options.attributes) {
        options.attributes = { type: 'text' }; // Default to text if no attributes specified
    }
    else if (!options.attributes.type) {
        options.attributes.type = 'text'; // Default to text if type is not in attributes
    }
    return createElement('input', options);
}
/** Creates an <img> element. */
function createImageElement(options) {
    const imgOptions = Object.assign({}, options);
    imgOptions.attributes = Object.assign(Object.assign({}, options.attributes), { src: options.src });
    if (options.alt) {
        imgOptions.attributes.alt = options.alt;
    }
    return createElement('img', imgOptions);
}
/** Creates an <a> element. */
function createAnchorElement(options) {
    const anchorOptions = Object.assign({}, options);
    anchorOptions.attributes = Object.assign(Object.assign({}, options.attributes), { href: options.href });
    return createElement('a', anchorOptions);
}
/** Creates a <label> element. */
function createLabelElement(options) {
    const labelOptions = Object.assign({}, options);
    if (options.htmlFor) {
        labelOptions.attributes = Object.assign(Object.assign({}, options.attributes), { for: options.htmlFor });
    }
    return createElement('label', labelOptions);
}
/** Creates a <form> element. */
function createFormElement(options = {}) {
    return createElement('form', options);
}
