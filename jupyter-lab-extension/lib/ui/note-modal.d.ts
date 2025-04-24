/**
 * Callbacks for the note modal.
 */
export interface NoteModalCallbacks {
    /**
     * Called when the save button is clicked.
     * @param title The note title.
     * @param content The note content.
     */
    handleSave: (title: string, content: string) => void;
    /**
     * Called when the cancel button is clicked.
     */
    handleCancel: () => void;
}
/**
 * Creates a note modal element.
 * @param callbacks Callbacks for the modal actions.
 * @param initialTitle Optional initial title for editing.
 * @param initialContent Optional initial content for editing.
 * @returns The modal element.
 */
export declare function createNoteModalElement(callbacks: NoteModalCallbacks, initialTitle?: string, initialContent?: string): HTMLElement;
