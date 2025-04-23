# Documentation for `jupyter-lab-extension/src/core/api-client.ts`

This file defines the `ApiClient` class, responsible for handling communication between the JupyterLab extension frontend and the backend API service.

## Overview

The `ApiClient` encapsulates the logic for making HTTP requests to the backend, specifically for the chat functionality. It handles sending user messages and context, and processing the potentially streamed responses from the backend.

## Key Components

### Class Definition

```typescript
import { SettingsState } from '../state/settings-state';

export class ApiClient {
    private apiUrl: string;
    private apiKey: string | null;
    private model: string;
    private settingsState: SettingsState;

    constructor(settingsState: SettingsState) {
        this.settingsState = settingsState;
        this.loadConfig();

        // Subscribe to setting changes
        this.settingsState.settingsChanged.connect(this.loadConfig, this);
    }

    // Method to load/reload configuration from SettingsState
    private loadConfig(): void {
        const settings = this.settingsState.getSettings();
        this.apiUrl = settings.apiUrl || 'http://127.0.0.1:8000'; // Default URL
        this.apiKey = settings.apiKey || null;
        this.model = settings.model || 'default-model'; // Default model
        console.log('ApiClient configuration loaded/updated:', { 
            apiUrl: this.apiUrl, 
            model: this.model, 
            apiKey: this.apiKey ? '******' : null 
        });
    }

    // Method to stream chat responses
    async streamChat(
        message: string, 
        context: any, // Consider defining a more specific type for context
        onChunk: (chunk: string) => void,
        onError: (error: Error) => void,
        onCompletion: () => void
    ): Promise<void> {
        // Implementation details...
        const controller = new AbortController();
        const signal = controller.signal;
        
        try {
            const response = await fetch(`${this.apiUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Include API Key if available
                    ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
                },
                body: JSON.stringify({ message, context, model: this.model }),
                signal: signal,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('Failed to get response reader');
            }

            const decoder = new TextDecoder();
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                const chunk = decoder.decode(value, { stream: true });
                onChunk(chunk);
            }
            onCompletion();
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Fetch aborted');
                // Handle abortion specifically if needed, maybe call onError or a specific onAbort callback
            } else {
                console.error('Streaming error:', error);
                onError(error as Error);
            }
        } finally {
            // Release reader lock? controller abort?
        }
    }
    
    // Method to dispose/cleanup
    dispose(): void {
        // Disconnect signal listener
        this.settingsState.settingsChanged.disconnect(this.loadConfig, this);
    }
}
```

### Constructor Logic

1.  **Store Dependencies:** Stores the provided `SettingsState` instance.
2.  **Load Initial Config:** Calls `loadConfig()` immediately to fetch the initial API URL, API Key, and Model from `SettingsState`.
3.  **Subscribe to Changes:** Connects the `loadConfig` method as a listener to the `settingsChanged` signal from `SettingsState`. This ensures the `ApiClient`'s configuration is automatically updated whenever the user saves new settings.

### `loadConfig()` Method

-   Retrieves the current settings object from `SettingsState`.
-   Updates the internal `apiUrl`, `apiKey`, and `model` properties, providing default values if they are not set.
-   Logs the loaded configuration (masking the API key).

### `streamChat()` Method

-   **Purpose:** Sends a chat request to the backend's `/chat` endpoint and handles the streamed response.
-   **Arguments:**
    -   `message` (string): The user's message.
    -   `context` (any): Additional contextual information (e.g., selected cell content).
    -   `onChunk` (function): Callback function executed for each received chunk of the response stream.
    -   `onError` (function): Callback function executed if an error occurs during the request or streaming.
    -   `onCompletion` (function): Callback function executed when the stream finishes successfully.
-   **Logic:**
    1.  Uses the `fetch` API to make a `POST` request to `${this.apiUrl}/chat`.
    2.  Sets the `Content-Type` header to `application/json`.
    3.  Includes an `Authorization: Bearer <apiKey>` header if an API key is configured.
    4.  Sends the `message`, `context`, and configured `model` in the request body (JSON stringified).
    5.  Includes an `AbortController` signal to potentially allow cancelling the request (though cancellation logic isn't fully shown in the snippet).
    6.  Checks if the response status is OK (`response.ok`). Throws an error if not.
    7.  Gets a `ReadableStreamDefaultReader` from the response body.
    8.  Uses a `TextDecoder` to decode the incoming `Uint8Array` chunks into strings.
    9.  Enters a loop that reads chunks from the stream until `done` is true.
    10. Calls the `onChunk` callback with the decoded string chunk.
    11. After the loop finishes (stream ends), calls the `onCompletion` callback.
    12. Includes error handling (`try...catch`) to catch network errors or issues during streaming, calling the `onError` callback.
    13. Includes a `finally` block (though its content isn't shown - might be used for cleanup like releasing reader locks).

### `dispose()` Method

-   Disconnects the `loadConfig` listener from the `SettingsState.settingsChanged` signal to prevent memory leaks when the `ApiClient` instance is no longer needed.

## Role in the Application

The `ApiClient` is the dedicated communication layer for backend interactions. It abstracts away the details of making HTTP requests and handling streams, providing a clean interface (`streamChat`) for the `MessageHandler` to use. It also dynamically adapts to configuration changes stored in `SettingsState`. 