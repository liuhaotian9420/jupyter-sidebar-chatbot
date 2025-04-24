"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMState = void 0;
/**
 * Placeholder class for LLM state management.
 * This class is referenced by other components and needs to exist to resolve imports.
 */
class LLMState {
    constructor() {
        // Basic properties for LLM state
        this.model = 'default';
        this.apiKey = null;
        // Initialize state or load from storage if needed
    }
    /**
     * Sets the active LLM model.
     * @param model The model identifier
     */
    setModel(model) {
        this.model = model;
    }
    /**
     * Gets the currently active model.
     * @returns The model identifier
     */
    getModel() {
        return this.model;
    }
    /**
     * Sets the API key for authentication.
     * @param apiKey The API key
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }
    /**
     * Gets the current API key.
     * @returns The API key or null if not set
     */
    getApiKey() {
        return this.apiKey;
    }
}
exports.LLMState = LLMState;
