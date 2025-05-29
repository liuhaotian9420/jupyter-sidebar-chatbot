import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ILauncher } from '@jupyterlab/launcher';
import { ICommandPalette } from '@jupyterlab/apputils';
import { INotebookTracker } from '@jupyterlab/notebook';
import { IDocumentManager } from '@jupyterlab/docmanager';

import { ChatbotSidebarWidget } from './sidebar-widget';
import { initGlobals, globals } from './core/globals';
import { registerCommands } from './commands';
import { CellContextTracker } from './cell-context-tracker';
// import { ApiClient } from './api-client';

// Import the main CSS file
import '../style/index.css';

// Export ApiClient for use by other components
export { ApiClient } from './core/api-client';

/**
 * Initialization data for the jupyter-sidebar-chatbot extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyter-sidebar-chatbot:plugin',
  autoStart: true,
  requires: [ILauncher, ICommandPalette, INotebookTracker, IDocumentManager],
  activate: (
    jupyterApp: JupyterFrontEnd,
    launcher: ILauncher,
    palette: ICommandPalette,
    tracker: INotebookTracker,
    docManager: IDocumentManager
  ) => {
    console.log('JupyterLab extension jupyter-sidebar-chatbot is activated!');
    
    // Initialize global references
    initGlobals(jupyterApp, tracker);
    
    // Initialize cell context tracker
    globals.cellContextTracker = new CellContextTracker(jupyterApp, tracker);
    
    // Create and add sidebar widget
    const sidebarWidget = new ChatbotSidebarWidget(docManager);
    jupyterApp.shell.add(sidebarWidget, 'left', { rank: 9999 });

    // Register commands
    registerCommands(jupyterApp, palette, launcher, sidebarWidget);
  }
};

export default plugin; 