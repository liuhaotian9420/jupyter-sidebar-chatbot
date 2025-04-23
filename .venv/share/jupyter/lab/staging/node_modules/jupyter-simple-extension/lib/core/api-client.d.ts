/**
 * API client for interacting with the backend LLM service
 */
export declare class ApiClient {
    private baseUrl;
    constructor(baseUrl?: string);
    /**
     * Stream a chat response from the mock LLM
     * @param message The user message to send
     * @param context Optional context information
     * @param onChunk Callback for each text chunk received
     * @param onComplete Callback when streaming is complete
     * @param onError Callback for errors
     */
    streamChat(message: string, context: any | undefined, onChunk: (chunk: string) => void, onComplete: () => void, onError: (error: Error) => void): Promise<void>;
    /**
     * Simple health check for the API
     * @returns A promise that resolves to true if the API is healthy
     */
    healthCheck(): Promise<boolean>;
}
