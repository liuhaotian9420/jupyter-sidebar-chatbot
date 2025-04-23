/**
 * Interface for the application settings.
 */
export interface AppSettings {
    provider: 'OpenAI' | 'HuggingFace' | 'Local' | string;
    apiKey: string;
    apiUrl: string;
    rules: string;
}
/**
 * Manages loading and saving application settings to localStorage.
 */
export declare class SettingsState {
    private currentSettings;
    constructor();
    /**
     * Loads settings from localStorage.
     * @returns The loaded settings or null if none are saved or an error occurs.
     */
    loadSettings(): AppSettings | null;
    /**
     * Saves the provided settings to localStorage.
     * @param settings - The settings object to save.
     */
    saveSettings(settings: AppSettings): void;
    /**
     * Gets the currently loaded settings.
     * @returns The current settings object or null if not loaded.
     */
    getSettings(): AppSettings | null;
    /**
     * Gets a specific setting value.
     * @param key - The key of the setting to retrieve.
     * @returns The value of the setting or undefined if not found.
     */
    getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] | undefined;
}
