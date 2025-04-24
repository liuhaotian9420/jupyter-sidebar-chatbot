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
export const DEFAULT_SETTINGS: AppSettings = {
    provider: 'OpenAI',
    apiKey: '',
    apiUrl: '',
    rules: '',
    model: 'gpt-4'
};

/**
 * Utility class for managing application settings
 */
export class SettingsManager {
    private apiClient: ApiClient;
    private static instance: SettingsManager;
    private currentSettings: AppSettings;

    private constructor(apiClient: ApiClient) {
        this.apiClient = apiClient;
        this.currentSettings = { ...DEFAULT_SETTINGS };
        this.loadSettingsFromStorage();
    }

    /**
     * Get the singleton instance of SettingsManager
     * @param apiClient The API client to use
     * @returns The singleton instance
     */
    public static getInstance(apiClient: ApiClient): SettingsManager {
        if (!SettingsManager.instance) {
            SettingsManager.instance = new SettingsManager(apiClient);
        }
        return SettingsManager.instance;
    }

    /**
     * Update the API client reference
     * @param apiClient The new API client to use
     */
    public updateApiClient(apiClient: ApiClient): void {
        this.apiClient = apiClient;
    }

    /**
     * Get the current settings
     * @returns The current settings
     */
    public getSettings(): AppSettings {
        return { ...this.currentSettings };
    }

    /**
     * Save settings to localStorage and update the backend
     * @param settings The settings to save
     * @returns A promise that resolves when the settings are saved
     */
    public async saveSettings(settings: AppSettings): Promise<void> {
        // Update local settings
        this.currentSettings = { ...settings };
        
        // Save to localStorage
        localStorage.setItem('jupyter-llm-ext-settings', JSON.stringify(settings));
        
        // Update backend
        try {
            await this.apiClient.updateSettings(settings);
            console.log('Settings saved to backend');
        } catch (error) {
            console.error('Failed to save settings to backend:', error);
            throw error;
        }
    }

    /**
     * Load settings from localStorage
     */
    private loadSettingsFromStorage(): void {
        const storedSettings = localStorage.getItem('jupyter-llm-ext-settings');
        if (storedSettings) {
            try {
                const parsed = JSON.parse(storedSettings);
                this.currentSettings = {
                    ...DEFAULT_SETTINGS,
                    ...parsed
                };
            } catch (error) {
                console.error('Failed to parse stored settings:', error);
            }
        }
    }
} 