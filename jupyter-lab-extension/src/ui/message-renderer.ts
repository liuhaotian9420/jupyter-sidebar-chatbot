import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js'; // Or import specific languages if needed

import {
  createDiv,
  createButton,
  createSpan,
  createImageElement
} from './dom-elements';
import {
  CodeRefData,
  createCodeRefWidgetHTML,
  attachCodeRefEventListeners,
  defaultCodeRefToggleLogic
} from './code-ref-widget';

import { copyToClipboard, copyImageToClipboard, copyMessageToClipboard } from '../utils/clipboard';
import { addMessageToCell } from '../utils/notebook-integration';
import { detectLanguage, highlightCode, preprocessMarkdown } from '../utils/highlighting';

/**
 * Callbacks for actions within rendered messages.
 */
export interface MessageRendererCallbacks {
  showCopyFeedback: (button: HTMLButtonElement) => void;
  addMessageToCell: (content: string) => void; // Wrap the util for consistency?
  copyToClipboard: (text: string, feedbackCb: () => void) => void;
  copyImageToClipboard: (imageUrl: string, feedbackCb: () => void) => void;
  copyMessageToClipboard: (text: string, feedbackCb: () => void) => void;
  handleConfirmInterrupt: () => void;
  handleRejectInterrupt: () => void;
  // Potentially others: handleCodeRefClick if we move that logic here
}

/**
 * Options for rendering a message.
 */
export interface MessageRenderOptions {
  isMarkdown: boolean;
  // Future: Add options for streaming updates, etc.
}

/**
 * Base function to create a message container div.
 */
function createMessageDiv(sender: 'user' | 'bot'): HTMLDivElement {
  const messageDiv = document.createElement('div');
  messageDiv.className = sender === 'user' ? 'jp-llm-ext-user-message' : 'jp-llm-ext-bot-message';
  return messageDiv;
}

/**
 * Renders a user message.
 */
export function renderUserMessage(
  text: string,
  options: Partial<MessageRenderOptions> = {},
  callbacks: Partial<MessageRendererCallbacks> = {}
): HTMLDivElement {
  const messageDiv = createMessageDiv('user');

  // Handle user message with code references (logic to be moved from addMessage)
  if (options.isMarkdown) { 
    // Special case: User message with code references (placeholder)
    const contentDiv = document.createElement('div');
    contentDiv.className = 'user-content-with-refs';
    // TODO: Move code reference widget creation logic here
    contentDiv.textContent = `[Code Refs Placeholder] ${text}`;
    messageDiv.appendChild(contentDiv);
  } else {
    messageDiv.textContent = text;
  }

  return messageDiv;
}

/**
 * Renders a bot message (text, markdown, images, code blocks).
 */
export function renderBotMessage(
  text: string,
  options: Partial<MessageRenderOptions> = { isMarkdown: true },
  callbacks: Partial<MessageRendererCallbacks> = {}
): HTMLDivElement {
  const messageDiv = createMessageDiv('bot');

  // Check if the message is an image URL
  const isImageUrl = text.trim().startsWith('/images/') &&
                    (text.trim().endsWith('.png') ||
                     text.trim().endsWith('.jpg') ||
                     text.trim().endsWith('.jpeg') ||
                     text.trim().endsWith('.gif'));

  if (isImageUrl) {
    // Construct full URL (TODO: Make base URL configurable)
    const fullImageUrl = `http://127.0.0.1:8000${text.trim()}`;
    // Call dedicated image rendering function
    renderImageMessage(messageDiv, fullImageUrl, callbacks);
  } else if (options.isMarkdown) {
    // Render as markdown (logic from addMessage)
    const markdownIndicator = document.createElement('div');
    markdownIndicator.textContent = "MD";
    markdownIndicator.className = 'markdown-indicator';
    messageDiv.appendChild(markdownIndicator);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'markdown-content';

    try {
      const processedText = preprocessMarkdown(text);
      const rawHtml = marked.parse(processedText) as string;
      const sanitizedHtml = DOMPurify.sanitize(rawHtml);
      contentDiv.innerHTML = sanitizedHtml;

      // Enhance code blocks after setting innerHTML
      const codeBlocks = contentDiv.querySelectorAll('pre code');
      codeBlocks.forEach(block => {
        enhanceCodeBlock(block as HTMLElement, callbacks);
      });

      // Check for and render interrupt buttons
      const isInterrupt = text.startsWith('**[INTERRUPT]**');
      if (isInterrupt) {
        renderInterruptButtons(contentDiv, callbacks);
      }

    } catch (error) {
      contentDiv.textContent = text; // Fallback to plain text
      console.error('Failed to render markdown:', error);
    }
    messageDiv.appendChild(contentDiv);
    
    // Add overall message action buttons AFTER content is added
    addBotMessageActions(messageDiv, text, callbacks);

  } else {
    // Render as plain text
    messageDiv.textContent = text;
    // Add overall message action buttons even for plain text bot messages
    addBotMessageActions(messageDiv, text, callbacks);
  }

  return messageDiv;
}

// --- More specific rendering functions or helpers can be added below ---

/**
 * Renders an image message with action buttons inside a container.
 *
 * @param container The parent HTML element to append the image message to.
 * @param imageUrl The full URL of the image to render.
 * @param callbacks Callbacks for actions like copy image, add path.
 */
function renderImageMessage(
  container: HTMLElement,
  imageUrl: string,
  callbacks: Partial<MessageRendererCallbacks> = {}
): void {
  // Create a container for the image that allows positioning the buttons
  const imageContainer = document.createElement('div');
  imageContainer.className = 'jp-llm-ext-image-container';
  imageContainer.style.position = 'relative';

  // Render as an image tag
  const img = document.createElement('img');
  img.src = imageUrl;
  img.alt = 'Image from bot';
  img.style.maxWidth = '100%'; // Ensure image fits within the container
  img.style.height = 'auto';
  imageContainer.appendChild(img);

  // Add action buttons for the image
  const imgActionsDiv = document.createElement('div');
  imgActionsDiv.className = 'jp-llm-ext-image-actions';
  imgActionsDiv.style.position = 'absolute';
  imgActionsDiv.style.bottom = '10px';
  imgActionsDiv.style.right = '10px';
  imgActionsDiv.style.display = 'flex';
  imgActionsDiv.style.gap = '8px';
  imgActionsDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
  imgActionsDiv.style.borderRadius = '4px';
  imgActionsDiv.style.padding = '4px';

  // Copy image button (using callback)
  if (callbacks.copyImageToClipboard && callbacks.showCopyFeedback) {
    const copyImgBtn = document.createElement('button');
    copyImgBtn.className = 'jp-llm-ext-image-action-button';
    copyImgBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
    copyImgBtn.title = 'Copy image to clipboard';
    const feedbackCb = () => callbacks.showCopyFeedback!(copyImgBtn);
    copyImgBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      callbacks.copyImageToClipboard!(imageUrl, feedbackCb);
    });
    imgActionsDiv.appendChild(copyImgBtn);
  }

  // Add file path button (using callback)
  if (callbacks.addMessageToCell) {
    const addPathBtn = document.createElement('button');
    addPathBtn.className = 'jp-llm-ext-image-action-button';
    addPathBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M12 11v6"></path><path d="M9 14h6"></path></svg>';
    addPathBtn.title = 'Add image path to current cell';
    addPathBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      // Pass the image URL (which is the message text in this case)
      callbacks.addMessageToCell!(imageUrl);
    });
    imgActionsDiv.appendChild(addPathBtn);
  }

  // Only add the actions div if it has buttons
  if (imgActionsDiv.hasChildNodes()) {
      imageContainer.appendChild(imgActionsDiv);
  }

  // Add the image container to the main message div
  container.appendChild(imageContainer);
}

/**
 * Creates the initial structure for a bot message that will receive streaming content.
 *
 * @returns Object containing the wrapper, streaming div, and final content div.
 */
export function renderBotMessageStreamingStart(): {
  wrapper: HTMLDivElement;
  streamingDiv: HTMLDivElement;
  contentDiv: HTMLDivElement;
} {
  const wrapper = createMessageWrapper('bot');

  const markdownIndicator = createDiv({
    text: 'MD',
    classes: 'markdown-indicator'
  });
  wrapper.appendChild(markdownIndicator);

  const streamingDiv = createDiv({
    classes: 'streaming-content',
    style: {
      whiteSpace: 'pre-wrap',
      fontFamily: 'monospace',
      fontSize: '0.9em'
    }
  });
  wrapper.appendChild(streamingDiv);

  const contentDiv = createDiv({
    classes: 'markdown-content',
    style: { display: 'none' } // Initially hidden
  });
  wrapper.appendChild(contentDiv);

  return { wrapper, streamingDiv, contentDiv };
}

/**
 * Updates the streaming div with a new chunk of text.
 *
 * @param streamingDiv - The div displaying streaming content.
 * @param chunk - The new text chunk to append.
 */
export function renderBotMessageStreamingUpdate(
  streamingDiv: HTMLDivElement,
  chunk: string
): void {
  // Simple append, might need refinement for complex streams
  streamingDiv.textContent += chunk; 
}

/**
 * Renders the final content of a bot message after streaming is complete.
 * Handles markdown, images, code blocks, and interrupts.
 *
 * @param contentDiv - The div where the final content should be rendered.
 * @param streamingDiv - The div that was used for streaming (will be hidden).
 * @param completeResponse - The full text content from the bot.
 * @param options - Rendering options including callbacks for actions.
 * @returns The populated contentDiv.
 */
export function renderBotMessageFinal(
  contentDiv: HTMLDivElement,
  streamingDiv: HTMLDivElement,
  completeResponse: string,
  options: RenderOptions = {}
): HTMLDivElement {
  // Hide streaming div, show final content div
  streamingDiv.style.display = 'none';
  contentDiv.style.display = 'block';

  // TODO: Move utility functions to utils/
  const preprocessMarkdown = (text: string): string => text; // Placeholder
  const detectLanguage = (code: string): string => hljs.highlightAuto(code).language || ''; // Placeholder
  const highlightCode = (code: string, lang: string): string => { // Placeholder
      if (lang && hljs.getLanguage(lang)) {
          try {
              return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
          } catch (__) {}
      }
      return hljs.highlightAuto(code).value;
  };
  const copyToClipboard = (text: string, cb?: () => void) => { console.log('Copy:', text); cb?.(); }; // Placeholder
  const addMessageToCell = (text: string) => { console.log('Add to cell:', text); }; // Placeholder
  const copyImageToClipboard = (url: string, cb?: () => void) => { console.log('Copy Img:', url); cb?.(); }; // Placeholder
  const showCopyFeedback = (btn: HTMLButtonElement) => { console.log('Feedback:', btn); }; // Placeholder

  // --- Image Handling ---
  const isImageUrl = completeResponse.trim().startsWith('/images/') && 
                     (completeResponse.trim().endsWith('.png') || 
                      completeResponse.trim().endsWith('.jpg') || 
                      completeResponse.trim().endsWith('.jpeg') || 
                      completeResponse.trim().endsWith('.gif'));

  if (isImageUrl) {
      const fullImageUrl = `http://127.0.0.1:8000${completeResponse.trim()}`; // TODO: Make base URL configurable
      renderImageMessage(contentDiv, fullImageUrl, options);
  } else {
      // --- Markdown & Code Block Handling ---
      try {
          const processedText = preprocessMarkdown(completeResponse);
          const rawHtml = marked.parse(processedText) as string;
          const sanitizedHtml = DOMPurify.sanitize(rawHtml);
          contentDiv.innerHTML = sanitizedHtml;

          // --- Interrupt Handling ---
          const isInterrupt = completeResponse.startsWith('**[INTERRUPT]**');
          if (isInterrupt) {
              renderInterruptButtons(contentDiv, options);
          }

          // --- Code Block Enhancements ---
          const codeBlocks = contentDiv.querySelectorAll('pre code');
          codeBlocks.forEach(block => {
              enhanceCodeBlock(block as HTMLElement, options);
          });

      } catch (error) {
          console.error('Error rendering markdown:', error);
          contentDiv.textContent = completeResponse; // Fallback to plain text
      }
  }
  return contentDiv;
}

/**
 * Enhances a code block element with highlighting and action buttons.
 *
 * @param codeBlockElement The <code> element within a <pre>.
 * @param callbacks Callbacks for actions like copy code, add to cell.
 */
function enhanceCodeBlock(
    codeBlockElement: HTMLElement,
    callbacks: Partial<MessageRendererCallbacks> = {}
): void {
    const preElement = codeBlockElement.parentElement;
    if (!preElement || preElement.tagName !== 'PRE') {
        console.warn('Code block enhancement called on element not within a <pre> tag.');
        return;
    }

    // Add standard JupyterLab classes for consistency
    codeBlockElement.classList.add('jp-RenderedText');
    preElement.classList.add('jp-RenderedHTMLCommon');

    // Get code content
    const codeContent = codeBlockElement.textContent || '';

    // Create code block header for buttons and language indicator
    const codeHeader = document.createElement('div');
    codeHeader.className = 'jp-llm-ext-code-header';

    // Add language indicator if detected
    const language = detectLanguage(codeContent); // Use imported util
    if (language) {
        const langIndicator = document.createElement('span');
        langIndicator.className = 'jp-llm-ext-code-language';
        langIndicator.textContent = language;
        codeHeader.appendChild(langIndicator);
        codeBlockElement.classList.add(`language-${language}`);
    }

    // Apply syntax highlighting
    try {
        // Use imported util (handles auto-detection if language is empty)
        codeBlockElement.innerHTML = highlightCode(codeContent, language);
    } catch (error) {
        console.error('Error applying syntax highlighting:', error);
        // codeBlockElement might contain original text or partially highlighted
    }

    // Add action buttons to the code header
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'jp-llm-ext-code-actions';

    // Copy button
    if (callbacks.copyToClipboard && callbacks.showCopyFeedback) {
        const copyButton = document.createElement('button');
        copyButton.className = 'jp-llm-ext-code-action-button';
        copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
        copyButton.title = 'Copy code to clipboard';
        const feedbackCb = () => callbacks.showCopyFeedback!(copyButton);
        copyButton.addEventListener('click', (event) => {
            event.stopPropagation();
            callbacks.copyToClipboard!(codeContent, feedbackCb);
        });
        actionsDiv.appendChild(copyButton);
    }

    // Add to cell button
    if (callbacks.addMessageToCell) {
        const addToButton = document.createElement('button');
        addToButton.className = 'jp-llm-ext-code-action-button';
        addToButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M12 11v6"></path><path d="M9 14h6"></path></svg>';
        addToButton.title = 'Add code to current cell';
        addToButton.addEventListener('click', (event) => {
            event.stopPropagation();
            callbacks.addMessageToCell!(codeContent);
        });
        actionsDiv.appendChild(addToButton);
    }

    // Add the actions to the header, and insert header before the <pre>
    if (actionsDiv.hasChildNodes()) {
        codeHeader.appendChild(actionsDiv);
    }
    if (codeHeader.hasChildNodes()) {
        preElement.parentNode?.insertBefore(codeHeader, preElement);
    }
}

/**
 * Renders Confirm/Reject buttons for an interrupt message.
 *
 * @param container The parent HTML element (message content div) to append buttons to.
 * @param callbacks Callbacks for confirm and reject actions.
 */
function renderInterruptButtons(
    container: HTMLElement,
    callbacks: Partial<MessageRendererCallbacks> = {}
): void {
    if (!callbacks.handleConfirmInterrupt || !callbacks.handleRejectInterrupt) {
        console.warn('Interrupt message needs confirm/reject callbacks.');
        return;
    }

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'jp-llm-ext-interrupt-buttons';
    buttonsContainer.style.marginTop = '12px';
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.gap = '8px';

    // Create confirm button
    const confirmButton = document.createElement('button');
    confirmButton.className = 'jp-llm-ext-confirm-button';
    confirmButton.textContent = 'Confirm';
    // Apply specific styling (can be moved to CSS)
    confirmButton.style.padding = '6px 12px';
    confirmButton.style.background = '#4CAF50';
    confirmButton.style.color = 'white';
    confirmButton.style.border = 'none';
    confirmButton.style.borderRadius = '4px';
    confirmButton.style.cursor = 'pointer';
    confirmButton.style.fontWeight = 'bold';

    // Create reject button
    const rejectButton = document.createElement('button');
    rejectButton.className = 'jp-llm-ext-reject-button';
    rejectButton.textContent = 'Reject';
    // Apply specific styling (can be moved to CSS)
    rejectButton.style.padding = '6px 12px';
    rejectButton.style.background = '#F44336';
    rejectButton.style.color = 'white';
    rejectButton.style.border = 'none';
    rejectButton.style.borderRadius = '4px';
    rejectButton.style.cursor = 'pointer';
    rejectButton.style.fontWeight = 'bold';

    // Add event listeners
    confirmButton.addEventListener('click', () => {
        confirmButton.disabled = true;
        rejectButton.disabled = true;
        confirmButton.style.opacity = '0.5';
        rejectButton.style.opacity = '0.5';
        callbacks.handleConfirmInterrupt!();
    });

    rejectButton.addEventListener('click', () => {
        confirmButton.disabled = true;
        rejectButton.disabled = true;
        confirmButton.style.opacity = '0.5';
        rejectButton.style.opacity = '0.5';
        callbacks.handleRejectInterrupt!();
    });

    // Add buttons to container and container to message
    buttonsContainer.appendChild(confirmButton);
    buttonsContainer.appendChild(rejectButton);
    container.appendChild(buttonsContainer);
}

/**
 * Adds overall action buttons (Copy, Add to Cell) to a bot message container.
 *
 * @param messageDiv The main div container for the bot message.
 * @param messageText The raw text content of the message.
 * @param callbacks Callbacks for actions like copy message, add to cell.
 */
function addBotMessageActions(
    messageDiv: HTMLDivElement,
    messageText: string,
    callbacks: Partial<MessageRendererCallbacks> = {}
): void {
    // Only add actions if corresponding callbacks are provided
    if (!callbacks.copyMessageToClipboard && !callbacks.addMessageToCell) {
        return;
    }

    console.log('Adding action buttons to bot message'); // Keep debug log for now

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'jp-llm-ext-message-actions';
    // actionsDiv.style.display = 'flex'; // Ensure display via CSS if needed

    // Copy Message button
    if (callbacks.copyMessageToClipboard && callbacks.showCopyFeedback) {
        const copyButton = document.createElement('button');
        copyButton.className = 'jp-llm-ext-message-action-button';
        copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
        copyButton.title = 'Copy message to clipboard';
        const feedbackCb = () => callbacks.showCopyFeedback!(copyButton);
        copyButton.addEventListener('click', (event) => {
            event.stopPropagation();
            callbacks.copyMessageToClipboard!(messageText, feedbackCb);
        });
        actionsDiv.appendChild(copyButton);
    }

    // Add to Cell button
    if (callbacks.addMessageToCell) {
        const addToButton = document.createElement('button');
        addToButton.className = 'jp-llm-ext-message-action-button';
        addToButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M12 11v6"></path><path d="M9 14h6"></path></svg>';
        addToButton.title = 'Add message to current cell';
        addToButton.addEventListener('click', (event) => {
            event.stopPropagation();
            callbacks.addMessageToCell!(messageText);
        });
        actionsDiv.appendChild(addToButton);
    }

    // Append the actions container if it has any buttons
    if (actionsDiv.hasChildNodes()) {
        messageDiv.appendChild(actionsDiv);
        console.log('Action buttons added to bot message:', actionsDiv); // Keep debug log
    }
}

// Potential future additions:
// - renderErrorMessage
// - renderSystemMessage
// - A main renderMessage function that delegates based on type? 