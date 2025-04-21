"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiClient = void 0;
const launcher_1 = require("@jupyterlab/launcher");
const apputils_1 = require("@jupyterlab/apputils");
const notebook_1 = require("@jupyterlab/notebook");
const docmanager_1 = require("@jupyterlab/docmanager");
// Import the modularized SimpleSidebarWidget from the new location
const sidebar_widget_1 = require("./chat/sidebar-widget");
const globals_1 = require("./globals");
const commands_1 = require("./commands");
const cell_context_tracker_1 = require("./cell-context-tracker");
// Export ApiClient for use by other components
var api_client_1 = require("./api-client");
Object.defineProperty(exports, "ApiClient", { enumerable: true, get: function () { return api_client_1.ApiClient; } });
/**
 * Initialization data for the jupyter-simple-extension extension.
 * This plugin integrates a custom sidebar with JupyterLab for enhanced functionality.
 */
const plugin = {
    id: 'jupyter-simple-extension:plugin',
    autoStart: true,
    requires: [launcher_1.ILauncher, apputils_1.ICommandPalette, notebook_1.INotebookTracker, docmanager_1.IDocumentManager],
    activate: (jupyterApp, launcher, palette, tracker, docManager) => {
        console.log('JupyterLab extension jupyter-simple-extension is activated!');
        // Initialize global references for app and notebook tracking
        (0, globals_1.initGlobals)(jupyterApp, tracker);
        // Initialize cell context tracker to monitor active cells and contexts
        globals_1.globals.cellContextTracker = new cell_context_tracker_1.CellContextTracker(jupyterApp, tracker);
        // Create and add sidebar widget for user interaction and context insertion
        const sidebarWidget = new sidebar_widget_1.SimpleSidebarWidget(docManager);
        jupyterApp.shell.add(sidebarWidget, 'left', { rank: 9999 });
        // Register commands for interacting with the extension via command palette and launcher
        (0, commands_1.registerCommands)(jupyterApp, palette, launcher, sidebarWidget);
    }
};
exports.default = plugin;
