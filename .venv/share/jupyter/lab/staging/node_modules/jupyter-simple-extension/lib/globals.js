/**
 * Global references to key components in the application
 */
export const globals = {};
/**
 * Initialize global references
 */
export function initGlobals(app, notebookTracker) {
    globals.app = app;
    globals.notebookTracker = notebookTracker;
}
