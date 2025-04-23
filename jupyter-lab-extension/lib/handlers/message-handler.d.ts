import { ApiClient } from '../core/api-client';
import { ChatState } from '../state/chat-state';
import { UIManager } from '../ui/ui-manager';
import { MessageRendererCallbacks } from '../ui/message-renderer';
import { InputHandler } from './input-handler';
/**
 * Handles sending messages, interacting with the API,
 * managing streaming responses, and updating the UI and state.
 */
export declare class MessageHandler {
    private apiClient;
    private chatState;
    private uiManager;
    private rendererCallbacks;
    private inputHandler;
    constructor(apiClient: ApiClient, chatState: ChatState, uiManager: UIManager, rendererCallbacks: MessageRendererCallbacks, inputHandler: InputHandler);
    /**
     * Processes and sends a user-initiated message.
     * Also handles adding the user message to the UI and clearing the input.
     */
    handleSendMessage(message: string): void;
    /**
     * Sends an automatic message (e.g., 'confirmed', 'rejected')
     * to the backend and handles the streaming response.
     * Also adds the user's confirmation/rejection action to the UI.
     */
    handleSendAutoMessage(message: string): void;
    /**
     * Adds a message to the UI via UIManager and saves to ChatState.
     * (Helper method, potentially could live in UIManager or be part of its callback)
     */
    private addMessage;
    /**
     * Core logic for sending a message to the API, handling the stream,
     * rendering the response, and saving the final bot message.
     */
    private streamAndRenderResponse;
}
