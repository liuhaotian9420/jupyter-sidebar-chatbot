import { Widget } from '@lumino/widgets';
import { IDocumentManager } from '@jupyterlab/docmanager';
/**
 * Main sidebar widget for the AI chat interface - Now acts as an orchestrator.
 */
export declare class SimpleSidebarWidget extends Widget {
    private apiClient;
    private chatState;
    private settingsState;
    private popupMenuManager;
    private inputHandler;
    private messageHandler;
    private historyHandler;
    private settingsHandler;
    private layoutElements;
    private settingsModalContainer;
    private uiManager;
    private docManager;
    private menuActionCallbacks;
    private handleNewChat;
    private handleToggleHistory;
    private handleSendMessage;
    private handleShowSettings;
    private handleShowPopupMenu;
    private handleUpdateTitle;
    constructor(docManager: IDocumentManager);
    /**
     * Disposes all resources
     */
    dispose(): void;
}
