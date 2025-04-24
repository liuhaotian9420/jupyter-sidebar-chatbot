## Feature: Inline Ref-Text Widgets (Timestamp: 2024-10-27T10:00:00Z)
- [x] **(P0)** Replace `<textarea>` with `contenteditable` `div` in `jupyter-lab-extension/src/ui/ui-manager.ts`. Style the `div` to mimic the original textarea.
- [x] **(P0)** Implement basic input handling for the `div` (capture text changes).
- [x] **(P1)** Implement detection of "@" symbol followed by potential reference text during typing.
- [x] **(P1)** Integrate with reference selection (e.g., `PopupMenuManager`) to identify when a full reference (like `@fileName.ext`) is selected/confirmed.
- [x] **(P1)** Replace the confirmed "@refText" string within the `div`'s content with a non-editable inline element (widget) that displays the reference and stores the original text or data.
- [x] **(P1)** Implement backspace handling to delete the entire widget when the cursor is immediately after it and backspace is pressed.
- [x] **(P0)** Implement serialization: Create a method to extract the semantic content (plain text + "@refText" for widgets) from the `div`. Update message sending logic to use this.
- [x] **(P2)** Handle copy/paste behavior within the `contenteditable` `div`.
- [x] **(P2)** Ensure standard text editing features (newlines with Shift+Enter, sending on Enter) function correctly.

---

### Feature: context-refs (`@{timestamp}`)

**Goal:** Implement insertion and rendering of file, directory, cell, and code references as block widgets in user messages.

**Tasks:**
- [x] **P0:** Update `PopupMenuManager` callbacks to insert correct reference text (`@file`, `@dir`, `@Cell`, `@code`) via `InputHandler`.
- [x] **P1:** Enhance `InputHandler` to store necessary metadata for `@code` references (notebook name, cell index, line number).
- [x] **P2:** Implement reference widget rendering in `UIManager`/`MessageRenderer` to replace `@...` text with styled, non-editable widgets in user messages, using specified display formats.
- [x] **P3:** Add CSS styling for `.jp-llm-ext-ref-widget` and type-specific variants.
- [x] **P4:** Update `FEAT_TODO.md` and `TESTING_TODO.md`.

---

### Feature: shortcut-context-ref (Timestamp: 2024-10-27T15:00:00Z)

**Goal:** Update the `Ctrl+L` shortcut to trigger context reference insertion via the standard reference handling mechanism (like clicking `@code` or `@cell` in the popup) instead of direct text appending. Add warning for invalid context.

**Tasks:**
- [x] **(P0)** Modify `Ctrl+L` logic in `shortcut-handler.ts` to call the appropriate handler function (likely on `InputHandler`) for `@code` and `@cell` references instead of `appendToInput`.
- [x] **(P1)** Add a warning indicator via `showIndicator` in `shortcut-handler.ts` if `Ctrl+L` is pressed when neither code is selected nor a cell is active.
- [x] **(P2)** Update `FEAT_TODO.md` (this task).
- [x] **(P2)** Update `TESTING_TODO.md` with testing tasks for the new shortcut behavior.

---

### Feature: inline-ref-widgets-enhancements (Timestamp: 2024-10-27T16:00:00Z)

**Goal:** Enhance the inline reference widgets within the `contenteditable` input field for immediate rendering, selection/deletion, and content preview.

**Tasks:**
- [x] **(P0)** Implement immediate rendering of reference widgets in the `contenteditable` input `div` upon insertion, mimicking the style in user messages.
- [x] **(P1)** Ensure the rendered widgets in the input `div` can be selected and deleted using standard editing actions (e.g., backspace, selection + delete).
- [x] **(P1)** Add an "expand" functionality (e.g., on hover or click) to code/cell widgets within the input `div` to show a preview of the first 3 lines.
- [x] **(P2)** Update `FEAT_TODO.md` with these tasks (this task).
- [x] **(P2)** Update `TESTING_TODO.md` with corresponding test cases.

---

### Feature: Codebase TODO Cleanup (Timestamp: YYYY-MM-DDTHH:mm:ssZ)  <-- Replace with current timestamp

**Goal:** Address remaining TODO comments found in the codebase.

**Tasks:**
- [ ] **(P?)** `notebook-integration.ts:50`: Handle selection in notebook output areas.
- [ ] **(P?)** `ui-manager.ts:447`: Implement a more robust notification system (e.g., toast).
- [ ] **(P?)** `ui-manager.ts:568, 621`: Update reference popup query dynamically if text changes.
- [ ] **(P?)** `message-renderer.ts:70`: Integrate code reference rendering properly in messages.
- [ ] **(P?)** `message-renderer.ts:106`: Add user message-specific actions (e.g., copy text).
- [ ] **(P?)** `message-renderer.ts:332, 551`: Make base URL for images configurable.
- [ ] **(P?)** `sidebar-widget.ts:223`: Merge `insertCollapsedCodeRef` with `insertCode`.
- [ ] **(P?)** `settings-handler.ts:76`: Have `ApiClient` observe `SettingsState` changes.
- [ ] **(P?)** `history-handler.ts:84`: Enhance history display (preview, timestamp, delete button).

---

### Feature: Notes System (Timestamp: 2023-11-08T12:00:00Z)

**Goal:** Implement a notes system that allows users to create, view, and manage markdown notes.

**Tasks:**
- [x] **(P0)** Create a state manager `NoteState` to store and manage notes.
- [x] **(P0)** Create a UI container for the notes view in `UIManager.createLayout()`.
- [x] **(P0)** Add a "Notes" button to the bottom row alongside "New Chat" and "History".
- [x] **(P1)** Create a `NoteHandler` class to manage note interactions and rendering.
- [x] **(P1)** Implement toggling between chat view and notes view, similar to history view.
- [x] **(P1)** Add an "Add Note" button to the notes view.
- [x] **(P2)** Create a modal for adding/editing notes with title and markdown content.
- [x] **(P2)** Implement rendering of note list items with clickable titles.
- [x] **(P2)** Add functionality to view note content when a note is selected.
- [x] **(P3)** Update `TESTING_TODO.md` with corresponding test cases.
