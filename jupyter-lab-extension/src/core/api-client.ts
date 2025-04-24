/**
 * API client for interacting with the backend LLM service
 */
export class ApiClient {
  private baseUrl: string;
  private localServiceUrl: string;

  constructor(baseUrl: string = 'http://localhost:8000') {
    // Normalize URL by removing trailing slashes
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    // Always keep local service URL for backend operations
    this.localServiceUrl = 'http://localhost:8000';
    console.log(`ApiClient initialized with baseUrl: ${this.baseUrl}`);
    console.log(`Local service URL fixed at: ${this.localServiceUrl}`);
  }

  /**
   * Stream a chat response from the LLM
   * @param message The user message to send
   * @param context Optional context information
   * @param onChunk Callback for each text chunk received
   * @param onComplete Callback when streaming is complete
   * @param onError Callback for errors
   * @param thread_id Optional thread ID for maintaining conversation history (deprecated, use context.thread_id instead)
   */
  async streamChat(
    message: string,
    context: any = null,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void,
    thread_id?: string
  ): Promise<void> {
    try {
      // Build the request body, allowing thread_id to come from either parameter (backward compatibility)
      // or from the context object (preferred)
      const requestBody: {
        message: string;
        context?: any;
        thread_id?: string;
      } = {
        message
      };
      
      // Set thread_id from either source (context.thread_id takes precedence)
      const effectiveThreadId = context?.thread_id || thread_id;
      
      // Debug info
      console.log('ApiClient.streamChat - Inputs:', { 
        message,
        context,
        thread_id,
        effectiveThreadId 
      });
      
      // Add the thread_id to the request body if available
      if (effectiveThreadId) {
        requestBody.thread_id = effectiveThreadId;
      }
      
      // Add context if provided, but don't modify the original context object
      if (context) {
        // Make a shallow copy of the context to avoid modifying the original
        requestBody.context = { ...context };
        
        // Remove thread_id from context copy to avoid duplication
        if ('thread_id' in requestBody.context) {
          delete requestBody.context.thread_id;
        }
      }
      
      // Debug info - final request body
      console.log('ApiClient.streamChat - Request body:', JSON.stringify(requestBody));

      // Use local service URL for backend operations
      const response = await fetch(`${this.localServiceUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
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
    } catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Create a new thread for conversation history
   * @returns Promise that resolves to the created thread ID
   */
  async createThread(): Promise<string> {
    try {
      // First check if the API is healthy
      const isHealthy = await this.healthCheck();
      if (!isHealthy) {
        console.warn('Backend API is not healthy, cannot create thread');
        throw new Error('Backend API is not healthy');
      }
      
      // Use local service URL for backend operations
      const threadUrl = `${this.localServiceUrl}/create-thread`;
      console.log('Creating thread using API endpoint:', threadUrl);
      
      try {
        const response = await fetch(threadUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        console.log(`Create thread response status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Thread created successfully:', data.thread_id);
        return data.thread_id;
      } catch (fetchError) {
        console.error('Error in fetch operation:', fetchError);
        // Check for CORS errors
        if (fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch')) {
          console.error('This might be a CORS or network connectivity issue. Check backend server logs.');
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      throw error;
    }
  }

  /**
   * List all available threads
   * @returns Promise that resolves to an array of thread IDs
   */
  async listThreads(): Promise<string[]> {
    try {
      // Use local service URL for backend operations
      const response = await fetch(`${this.localServiceUrl}/threads`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.threads;
    } catch (error) {
      console.error('Error listing threads:', error);
      throw error;
    }
  }

  /**
   * Update LLM settings on the backend
   * @param settings Settings to update
   * @returns Promise that resolves to the updated settings
   */
  async updateSettings(settings: {
    provider: string;
    apiKey: string;
    apiUrl?: string;
    rules?: string;
    model: string;
  }): Promise<any> {
    try {
      // Use local service URL for backend operations
      const response = await fetch(`${this.localServiceUrl}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  /**
   * Simple health check for the API
   * @returns A promise that resolves to true if the API is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Always use the local service URL for health check
      const healthUrl = `${this.localServiceUrl}/health`;
      console.log(`Performing health check at: ${healthUrl}`);
      
      const response = await fetch(healthUrl, {
        method: 'GET'
      });
      
      console.log(`Health check response status: ${response.status} ${response.statusText}`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      // More detailed logging for network errors
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('Network error: Could not connect to the backend. Please check if the backend server is running.');
      }
      return false;
    }
  }
} 