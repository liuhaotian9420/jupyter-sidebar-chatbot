import { ILauncher } from '@jupyterlab/launcher';
import { LabIcon } from '@jupyterlab/ui-components';
import { Widget } from '@lumino/widgets';
import { ICommandPalette } from '@jupyterlab/apputils';
import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { IDocumentManager } from '@jupyterlab/docmanager';
// import { Transaction } from '@codemirror/state';
// import { IDisposable } from '@lumino/disposable';
// Example icon string (base64-encoded SVG)
const iconSvgStr = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-left-text" viewBox="0 0 16 16">' +
    '<path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>' +
    '<path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6zm0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>' +
    '</svg>';
// Create a custom icon
const extensionIcon = new LabIcon({
    name: 'simple:icon',
    svgstr: iconSvgStr
});
// Create a widget for the sidebar
class SimpleSidebarWidget extends Widget {
    constructor(docManager) {
        console.log('[SimpleSidebarWidget] Constructor start'); // Log 1
        super();
        this.isMarkdownMode = false;
        this.isInputExpanded = false;
        this.docManager = docManager;
        this.id = 'simple-sidebar';
        this.title.label = '';
        this.title.caption = 'AI Chat Interface';
        this.title.icon = extensionIcon;
        this.title.closable = true;
        // Create the main container
        const content = document.createElement('div');
        content.className = 'simple-sidebar-content';
        content.style.display = 'flex';
        content.style.flexDirection = 'column';
        content.style.height = '100%';
        // Create message container
        this.messageContainer = document.createElement('div');
        this.messageContainer.className = 'message-container';
        this.messageContainer.style.flexGrow = '1';
        this.messageContainer.style.overflowY = 'auto';
        this.messageContainer.style.padding = '10px';
        this.messageContainer.style.borderBottom = '1px solid #e0e0e0';
        // Create input container (will hold controls, input field, and send button)
        this.inputContainer = document.createElement('div');
        this.inputContainer.style.display = 'flex';
        this.inputContainer.style.flexDirection = 'column';
        this.inputContainer.style.padding = '10px';
        this.inputContainer.style.gap = '5px';
        // Create controls container (for toggle and action buttons on one line)
        const controlsContainer = document.createElement('div');
        controlsContainer.style.display = 'flex';
        controlsContainer.style.justifyContent = 'space-between';
        controlsContainer.style.alignItems = 'center';
        controlsContainer.style.marginBottom = '5px';
        // Create markdown toggle container (left side of controls)
        const toggleContainer = document.createElement('div');
        toggleContainer.style.display = 'flex';
        toggleContainer.style.alignItems = 'center';
        // Create markdown toggle
        const markdownToggle = document.createElement('input');
        markdownToggle.type = 'checkbox';
        markdownToggle.id = 'markdown-toggle';
        markdownToggle.style.marginRight = '5px';
        // Create toggle label
        const toggleLabel = document.createElement('label');
        toggleLabel.htmlFor = 'markdown-toggle';
        toggleLabel.textContent = 'Markdown mode';
        toggleLabel.style.fontSize = '12px';
        // Add toggle event
        markdownToggle.addEventListener('change', (e) => {
            const target = e.target;
            this.isMarkdownMode = target.checked;
            this.inputField.placeholder = this.isMarkdownMode ?
                'Write markdown here...\\n\\n# Example heading\\n- List item\\n\\n```code block```' :
                'Ask me anything...';
        });
        // Add toggle elements to container
        toggleContainer.appendChild(markdownToggle);
        toggleContainer.appendChild(toggleLabel);
        // Create action buttons container (right side of controls)
        console.log('[SimpleSidebarWidget] Creating action buttons container'); // Log 2
        const actionButtonsContainer = document.createElement('div');
        actionButtonsContainer.style.display = 'flex';
        actionButtonsContainer.style.gap = '2px';
        // Create command button
        const commandButton = this.createButton('@', 'Command list');
        commandButton.addEventListener('click', () => {
            // Command list logic will be implemented later
        });
        // Create attachment button
        const attachmentButton = this.createButton('📎', 'Upload file');
        attachmentButton.addEventListener('click', () => {
            // File upload logic will be implemented later
        });
        // Create file search button
        const fileSearchButton = this.createButton('🔍', 'Browse files');
        fileSearchButton.addEventListener('click', () => {
            // File browse logic will be implemented later
        });
        // Create expand input button
        const expandButton = this.createButton('⤢', 'Expand input');
        expandButton.addEventListener('click', () => {
            this.isInputExpanded = !this.isInputExpanded;
            if (this.isInputExpanded) {
                this.inputField.style.height = '100px';
                this.inputField.style.resize = 'vertical';
                expandButton.textContent = '⤡';
                expandButton.title = 'Collapse input';
            }
            else {
                this.inputField.style.height = 'auto';
                this.inputField.style.resize = 'none';
                expandButton.textContent = '⤢';
                expandButton.title = 'Expand input';
            }
        });
        // Create settings button
        const settingsButton = this.createButton('⚙️', 'Settings');
        settingsButton.addEventListener('click', () => {
            // Settings logic will be implemented later
        });
        // Create List Contents button
        const listDirButton = this.createButton('📁', 'List Directory Contents');
        listDirButton.addEventListener('click', () => this.listCurrentDirectoryContents());
        // Add buttons to container
        actionButtonsContainer.appendChild(commandButton);
        actionButtonsContainer.appendChild(attachmentButton);
        actionButtonsContainer.appendChild(fileSearchButton);
        actionButtonsContainer.appendChild(expandButton);
        actionButtonsContainer.appendChild(settingsButton);
        actionButtonsContainer.appendChild(listDirButton);
        // Add toggle and action buttons to the controls container
        controlsContainer.appendChild(toggleContainer);
        controlsContainer.appendChild(actionButtonsContainer);
        // Create input field (changed to textarea)
        this.inputField = document.createElement('textarea');
        this.inputField.placeholder = 'Ask me anything...';
        this.inputField.style.flexGrow = '1';
        this.inputField.style.padding = '5px';
        this.inputField.style.border = '1px solid #ccc';
        this.inputField.style.borderRadius = '3px';
        this.inputField.style.resize = 'none';
        this.inputField.rows = 1;
        this.inputField.style.overflowY = 'auto';
        // Create input actions container (for send button)
        const inputActionsContainer = document.createElement('div');
        inputActionsContainer.style.display = 'flex';
        inputActionsContainer.style.justifyContent = 'flex-end';
        inputActionsContainer.style.marginTop = '5px';
        // Create send button
        const sendButton = document.createElement('button');
        sendButton.className = 'jp-Button';
        sendButton.textContent = 'Send';
        sendButton.style.padding = '5px 10px';
        // Add event listeners
        sendButton.addEventListener('click', () => this.handleSendMessage());
        this.inputField.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                this.handleSendMessage();
            }
        });
        // Add button to actions container
        inputActionsContainer.appendChild(sendButton);
        // Assemble the input components
        this.inputContainer.appendChild(controlsContainer);
        console.log('[SimpleSidebarWidget] Controls container appended to input container'); // Log 6
        this.inputContainer.appendChild(this.inputField);
        this.inputContainer.appendChild(inputActionsContainer);
        // Assemble all components
        content.appendChild(this.messageContainer);
        content.appendChild(this.inputContainer);
        this.node.appendChild(content);
        console.log('[SimpleSidebarWidget] Constructor end'); // Log 7
    }
    createButton(text, tooltip) {
        const button = document.createElement('button');
        button.textContent = text;
        button.title = tooltip;
        button.className = 'jp-Button';
        button.style.margin = '0 2px';
        button.style.padding = '2px 8px';
        return button;
    }
    handleSendMessage() {
        const message = this.inputField.value.trim();
        if (message) {
            // Add metadata about markdown mode to the message
            this.addMessage(message, 'user', this.isMarkdownMode);
            this.inputField.value = '';
            // Reset expanded state if needed after sending
            if (this.isInputExpanded) {
                this.inputField.style.height = '100px';
            }
            else {
                this.inputField.style.height = 'auto';
                this.inputField.rows = 1;
            }
            // Echo response for demonstration
            setTimeout(() => {
                this.addMessage(`Echo: ${message}`, 'bot', false);
            }, 500);
        }
    }
    addMessage(text, sender, isMarkdown = false) {
        const messageDiv = document.createElement('div');
        messageDiv.style.marginBottom = '10px';
        messageDiv.style.padding = '8px';
        messageDiv.style.borderRadius = '5px';
        messageDiv.style.maxWidth = '80%';
        messageDiv.style.wordWrap = 'break-word';
        if (sender === 'user') {
            messageDiv.style.backgroundColor = '#e3f2fd';
            messageDiv.style.marginLeft = 'auto';
        }
        else {
            messageDiv.style.backgroundColor = '#f5f5f5';
            messageDiv.style.marginRight = 'auto';
        }
        // Add message content
        if (isMarkdown) {
            const markdownIndicator = document.createElement('div');
            markdownIndicator.textContent = "MD";
            markdownIndicator.style.fontSize = '9px';
            markdownIndicator.style.color = '#666';
            markdownIndicator.style.textAlign = 'right';
            messageDiv.appendChild(markdownIndicator);
            // Create a container for the rendered markdown
            const contentDiv = document.createElement('div');
            contentDiv.className = 'markdown-content';
            // Convert markdown to HTML and sanitize it
            try {
                // Parse markdown to HTML
                const rawHtml = marked.parse(text);
                // Sanitize the HTML to prevent XSS attacks
                const sanitizedHtml = DOMPurify.sanitize(rawHtml);
                // Set the sanitized HTML
                contentDiv.innerHTML = sanitizedHtml;
            }
            catch (error) {
                // Fallback if markdown parsing fails
                contentDiv.textContent = text;
                console.error('Failed to render markdown:', error);
            }
            messageDiv.appendChild(contentDiv);
        }
        else {
            messageDiv.textContent = text;
        }
        this.messageContainer.appendChild(messageDiv);
        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }
    async listCurrentDirectoryContents() {
        let dirPath = null;
        let source = null;
        // 1. Determine the directory path
        const currentShellWidget = app.shell.currentWidget;
        if (currentShellWidget) {
            const widgetContext = this.docManager.contextForWidget(currentShellWidget);
            if (widgetContext) {
                const path = widgetContext.path;
                const lastSlash = path.lastIndexOf('/');
                dirPath = lastSlash === -1 ? '' : path.substring(0, lastSlash); // Use '' for root
                source = 'widget context';
            }
        }
        // Fallback to notebook tracker if no context from widget
        if (dirPath === null) {
            const currentNotebookPanel = notebookTracker === null || notebookTracker === void 0 ? void 0 : notebookTracker.currentWidget;
            if (currentNotebookPanel instanceof NotebookPanel) {
                const nbPath = currentNotebookPanel.context.path;
                const lastSlash = nbPath.lastIndexOf('/');
                dirPath = lastSlash === -1 ? '' : nbPath.substring(0, lastSlash);
                source = 'active notebook';
            }
        }
        // 2. List contents if path was found
        if (dirPath !== null) {
            console.log(`Listing contents for directory: "${dirPath || '/'}" (from ${source})`);
            try {
                const contents = await this.docManager.services.contents.get(dirPath);
                console.log('Directory Contents:');
                if (contents.content && contents.content.length > 0) {
                    contents.content.forEach((item) => {
                        console.log(`- ${item.name} (${item.type})`);
                    });
                }
                else {
                    console.log('(Directory is empty)');
                }
            }
            catch (error) {
                console.error(`Error listing directory contents for "${dirPath}":`, error);
            }
        }
        else {
            console.log('Could not determine current directory context to list.');
        }
    }
}
// --- Need app and notebookTracker accessible globally or passed differently ---
let app;
let notebookTracker;
// --- Track active cell DOM elements with listeners ---
let activeCellEditorNode = null;
/**
 * Initialization data for the jupyter-simple-extension extension.
 */
const plugin = {
    id: 'jupyter-simple-extension:plugin',
    autoStart: true,
    requires: [ILauncher, ICommandPalette, INotebookTracker, IDocumentManager],
    activate: (_app, launcher, palette, _notebookTracker, docManager) => {
        console.log('JupyterLab extension jupyter-simple-extension is activated!');
        app = _app;
        notebookTracker = _notebookTracker;
        const sidebarWidget = new SimpleSidebarWidget(docManager);
        app.shell.add(sidebarWidget, 'left', { rank: 9999 });
        // Add a command to toggle the sidebar
        app.commands.addCommand('simple-extension:toggle-sidebar', {
            label: 'Toggle Simple Sidebar',
            icon: extensionIcon,
            execute: () => {
                if (sidebarWidget.isAttached) {
                    sidebarWidget.parent = null;
                }
                else {
                    app.shell.add(sidebarWidget, 'left', { rank: 9999 });
                }
            }
        });
        // Add the command to the command palette
        palette.addItem({
            command: 'simple-extension:toggle-sidebar',
            category: 'Extension'
        });
        // Add a launcher item
        launcher.add({
            command: 'simple-extension:toggle-sidebar',
            category: 'Other',
            rank: 9999
        });
        // --- Function to log cursor context from CodeMirror EditorView ---
        const logCmContext = (view) => {
            try {
                const state = view.state;
                const offset = state.selection.main.head;
                const fullText = state.doc.toString();
                const line = state.doc.lineAt(offset);
                const position = { line: line.number - 1, column: offset - line.from }; // Calculate approx line/col
                const contextRadius = 100;
                const start = Math.max(0, offset - contextRadius);
                const end = Math.min(fullText.length, offset + contextRadius);
                const contextBefore = fullText.substring(start, offset);
                const contextAfter = fullText.substring(offset, end);
                console.log('--- CM Cursor Context ---');
                console.log('Position (approx):', position);
                console.log('Offset:', offset);
                console.log('Before:', contextBefore);
                console.log('After:', contextAfter);
                console.log('-----------------------');
            }
            catch (error) {
                console.error("Error in logCmContext:", error);
                console.log("EditorView object during error:", view);
            }
        };
        // --- Function to remove event listeners from previous active cell ---
        const cleanupPreviousListeners = () => {
            if (activeCellEditorNode) {
                console.log("Removing event listeners from previous cell editor node.");
                // Remove both keydown and mouseup listeners
                activeCellEditorNode.removeEventListener('keydown', handleEditorEvent);
                activeCellEditorNode.removeEventListener('mouseup', handleEditorEvent);
                activeCellEditorNode = null;
            }
        };
        // --- Event handler for keypresses and mouse events ---
        const handleEditorEvent = (event) => {
            try {
                console.log(`Editor ${event.type} event detected`);
                // Get the current active cell from the tracker
                const cell = notebookTracker.activeCell;
                if (!cell || !cell.editor)
                    return;
                // Find the inner EditorView instance
                const editor = cell.editor;
                const view = editor.editor;
                if (!view) {
                    console.warn("Could not access inner EditorView in event handler");
                    return;
                }
                // Log the cursor context
                logCmContext(view);
            }
            catch (error) {
                console.error("Error in editor event handler:", error);
            }
        };
        // --- Setup event listeners on active cell ---
        const setupCellListeners = (cell) => {
            if (!cell)
                return;
            // Clean up previous listeners
            cleanupPreviousListeners();
            if (cell.editor) {
                try {
                    // Find editor DOM node - typically has class jp-Editor or CodeMirrorEditor
                    const cellNode = cell.node;
                    const editorNode = cellNode.querySelector('.jp-Editor') ||
                        cellNode.querySelector('.jp-InputArea-editor');
                    if (editorNode) {
                        console.log("Found editor DOM node, attaching event listeners");
                        // Store reference to active editor node
                        activeCellEditorNode = editorNode;
                        // Add event listeners for key and mouse events
                        editorNode.addEventListener('keydown', handleEditorEvent);
                        editorNode.addEventListener('mouseup', handleEditorEvent);
                        // Try to log immediate context if EditorView available
                        const view = cell.editor.editor;
                        if (view) {
                            console.log("Logging initial context after setting up listeners:");
                            logCmContext(view);
                        }
                    }
                    else {
                        console.warn("Could not find editor DOM node in cell");
                    }
                }
                catch (error) {
                    console.error("Error setting up cell listeners:", error);
                }
            }
        };
        // --- Minimal listener for active cell changes (to attach DOM listeners) ---
        notebookTracker.activeCellChanged.connect((tracker, cell) => {
            console.log(`Active cell changed, setting up event listeners...`);
            setupCellListeners(cell);
        });
        // --- Wait for app to start, then handle current notebook changes ---
        app.started.then(() => {
            console.log("App started, connecting notebookTracker.currentChanged listener.");
            notebookTracker.currentChanged.connect((tracker, panel) => {
                console.log("Notebook current widget changed.");
                // Clean up previous listeners
                cleanupPreviousListeners();
                if (panel && panel.content) {
                    const cell = panel.content.activeCell;
                    console.log("Setting up listeners for initial active cell in new notebook");
                    setupCellListeners(cell);
                }
            });
        });
    } // End activate function
}; // End plugin object definition
export default plugin;
