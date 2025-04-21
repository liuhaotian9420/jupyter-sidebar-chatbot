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
export class SettingsManager {
  private settingsModalContainer: HTMLDivElement;
  private defaultSettings: ChatSettings = {
    provider: 'OpenAI',
    apiKey: '',
    apiBaseUrl: '',
    rules: ''
  };
  private currentSettings: ChatSettings;

  constructor() {
    this.currentSettings = { ...this.defaultSettings };
    this.settingsModalContainer = this.createSettingsModal();
    document.body.appendChild(this.settingsModalContainer);
  }

  /**
   * Creates the settings modal
   * @returns The created modal container
   */
  private createSettingsModal(): HTMLDivElement {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.display = 'none';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.zIndex = '1000';

    const content = document.createElement('div');
    content.style.backgroundColor = '#fff';
    content.style.padding = '20px';
    content.style.borderRadius = '5px';
    content.style.width = '400px';

    const title = document.createElement('h3');
    title.textContent = 'Settings';
    content.appendChild(title);

    const providerLabel = document.createElement('label');
    providerLabel.htmlFor = 'settings-provider';
    providerLabel.textContent = 'LLM Provider:';
    content.appendChild(providerLabel);

    const providerSelect = document.createElement('select');
    providerSelect.id = 'settings-provider';
    ['OpenAI', 'HuggingFace', 'Local'].forEach(opt => {
      const option = document.createElement('option');
      option.value = opt;
      option.textContent = opt;
      providerSelect.appendChild(option);
    });
    content.appendChild(providerSelect);
    content.appendChild(document.createElement('br'));

    const keyLabel = document.createElement('label');
    keyLabel.htmlFor = 'settings-api-key';
    keyLabel.textContent = 'API Key:';
    content.appendChild(keyLabel);

    const keyInput = document.createElement('input');
    keyInput.id = 'settings-api-key';
    keyInput.type = 'text';
    keyInput.style.width = '100%';
    content.appendChild(keyInput);
    content.appendChild(document.createElement('br'));

    const urlLabel = document.createElement('label');
    urlLabel.htmlFor = 'settings-api-base-url';
    urlLabel.textContent = 'API Base URL (optional):';
    content.appendChild(urlLabel);

    const urlInput = document.createElement('input');
    urlInput.id = 'settings-api-base-url';
    urlInput.type = 'text';
    urlInput.style.width = '100%';
    content.appendChild(urlInput);
    content.appendChild(document.createElement('br'));

    const rulesLabel = document.createElement('label');
    rulesLabel.htmlFor = 'settings-rules';
    rulesLabel.textContent = 'Rules:';
    content.appendChild(rulesLabel);

    const rulesTextarea = document.createElement('textarea');
    rulesTextarea.id = 'settings-rules';
    rulesTextarea.style.width = '100%';
    rulesTextarea.style.height = '100px';
    content.appendChild(rulesTextarea);
    content.appendChild(document.createElement('br'));

    const btnContainer = document.createElement('div');
    btnContainer.style.textAlign = 'right';
    btnContainer.style.marginTop = '10px';

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', () => {
      const provider = (document.getElementById('settings-provider') as HTMLSelectElement).value;
      const key = (document.getElementById('settings-api-key') as HTMLInputElement).value;
      const url = (document.getElementById('settings-api-base-url') as HTMLInputElement).value;
      const rules = (document.getElementById('settings-rules') as HTMLTextAreaElement).value;
      
      this.currentSettings = {
        provider,
        apiKey: key,
        apiBaseUrl: url,
        rules
      };
      
      console.log('Settings saved:', this.currentSettings);
      this.hideSettingsModal();
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.marginLeft = '10px';
    cancelBtn.addEventListener('click', () => this.hideSettingsModal());

    btnContainer.appendChild(saveBtn);
    btnContainer.appendChild(cancelBtn);
    content.appendChild(btnContainer);

    modal.appendChild(content);
    return modal;
  }

  /**
   * Shows the settings modal
   */
  public showSettingsModal(): void {
    // Update form fields with current settings
    (document.getElementById('settings-provider') as HTMLSelectElement).value = this.currentSettings.provider;
    (document.getElementById('settings-api-key') as HTMLInputElement).value = this.currentSettings.apiKey;
    (document.getElementById('settings-api-base-url') as HTMLInputElement).value = this.currentSettings.apiBaseUrl;
    (document.getElementById('settings-rules') as HTMLTextAreaElement).value = this.currentSettings.rules;
    
    this.settingsModalContainer.style.display = 'flex';
  }

  /**
   * Hides the settings modal
   */
  public hideSettingsModal(): void {
    this.settingsModalContainer.style.display = 'none';
  }

  /**
   * Gets the current settings
   * @returns The current settings
   */
  public getSettings(): ChatSettings {
    return { ...this.currentSettings };
  }

  /**
   * Cleans up resources
   */
  public dispose(): void {
    if (this.settingsModalContainer.parentNode) {
      this.settingsModalContainer.parentNode.removeChild(this.settingsModalContainer);
    }
  }
}
