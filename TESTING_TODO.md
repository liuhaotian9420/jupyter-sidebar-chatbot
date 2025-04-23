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
- [X] Verify bot message is correctly formatted.

### 3. New Chat Functionality
- [X] Click "New Chat" button/icon.
- [X] Verify chat message area clears.
- [X] Verify chat title/state indicates a new chat.
- [X] Send a message in the new chat and verify user/bot messages render correctly.

### 4. Markdown & Code Blocks
- [X] Send a message containing markdown (e.g., bold, italics, list).
- [X] Verify markdown renders correctly in both user and bot messages.
- [X] Send a message containing a code block (e.g., ```python print("hello")```).
- [X] Verify code block renders with correct background/styling.
- [X] Verify syntax highlighting is applied correctly within the code block.
- [X] Verify "Copy" button appears on the code block.
- [X] Click "Copy" button and verify code is copied to clipboard.
- [X] Verify "Add to Cell" button appears on the code block.
- [X] Click "Add to Cell" and verify code is added to a new notebook cell.

### 5. Image Rendering
- [X] Send a message that should trigger an image response (if backend supports).
- [X] Verify image renders correctly in the chat.
- [X] Verify "Copy Path" button (or similar) appears for the image.
- [X] Click "Copy Path" and verify the image source/path is copied.
- [X] Verify "Add Path to Cell" button (or similar) appears.
- [X] Click "Add Path to Cell" and verify the path is added to a new notebook cell.

### 6. Interrupt Messages
- [X] Trigger an interrupt message (e.g., by sending a message while another is processing, if supported).
- [X] Verify interrupt message appears correctly.
- [X] Verify "Confirm" and "Reject" (or similar) buttons appear.
- [X] Test clicking "Confirm" - verify expected behavior (e.g., stop generation).
- [X] Test clicking "Reject" - verify expected behavior (e.g., continue generation).
- [X] Verify automated "Confirmed" message appears below the original interrupt message, potentially with a separator.
- [X] Verify automated "Rejected" message appears below the original interrupt message, potentially with a separator.

### 7. Input Field Functionality
- [X] Test Markdown toggle button - verify it changes state/appearance.
- [X] Type long text - verify input field expands vertically.
- [X] Type `@` symbol - verify the `PopupMenuManager` mention popup appears.
- [X] Select an item from the `@` popup - verify it's inserted into the input.
- [ ] Trigger code reference insertion (e.g., via `@` or shortcut).
- [X] Verify code reference widget appears correctly in the input field.

### 8. Keyboard Shortcuts
- [X] Press `@` key - verify the mention popup appears.
- [X] Press `Ctrl+L` (or configured shortcut) - verify the code reference selection/insertion process is triggered.
- [X] Verify shortcut indicator (if implemented) appears when relevant.

### 9. Chat History
- [X] Create multiple chats (3+).
- [ ] Click "Toggle History" button/icon.
- [X] Verify history panel appears, showing list of previous chats (e.g., with titles).
- [X] Click on a chat in the history list.
- [X] Verify the selected chat messages load correctly in the main chat area.
- [X] Verify the chat title updates correctly.
- [X] Click "New Chat" while history is open - verify behavior is correct.
- [X] Click "Toggle History" again - verify panel closes.

### 10. Settings
- [X] Click Settings button/icon.
- [X] Verify settings modal opens.
- [X] View current settings (API Key, Model, etc.).
- [X] Change a setting (e.g., update model name).
- [X] Click "Save".
- [X] Verify settings modal closes.
- [X] Verify success toast notification appears.
- [X] Re-open settings modal - verify the changed setting persisted.
- [X] Reload JupyterLab entirely.
- [X] Open the extension and settings modal - verify the setting is still persisted.
- [X] Test "Cancel" button in settings modal - verify changes are discarded.

### 11. Clipboard Utilities
- [X] Right-click (or use action button) on a regular text message.
- [X] Select "Copy" - verify message text is copied.
- [X] Right-click (or use action button) on a message containing an image.
- [X] Select "Copy Image" (if available) - verify image is copied (test pasting into an image editor).

### 12. Notebook Integration Utilities
- [ ] Right-click (or use action button) on a regular text message.
- [ ] Select "Add to Cell" - verify message text is added to a new cell.
- *Covered in Code Blocks:* Adding code block content to cell.
- *Covered in Images:* Adding image path to cell.

## P1: Update Imports/Exports
- [X] Review `src/core/` files for unused/incorrect imports/exports.
- [X] Review `src/handlers/` files for unused/incorrect imports/exports.
- [X] Review `src/state/` files for unused/incorrect imports/exports.
- [X] Review `src/ui/` files for unused/incorrect imports/exports.
- [X] Review `src/utils/` files for unused/incorrect imports/exports.
- [X] Review top-level `src/` files (e.g., `index.ts`, `globals.ts`) for unused/incorrect imports/exports.

## P2: Review CSS (`index.css`)
- [x] Inspect main chat container element structure and classes.
- [x] Inspect user message element structure and classes.
- [x] Inspect bot message element structure and classes.
- [x] Inspect code block element structure and classes.
- [x] Inspect image element structure and classes.
- [x] Inspect input field area (bar, input, buttons) structure and classes.
- [x] Inspect history panel structure and classes.
- [x] Inspect settings modal structure and classes.
- [x] Verify all `jp-llm-ext-*` classes match elements as defined in `style/index.css`.

## Feature: Inline Ref-Text Widgets
- **Unit Tests:**
  - [ ] Test serialization function (extracts text and @ref from contenteditable div).
  - [ ] Test widget creation/replacement logic.
  - [ ] Test backspace handling for deleting widgets.
- **UI/Integration Tests:**
  - [x] Verify typing regular text works as expected.
  - [x] Verify typing markdown works as expected.
  - [ ] Verify inserting a reference using "@" creates a visible, non-editable widget.
  - [ ] Verify deleting a reference widget using backspace removes the entire widget.
  - [ ] Verify sending a message correctly serializes text and reference widgets.
  - [ ] Verify copy/paste behavior with text and widgets.
  - [ ] Verify Shift+Enter creates a newline in the input div.
  - [ ] Verify Enter (without Shift) triggers message sending.
  - [ ] Verify the contenteditable div visually resembles the previous textarea.

### Feature: context-refs

**Goal:** Ensure file, directory, cell, and code references can be inserted via the popup menu and are rendered correctly as non-editable widgets in user messages.

**Testing Tasks:**
- [x] **UI/Integration:** Verify that selecting 'File' from the popup menu and choosing a file inserts `@file <filepath>` into the input field.
- [x] **UI/Integration:** Verify that selecting 'Directory' from the popup menu and choosing a directory inserts `@dir <dirpath>` into the input field.
- [x] **UI/Integration:** Verify that selecting 'Cells' from the popup menu and choosing a cell inserts `@Cell <1-based-index>` into the input field.
- [x] **UI/Integration:** Verify that selecting 'Code' -> 'Insert as collapsed reference' inserts an `@code <refId>` placeholder and stores associated metadata (notebook, cell, line).
- [x] **Rendering:** Confirm that sending a message containing `@file <path>` renders a widget displaying only the filename (`{filename}`).
- [x] **Rendering:** Confirm that sending a message containing `@dir <path>` renders a widget displaying only the directory name (`{dirname}`).
- [x] **Rendering:** Confirm that sending a message containing `@Cell <index>` renders a widget displaying `{notebookName}-{M/C}-{index}`.
- [ ] **Rendering:** Confirm that sending a message containing `@code <refId>` renders a widget displaying `{notebookName}-{cellIndex}-{lineNumber}`.
- [x] **Rendering:** Verify that rendered widgets are non-editable within the displayed user message.
- [ ] **Rendering:** Verify that the original reference text is stored in the `data-ref-text` attribute of the widget span.
- [x] **Styling:** Check that the rendered widgets have the correct `jp-llm-ext-ref-widget` class and type-specific classes.
- [x] **Styling:** Ensure the widgets have the desired block/pill appearance based on the CSS added in P3.
- [ ] **Edge Cases:** Test with file/directory names containing spaces or special characters.
- [x] **Edge Cases:** Test inserting multiple references in one message.
- [ ] **Edge Cases:** Test references in different notebooks.
- [ ] **Edge Cases:** Test cell references when cells are added/deleted in the notebook after the reference is created (how should this behave?).