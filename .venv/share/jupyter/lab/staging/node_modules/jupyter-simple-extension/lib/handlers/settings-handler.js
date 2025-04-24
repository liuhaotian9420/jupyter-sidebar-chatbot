"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsHandler = void 0;
const api_client_1 = require("../core/api-client");
/**
 * Handles the logic related to the settings modal:
 * displaying, hiding, populating, saving, and showing feedback.
 */
class SettingsHandler {
    constructor(state, settingsModalContainer, uiManager, // Pass UIManager for notifications
    apiClient) {
        this.state = state;
        this.settingsModalContainer = settingsModalContainer;
        this.uiManager = uiManager;
        this.apiClient = apiClient;
    }
    /**
     * Populates the settings form with current values and displays the modal.
     */
    showModal() {
        const currentSettings = this.state.getSettings();
        if (currentSettings) {
            try {
                // Query elements within the modal container
                this.settingsModalContainer.querySelector('#settings-provider').value = currentSettings.provider;
                this.settingsModalContainer.querySelector('#settings-api-key').value = currentSettings.apiKey;
                this.settingsModalContainer.querySelector('#settings-api-url').value = currentSettings.apiUrl;
                this.settingsModalContainer.querySelector('#settings-rules').value = currentSettings.rules;
                // Load model selection
                const modelSelect = this.settingsModalContainer.querySelector('#settings-model');
                if (modelSelect) {
                    // Ensure we have options for the current provider
                    const providerSelect = this.settingsModalContainer.querySelector('#settings-provider');
                    if (providerSelect) {
                        // Trigger the change event to load model options for the selected provider
                        const event = new Event('change');
                        providerSelect.dispatchEvent(event);
                        // After options are loaded, set the selected model
                        if (currentSettings.model) {
                            modelSelect.value = currentSettings.model;
                        }
                    }
                }
            }
            catch (error) {
                console.error('Error populating settings form:', error);
                // Optionally show an error to the user
            }
        }
        this.settingsModalContainer.style.display = 'flex';
    }
    /**
     * Hides the settings modal.
     */
    hideModal() {
        this.settingsModalContainer.style.display = 'none';
    }
    /**
     * Updates the API client with new settings
     * This is important to ensure the API client uses the correct baseUrl
     * @param settings The new settings to apply
     */
    updateApiClient(settings) {
        // Create a new API client with the updated URL
        if (settings.apiUrl && settings.apiUrl.trim() !== '') {
            // Replace the API client instance with a new one using the updated URL
            this.apiClient = new api_client_1.ApiClient(settings.apiUrl);
            // Update the API client reference in the settings manager
            this.state.updateApiClient(this.apiClient);
            // Update API client in other components that need it
            // Publish an event that the API client has changed
            const event = new CustomEvent('api-client-updated', {
                detail: { apiClient: this.apiClient }
            });
            window.dispatchEvent(event);
            console.log('API Client updated with new baseUrl:', settings.apiUrl);
        }
        else {
            console.warn('Cannot update API client: apiUrl is empty');
        }
    }
    /**
     * Reads values from the form, saves them using SettingsState,
     * updates the ApiClient, hides the modal, and shows a success notification.
     * This method is intended to be called by the modal's save button listener.
     */
    saveSettings() {
        var _a, _b, _c, _d, _e;
        // Get values from form fields within the modal container
        const provider = (_a = this.settingsModalContainer.querySelector('#settings-provider')) === null || _a === void 0 ? void 0 : _a.value;
        const key = (_b = this.settingsModalContainer.querySelector('#settings-api-key')) === null || _b === void 0 ? void 0 : _b.value;
        const url = (_c = this.settingsModalContainer.querySelector('#settings-api-url')) === null || _c === void 0 ? void 0 : _c.value;
        const rules = (_d = this.settingsModalContainer.querySelector('#settings-rules')) === null || _d === void 0 ? void 0 : _d.value;
        const model = (_e = this.settingsModalContainer.querySelector('#settings-model')) === null || _e === void 0 ? void 0 : _e.value;
        // Basic validation
        if (provider === undefined || key === undefined || url === undefined || rules === undefined || model === undefined) {
            console.error("Could not find all settings input elements.");
            this.showNotification('Error: Could not save settings. Input elements missing.', 'error');
            return;
        }
        const settings = { provider, apiKey: key, apiUrl: url, rules, model };
        try {
            // Save settings using SettingsState
            this.state.saveSettings(settings);
            console.log('Settings saved via SettingsState:', settings);
            // Update the API client with new settings
            this.updateApiClient(settings);
            this.hideModal();
            this.showNotification('Settings saved successfully', 'success');
        }
        catch (error) {
            console.error('Error saving settings:', error);
            this.showNotification(`Error saving settings: ${error}`, 'error');
        }
    }
    /**
     * Displays a temporary notification message.
     * Relies on UIManager to provide the actual notification mechanism.
     */
    showNotification(message, type) {
        // Delegate notification display to UIManager or a dedicated notification service
        if (this.uiManager && typeof this.uiManager.showNotification === 'function') {
            this.uiManager.showNotification(message, type);
        }
        else {
            // Fallback or log if UIManager doesn't support notifications yet
            console.log(`Notification (${type}): ${message}`);
            // The old popSaveSuccess logic requires direct access to the widget node,
            // which this handler shouldn't have. This needs to be handled by the UI layer.
        }
    }
}
exports.SettingsHandler = SettingsHandler;
