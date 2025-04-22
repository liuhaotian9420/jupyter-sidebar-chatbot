/**
 * Interface for the application settings.
 */
export interface AppSettings {
  provider: 'OpenAI' | 'HuggingFace' | 'Local' | string; // Allow string for future extensibility
  apiKey: string;
  apiUrl: string; // Optional API URL
  rules: string; // Custom rules/prompt prefix
}

const SETTINGS_STORAGE_KEY = 'jp-llm-ext-settings';

/**
 * Manages loading and saving application settings to localStorage.
 */
export class SettingsState {
  private currentSettings: AppSettings | null = null;

  constructor() {
    this.currentSettings = this.loadSettings();
  }

  /**
   * Loads settings from localStorage.
   * @returns The loaded settings or null if none are saved or an error occurs.
   */
  loadSettings(): AppSettings | null {
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings) as AppSettings;
        // Basic validation (can be expanded)
        if (settings && settings.provider) {
          this.currentSettings = settings;
          console.log('Loaded settings:', this.currentSettings);
          return this.currentSettings;
        }
      } catch (error) {
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
  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      this.currentSettings = { ...settings }; // Update internal state
      console.log('Settings saved:', this.currentSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      // Optional: Notify user of save failure
    }
  }

  /**
   * Gets the currently loaded settings.
   * @returns The current settings object or null if not loaded.
   */
  getSettings(): AppSettings | null {
    return this.currentSettings ? { ...this.currentSettings } : null; // Return a copy
  }

  /**
   * Gets a specific setting value.
   * @param key - The key of the setting to retrieve.
   * @returns The value of the setting or undefined if not found.
   */
  getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] | undefined {
    return this.currentSettings ? this.currentSettings[key] : undefined;
  }
} 