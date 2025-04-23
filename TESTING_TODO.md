# Phase 5: Testing TODO List

This list tracks the progress of testing the refactored Jupyter LLM Extension based on the sub-tasks outlined in the `@refactor-plan`.

## P0: Test Thoroughly

### 1. Build & Launch
- [X] Ensure extension builds without errors (`jlpm build`).
- [X] Launch JupyterLab.
- [X] Verify the LLM sidebar loads without console errors.
- [X] Verify basic UI elements (title bar, input field, send button) are visible.

### 2. Basic Chat Functionality
- [X] Send a simple message.
- [X] Verify user message appears correctly formatted.
- [X] Verify bot response appears.
- [X] Verify streaming updates (if applicable).
- [ ] Verify bot message is correctly formatted.

### 3. New Chat Functionality
- [ ] Click "New Chat" button/icon.
- [ ] Verify chat message area clears.
- [ ] Verify chat title/state indicates a new chat.
- [ ] Send a message in the new chat and verify user/bot messages render correctly.

### 4. Markdown & Code Blocks
- [ ] Send a message containing markdown (e.g., bold, italics, list).
- [ ] Verify markdown renders correctly in both user and bot messages.
- [ ] Send a message containing a code block (e.g., ```python
print("hello")
```).
- [ ] Verify code block renders with correct background/styling.
- [ ] Verify syntax highlighting is applied correctly within the code block.
- [ ] Verify "Copy" button appears on the code block.
- [ ] Click "Copy" button and verify code is copied to clipboard.
- [ ] Verify "Add to Cell" button appears on the code block.
- [ ] Click "Add to Cell" and verify code is added to a new notebook cell.

### 5. Image Rendering
- [ ] Send a message that should trigger an image response (if backend supports).
- [ ] Verify image renders correctly in the chat.
- [ ] Verify "Copy Path" button (or similar) appears for the image.
- [ ] Click "Copy Path" and verify the image source/path is copied.
- [ ] Verify "Add Path to Cell" button (or similar) appears.
- [ ] Click "Add Path to Cell" and verify the path is added to a new notebook cell.

### 6. Interrupt Messages
- [ ] Trigger an interrupt message (e.g., by sending a message while another is processing, if supported).
- [ ] Verify interrupt message appears correctly.
- [ ] Verify "Confirm" and "Reject" (or similar) buttons appear.
- [ ] Test clicking "Confirm" - verify expected behavior (e.g., stop generation).
- [ ] Test clicking "Reject" - verify expected behavior (e.g., continue generation).

### 7. Input Field Functionality
- [ ] Test Markdown toggle button - verify it changes state/appearance.
- [ ] Type long text - verify input field expands vertically.
- [ ] Type `@` symbol - verify the `PopupMenuManager` mention popup appears.
- [ ] Select an item from the `@` popup - verify it's inserted into the input.
- [ ] Trigger code reference insertion (e.g., via `@` or shortcut).
- [ ] Verify code reference widget appears correctly in the input field.

### 8. Keyboard Shortcuts
- [ ] Press `@` key - verify the mention popup appears.
- [ ] Press `Ctrl+L` (or configured shortcut) - verify the code reference selection/insertion process is triggered.
- [ ] Verify shortcut indicator (if implemented) appears when relevant.

### 9. Chat History
- [ ] Create multiple chats (3+).
- [ ] Click "Toggle History" button/icon.
- [ ] Verify history panel appears, showing list of previous chats (e.g., with titles).
- [ ] Click on a chat in the history list.
- [ ] Verify the selected chat messages load correctly in the main chat area.
- [ ] Verify the chat title updates correctly.
- [ ] Click "New Chat" while history is open - verify behavior is correct.
- [ ] Click "Toggle History" again - verify panel closes.

### 10. Settings
- [ ] Click Settings button/icon.
- [ ] Verify settings modal opens.
- [ ] View current settings (API Key, Model, etc.).
- [ ] Change a setting (e.g., update model name).
- [ ] Click "Save".
- [ ] Verify settings modal closes.
- [ ] Verify success toast notification appears.
- [ ] Re-open settings modal - verify the changed setting persisted.
- [ ] Reload JupyterLab entirely.
- [ ] Open the extension and settings modal - verify the setting is still persisted.
- [ ] Test "Cancel" button in settings modal - verify changes are discarded.

### 11. Clipboard Utilities
- [ ] Right-click (or use action button) on a regular text message.
- [ ] Select "Copy" - verify message text is copied.
- [ ] Right-click (or use action button) on a message containing an image.
- [ ] Select "Copy Image" (if available) - verify image is copied (test pasting into an image editor).

### 12. Notebook Integration Utilities
- [ ] Right-click (or use action button) on a regular text message.
- [ ] Select "Add to Cell" - verify message text is added to a new cell.
- *Covered in Code Blocks:* Adding code block content to cell.
- *Covered in Images:* Adding image path to cell.

## P1: Update Imports/Exports
- [ ] Review `src/core/` files for unused/incorrect imports/exports.
- [ ] Review `src/handlers/` files for unused/incorrect imports/exports.
- [ ] Review `src/state/` files for unused/incorrect imports/exports.
- [ ] Review `src/ui/` files for unused/incorrect imports/exports.
- [ ] Review `src/utils/` files for unused/incorrect imports/exports.
- [ ] Review top-level `src/` files (e.g., `index.ts`, `globals.ts`) for unused/incorrect imports/exports.

## P2: Review CSS (`index.css`)
- [ ] Inspect main chat container element structure and classes.
- [ ] Inspect user message element structure and classes.
- [ ] Inspect bot message element structure and classes.
- [ ] Inspect code block element structure and classes.
- [ ] Inspect image element structure and classes.
- [ ] Inspect input field area (bar, input, buttons) structure and classes.
- [ ] Inspect history panel structure and classes.
- [ ] Inspect settings modal structure and classes.
- [ ] Verify all `jp-llm-ext-*` classes match elements as defined in `style/index.css`. 