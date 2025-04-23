"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiClient = void 0;
/**
 * API client for interacting with the backend LLM service
 */
class ApiClient {
    constructor(baseUrl = 'http://localhost:8000') {
        this.baseUrl = baseUrl;
    }
    /**
     * Stream a chat response from the mock LLM
     * @param message The user message to send
     * @param context Optional context information
     * @param onChunk Callback for each text chunk received
     * @param onComplete Callback when streaming is complete
     * @param onError Callback for errors
     */
    async streamChat(message, context = null, onChunk, onComplete, onError) {
        try {
            const response = await fetch(`${this.baseUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    context
                })
            });
            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }
            if (!response.body) {
                throw new Error('ReadableStream not supported in this browser.');
            }
            // Set up stream reading
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    const chunk = decoder.decode(value, { stream: !done });
                    onChunk(chunk);
                }
            }
            onComplete();
        }
        catch (error) {
            onError(error instanceof Error ? error : new Error(String(error)));
        }
    }
    /**
     * Simple health check for the API
     * @returns A promise that resolves to true if the API is healthy
     */
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseUrl}/health`);
            return response.ok;
        }
        catch (error) {
            console.error('API health check failed:', error);
            return false;
        }
    }
}
exports.ApiClient = ApiClient;
