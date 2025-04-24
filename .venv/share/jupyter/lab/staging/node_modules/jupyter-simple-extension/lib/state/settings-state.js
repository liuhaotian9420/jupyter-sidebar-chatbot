"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsManager = exports.DEFAULT_SETTINGS = void 0;
/**
 * Default settings values
 */
exports.DEFAULT_SETTINGS = {
    provider: 'OpenAI',
    apiKey: '',
    apiUrl: '',
    rules: '',
    model: 'gpt-4'
};
/**
 * Utility class for managing application settings
 */
class SettingsManager {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.currentSettings = Object.assign({}, exports.DEFAULT_SETTINGS);
        this.loadSettingsFromStorage();
    }
    /**
     * Get the singleton instance of SettingsManager
     * @param apiClient The API client to use
     * @returns The singleton instance
     */
    static getInstance(apiClient) {
        if (!SettingsManager.instance) {
            SettingsManager.instance = new SettingsManager(apiClient);
        }
        return SettingsManager.instance;
    }
    /**
     * Update the API client reference
     * @param apiClient The new API client to use
     */
    updateApiClient(apiClient) {
        this.apiClient = apiClient;
    }
    /**
     * Get the current settings
     * @returns The current settings
     */
    getSettings() {
        return Object.assign({}, this.currentSettings);
    }
    /**
     * Save settings to localStorage and update the backend
     * @param settings The settings to save
     * @returns A promise that resolves when the settings are saved
     */
    async saveSettings(settings) {
        // Update local settings
        this.currentSettings = Object.assign({}, settings);
        // Save to localStorage
        localStorage.setItem('jupyter-llm-ext-settings', JSON.stringify(settings));
        // Update backend
        try {
            await this.apiClient.updateSettings(settings);
            console.log('Settings saved to backend');
        }
        catch (error) {
            console.error('Failed to save settings to backend:', error);
            throw error;
        }
    }
    /**
     * Load settings from localStorage
     */
    loadSettingsFromStorage() {
        const storedSettings = localStorage.getItem('jupyter-llm-ext-settings');
        if (storedSettings) {
            try {
                const parsed = JSON.parse(storedSettings);
                this.currentSettings = Object.assign(Object.assign({}, exports.DEFAULT_SETTINGS), parsed);
            }
            catch (error) {
                console.error('Failed to parse stored settings:', error);
            }
        }
    }
}
exports.SettingsManager = SettingsManager;
