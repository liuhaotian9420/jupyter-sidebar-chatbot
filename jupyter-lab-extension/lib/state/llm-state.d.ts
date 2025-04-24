/**
 * Placeholder class for LLM state management.
 * This class is referenced by other components and needs to exist to resolve imports.
 */
export declare class LLMState {
    private model;
    private apiKey;
    constructor();
    /**
     * Sets the active LLM model.
     * @param model The model identifier
     */
    setModel(model: string): void;
    /**
     * Gets the currently active model.
     * @returns The model identifier
     */
    getModel(): string;
    /**
     * Sets the API key for authentication.
     * @param apiKey The API key
     */
    setApiKey(apiKey: string): void;
    /**
     * Gets the current API key.
     * @returns The API key or null if not set
     */
    getApiKey(): string | null;
}
