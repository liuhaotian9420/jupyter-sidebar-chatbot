/**
 * Manages settings and configuration for the chat interface
 */
/**
 * Interface for chat settings
 */
export interface ChatSettings {
    provider: string;
    apiKey: string;
    apiBaseUrl: string;
    rules: string;
}
/**
 * Manages settings and configuration for the chat interface
 */
export declare class SettingsManager {
    private settingsModalContainer;
    private defaultSettings;
    private currentSettings;
    constructor();
    /**
     * Creates the settings modal
     * @returns The created modal container
     */
    private createSettingsModal;
    /**
     * Shows the settings modal
     */
    showSettingsModal(): void;
    /**
     * Hides the settings modal
     */
    hideSettingsModal(): void;
    /**
     * Gets the current settings
     * @returns The current settings
     */
    getSettings(): ChatSettings;
    /**
     * Cleans up resources
     */
    dispose(): void;
}
