"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildLayout = buildLayout;
const dom_elements_1 = require("./dom-elements");
/**
 * Builds the main HTML structure for the sidebar widget.
 *
 * @param callbacks - An object containing callback functions for various UI interactions.
 * @returns An object containing the main widget HTMLElement and references to key interactive elements.
 */
function buildLayout(callbacks = {}) {
    // --- Main Content Wrapper ---
    const mainElement = (0, dom_elements_1.createDiv)({
        classes: 'jp-llm-ext-content-wrapper'
    });
    // --- Title Bar ---
    const titleContainer = (0, dom_elements_1.createDiv)({ classes: 'jp-llm-ext-title-container' });
    const titleInput = (0, dom_elements_1.createInputElement)({
        id: 'chat-title-input',
        classes: 'chat-title-input',
        attributes: { type: 'text', placeholder: 'Chat title', value: 'New Chat' }
    });
    if (callbacks.onTitleChange) {
        titleInput.addEventListener('change', () => callbacks.onTitleChange(titleInput.value));
    }
    titleContainer.appendChild(titleInput);
    // --- Message & History Containers ---
    const messageContainer = (0, dom_elements_1.createDiv)({ classes: 'jp-llm-ext-message-container' });
    const historyContainer = (0, dom_elements_1.createDiv)({
        classes: 'jp-llm-ext-history-container',
        style: { display: 'none' } // Hidden by default
    });
    // --- Notes Container ---
    const notesContainer = (0, dom_elements_1.createDiv)({ classes: 'jp-llm-ext-notes-container', style: { display: 'none' } });
    // --- Bottom Bar Area ---
    const bottomBarContainer = (0, dom_elements_1.createDiv)({ classes: 'jp-llm-ext-bottom-bar-container' });
    // Row 1: Controls (Markdown Toggle, @, Expand, Settings)
    const controlsRow = (0, dom_elements_1.createDiv)({ classes: 'jp-llm-ext-bottom-bar-row jp-llm-ext-controls-row' });
    const controlsContainer = (0, dom_elements_1.createDiv)({ classes: 'jp-llm-ext-controls-container' });
    // Markdown Toggle
    const toggleContainer = (0, dom_elements_1.createDiv)({ classes: 'jp-llm-ext-toggle-container' });
    const markdownToggleButton = (0, dom_elements_1.createInputElement)({
        id: 'markdown-toggle',
        attributes: { type: 'checkbox' }
    });
    const toggleLabel = (0, dom_elements_1.createLabelElement)({
        text: 'Markdown mode',
        htmlFor: 'markdown-toggle'
    });
    if (callbacks.onMarkdownToggleChange) {
        markdownToggleButton.addEventListener('change', () => {
            callbacks.onMarkdownToggleChange(markdownToggleButton.checked);
        });
    }
    toggleContainer.appendChild(markdownToggleButton);
    toggleContainer.appendChild(toggleLabel);
    // Action Buttons (@, Expand, Settings)
    const actionButtonsContainer = (0, dom_elements_1.createDiv)({ classes: 'jp-llm-ext-action-buttons-container' });
    const atButton = (0, dom_elements_1.createButton)({ text: '@', attributes: { title: 'Browse cells, code, files, and more' }, classes: 'jp-Button jp-llm-ext-action-button' });
    if (callbacks.onAtButtonClick) {
        atButton.addEventListener('click', callbacks.onAtButtonClick);
    }
    const expandButton = (0, dom_elements_1.createButton)({ text: '⤢', attributes: { title: 'Expand input' }, classes: 'jp-Button jp-llm-ext-action-button' });
    if (callbacks.onExpandToggleClick) {
        expandButton.addEventListener('click', () => callbacks.onExpandToggleClick(expandButton));
    }
    const settingsButton = (0, dom_elements_1.createButton)({ text: '⚙️', attributes: { title: 'Settings' }, classes: 'jp-Button jp-llm-ext-action-button' });
    if (callbacks.onSettingsClick) {
        settingsButton.addEventListener('click', callbacks.onSettingsClick);
    }
    actionButtonsContainer.appendChild(atButton);
    actionButtonsContainer.appendChild(expandButton);
    actionButtonsContainer.appendChild(settingsButton);
    controlsContainer.appendChild(toggleContainer);
    controlsContainer.appendChild(actionButtonsContainer);
    controlsRow.appendChild(controlsContainer);
    // Row 2: Input Field
    const inputRow = (0, dom_elements_1.createDiv)({ classes: 'jp-llm-ext-bottom-bar-row jp-llm-ext-input-row' });
    const inputField = (0, dom_elements_1.createDiv)({
        classes: 'jp-llm-ext-input-field',
        attributes: {
            contenteditable: 'true',
            role: 'textbox',
            'aria-multiline': 'true',
            'data-placeholder': 'Ask me anything...'
        },
        style: { minHeight: '20px', overflowY: 'hidden' }
    });
    if (callbacks.onInputFieldKeyPress) {
        inputField.addEventListener('keypress', callbacks.onInputFieldKeyPress);
    }
    if (callbacks.onInputFieldValueChange) {
        inputField.addEventListener('input', () => callbacks.onInputFieldValueChange(inputField.textContent || ''));
    }
    inputRow.appendChild(inputField);
    // Row 3: Main Buttons (Send, New Chat, History)
    const buttonsRow = (0, dom_elements_1.createDiv)({ classes: 'jp-llm-ext-bottom-bar-row jp-llm-ext-buttons-row' });
    const sendButton = (0, dom_elements_1.createButton)({
        text: 'Send',
        classes: 'jp-Button jp-llm-ext-send-button'
    });
    if (callbacks.onSendMessageClick) {
        sendButton.addEventListener('click', callbacks.onSendMessageClick);
    }
    const newChatButton = (0, dom_elements_1.createButton)({
        text: '+ New Chat',
        attributes: { title: 'Start a new chat' },
        classes: 'jp-Button jp-llm-ext-action-button'
    });
    if (callbacks.onNewChatClick) {
        newChatButton.addEventListener('click', callbacks.onNewChatClick);
    }
    const historyButton = (0, dom_elements_1.createButton)({
        text: 'History',
        attributes: { title: 'View chat history' },
        classes: 'jp-Button jp-llm-ext-action-button'
    });
    if (callbacks.onHistoryToggleClick) {
        historyButton.addEventListener('click', callbacks.onHistoryToggleClick);
    }
    // Notes button
    const notesButton = (0, dom_elements_1.createButton)({
        text: 'Notes',
        attributes: { title: 'View notes' },
        classes: 'jp-Button jp-llm-ext-action-button'
    });
    if (callbacks.onNotesClick) {
        notesButton.addEventListener('click', callbacks.onNotesClick);
    }
    buttonsRow.appendChild(sendButton);
    buttonsRow.appendChild(newChatButton);
    buttonsRow.appendChild(historyButton);
    buttonsRow.appendChild(notesButton);
    // Assemble Bottom Bar
    bottomBarContainer.appendChild(controlsRow);
    bottomBarContainer.appendChild(inputRow);
    bottomBarContainer.appendChild(buttonsRow);
    // --- Assemble Main Element ---
    mainElement.appendChild(titleContainer);
    mainElement.appendChild(messageContainer);
    mainElement.appendChild(historyContainer);
    mainElement.appendChild(notesContainer);
    mainElement.appendChild(bottomBarContainer);
    return {
        mainElement,
        titleInput,
        messageContainer,
        historyContainer,
        notesContainer,
        inputField,
        bottomBarContainer,
        sendButton,
        newChatButton,
        historyButton,
        notesButton,
        markdownToggleButton,
        expandButton,
        atButton,
        settingsButton
    };
}
