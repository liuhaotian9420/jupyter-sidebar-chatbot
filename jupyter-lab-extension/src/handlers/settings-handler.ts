import { SettingsState, AppSettings } from '../state/settings-state';
import { UIManager } from '../ui/ui-manager'; // Import UIManager if it provides notification service

/**
 * Handles the logic related to the settings modal: 
 * displaying, hiding, populating, saving, and showing feedback.
 */
export class SettingsHandler {
    private state: SettingsState;
    private settingsModalContainer: HTMLDivElement;
    private uiManager: UIManager; // To show notifications

    constructor(
        state: SettingsState,
        settingsModalContainer: HTMLDivElement,
        uiManager: UIManager // Pass UIManager for notifications
    ) {
        this.state = state;
        this.settingsModalContainer = settingsModalContainer;
        this.uiManager = uiManager;
    }

    /**
     * Populates the settings form with current values and displays the modal.
     */
    public showModal(): void {
        const currentSettings = this.state.getSettings();
        if (currentSettings) {
            try {
                // Query elements within the modal container
                (this.settingsModalContainer.querySelector('#settings-provider') as HTMLSelectElement).value = currentSettings.provider;
                (this.settingsModalContainer.querySelector('#settings-api-key') as HTMLInputElement).value = currentSettings.apiKey;
                (this.settingsModalContainer.querySelector('#settings-api-url') as HTMLInputElement).value = currentSettings.apiUrl;
                (this.settingsModalContainer.querySelector('#settings-rules') as HTMLTextAreaElement).value = currentSettings.rules;
            } catch (error) {
                console.error('Error populating settings form:', error);
                // Optionally show an error to the user
            }
        }
        this.settingsModalContainer.style.display = 'flex';
    }

    /**
     * Hides the settings modal.
     */
    public hideModal(): void {
        this.settingsModalContainer.style.display = 'none';
    }

    /**
     * Reads values from the form, saves them using SettingsState,
     * updates the ApiClient, hides the modal, and shows a success notification.
     * This method is intended to be called by the modal's save button listener.
     */
    public saveSettings(): void {
        // Get values from form fields within the modal container
        const provider = (this.settingsModalContainer.querySelector('#settings-provider') as HTMLSelectElement)?.value;
        const key = (this.settingsModalContainer.querySelector('#settings-api-key') as HTMLInputElement)?.value;
        const url = (this.settingsModalContainer.querySelector('#settings-api-url') as HTMLInputElement)?.value;
        const rules = (this.settingsModalContainer.querySelector('#settings-rules') as HTMLTextAreaElement)?.value;

        // Basic validation
        if (provider === undefined || key === undefined || url === undefined || rules === undefined) {
            console.error("Could not find all settings input elements.");
            this.showNotification('Error: Could not save settings. Input elements missing.', 'error');
            return;
        }

        const settings: AppSettings = { provider, apiKey: key, apiUrl: url, rules };

        try {
            // Save settings using SettingsState
            this.state.saveSettings(settings);
            console.log('Settings saved via SettingsState:', settings);
            
            // Reconfigure ApiClient instance
            // TODO: The ApiClient should ideally observe the SettingsState 
            // or have a dedicated update method instead of creating a new instance.
            // For now, we assume the main widget will recreate/update the ApiClient 
            // or pass an update callback.
            // Example: this.apiClient.updateConfig(settings.apiUrl || undefined);
            console.log('API Client needs reconfiguration with new settings.');

            this.hideModal();
            this.showNotification('Settings saved successfully', 'success');

        } catch (error) {
            console.error('Error saving settings:', error);
            this.showNotification(`Error saving settings: ${error}`, 'error');
        }
    }

    /**
     * Displays a temporary notification message.
     * Relies on UIManager to provide the actual notification mechanism.
     */
    private showNotification(message: string, type: 'success' | 'error' | 'info'): void {
        // Delegate notification display to UIManager or a dedicated notification service
        if (this.uiManager && typeof this.uiManager.showNotification === 'function') {
            this.uiManager.showNotification(message, type);
        } else {
            // Fallback or log if UIManager doesn't support notifications yet
            console.log(`Notification (${type}): ${message}`);
            // The old popSaveSuccess logic requires direct access to the widget node,
            // which this handler shouldn't have. This needs to be handled by the UI layer.
        }
    }
} 