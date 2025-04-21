"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiClient = void 0;
const launcher_1 = require("@jupyterlab/launcher");
const apputils_1 = require("@jupyterlab/apputils");
const notebook_1 = require("@jupyterlab/notebook");
const docmanager_1 = require("@jupyterlab/docmanager");
const sidebar_widget_1 = require("./sidebar-widget");
const globals_1 = require("./globals");
const commands_1 = require("./commands");
const cell_context_tracker_1 = require("./cell-context-tracker");
// import { ApiClient } from './api-client';
// Import the main CSS file
require("../style/index.css");
// Export ApiClient for use by other components
var api_client_1 = require("./api-client");
Object.defineProperty(exports, "ApiClient", { enumerable: true, get: function () { return api_client_1.ApiClient; } });
/**
 * Initialization data for the jupyter-simple-extension extension.
 */
const plugin = {
    id: 'jupyter-simple-extension:plugin',
    autoStart: true,
    requires: [launcher_1.ILauncher, apputils_1.ICommandPalette, notebook_1.INotebookTracker, docmanager_1.IDocumentManager],
    activate: (jupyterApp, launcher, palette, tracker, docManager) => {
        console.log('JupyterLab extension jupyter-simple-extension is activated!');
        // Initialize global references
        (0, globals_1.initGlobals)(jupyterApp, tracker);
        // Initialize cell context tracker
        globals_1.globals.cellContextTracker = new cell_context_tracker_1.CellContextTracker(jupyterApp, tracker);
        // Create and add sidebar widget
        const sidebarWidget = new sidebar_widget_1.SimpleSidebarWidget(docManager);
        jupyterApp.shell.add(sidebarWidget, 'left', { rank: 9999 });
        // Register commands
        (0, commands_1.registerCommands)(jupyterApp, palette, launcher, sidebarWidget);
    }
};
exports.default = plugin;
