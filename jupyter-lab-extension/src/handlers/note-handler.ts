import { NoteState, Note } from '../state/note-state';
import { createNoteModalElement, NoteModalCallbacks } from '../ui/note-modal';
import { renderMarkdown } from '../utils/markdown';
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
export class NoteHandler {
  private notesContainer: HTMLDivElement;
  private noteListContainer: HTMLDivElement;
  private noteContentContainer: HTMLDivElement;
  private noteModalContainer: HTMLDivElement;
  private selectedNoteId: string | null = null;
  private isNotesViewVisible: boolean = false;

  /**
   * Creates a new NoteHandler.
   * @param noteState The note state.
   * @param uiManager The UI manager.
   * @param callbacks Callbacks for note changes.
   * @param parentNode The parent node where the note handler will append its elements.
   */
  constructor(
    private noteState: NoteState,
    private uiManager: UIManager,
    private callbacks: NoteHandlerCallbacks,
    private parentNode: HTMLElement
  ) {
    // Create main container for notes
    this.notesContainer = document.createElement('div');
    this.notesContainer.className = 'jp-llm-ext-notes-container';
    this.notesContainer.style.display = 'none';
    
    // Create container for the note list
    this.noteListContainer = document.createElement('div');
    this.noteListContainer.className = 'jp-llm-ext-note-list-container';
    
    // Create container for note content
    this.noteContentContainer = document.createElement('div');
    this.noteContentContainer.className = 'jp-llm-ext-note-content-container';
    
    // Create container for the note modal
    this.noteModalContainer = document.createElement('div');
    this.noteModalContainer.className = 'jp-llm-ext-note-modal-container';
    
    // Append the modal container to the parent node (not inside the notes container)
    // This allows the modal to appear as an overlay on the entire UI
    this.parentNode.appendChild(this.noteModalContainer);
    
    // Initialize the notes view
    this.initializeNotesView();
  }

  /**
   * Initializes the notes view with header, list and content sections.
   */
  private initializeNotesView(): void {
    // Create header
    const header = document.createElement('div');
    header.className = 'jp-llm-ext-notes-header';
    
    // Create back button
    const backButton = document.createElement('button');
    backButton.className = 'jp-Button jp-llm-ext-back-button';
    backButton.innerHTML = '<span class="jp-icon3 jp-icon-selectable" role="presentation"><svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg></span>';
    backButton.title = 'Back to chat';
    backButton.addEventListener('click', () => this.hideNotesView());
    
    const title = document.createElement('h2');
    title.textContent = 'Notes';
    
    const addButton = document.createElement('button');
    addButton.className = 'jp-Button jp-llm-ext-add-note-button';
    addButton.textContent = 'Add Note';
    addButton.addEventListener('click', () => this.showAddNoteModal());
    
    header.appendChild(backButton);
    header.appendChild(title);
    header.appendChild(addButton);
    
    // Create flex container for list and content
    const flexContainer = document.createElement('div');
    flexContainer.className = 'jp-llm-ext-notes-flex-container';
    flexContainer.appendChild(this.noteListContainer);
    flexContainer.appendChild(this.noteContentContainer);
    
    // Add components to the main container
    this.notesContainer.appendChild(header);
    this.notesContainer.appendChild(flexContainer);
    
    // Initial render of notes
    this.renderNotes();
  }

  /**
   * Shows the add note modal.
   */
  private showAddNoteModal(): void {
    const modalCallbacks: NoteModalCallbacks = {
      handleSave: (title: string, content: string) => {
        this.noteState.createNewNote(title, content);
        this.renderNotes();
        this.hideNoteModal();
        this.onNoteChange();
      },
      handleCancel: () => {
        this.hideNoteModal();
      }
    };
    
    const modal = createNoteModalElement(modalCallbacks);
    this.showModal(modal);
  }

  /**
   * Shows the edit note modal for a specific note.
   * @param note The note to edit.
   */
  private showEditNoteModal(note: Note): void {
    const modalCallbacks: NoteModalCallbacks = {
      handleSave: (title: string, content: string) => {
        this.noteState.updateNote(note.id, title, content);
        this.renderNotes();
        this.hideNoteModal();
        if (this.selectedNoteId === note.id) {
          this.showNoteContent(note.id);
        }
        this.onNoteChange();
      },
      handleCancel: () => {
        this.hideNoteModal();
      }
    };
    
    const modal = createNoteModalElement(modalCallbacks, note.title, note.content);
    this.showModal(modal);
  }

  /**
   * Called when a note is changed. Updates the UI title if needed.
   */
  private onNoteChange(): void {
    // Check if a note is selected and update the title input
    const currentNote = this.noteState.getNoteById(this.selectedNoteId || '');
    if (currentNote && this.callbacks.updateTitleInput) {
      this.callbacks.updateTitleInput(currentNote.title);
    }
  }

  /**
   * Shows a modal in the note modal container.
   * @param modal The modal element to show.
   */
  private showModal(modal: HTMLElement): void {
    // Clear any existing modal
    this.noteModalContainer.innerHTML = '';
    
    // Add the new modal
    this.noteModalContainer.appendChild(modal);
    
    // Show the modal container
    this.noteModalContainer.style.display = 'block';
  }

  /**
   * Hides the note modal.
   */
  private hideNoteModal(): void {
    this.noteModalContainer.style.display = 'none';
    this.noteModalContainer.innerHTML = '';
  }

  /**
   * Renders the list of notes.
   */
  private renderNotes(): void {
    // Clear the current list
    this.noteListContainer.innerHTML = '';
    
    // Get all notes
    const notes = this.noteState.getAllNotes();
    
    if (notes.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'jp-llm-ext-note-empty-message';
      emptyMessage.textContent = 'No notes yet. Click "Add Note" to create one.';
      this.noteListContainer.appendChild(emptyMessage);
      return;
    }
    
    // Create list
    const notesList = document.createElement('ul');
    notesList.className = 'jp-llm-ext-note-list';
    
    // Add each note to the list
    notes.forEach((note: Note) => {
      const noteItem = document.createElement('li');
      noteItem.className = 'jp-llm-ext-note-item';
      if (this.selectedNoteId === note.id) {
        noteItem.classList.add('jp-llm-ext-note-item-selected');
      }
      
      // Note content (title and actions)
      const noteContent = document.createElement('div');
      noteContent.className = 'jp-llm-ext-note-item-content';
      
      const noteTitle = document.createElement('span');
      noteTitle.className = 'jp-llm-ext-note-item-title';
      noteTitle.textContent = note.title;
      
      const noteActions = document.createElement('div');
      noteActions.className = 'jp-llm-ext-note-item-actions';
      
      const editButton = document.createElement('button');
      editButton.className = 'jp-Button jp-llm-ext-note-edit-button';
      editButton.innerHTML = '<span class="jp-icon3 jp-icon-selectable" role="presentation"><svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg></span>';
      editButton.title = 'Edit note';
      editButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent note selection
        this.showEditNoteModal(note);
      });
      
      const deleteButton = document.createElement('button');
      deleteButton.className = 'jp-Button jp-llm-ext-note-delete-button';
      deleteButton.innerHTML = '<span class="jp-icon3 jp-icon-selectable" role="presentation"><svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></span>';
      deleteButton.title = 'Delete note';
      deleteButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent note selection
        if (confirm(`Are you sure you want to delete the note "${note.title}"?`)) {
          this.noteState.deleteNote(note.id);
          
          // If the deleted note was selected, clear the content container
          if (this.selectedNoteId === note.id) {
            this.selectedNoteId = null;
            this.noteContentContainer.innerHTML = '';
          }
          
          this.renderNotes();
          this.onNoteChange();
        }
      });
      
      noteActions.appendChild(editButton);
      noteActions.appendChild(deleteButton);
      
      noteContent.appendChild(noteTitle);
      noteContent.appendChild(noteActions);
      
      noteItem.appendChild(noteContent);
      
      // Add click event to show the note content
      noteItem.addEventListener('click', () => {
        this.showNoteContent(note.id);
      });
      
      notesList.appendChild(noteItem);
    });
    
    this.noteListContainer.appendChild(notesList);
  }

  /**
   * Shows the content of a specific note.
   * @param noteId The ID of the note to show.
   */
  private showNoteContent(noteId: string): void {
    // Set as selected
    this.selectedNoteId = noteId;
    
    // Re-render notes to update selection
    this.renderNotes();
    
    // Clear current content
    this.noteContentContainer.innerHTML = '';
    
    // Get the note
    const note = this.noteState.getNoteById(noteId);
    if (!note) return;
    
    // Create content container
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'jp-llm-ext-note-content-wrapper';
    
    // Note title
    const title = document.createElement('h3');
    title.className = 'jp-llm-ext-note-content-title';
    title.textContent = note.title;
    contentWrapper.appendChild(title);
    
    // Note content
    const content = document.createElement('div');
    content.className = 'jp-llm-ext-note-content-text jp-RenderedMarkdown';
    
    // Render markdown content
    content.innerHTML = renderMarkdown(note.content);
    
    contentWrapper.appendChild(content);
    this.noteContentContainer.appendChild(contentWrapper);
    
    // Update the title in parent UI if callback exists
    if (this.callbacks.updateTitleInput) {
      this.callbacks.updateTitleInput(note.title);
    }
  }

  /**
   * Toggles visibility of the notes view.
   */
  public toggleNotesView(): void {
    this.isNotesViewVisible = !this.isNotesViewVisible;
    if (this.isNotesViewVisible) {
      this.showNotesView();
    } else {
      this.hideNotesView();
    }
  }

  /**
   * Shows the notes view.
   */
  public showNotesView(): void {
    this.notesContainer.style.display = 'flex';
    this.isNotesViewVisible = true;
    
    // Use UIManager to properly hide message containers and show notes view
    this.uiManager.showNotesView();
    
    // Find any other message containers that might be visible and hide them
    const allMessageContainers = document.querySelectorAll('.jp-llm-ext-message-container');
    allMessageContainers.forEach(container => {
      (container as HTMLElement).style.display = 'none';
    });
  }

  /**
   * Hides the notes view.
   */
  public hideNotesView(): void {
    this.notesContainer.style.display = 'none';
    this.isNotesViewVisible = false;
    
    // Use UIManager to show the chat view again
    this.uiManager.showChatView();
  }

  /**
   * Returns the notes container.
   * @returns The notes container element.
   */
  public getContainer(): HTMLDivElement {
    return this.notesContainer;
  }
} 