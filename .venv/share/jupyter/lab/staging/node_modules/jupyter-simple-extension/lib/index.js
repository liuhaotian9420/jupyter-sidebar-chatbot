import { ILauncher } from '@jupyterlab/launcher';
import { ICommandPalette } from '@jupyterlab/apputils';
import { INotebookTracker } from '@jupyterlab/notebook';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { SimpleSidebarWidget } from './sidebar-widget';
import { initGlobals, globals } from './globals';
import { registerCommands } from './commands';
import { CellContextTracker } from './cell-context-tracker';
/**
 * Initialization data for the jupyter-simple-extension extension.
 */
const plugin = {
    id: 'jupyter-simple-extension:plugin',
    autoStart: true,
    requires: [ILauncher, ICommandPalette, INotebookTracker, IDocumentManager],
    activate: (jupyterApp, launcher, palette, tracker, docManager) => {
        console.log('JupyterLab extension jupyter-simple-extension is activated!');
        // Initialize global references
        initGlobals(jupyterApp, tracker);
        // Initialize cell context tracker
        globals.cellContextTracker = new CellContextTracker(jupyterApp, tracker);
        // Create and add sidebar widget
        const sidebarWidget = new SimpleSidebarWidget(docManager);
        jupyterApp.shell.add(sidebarWidget, 'left', { rank: 9999 });
        // Register commands
        registerCommands(jupyterApp, palette, launcher, sidebarWidget);
    }
};
export default plugin;
