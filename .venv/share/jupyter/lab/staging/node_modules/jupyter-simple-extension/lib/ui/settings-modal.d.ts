import { AppSettings } from '../state/settings-state';
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
    constructor(callbacks: SettingsModalCallbacks);
}
