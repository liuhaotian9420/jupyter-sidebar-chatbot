/**
 * Placeholder class for LLM state management.
 * This class is referenced by other components and needs to exist to resolve imports.
 */
export class LLMState {
  // Basic properties for LLM state
  private model: string = 'default';
  private apiKey: string | null = null;
  
  constructor() {
    // Initialize state or load from storage if needed
  }
  
  /**
   * Sets the active LLM model.
   * @param model The model identifier
   */
  setModel(model: string): void {
    this.model = model;
  }
  
  /**
   * Gets the currently active model.
   * @returns The model identifier
   */
  getModel(): string {
    return this.model;
  }
  
  /**
   * Sets the API key for authentication.
   * @param apiKey The API key
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }
  
  /**
   * Gets the current API key.
   * @returns The API key or null if not set
   */
  getApiKey(): string | null {
    return this.apiKey;
  }
} 