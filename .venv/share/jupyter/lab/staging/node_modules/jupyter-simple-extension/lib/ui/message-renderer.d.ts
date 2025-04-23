import { CodeRefData } from '../handlers/input-handler';
/**
 * Callbacks for actions within rendered messages.
 */
export interface MessageRendererCallbacks {
    showCopyFeedback: (button: HTMLButtonElement) => void;
    addMessageToCell: (content: string) => void;
    copyToClipboard: (text: string, feedbackCb: () => void) => void;
    copyImageToClipboard: (imageUrl: string, feedbackCb: () => void) => void;
    copyMessageToClipboard: (text: string, feedbackCb: () => void) => void;
    handleConfirmInterrupt: () => void;
    handleRejectInterrupt: () => void;
    getCodeRefData?: (refId: string) => CodeRefData | undefined;
    getCurrentNotebookContext?: () => {
        name: string;
        path: string;
    } | undefined;
}
/**
 * Options for rendering a message.
 */
export interface MessageRenderOptions {
    isMarkdown: boolean;
}
/**
 * Renders a user message.
 */
export declare function renderUserMessage(text: string, options?: Partial<MessageRenderOptions>, callbacks?: Partial<MessageRendererCallbacks>): HTMLDivElement;
/**
 * Renders a bot message (text, markdown, images, code blocks).
 */
export declare function renderBotMessage(text: string, options?: Partial<MessageRenderOptions>, callbacks?: Partial<MessageRendererCallbacks>): HTMLDivElement;
/**
 * Creates the initial structure for a bot message that will receive streaming content.
 *
 * @returns Object containing the wrapper, streaming div, and final content div.
 */
export declare function renderBotMessageStreamingStart(): {
    wrapper: HTMLDivElement;
    streamingDiv: HTMLDivElement;
    contentDiv: HTMLDivElement;
};
/**
 * Updates the streaming div with a new chunk of text.
 *
 * @param streamingDiv - The div displaying streaming content.
 * @param chunk - The new text chunk to append.
 */
export declare function renderBotMessageStreamingUpdate(streamingDiv: HTMLDivElement, chunk: string): void;
/**
 * Renders the final content of a bot message after streaming is complete.
 * Handles markdown, images, code blocks, and interrupts.
 *
 * @param contentDiv - The div where the final content should be rendered.
 * @param streamingDiv - The div that was used for streaming (will be hidden).
 * @param completeResponse - The full text content from the bot.
 * @param options - Rendering options including callbacks for actions.
 * @returns The populated contentDiv.
 */
export declare function renderBotMessageFinal(contentDiv: HTMLDivElement, streamingDiv: HTMLDivElement, completeResponse: string, options?: Partial<MessageRenderOptions & MessageRendererCallbacks>, callbacks?: Partial<MessageRendererCallbacks>): HTMLDivElement;
/**
 * Handles rendering individual messages (user, bot, system) into HTML elements.
 */
export declare class MessageRenderer {
    constructor();
}
