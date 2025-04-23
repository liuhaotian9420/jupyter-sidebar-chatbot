## Feature: Inline Ref-Text Widgets (Timestamp: 2024-10-27T10:00:00Z)
- [x] **(P0)** Replace `<textarea>` with `contenteditable` `div` in `jupyter-lab-extension/src/ui/ui-manager.ts`. Style the `div` to mimic the original textarea.
- [x] **(P0)** Implement basic input handling for the `div` (capture text changes).
- [x] **(P1)** Implement detection of "@" symbol followed by potential reference text during typing.
- [x] **(P1)** Integrate with reference selection (e.g., `PopupMenuManager`) to identify when a full reference (like `@fileName.ext`) is selected/confirmed.
- [x] **(P1)** Replace the confirmed "@refText" string within the `div`'s content with a non-editable inline element (widget) that displays the reference and stores the original text or data.
- [x] **(P1)** Implement backspace handling to delete the entire widget when the cursor is immediately after it and backspace is pressed.
- [x] **(P0)** Implement serialization: Create a method to extract the semantic content (plain text + "@refText" for widgets) from the `div`. Update message sending logic to use this.
- [x] **(P2)** Handle copy/paste behavior within the `contenteditable` `div`.
- [ ] **(P2)** Ensure standard text editing features (newlines with Shift+Enter, sending on Enter) function correctly.
