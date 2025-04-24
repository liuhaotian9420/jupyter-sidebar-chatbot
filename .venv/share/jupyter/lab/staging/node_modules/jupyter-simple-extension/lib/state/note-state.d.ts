/**
 * Interface for a single note.
 */
export interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}
/**
 * Manages the state of notes and the currently selected note.
 */
export declare class NoteState {
    private notes;
    private currentNoteId;
    constructor();
    /**
     * Creates a new note.
     * @param title - The title for the new note.
     * @param content - The content for the new note.
     * @returns The newly created note.
     */
    createNewNote(title: string, content: string): Note;
    /**
     * Sets the currently selected note ID.
     * @param noteId - The ID of the note to set as current.
     */
    setCurrentNoteId(noteId: string): void;
    /**
     * Gets the ID of the currently selected note.
     * @returns The current note ID or null if none is selected.
     */
    getCurrentNoteId(): string | null;
    /**
     * Retrieves a specific note by its ID.
     * @param noteId - The ID of the note to retrieve.
     * @returns The note or undefined if not found.
     */
    getNoteById(noteId: string): Note | undefined;
    /**
     * Retrieves the currently selected note.
     * @returns The current note or undefined if no note is selected or found.
     */
    getCurrentNote(): Note | undefined;
    /**
     * Updates a note's title and content.
     * @param noteId - The ID of the note to update.
     * @param title - The new title for the note.
     * @param content - The new content for the note.
     * @returns The updated note or undefined if not found.
     */
    updateNote(noteId: string, title: string, content: string): Note | undefined;
    /**
     * Deletes a note by its ID.
     * @param noteId - The ID of the note to delete.
     * @returns True if the note was found and deleted, false otherwise.
     */
    deleteNote(noteId: string): boolean;
    /**
     * Gets all notes.
     * @returns An array of all notes.
     */
    getAllNotes(): Note[];
}
