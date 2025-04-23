export interface LayoutCallbacks {
    onTitleChange?: (newTitle: string) => void;
    onNewChatClick?: () => void;
    onHistoryToggleClick?: () => void;
    onSendMessageClick?: () => void;
    onInputFieldKeyPress?: (event: KeyboardEvent) => void;
    onInputFieldValueChange?: (value: string) => void;
    onMarkdownToggleChange?: (isMarkdown: boolean) => void;
    onExpandToggleClick?: (button: HTMLButtonElement) => void;
    onAtButtonClick?: (event: MouseEvent) => void;
    onSettingsClick?: (event: MouseEvent) => void;
}
export interface LayoutElements {
    mainElement: HTMLDivElement;
    titleInput: HTMLInputElement;
    messageContainer: HTMLDivElement;
    historyContainer: HTMLDivElement;
    inputField: HTMLTextAreaElement;
    bottomBarContainer: HTMLDivElement;
    sendButton: HTMLButtonElement;
    newChatButton: HTMLButtonElement;
    historyButton: HTMLButtonElement;
    markdownToggleButton: HTMLInputElement;
    expandButton: HTMLButtonElement;
    atButton: HTMLButtonElement;
    settingsButton: HTMLButtonElement;
}
/**
 * Builds the main HTML structure for the sidebar widget.
 *
 * @param callbacks - An object containing callback functions for various UI interactions.
 * @returns An object containing the main widget HTMLElement and references to key interactive elements.
 */
export declare function buildLayout(callbacks?: LayoutCallbacks): LayoutElements;
