"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCodeRefWidgetHTML = createCodeRefWidgetHTML;
exports.attachCodeRefEventListeners = attachCodeRefEventListeners;
exports.defaultCodeRefToggleLogic = defaultCodeRefToggleLogic;
exports.createCodeRefPlaceholder = createCodeRefPlaceholder;
const dom_elements_1 = require("./dom-elements");
/**
 * Creates the HTML element for a collapsible code reference widget.
 *
 * @param data - The data for the code reference.
 * @returns The HTMLElement representing the code reference widget.
 */
function createCodeRefWidgetHTML(data) {
    const widget = (0, dom_elements_1.createSpan)({
        classes: 'jp-llm-ext-code-ref-widget',
        attributes: {
            'data-ref-id': data.refId,
            'data-code': encodeURIComponent(data.code), // Store original code safely
            'data-ref': data.codeRef
        }
    });
    const label = (0, dom_elements_1.createSpan)({
        classes: 'jp-llm-ext-code-ref-label',
        text: data.codeRef
    });
    const toggleButton = (0, dom_elements_1.createButton)({
        classes: 'jp-llm-ext-code-ref-toggle',
        text: '⯈', // Right-pointing triangle initially
        attributes: { title: 'Expand/collapse code' }
    });
    const content = (0, dom_elements_1.createSpan)({
        classes: 'jp-llm-ext-code-ref-content',
        text: data.code, // Display the raw code for now
        style: { display: 'none' } // Hidden initially
    });
    // Assemble the widget
    widget.appendChild(label);
    widget.appendChild(toggleButton);
    widget.appendChild(content);
    return widget;
}
/**
 * Attaches event listeners (specifically click for toggle) to a code ref widget.
 *
 * @param element - The code ref widget HTMLElement.
 * @param toggleCallback - A function to call when the toggle button is clicked.
 */
function attachCodeRefEventListeners(element, toggleCallback) {
    const toggleButton = element.querySelector('.jp-llm-ext-code-ref-toggle');
    const contentElement = element.querySelector('.jp-llm-ext-code-ref-content');
    if (toggleButton && contentElement) {
        toggleButton.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleCallback(toggleButton, contentElement);
        });
    }
}
/**
 * Default logic for toggling the visibility of the code ref content.
 * This can be passed as the callback to attachCodeRefEventListeners.
 *
 * @param toggleButton - The button element that was clicked.
 * @param contentElement - The content element to toggle.
 */
function defaultCodeRefToggleLogic(toggleButton, contentElement) {
    const isVisible = contentElement.style.display !== 'none';
    contentElement.style.display = isVisible ? 'none' : 'block'; // Or 'inline-block'/'inline' depending on desired layout
    toggleButton.textContent = isVisible ? '⯈' : '⯆'; // Update triangle direction
}
/**
 * Creates a textual placeholder for a code reference.
 *
 * @param refId - The unique identifier for the reference (e.g., "ref-1").
 * @param notebookName - The name of the notebook (optional, for future display enhancements).
 * @param lineNumber - The starting line number of the code (optional, for future display enhancements).
 * @returns A string placeholder like "[ref-1]".
 */
function createCodeRefPlaceholder(refId, notebookName, // Keep optional for now
lineNumber // Keep optional for now
) {
    // Keep it simple for now, just the ID.
    // Display details like notebook/line could be added later if needed.
    return `[${refId}]`;
}
