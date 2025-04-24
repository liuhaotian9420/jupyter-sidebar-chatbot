"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsModal = void 0;
exports.createSettingsModalElement = createSettingsModalElement;
const settings_state_1 = require("../state/settings-state");
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
    // Model selection
    const modelLabel = document.createElement('label');
    modelLabel.className = 'jp-llm-ext-settings-label';
    modelLabel.textContent = 'Model:';
    form.appendChild(modelLabel);
    const modelSelect = document.createElement('select');
    modelSelect.className = 'jp-llm-ext-settings-select';
    modelSelect.id = 'settings-model'; // Keep ID for retrieval
    // Predefined set of model names
    const modelOptions = {
        'OpenAI': ['deepseek-chat', 'gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-4o', 'gpt-4o-mini',],
        'HuggingFace': ['mistral-7b', 'llama-2-70b', 'falcon-40b', 'mixtral-8x7b'],
        'Local': ['llama2', 'mistral', 'phi-2', 'codellama', 'orca-mini']
    };
    // Initial loading of model options based on default provider
    modelOptions['OpenAI'].forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        modelSelect.appendChild(option);
    });
    // Update model options when provider changes
    providerSelect.addEventListener('change', () => {
        // Clear existing options
        modelSelect.innerHTML = '';
        // Add new options based on selected provider
        const selectedProvider = providerSelect.value;
        const providerModels = modelOptions[selectedProvider] || [];
        providerModels.forEach((opt) => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            modelSelect.appendChild(option);
        });
    });
    form.appendChild(modelSelect);
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
    rulesInput.placeholder = 'Enter custom rules or instructions for the LLM...\n\nExample:\n- Be concise and clear\n- Focus on code quality\n- Follow best practices';
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
            provider: providerSelect.value,
            model: modelSelect.value
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
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.settings = Object.assign({}, settings_state_1.DEFAULT_SETTINGS);
        // Define our callbacks
        const callbacks = {
            handleSave: this.saveSettings.bind(this),
            handleCancel: this.hideModal.bind(this)
        };
        // Create the modal element
        this.modalElement = createSettingsModalElement(callbacks);
        // Add modal to document body
        document.body.appendChild(this.modalElement);
        // Close modal when clicking outside
        this.modalElement.addEventListener('click', (event) => {
            if (event.target === this.modalElement) {
                this.hideModal();
            }
        });
    }
    /**
     * Load existing settings into the form
     */
    loadSettingsIntoForm() {
        const providerSelect = document.getElementById('settings-provider');
        const apiKeyInput = document.getElementById('settings-api-key');
        const apiUrlInput = document.getElementById('settings-api-url');
        const rulesInput = document.getElementById('settings-rules');
        const modelSelect = document.getElementById('settings-model');
        if (providerSelect && this.settings.provider) {
            providerSelect.value = this.settings.provider;
            // Update model options for the selected provider
            if (modelSelect) {
                // Clear existing options
                modelSelect.innerHTML = '';
                // Get model options for the current provider
                const modelOptions = {
                    'OpenAI': ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-4o', 'gpt-4o-mini'],
                    'HuggingFace': ['mistral-7b', 'llama-2-70b', 'falcon-40b', 'mixtral-8x7b'],
                    'Local': ['llama2', 'mistral', 'phi-2', 'codellama', 'orca-mini']
                };
                const providerModels = modelOptions[this.settings.provider] || [];
                providerModels.forEach((opt) => {
                    const option = document.createElement('option');
                    option.value = opt;
                    option.textContent = opt;
                    modelSelect.appendChild(option);
                });
                // Set the selected model if it exists
                if (this.settings.model) {
                    modelSelect.value = this.settings.model;
                }
            }
        }
        if (apiKeyInput) {
            apiKeyInput.value = this.settings.apiKey || '';
        }
        if (apiUrlInput) {
            apiUrlInput.value = this.settings.apiUrl || '';
        }
        if (rulesInput) {
            rulesInput.value = this.settings.rules || '';
        }
    }
    /**
     * Show the modal dialog and load current settings
     * @param currentSettings Current settings to pre-fill
     */
    showModal(currentSettings) {
        if (currentSettings) {
            this.settings = Object.assign({}, currentSettings);
        }
        this.loadSettingsIntoForm();
        this.modalElement.style.display = 'flex';
    }
    /**
     * Hide the modal dialog
     */
    hideModal() {
        this.modalElement.style.display = 'none';
    }
    /**
     * Save the settings and hide the modal
     * @param settings Settings to save
     */
    async saveSettings(settings) {
        this.settings = Object.assign({}, settings);
        try {
            // Save settings to backend
            await this.apiClient.updateSettings(settings);
            // Hide modal on success
            this.hideModal();
        }
        catch (error) {
            console.error('Failed to save settings:', error);
            // Show error message (could be improved)
            alert('Failed to save settings. Please try again.');
        }
    }
}
exports.SettingsModal = SettingsModal;
