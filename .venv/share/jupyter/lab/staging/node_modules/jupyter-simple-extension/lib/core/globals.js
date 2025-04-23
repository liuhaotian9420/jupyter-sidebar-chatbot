"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globals = void 0;
exports.initGlobals = initGlobals;
/**
 * Global references to key components in the application
 */
exports.globals = {};
/**
 * Initialize global references
 */
function initGlobals(app, notebookTracker) {
    exports.globals.app = app;
    exports.globals.notebookTracker = notebookTracker;
}
