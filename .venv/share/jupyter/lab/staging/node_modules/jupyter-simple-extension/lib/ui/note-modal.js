"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNoteModalElement = createNoteModalElement;
/**
 * Creates a note modal element.
 * @param callbacks Callbacks for the modal actions.
 * @param initialTitle Optional initial title for editing.
 * @param initialContent Optional initial content for editing.
 * @returns The modal element.
 */
function createNoteModalElement(callbacks, initialTitle = '', initialContent = '') {
    // Create backdrop for the modal
    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'jp-llm-ext-note-modal-backdrop';
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'jp-llm-ext-note-modal';
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'jp-llm-ext-note-modal-content';
    // Create modal title
    const modalTitle = document.createElement('h3');
    modalTitle.className = 'jp-llm-ext-note-modal-title';
    modalTitle.textContent = initialTitle ? 'Edit Note' : 'Add New Note';
    modalContent.appendChild(modalTitle);
    // Create form
    const form = document.createElement('form');
    form.className = 'jp-llm-ext-note-modal-form';
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const titleInput = form.querySelector('.jp-llm-ext-note-modal-input');
        const contentTextarea = form.querySelector('.jp-llm-ext-note-modal-textarea');
        if (titleInput && contentTextarea) {
            callbacks.handleSave(titleInput.value, contentTextarea.value);
        }
    });
    // Create title input
    const titleLabel = document.createElement('label');
    titleLabel.className = 'jp-llm-ext-note-modal-label';
    titleLabel.textContent = 'Title';
    titleLabel.htmlFor = 'note-title-input';
    const titleInput = document.createElement('input');
    titleInput.className = 'jp-llm-ext-note-modal-input';
    titleInput.type = 'text';
    titleInput.id = 'note-title-input';
    titleInput.placeholder = 'Enter note title';
    titleInput.value = initialTitle;
    titleInput.required = true;
    // Create content textarea
    const contentLabel = document.createElement('label');
    contentLabel.className = 'jp-llm-ext-note-modal-label';
    contentLabel.textContent = 'Content (Markdown supported)';
    contentLabel.htmlFor = 'note-content-textarea';
    const contentTextarea = document.createElement('textarea');
    contentTextarea.className = 'jp-llm-ext-note-modal-textarea';
    contentTextarea.id = 'note-content-textarea';
    contentTextarea.placeholder = 'Enter note content (supports Markdown)';
    contentTextarea.value = initialContent;
    contentTextarea.required = true;
    contentTextarea.rows = 10;
    // Create buttons
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'jp-llm-ext-note-modal-buttons';
    const cancelButton = document.createElement('button');
    cancelButton.className = 'jp-Button jp-llm-ext-note-modal-cancel';
    cancelButton.textContent = 'Cancel';
    cancelButton.type = 'button';
    cancelButton.addEventListener('click', () => {
        callbacks.handleCancel();
    });
    const saveButton = document.createElement('button');
    saveButton.className = 'jp-Button jp-llm-ext-note-modal-save';
    saveButton.textContent = 'Save';
    saveButton.type = 'submit';
    // Add elements to form
    form.appendChild(titleLabel);
    form.appendChild(titleInput);
    form.appendChild(contentLabel);
    form.appendChild(contentTextarea);
    buttonsContainer.appendChild(cancelButton);
    buttonsContainer.appendChild(saveButton);
    form.appendChild(buttonsContainer);
    modalContent.appendChild(form);
    modal.appendChild(modalContent);
    modalBackdrop.appendChild(modal);
    // Auto-focus the title input when the modal is shown
    setTimeout(() => {
        titleInput.focus();
    }, 0);
    return modalBackdrop;
}
