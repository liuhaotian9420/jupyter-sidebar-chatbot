/**
 * Helper function to copy text to clipboard.
 * Provides visual feedback via console logs and optionally a callback.
 */
export declare function copyToClipboard(text: string, feedbackCallback?: () => void): void;
/**
 * Copies message content to clipboard.
 * Provides visual feedback via console logs and optionally a callback.
 */
export declare function copyMessageToClipboard(text: string, feedbackCallback?: (success: boolean) => void): void;
/**
 * Copies an image to the clipboard from a given URL.
 * Provides visual feedback via console logs and optionally a callback.
 */
export declare function copyImageToClipboard(imageUrl: string, feedbackCallback?: (success: boolean) => void): void;
