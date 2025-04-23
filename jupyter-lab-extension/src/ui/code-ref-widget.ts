import { createButton, createSpan } from './dom-elements';

/**
 * Data associated with a code reference widget.
 */
export interface CodeRefData {
  refId: string;
  code: string;
  codeRef: string; // e.g., "notebook.ipynb:3-10"
}

/**
 * Creates the HTML element for a collapsible code reference widget.
 *
 * @param data - The data for the code reference.
 * @returns The HTMLElement representing the code reference widget.
 */
export function createCodeRefWidgetHTML(data: CodeRefData): HTMLSpanElement {
  const widget = createSpan({
    classes: 'jp-llm-ext-code-ref-widget',
    attributes: {
      'data-ref-id': data.refId,
      'data-code': encodeURIComponent(data.code), // Store original code safely
      'data-ref': data.codeRef
    }
  });

  const label = createSpan({
    classes: 'jp-llm-ext-code-ref-label',
    text: data.codeRef
  });

  const toggleButton = createButton({
    classes: 'jp-llm-ext-code-ref-toggle',
    text: '⯈', // Right-pointing triangle initially
    attributes: { title: 'Expand/collapse code' }
  });

  const content = createSpan({
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
export function attachCodeRefEventListeners(
  element: HTMLElement,
  toggleCallback: (targetButton: HTMLButtonElement, contentElement: HTMLElement) => void
): void {
  const toggleButton = element.querySelector('.jp-llm-ext-code-ref-toggle') as HTMLButtonElement;
  const contentElement = element.querySelector('.jp-llm-ext-code-ref-content') as HTMLElement;

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
export function defaultCodeRefToggleLogic(toggleButton: HTMLButtonElement, contentElement: HTMLElement): void {
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
export function createCodeRefPlaceholder(
  refId: string, 
  notebookName?: string, // Keep optional for now
  lineNumber?: number // Keep optional for now
): string {
  // Keep it simple for now, just the ID.
  // Display details like notebook/line could be added later if needed.
  return `[${refId}]`;
} 