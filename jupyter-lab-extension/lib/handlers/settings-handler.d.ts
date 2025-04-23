import { SettingsState } from '../state/settings-state';
import { UIManager } from '../ui/ui-manager';
/**
 * Handles the logic related to the settings modal:
 * displaying, hiding, populating, saving, and showing feedback.
 */
export declare class SettingsHandler {
    private state;
    private settingsModalContainer;
    private uiManager;
    constructor(state: SettingsState, settingsModalContainer: HTMLDivElement, uiManager: UIManager);
    /**
     * Populates the settings form with current values and displays the modal.
     */
    showModal(): void;
    /**
     * Hides the settings modal.
     */
    hideModal(): void;
    /**
     * Reads values from the form, saves them using SettingsState,
     * updates the ApiClient, hides the modal, and shows a success notification.
     * This method is intended to be called by the modal's save button listener.
     */
    saveSettings(): void;
    /**
     * Displays a temporary notification message.
     * Relies on UIManager to provide the actual notification mechanism.
     */
    private showNotification;
}
