"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = registerCommands;
const ui_components_1 = require("@jupyterlab/ui-components"); // Import LabIcon if needed as placeholder
// Placeholder icon (replace if you have a specific icon)
const extensionIcon = ui_components_1.LabIcon.resolve({ icon: 'ui-components:jupyterlab' }); // Use resolve for built-in
/**
 * Registers commands for the extension
 */
function registerCommands(app, palette, launcher, sidebarWidget) {
    // Add command to toggle the sidebar
    app.commands.addCommand('simple-extension:toggle-sidebar', {
        label: 'Toggle AI Assistant Sidebar',
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
}
