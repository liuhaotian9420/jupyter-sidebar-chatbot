/**
 * API client for interacting with the backend LLM service
 */
export declare class ApiClient {
    private baseUrl;
    private localServiceUrl;
    constructor(baseUrl?: string);
    /**
     * Stream a chat response from the LLM
     * @param message The user message to send
     * @param context Optional context information
     * @param onChunk Callback for each text chunk received
     * @param onComplete Callback when streaming is complete
     * @param onError Callback for errors
     * @param thread_id Optional thread ID for maintaining conversation history (deprecated, use context.thread_id instead)
     */
    streamChat(message: string, context: any | undefined, onChunk: (chunk: string) => void, onComplete: () => void, onError: (error: Error) => void, thread_id?: string): Promise<void>;
    /**
     * Create a new thread for conversation history
     * @returns Promise that resolves to the created thread ID
     */
    createThread(): Promise<string>;
    /**
     * List all available threads
     * @returns Promise that resolves to an array of thread IDs
     */
    listThreads(): Promise<string[]>;
    /**
     * Update LLM settings on the backend
     * @param settings Settings to update
     * @returns Promise that resolves to the updated settings
     */
    updateSettings(settings: {
        provider: string;
        apiKey: string;
        apiUrl?: string;
        rules?: string;
        model: string;
    }): Promise<any>;
    /**
     * Simple health check for the API
     * @returns A promise that resolves to true if the API is healthy
     */
    healthCheck(): Promise<boolean>;
}
