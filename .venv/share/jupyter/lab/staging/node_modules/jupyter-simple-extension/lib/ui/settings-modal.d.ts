import { AppSettings } from '../state/settings-state';
import { ApiClient } from '../core/api-client';
/**
 * Callbacks for the settings modal actions.
 */
export interface SettingsModalCallbacks {
    /**
     * Called when the Save button is clicked.
     * The implementation should read the values from the form inputs,
     * save them, and potentially close the modal.
     */
    handleSave: (settings: AppSettings) => void;
    /**
     * Called when the Cancel button is clicked.
     * The implementation should typically close the modal.
     */
    handleCancel: () => void;
}
/**
 * Creates the HTML element for the settings modal.
 * @param callbacks Callbacks for save and cancel actions.
 * @returns The main modal HTMLElement.
 */
export declare function createSettingsModalElement(callbacks: SettingsModalCallbacks): HTMLDivElement;
/**
 * Creates and manages the settings modal dialog.
 */
export declare class SettingsModal {
    private modalElement;
    private settings;
    private apiClient;
    constructor(apiClient: ApiClient);
    /**
     * Load existing settings into the form
     */
    private loadSettingsIntoForm;
    /**
     * Show the modal dialog and load current settings
     * @param currentSettings Current settings to pre-fill
     */
    showModal(currentSettings?: AppSettings): void;
    /**
     * Hide the modal dialog
     */
    hideModal(): void;
    /**
     * Save the settings and hide the modal
     * @param settings Settings to save
     */
    private saveSettings;
}
