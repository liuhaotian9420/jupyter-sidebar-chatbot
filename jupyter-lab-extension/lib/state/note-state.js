"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoteState = void 0;
const uuid_1 = require("uuid");
/**
 * Manages the state of notes and the currently selected note.
 */
class NoteState {
    constructor() {
        this.notes = [];
        this.currentNoteId = null;
        // In the future, we might load notes from persistent storage here
    }
    /**
     * Creates a new note.
     * @param title - The title for the new note.
     * @param content - The content for the new note.
     * @returns The newly created note.
     */
    createNewNote(title, content) {
        const timestamp = new Date().toISOString();
        const newNote = {
            id: (0, uuid_1.v4)(),
            title,
            content,
            createdAt: timestamp,
            updatedAt: timestamp
        };
        this.notes.push(newNote);
        this.currentNoteId = newNote.id;
        return newNote;
    }
    /**
     * Sets the currently selected note ID.
     * @param noteId - The ID of the note to set as current.
     */
    setCurrentNoteId(noteId) {
        this.currentNoteId = noteId;
    }
    /**
     * Gets the ID of the currently selected note.
     * @returns The current note ID or null if none is selected.
     */
    getCurrentNoteId() {
        return this.currentNoteId;
    }
    /**
     * Retrieves a specific note by its ID.
     * @param noteId - The ID of the note to retrieve.
     * @returns The note or undefined if not found.
     */
    getNoteById(noteId) {
        return this.notes.find(note => note.id === noteId);
    }
    /**
     * Retrieves the currently selected note.
     * @returns The current note or undefined if no note is selected or found.
     */
    getCurrentNote() {
        if (!this.currentNoteId) {
            return undefined;
        }
        return this.getNoteById(this.currentNoteId);
    }
    /**
     * Updates a note's title and content.
     * @param noteId - The ID of the note to update.
     * @param title - The new title for the note.
     * @param content - The new content for the note.
     * @returns The updated note or undefined if not found.
     */
    updateNote(noteId, title, content) {
        const noteIndex = this.notes.findIndex(note => note.id === noteId);
        if (noteIndex < 0) {
            return undefined;
        }
        this.notes[noteIndex] = Object.assign(Object.assign({}, this.notes[noteIndex]), { title,
            content, updatedAt: new Date().toISOString() });
        return this.notes[noteIndex];
    }
    /**
     * Deletes a note by its ID.
     * @param noteId - The ID of the note to delete.
     * @returns True if the note was found and deleted, false otherwise.
     */
    deleteNote(noteId) {
        const initialLength = this.notes.length;
        this.notes = this.notes.filter(note => note.id !== noteId);
        if (this.notes.length < initialLength) {
            // If the deleted note was the current one, reset current or set to the first note
            if (this.currentNoteId === noteId) {
                this.currentNoteId = this.notes.length > 0 ? this.notes[0].id : null;
            }
            return true;
        }
        return false;
    }
    /**
     * Gets all notes.
     * @returns An array of all notes.
     */
    getAllNotes() {
        return [...this.notes]; // Return a copy to prevent direct mutation
    }
}
exports.NoteState = NoteState;
