"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRenderer = void 0;
exports.renderUserMessage = renderUserMessage;
exports.renderBotMessage = renderBotMessage;
exports.renderBotMessageStreamingStart = renderBotMessageStreamingStart;
exports.renderBotMessageStreamingUpdate = renderBotMessageStreamingUpdate;
exports.renderBotMessageFinal = renderBotMessageFinal;
exports.renderReferenceWidgetInline = renderReferenceWidgetInline;
const marked_1 = require("marked");
const dompurify_1 = __importDefault(require("dompurify"));
// import hljs from 'highlight.js'; // Removed unused import
const dom_elements_1 = require("./dom-elements");
const globals_1 = require("../core/globals"); // Import globals
// Removed unused import block for clipboard utils (used via callbacks)
// import { copyToClipboard, copyImageToClipboard, copyMessageToClipboard } from '../utils/clipboard';
// Removed unused import (used via callbacks)
// import { addMessageToCell } from '../utils/notebook-integration';
const highlighting_1 = require("../utils/highlighting");
const markdown_config_1 = require("../utils/markdown-config");
/**
 * Base function to create a message container div.
 */
function createMessageDiv(sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'user' ? 'jp-llm-ext-user-message' : 'jp-llm-ext-bot-message';
    return messageDiv;
}
/**
 * Renders a user message.
 */
function renderUserMessage(text, options = {}, callbacks = {}) {
    console.log(`[renderUserMessage] Rendering with isMarkdown: ${options.isMarkdown}, text: "${text}"`);
    const messageDiv = createMessageDiv('user');
    if (options.isMarkdown) {
        // Use 'markdown-content' class for consistent styling
        const contentDiv = document.createElement('div');
        contentDiv.className = 'markdown-content';
        try {
            // Preprocess, parse, and sanitize like in bot messages
            const processedText = (0, markdown_config_1.preprocessMarkdown)(text);
            const rawHtml = marked_1.marked.parse(processedText);
            const sanitizedHtml = dompurify_1.default.sanitize(rawHtml);
            contentDiv.innerHTML = sanitizedHtml;
            // Add markdown indicator (similar to bot messages)
            const markdownIndicator = document.createElement('div');
            markdownIndicator.textContent = "MD";
            markdownIndicator.className = 'markdown-indicator';
            messageDiv.appendChild(markdownIndicator);
            // Enhance code blocks if user messages can contain them
            const codeBlocks = contentDiv.querySelectorAll('pre code');
            codeBlocks.forEach(block => {
                // Pass only relevant callbacks if needed for user code blocks
                enhanceCodeBlock(block, callbacks);
            });
        }
        catch (error) {
            console.error('Failed to render user markdown:', error);
            // Fallback to plain text if Markdown rendering fails
            contentDiv.textContent = text;
        }
        messageDiv.appendChild(contentDiv);
    }
    else {
        // Non-Markdown user message (plain text)
        // Replace simple textContent assignment with ref-aware rendering
        // messageDiv.textContent = text;
        renderMessageContentWithRefs(messageDiv, text, callbacks);
    }
    return messageDiv;
}
/**
 * NEW: Renders message content, replacing @references with widgets.
 */
function renderMessageContentWithRefs(container, text, callbacks) {
    // --- DEBUG LOG --- 
    console.log('[renderMessageContentWithRefs] Processing text:', JSON.stringify(text)); // Log exact text
    // --- END DEBUG LOG ---
    // Regex to find @file, @dir, @Cell, @code references (with optional surrounding whitespace)
    const refRegex = /\s*(@(file|dir|Cell|code)\[([^\]]+?)\])\s*/g;
    let lastIndex = 0;
    let match;
    // Reset regex state just in case
    refRegex.lastIndex = 0;
    while ((match = refRegex.exec(text)) !== null) {
        // Append text before the match
        if (match.index > lastIndex) {
            container.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
        }
        // Process the matched reference
        const fullMatchWithWhitespace = match[0]; // Includes potential whitespace
        const fullMatch = match[1]; // The actual @type[value] part
        const type = match[2];
        const value = match[3];
        try {
            const widget = createRefWidget(type, value, fullMatch, callbacks); // Pass the clean match
            container.appendChild(widget);
        }
        catch (error) {
            console.error(`Failed to create widget for reference: ${fullMatch}`, error);
            // Fallback: append the original reference text (with potential whitespace)
            container.appendChild(document.createTextNode(fullMatchWithWhitespace));
        }
        lastIndex = refRegex.lastIndex;
    }
    // Append any remaining text after the last match
    if (lastIndex < text.length) {
        container.appendChild(document.createTextNode(text.substring(lastIndex)));
    }
}
/**
 * NEW: Creates a reference widget span.
 */
function createRefWidget(type, value, originalRefText, // The full @type[value] string
callbacks) {
    const widget = document.createElement('span');
    widget.className = `jp-llm-ext-ref-widget ref-${type.toLowerCase()}`;
    widget.setAttribute('contenteditable', 'false');
    widget.dataset.refText = originalRefText; // Store the original reference
    let displayText = '';
    let titleText = originalRefText; // Default tooltip
    switch (type) {
        case 'file':
            displayText = value.split(/[\\/]/).pop() || value; // Extract filename
            titleText = `File: ${value}`;
            break;
        case 'dir':
            displayText = value.split(/[\\/]/).pop() || value || '/'; // Extract dirname, handle root
            titleText = `Directory: ${value}`;
            break;
        case 'Cell': {
            const cellIndex = parseInt(value) - 1; // Convert back to 0-based index
            const notebookContext = callbacks.getCurrentNotebookContext ? callbacks.getCurrentNotebookContext() : undefined;
            // --- DEBUG LOG --- 
            console.log(`[createRefWidget @Cell] Input Value: ${value}, Parsed Index: ${cellIndex}, Notebook Context:`, notebookContext);
            // --- END DEBUG LOG --- 
            const notebookName = (notebookContext === null || notebookContext === void 0 ? void 0 : notebookContext.name) || 'notebook';
            let cellTypeChar = '?';
            if (notebookContext && globals_1.globals.notebookTracker) {
                const currentNotebookPanel = globals_1.globals.notebookTracker.find(widget => widget.context.path === notebookContext.path);
                if (currentNotebookPanel && currentNotebookPanel.model) {
                    const cellModel = currentNotebookPanel.model.cells.get(cellIndex);
                    if (cellModel) {
                        cellTypeChar = cellModel.type === 'markdown' ? 'M' : 'C';
                    }
                }
            }
            displayText = `${notebookName}-${cellTypeChar}-${value}`; // value is 1-based index
            titleText = `Cell ${value} (${cellTypeChar === 'M' ? 'Markdown' : 'Code'}) in ${notebookName}`;
            break;
        }
        case 'code': {
            const refId = value;
            const refData = callbacks.getCodeRefData ? callbacks.getCodeRefData(refId) : undefined;
            // --- DEBUG LOG --- 
            console.log(`[createRefWidget @code] Input Value (refId): ${refId}, Ref Data Found:`, refData);
            // --- END DEBUG LOG --- 
            if (refData) {
                // Construct display text using start and end lines
                const startLine = refData.lineNumber;
                const endLine = refData.lineEndNumber;
                const linePart = startLine === endLine ? `${startLine}` : `${startLine}_${endLine}`;
                displayText = `${refData.notebookName}-${refData.cellIndex + 1}-${linePart}`;
                // Update title text as well
                const titleLinePart = startLine === endLine ? `Line ${startLine}` : `Lines ${startLine}-${endLine}`;
                titleText = `Code Reference: ${refData.notebookName}, Cell ${refData.cellIndex + 1}, ${titleLinePart}`;
            }
            else {
                displayText = `code-ref-${refId}`; // Fallback display
                titleText = `Code Reference ID: ${refId} (Data not found)`;
            }
            break;
        }
    }
    widget.textContent = displayText;
    widget.title = titleText; // Add tooltip
    return widget;
}
/**
 * NEW: Recursively finds and replaces @references within text nodes of an element.
 */
function renderRefsInElement(element, callbacks) {
    // Use the same updated regex here
    const refRegex = /\s*(@(file|dir|Cell|code)\[([^\]]+?)\])\s*/g;
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
    let node;
    const nodesToProcess = [];
    while ((node = walker.nextNode())) {
        if (node instanceof Text &&
            node.textContent &&
            !(node.parentElement && node.parentElement.closest('.jp-llm-ext-ref-widget'))) {
            // Test with the specific regex before adding
            refRegex.lastIndex = 0; // Reset before test
            if (refRegex.test(node.textContent)) {
                nodesToProcess.push(node);
            }
        }
    }
    // Now, process the collected text nodes
    nodesToProcess.forEach(textNode => {
        const parent = textNode.parentNode;
        if (!parent)
            return;
        const text = textNode.textContent || '';
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        let match;
        refRegex.lastIndex = 0; // Reset regex state for each node
        while ((match = refRegex.exec(text)) !== null) {
            // Append text before the match
            if (match.index > lastIndex) {
                fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
            }
            // Process the matched reference
            const fullMatchWithWhitespace = match[0];
            const fullMatch = match[1];
            const type = match[2];
            const value = match[3];
            try {
                const widget = createRefWidget(type, value, fullMatch, callbacks);
                fragment.appendChild(widget);
            }
            catch (error) {
                console.error(`Failed to create widget for reference: ${fullMatch}`, error);
                fragment.appendChild(document.createTextNode(fullMatchWithWhitespace)); // Fallback
            }
            lastIndex = refRegex.lastIndex;
        }
        // Append any remaining text after the last match
        if (lastIndex < text.length) {
            fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
        }
        // Replace the original text node with the fragment
        parent.replaceChild(fragment, textNode);
    });
}
/**
 * Renders a bot message (text, markdown, images, code blocks).
 */
function renderBotMessage(text, options = { isMarkdown: true }, callbacks = {}) {
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
    }
    else if (options.isMarkdown) {
        // Render as markdown (logic from addMessage)
        const markdownIndicator = document.createElement('div');
        markdownIndicator.textContent = "MD";
        markdownIndicator.className = 'markdown-indicator';
        messageDiv.appendChild(markdownIndicator);
        const contentDiv = document.createElement('div');
        contentDiv.className = 'markdown-content';
        try {
            const processedText = (0, markdown_config_1.preprocessMarkdown)(text);
            const rawHtml = marked_1.marked.parse(processedText);
            const sanitizedHtml = dompurify_1.default.sanitize(rawHtml);
            contentDiv.innerHTML = sanitizedHtml;
            // --- NEW: Render references within the sanitized HTML --- 
            renderRefsInElement(contentDiv, callbacks);
            // --- End NEW ---
            // Enhance code blocks after setting innerHTML and rendering refs
            const codeBlocks = contentDiv.querySelectorAll('pre code');
            codeBlocks.forEach(block => {
                enhanceCodeBlock(block, callbacks);
            });
            // Check for and render interrupt buttons
            const isInterrupt = text.startsWith('**[INTERRUPT]**');
            if (isInterrupt) {
                renderInterruptButtons(contentDiv, callbacks);
            }
        }
        catch (error) {
            contentDiv.textContent = text; // Fallback to plain text
            console.error('Failed to render markdown:', error);
        }
        messageDiv.appendChild(contentDiv);
        // Add overall message action buttons AFTER content is added
        addBotMessageActions(messageDiv, text, callbacks);
    }
    else {
        // Render as plain text
        messageDiv.textContent = text;
        // Add overall message action buttons even for plain text bot messages
        addBotMessageActions(messageDiv, text, callbacks);
    }
    return messageDiv;
}
// Define createMessageWrapper based on createMessageDiv
function createMessageWrapper(sender) {
    return createMessageDiv(sender);
}
// --- More specific rendering functions or helpers can be added below ---
/**
 * Renders an image message with action buttons inside a container.
 *
 * @param container The parent HTML element to append the image message to.
 * @param imageUrl The full URL of the image to render.
 * @param callbacks Callbacks for actions like copy image, add path.
 */
function renderImageMessage(container, imageUrl, callbacks = {}) {
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
    imgActionsDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.6)'; // Added slight background for visibility
    imgActionsDiv.style.borderRadius = '4px';
    imgActionsDiv.style.padding = '4px';
    // Copy image button (using callback)
    if (callbacks.copyImageToClipboard && callbacks.showCopyFeedback) {
        const copyImgBtn = document.createElement('button');
        copyImgBtn.className = 'jp-llm-ext-image-action-button';
        copyImgBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
        copyImgBtn.title = 'Copy image to clipboard';
        const feedbackCb = () => callbacks.showCopyFeedback(copyImgBtn);
        copyImgBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            callbacks.copyImageToClipboard(imageUrl, feedbackCb);
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
            callbacks.addMessageToCell(imageUrl);
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
function renderBotMessageStreamingStart() {
    const wrapper = createMessageWrapper('bot');
    const markdownIndicator = (0, dom_elements_1.createDiv)({
        text: 'MD',
        classes: 'markdown-indicator'
    });
    wrapper.appendChild(markdownIndicator);
    const streamingDiv = (0, dom_elements_1.createDiv)({
        classes: 'streaming-content',
        style: {
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: '0.9em'
        }
    });
    wrapper.appendChild(streamingDiv);
    const contentDiv = (0, dom_elements_1.createDiv)({
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
function renderBotMessageStreamingUpdate(streamingDiv, chunk) {
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
function renderBotMessageFinal(contentDiv, streamingDiv, completeResponse, options = {}, callbacks = {}) {
    // Hide streaming div, show final content div
    streamingDiv.style.display = 'none';
    contentDiv.style.display = 'block';
    // Consolidate callbacks access
    const effectiveCallbacks = Object.assign(Object.assign({}, options), callbacks);
    // --- Image Handling ---
    const isImageUrl = completeResponse.trim().startsWith('/images/') &&
        (completeResponse.trim().endsWith('.png') ||
            completeResponse.trim().endsWith('.jpg') ||
            completeResponse.trim().endsWith('.jpeg') ||
            completeResponse.trim().endsWith('.gif'));
    if (isImageUrl) {
        const fullImageUrl = `http://127.0.0.1:8000${completeResponse.trim()}`; // TODO: Make base URL configurable
        renderImageMessage(contentDiv, fullImageUrl, effectiveCallbacks);
    }
    else {
        // --- Markdown & Code Block Handling ---
        try {
            const processedText = (0, markdown_config_1.preprocessMarkdown)(completeResponse);
            const rawHtml = marked_1.marked.parse(processedText);
            const sanitizedHtml = dompurify_1.default.sanitize(rawHtml);
            contentDiv.innerHTML = sanitizedHtml;
            // --- NEW: Render references within the sanitized HTML --- 
            renderRefsInElement(contentDiv, effectiveCallbacks);
            // --- End NEW ---
            // --- Interrupt Handling ---
            const isInterrupt = completeResponse.startsWith('**[INTERRUPT]**');
            if (isInterrupt) {
                renderInterruptButtons(contentDiv, effectiveCallbacks);
            }
            // --- Code Block Enhancements ---
            const codeBlocks = contentDiv.querySelectorAll('pre code');
            codeBlocks.forEach(block => {
                enhanceCodeBlock(block, effectiveCallbacks);
            });
        }
        catch (error) {
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
function enhanceCodeBlock(codeBlockElement, callbacks = {}) {
    var _a;
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
    const language = (0, highlighting_1.detectLanguage)(codeContent); // Use imported util
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
        codeBlockElement.innerHTML = (0, highlighting_1.highlightCode)(codeContent, language);
    }
    catch (error) {
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
        const feedbackCb = () => callbacks.showCopyFeedback(copyButton);
        copyButton.addEventListener('click', (event) => {
            event.stopPropagation();
            callbacks.copyToClipboard(codeContent, feedbackCb);
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
            callbacks.addMessageToCell(codeContent);
        });
        actionsDiv.appendChild(addToButton);
    }
    // Add the actions to the header
    if (actionsDiv.hasChildNodes()) {
        codeHeader.appendChild(actionsDiv);
    }
    // Insert header before the <pre> element if it has content
    if (codeHeader.hasChildNodes()) {
        const parentElement = preElement.parentElement;
        if (parentElement) {
            parentElement.insertBefore(codeHeader, preElement);
        }
        else {
            // Fallback: Try parentNode if parentElement is null
            (_a = preElement.parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(codeHeader, preElement);
        }
    }
}
/**
 * Renders Confirm/Reject buttons for an interrupt message.
 *
 * @param container The parent HTML element (message content div) to append buttons to.
 * @param callbacks Callbacks for confirm and reject actions.
 */
function renderInterruptButtons(container, callbacks = {}) {
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
        callbacks.handleConfirmInterrupt();
    });
    rejectButton.addEventListener('click', () => {
        confirmButton.disabled = true;
        rejectButton.disabled = true;
        confirmButton.style.opacity = '0.5';
        rejectButton.style.opacity = '0.5';
        callbacks.handleRejectInterrupt();
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
function addBotMessageActions(messageDiv, messageText, callbacks = {}) {
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
        const feedbackCb = () => callbacks.showCopyFeedback(copyButton);
        copyButton.addEventListener('click', (event) => {
            event.stopPropagation();
            callbacks.copyMessageToClipboard(messageText, feedbackCb);
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
            callbacks.addMessageToCell(messageText);
        });
        actionsDiv.appendChild(addToButton);
    }
    // Append the actions container if it has any buttons
    if (actionsDiv.hasChildNodes()) {
        messageDiv.appendChild(actionsDiv);
        console.log('Action buttons added to bot message:', actionsDiv); // Keep debug log
    }
}
/**
 * Renders a reference widget as an HTMLElement suitable for inline display
 * (e.g., within the input field or a message).
 *
 * @param type - The type of reference ('code', 'cell', 'file', 'dir').
 * @param data - The data associated with the reference (CodeRefData, path string, etc.).
 * @param refId - Optional reference ID (e.g., 'ref-1') to store on the element.
 * @returns An HTMLElement representing the widget.
 */
function renderReferenceWidgetInline(type, data, // string for file/dir paths
placeholder, // ADDED: The original placeholder text (e.g., @code[ref-1])
refId // Keep refId separate for map lookups if needed
) {
    const widget = document.createElement('span');
    widget.classList.add('jp-llm-ext-ref-widget', `jp-llm-ext-ref-${type}`);
    widget.contentEditable = 'false'; // Make the widget non-editable itself
    widget.style.display = 'inline-block'; // Ensure it behaves like a block for styling/selection
    widget.style.cursor = 'pointer'; // Change cursor to pointer to indicate clickability
    widget.dataset.placeholder = placeholder; // ADDED: Store the placeholder
    const displayTextSpan = document.createElement('span'); // Span for the main text
    const previewDiv = document.createElement('div'); // Div for the preview content
    previewDiv.className = 'jp-llm-ext-ref-preview';
    previewDiv.style.display = 'none'; // Initially hidden
    previewDiv.style.border = '1px solid var(--jp-border-color1)';
    previewDiv.style.padding = '4px';
    previewDiv.style.marginTop = '2px';
    previewDiv.style.fontSize = '0.9em';
    previewDiv.style.backgroundColor = 'var(--jp-layout-color0)';
    previewDiv.style.whiteSpace = 'pre-wrap'; // Preserve line breaks
    previewDiv.style.fontFamily = 'monospace';
    previewDiv.style.cursor = 'text'; // Keep text cursor for preview
    let displayText = '';
    let baseTitle = ''; // Tooltip for the main widget text, without preview
    let previewContent = '';
    switch (type) {
        case 'code':
        case 'cell': { // Combine logic for code and cell previews
            const refData = data;
            const isCode = type === 'code';
            const lines = refData.lineNumber === refData.lineEndNumber
                ? `L${refData.lineNumber}`
                : `L${refData.lineNumber}-${refData.lineEndNumber}`;
            displayText = isCode
                ? `@code (${refData.notebookName}:${lines})`
                : `@Cell (${refData.notebookName}:Cell ${refData.cellIndex + 1})`;
            baseTitle = isCode
                ? `Code: ${refData.notebookName}, Cell ${refData.cellIndex + 1}, ${lines}`
                : `Cell: ${refData.notebookName}, Index ${refData.cellIndex + 1}`;
            if (refId)
                widget.dataset.refId = refId;
            widget.dataset.notebookName = refData.notebookName;
            widget.dataset.cellIndex = String(refData.cellIndex);
            widget.dataset.content = refData.content; // Store content
            if (isCode) {
                widget.dataset.startLine = String(refData.lineNumber);
                widget.dataset.endLine = String(refData.lineEndNumber);
            }
            // Prepare preview content
            if (refData.content) {
                const contentLines = refData.content.split('\n');
                previewContent = contentLines.slice(0, 3).join('\n');
                if (contentLines.length > 3) {
                    previewContent += '\n...';
                }
            }
            break;
        }
        case 'file':
            const filePath = data;
            const fileName = filePath.split(/[\/\\]/).pop() || filePath; // Handle windows paths
            displayText = `@file (${fileName})`;
            baseTitle = `File: ${filePath}`; // Tooltip shows full path
            widget.dataset.path = filePath; // Store full path
            // No preview for files/dirs
            widget.style.cursor = 'default'; // No expansion for file/dir
            break;
        case 'dir':
            const dirPath = data;
            const dirName = dirPath.split(/[\/\\]/).pop() || dirPath || '/'; // Handle windows paths
            displayText = `@dir (${dirName})`;
            baseTitle = `Directory: ${dirPath}`; // Tooltip shows full path
            widget.dataset.path = dirPath; // Store full path
            // No preview for files/dirs
            widget.style.cursor = 'default'; // No expansion for file/dir
            break;
        default:
            displayText = '@unknown-ref';
            baseTitle = 'Unknown Reference';
            widget.style.cursor = 'default';
    }
    displayTextSpan.textContent = displayText;
    widget.title = baseTitle; // Set base tooltip for the main part
    widget.appendChild(displayTextSpan);
    // Add preview div and click listener only if there's preview content
    if (previewContent) {
        previewDiv.textContent = previewContent;
        widget.appendChild(previewDiv);
        // Add click listener to the main widget span to toggle preview
        widget.addEventListener('click', (event) => {
            // Prevent the click from propagating to the input div listener if needed
            event.stopPropagation();
            const isHidden = previewDiv.style.display === 'none';
            previewDiv.style.display = isHidden ? 'block' : 'none';
            // Optional: Change an indicator icon here
        });
        // Prevent clicks *inside* the preview div from closing it
        previewDiv.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    }
    else {
        // Ensure cursor remains default if no preview/expansion
        widget.style.cursor = 'default';
    }
    return widget;
}
// Potential future additions:
// - renderErrorMessage
// - renderSystemMessage
// - A main renderMessage function that delegates based on type? 
/**
 * Handles rendering individual messages (user, bot, system) into HTML elements.
 */
class MessageRenderer {
    // private callbacks: MessageRendererCallbacks; // Removed unused member
    // private uiManager: UIManager; // Might not be needed directly if callbacks handle UI updates
    constructor( /* callbacks: MessageRendererCallbacks */ /* , uiManager: UIManager */) {
        // this.callbacks = callbacks; // Removed unused assignment
        // this.uiManager = uiManager;
    }
}
exports.MessageRenderer = MessageRenderer;
