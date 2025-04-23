"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsState = void 0;
const SETTINGS_STORAGE_KEY = 'jp-llm-ext-settings';
/**
 * Manages loading and saving application settings to localStorage.
 */
class SettingsState {
    constructor() {
        this.currentSettings = null;
        this.currentSettings = this.loadSettings();
    }
    /**
     * Loads settings from localStorage.
     * @returns The loaded settings or null if none are saved or an error occurs.
     */
    loadSettings() {
        const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                // Basic validation (can be expanded)
                if (settings && settings.provider) {
                    this.currentSettings = settings;
                    console.log('Loaded settings:', this.currentSettings);
                    return this.currentSettings;
                }
            }
            catch (error) {
                console.error('Error loading saved settings:', error);
                localStorage.removeItem(SETTINGS_STORAGE_KEY); // Clear corrupted data
            }
        }
        console.log('No valid settings found in localStorage.');
        return null;
    }
    /**
     * Saves the provided settings to localStorage.
     * @param settings - The settings object to save.
     */
    saveSettings(settings) {
        try {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
            this.currentSettings = Object.assign({}, settings); // Update internal state
            console.log('Settings saved:', this.currentSettings);
        }
        catch (error) {
            console.error('Error saving settings:', error);
            // Optional: Notify user of save failure
        }
    }
    /**
     * Gets the currently loaded settings.
     * @returns The current settings object or null if not loaded.
     */
    getSettings() {
        return this.currentSettings ? Object.assign({}, this.currentSettings) : null; // Return a copy
    }
    /**
     * Gets a specific setting value.
     * @param key - The key of the setting to retrieve.
     * @returns The value of the setting or undefined if not found.
     */
    getSetting(key) {
        return this.currentSettings ? this.currentSettings[key] : undefined;
    }
}
exports.SettingsState = SettingsState;
