import { Widget } from '@lumino/widgets';
import { IDocumentManager } from '@jupyterlab/docmanager';
/**
 * Main sidebar widget for the AI chat interface - Now acts as an orchestrator.
 */
export declare class SimpleSidebarWidget extends Widget {
    private apiClient;
    private chatState;
    private settingsState;
    private noteState;
    private popupMenuManager;
    private inputHandler;
    private messageHandler;
    private historyHandler;
    private noteHandler;
    private settingsHandler;
    private layoutElements;
    private settingsModalContainer;
    private uiManager;
    private docManager;
    private handleNewChat;
    private handleToggleHistory;
    private handleToggleNotes;
    private handleSendMessage;
    private handleShowSettings;
    private handleShowPopupMenu;
    private handleUpdateTitle;
    /**
     * Helper function to replace a text range with a non-editable widget span.
     */
    private createWidgetSpan;
    constructor(docManager: IDocumentManager);
    /**
     * Disposes all resources
     */
    dispose(): void;
}
