import { ApiClient } from '../core/api-client';
/**
 * Interface for application settings
 */
export interface AppSettings {
    provider: string;
    apiKey: string;
    apiUrl: string;
    rules: string;
    model: string;
}
/**
 * Default settings values
 */
export declare const DEFAULT_SETTINGS: AppSettings;
/**
 * Utility class for managing application settings
 */
export declare class SettingsManager {
    private apiClient;
    private static instance;
    private currentSettings;
    private constructor();
    /**
     * Get the singleton instance of SettingsManager
     * @param apiClient The API client to use
     * @returns The singleton instance
     */
    static getInstance(apiClient: ApiClient): SettingsManager;
    /**
     * Update the API client reference
     * @param apiClient The new API client to use
     */
    updateApiClient(apiClient: ApiClient): void;
    /**
     * Get the current settings
     * @returns The current settings
     */
    getSettings(): AppSettings;
    /**
     * Save settings to localStorage and update the backend
     * @param settings The settings to save
     * @returns A promise that resolves when the settings are saved
     */
    saveSettings(settings: AppSettings): Promise<void>;
    /**
     * Load settings from localStorage
     */
    private loadSettingsFromStorage;
}
