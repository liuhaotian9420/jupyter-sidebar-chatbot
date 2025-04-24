import { v4 as uuidv4 } from 'uuid';

/**
 * Interface for a single note.
 */
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string; // ISO string timestamp
  updatedAt: string; // ISO string timestamp
}

/**
 * Manages the state of notes and the currently selected note.
 */
export class NoteState {
  private notes: Note[] = [];
  private currentNoteId: string | null = null;

  constructor() {
    // In the future, we might load notes from persistent storage here
  }

  /**
   * Creates a new note.
   * @param title - The title for the new note.
   * @param content - The content for the new note.
   * @returns The newly created note.
   */
  createNewNote(title: string, content: string): Note {
    const timestamp = new Date().toISOString();
    const newNote: Note = {
      id: uuidv4(),
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
  setCurrentNoteId(noteId: string): void {
    this.currentNoteId = noteId;
  }

  /**
   * Gets the ID of the currently selected note.
   * @returns The current note ID or null if none is selected.
   */
  getCurrentNoteId(): string | null {
    return this.currentNoteId;
  }

  /**
   * Retrieves a specific note by its ID.
   * @param noteId - The ID of the note to retrieve.
   * @returns The note or undefined if not found.
   */
  getNoteById(noteId: string): Note | undefined {
    return this.notes.find(note => note.id === noteId);
  }

  /**
   * Retrieves the currently selected note.
   * @returns The current note or undefined if no note is selected or found.
   */
  getCurrentNote(): Note | undefined {
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
  updateNote(noteId: string, title: string, content: string): Note | undefined {
    const noteIndex = this.notes.findIndex(note => note.id === noteId);
    if (noteIndex < 0) {
      return undefined;
    }

    this.notes[noteIndex] = {
      ...this.notes[noteIndex],
      title,
      content,
      updatedAt: new Date().toISOString()
    };

    return this.notes[noteIndex];
  }

  /**
   * Deletes a note by its ID.
   * @param noteId - The ID of the note to delete.
   * @returns True if the note was found and deleted, false otherwise.
   */
  deleteNote(noteId: string): boolean {
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
  getAllNotes(): Note[] {
    return [...this.notes]; // Return a copy to prevent direct mutation
  }
} 