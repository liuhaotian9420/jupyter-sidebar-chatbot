"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsModal = void 0;
exports.createSettingsModalElement = createSettingsModalElement;
/**
 * Creates the HTML element for the settings modal.
 * @param callbacks Callbacks for save and cancel actions.
 * @returns The main modal HTMLElement.
 */
function createSettingsModalElement(callbacks) {
    const modal = document.createElement('div');
    modal.className = 'jp-llm-ext-settings-modal';
    modal.style.display = 'none'; // Initially hidden
    const content = document.createElement('div');
    content.className = 'jp-llm-ext-settings-content';
    const title = document.createElement('h2');
    title.className = 'jp-llm-ext-settings-title';
    title.textContent = 'Settings';
    content.appendChild(title);
    const form = document.createElement('form');
    form.className = 'jp-llm-ext-settings-form';
    // Provider selection
    const providerLabel = document.createElement('label');
    providerLabel.className = 'jp-llm-ext-settings-label';
    providerLabel.textContent = 'API Provider:';
    form.appendChild(providerLabel);
    const providerSelect = document.createElement('select');
    providerSelect.className = 'jp-llm-ext-settings-select';
    providerSelect.id = 'settings-provider'; // Keep ID for retrieval
    ['OpenAI', 'HuggingFace', 'Local'].forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        providerSelect.appendChild(option);
    });
    form.appendChild(providerSelect);
    // API Key input
    const apiKeyLabel = document.createElement('label');
    apiKeyLabel.className = 'jp-llm-ext-settings-label';
    apiKeyLabel.textContent = 'API Key:';
    form.appendChild(apiKeyLabel);
    const apiKeyInput = document.createElement('input');
    apiKeyInput.className = 'jp-llm-ext-settings-input';
    apiKeyInput.type = 'password';
    apiKeyInput.id = 'settings-api-key'; // Keep ID for retrieval
    form.appendChild(apiKeyInput);
    // API URL input
    const apiUrlLabel = document.createElement('label');
    apiUrlLabel.className = 'jp-llm-ext-settings-label';
    apiUrlLabel.textContent = 'API URL (optional):';
    form.appendChild(apiUrlLabel);
    const apiUrlInput = document.createElement('input');
    apiUrlInput.className = 'jp-llm-ext-settings-input';
    apiUrlInput.type = 'text';
    apiUrlInput.id = 'settings-api-url'; // Keep ID for retrieval
    form.appendChild(apiUrlInput);
    // Rules input
    const rulesLabel = document.createElement('label');
    rulesLabel.className = 'jp-llm-ext-settings-label';
    rulesLabel.textContent = 'Custom Rules (optional):';
    form.appendChild(rulesLabel);
    const rulesInput = document.createElement('textarea');
    rulesInput.className = 'jp-llm-ext-settings-textarea';
    rulesInput.id = 'settings-rules'; // Keep ID for retrieval
    form.appendChild(rulesInput);
    // Buttons container
    const btnContainer = document.createElement('div');
    btnContainer.className = 'jp-llm-ext-settings-buttons';
    const saveBtn = document.createElement('button');
    saveBtn.className = 'jp-llm-ext-settings-button jp-llm-ext-settings-save-button';
    saveBtn.textContent = 'Save';
    saveBtn.type = 'button'; // Prevent default form submission
    saveBtn.addEventListener('click', (event) => {
        event.preventDefault();
        // The callback implementation will handle reading values and saving
        const settings = {
            apiKey: apiKeyInput.value,
            apiUrl: apiUrlInput.value,
            rules: rulesInput.value,
            provider: providerSelect.value
        };
        callbacks.handleSave(settings);
    });
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'jp-llm-ext-settings-button jp-llm-ext-settings-cancel-button';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.type = 'button'; // Prevent default form submission
    cancelBtn.addEventListener('click', (event) => {
        event.preventDefault();
        callbacks.handleCancel();
    });
    btnContainer.appendChild(saveBtn);
    btnContainer.appendChild(cancelBtn);
    form.appendChild(btnContainer);
    content.appendChild(form);
    modal.appendChild(content);
    return modal;
}
/**
 * Creates and manages the settings modal dialog.
 */
class SettingsModal {
    // private modalElement: HTMLDivElement; // Commented out - unused
    // private settings: AppSettings; // Commented out - unused
    constructor(callbacks) {
        // this.modalElement = createSettingsModalElement(callbacks); // Commented out - unused assignment
        // this.settings = { // Commented out - unused initialization
        //     provider: '', 
        //     apiKey: '', 
        //     apiUrl: '', 
        //     rules: '' 
        // }; 
    }
}
exports.SettingsModal = SettingsModal;
