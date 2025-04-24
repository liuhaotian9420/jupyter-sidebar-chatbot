import { NoteState } from '../state/note-state';
import { UIManager } from '../ui/ui-manager';
/**
 * Callbacks for the NoteHandler.
 */
export interface NoteHandlerCallbacks {
    /**
     * Called when a note title is selected or updated.
     * The implementation should update the title input in the UI.
     */
    updateTitleInput: (title: string) => void;
}
/**
 * Manages the notes UI and interactions.
 */
export declare class NoteHandler {
    private noteState;
    private uiManager;
    private callbacks;
    private parentNode;
    private notesContainer;
    private noteListContainer;
    private noteContentContainer;
    private noteModalContainer;
    private selectedNoteId;
    private isNotesViewVisible;
    /**
     * Creates a new NoteHandler.
     * @param noteState The note state.
     * @param uiManager The UI manager.
     * @param callbacks Callbacks for note changes.
     * @param parentNode The parent node where the note handler will append its elements.
     */
    constructor(noteState: NoteState, uiManager: UIManager, callbacks: NoteHandlerCallbacks, parentNode: HTMLElement);
    /**
     * Initializes the notes view with header, list and content sections.
     */
    private initializeNotesView;
    /**
     * Shows the add note modal.
     */
    private showAddNoteModal;
    /**
     * Shows the edit note modal for a specific note.
     * @param note The note to edit.
     */
    private showEditNoteModal;
    /**
     * Called when a note is changed. Updates the UI title if needed.
     */
    private onNoteChange;
    /**
     * Shows a modal in the note modal container.
     * @param modal The modal element to show.
     */
    private showModal;
    /**
     * Hides the note modal.
     */
    private hideNoteModal;
    /**
     * Renders the list of notes.
     */
    private renderNotes;
    /**
     * Shows the content of a specific note.
     * @param noteId The ID of the note to show.
     */
    private showNoteContent;
    /**
     * Toggles visibility of the notes view.
     */
    toggleNotesView(): void;
    /**
     * Shows the notes view.
     */
    showNotesView(): void;
    /**
     * Hides the notes view.
     */
    hideNotesView(): void;
    /**
     * Returns the notes container.
     * @returns The notes container element.
     */
    getContainer(): HTMLDivElement;
}
