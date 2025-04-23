# Documentation for `jupyter-lab-extension/src/handlers/history-handler.ts`

This file defines the `HistoryHandler` class, responsible for managing the chat history panel's UI and logic.

## Overview

The `HistoryHandler` coordinates interactions related to viewing and managing past chat sessions. It interacts with the `ChatState` to get historical data and with the `UIManager` (or directly with DOM elements) to display the history list and load selected chats into the main view.

## Key Components

### Class Definition

```typescript
import { ChatState, ChatHistoryItem } from '../state/chat-state';
import { UIManager } from '../ui/ui-manager'; // Or specific elements/renderer
// Potentially import MessageRenderer if rendering messages directly

export interface HistoryHandlerCallbacks {
    loadChatMessages: (messages: ChatMessage[]) => void; // Callback to render messages
    updateChatTitle: (title: string) => void; // Callback to update main title
}

export class HistoryHandler {
    private chatState: ChatState;
    private uiManager: UIManager; // Or specific elements
    private callbacks: HistoryHandlerCallbacks;
    private historyContainer: HTMLElement; // Container for the history list
    private isVisible: boolean = false;

    constructor(
        chatState: ChatState, 
        uiManager: UIManager, // Or specific elements
        callbacks: HistoryHandlerCallbacks,
        historyContainer: HTMLElement
    ) {
        this.chatState = chatState;
        this.uiManager = uiManager;
        this.callbacks = callbacks;
        this.historyContainer = historyContainer;
    }

    // Method to toggle history panel visibility
    toggleHistoryView(): void {
        this.isVisible = !this.isVisible;
        // Logic to show/hide historyContainer using uiManager or direct style manipulation
        // Example:
        // this.uiManager.setHistoryPanelVisibility(this.isVisible);
        this.historyContainer.style.display = this.isVisible ? 'block' : 'none';
        
        if (this.isVisible) {
            this.renderChatHistory();
        }
    }

    // Method to render the list of chats in the history panel
    renderChatHistory(): void {
        this.historyContainer.innerHTML = ''; // Clear previous list
        const history = this.chatState.getChatHistory();
        
        if (history.length === 0) {
            this.historyContainer.textContent = 'No chat history yet.';
            return;
        }

        const ul = document.createElement('ul');
        ul.classList.add('jp-llm-ext-history-list'); // Add CSS class

        history.forEach(chatItem => {
            const li = document.createElement('li');
            li.textContent = chatItem.title || `Chat ${chatItem.id.substring(0, 6)}`;
            li.dataset.chatId = chatItem.id;
            li.classList.add('jp-llm-ext-history-item'); // Add CSS class
            
            // Add click listener to load the chat
            li.addEventListener('click', () => this.loadChat(chatItem.id));
            
            // Highlight the currently active chat
            if (chatItem.id === this.chatState.getCurrentChatId()) {
                li.classList.add('jp-llm-ext-history-item-active');
            }

            ul.appendChild(li);
        });

        this.historyContainer.appendChild(ul);
    }

    // Method to load a specific chat's messages into the main view
    loadChat(chatId: string): void {
        const chatItem = this.chatState.getChatById(chatId);
        if (!chatItem) {
            console.error(`Chat with ID ${chatId} not found.`);
            return;
        }

        // Set the loaded chat as the current one in the state
        this.chatState.setCurrentChatId(chatId);

        // Use callbacks to update the main UI
        this.callbacks.loadChatMessages(chatItem.messages);
        this.callbacks.updateChatTitle(chatItem.title || `Chat ${chatItem.id.substring(0, 6)}`);

        // Hide the history panel after selection (optional behavior)
        if (this.isVisible) {
             this.toggleHistoryView();
        }
        
        // Optionally re-render history to update active item styling
        // this.renderChatHistory(); // Be careful of infinite loops if called inside toggleHistoryView
    }
    
    // Method called when a new chat is created elsewhere
    handleNewChatCreated(): void {
        // If history panel is visible, re-render it to show the new chat (and update active state)
        if (this.isVisible) {
            this.renderChatHistory();
        }
    }
}
```

### Constructor Logic

1.  **Store Dependencies:** Saves references to `ChatState`, `UIManager` (or specific elements), `HistoryHandlerCallbacks`, and the `historyContainer` DOM element.

### Key Methods

-   **`toggleHistoryView()`:**
    *   Flips the `isVisible` state.
    *   Calls methods (likely on `UIManager` or directly manipulates `historyContainer.style.display`) to show or hide the history panel.
    *   If the panel is becoming visible, it calls `renderChatHistory()` to populate it.
-   **`renderChatHistory()`:**
    *   Clears the current content of the `historyContainer`.
    *   Retrieves the full chat history array from `ChatState`.
    *   If empty, displays a message.
    *   If not empty, creates a `<ul>` element.
    *   Iterates through each `ChatHistoryItem`:
        *   Creates an `<li>` element displaying the chat title (or a default based on ID).
        *   Adds a `data-chat-id` attribute.
        *   Adds a CSS class for styling.
        *   Attaches a click event listener that calls `loadChat(chatItem.id)`.
        *   Adds an 'active' class if the item corresponds to the currently active chat ID in `ChatState`.
        *   Appends the `<li>` to the `<ul>`.
    *   Appends the `<ul>` to the `historyContainer`.
-   **`loadChat(chatId)`:**
    *   Retrieves the specified `ChatHistoryItem` from `ChatState`.
    *   Sets the `currentChatId` in `ChatState` to the loaded chat's ID.
    *   Uses the provided `callbacks` (`loadChatMessages`, `updateChatTitle`) to instruct the main UI (likely managed by `UIManager` or `SimpleSidebarWidget`) to display the messages and title of the selected chat.
    *   Optionally hides the history panel after a selection is made.
-   **`handleNewChatCreated()`:**
    *   Intended to be called by `SimpleSidebarWidget` or `ChatState` when a new chat is initiated.
    *   If the history panel is currently visible, it re-renders the list to include the newly created chat and correctly highlight it as active.

### Callbacks Interface (`HistoryHandlerCallbacks`)

-   Defines the functions that the `HistoryHandler` needs to call to update the main chat area when a historical chat is loaded:
    -   `loadChatMessages`: Takes an array of `ChatMessage` and triggers the rendering of these messages in the main message container.
    -   `updateChatTitle`: Takes a string and updates the title displayed in the main chat view's title bar.

## Role in the Application

The `HistoryHandler` isolates the logic for the chat history feature. It acts as a controller for the history side panel, fetching data from the state, rendering the list UI, handling user clicks on history items, and communicating back to the main widget via callbacks to load the selected chat content. 