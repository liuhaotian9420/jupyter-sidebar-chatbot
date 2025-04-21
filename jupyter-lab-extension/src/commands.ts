import { JupyterFrontEnd } from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils';
import { ILauncher } from '@jupyterlab/launcher';
import { extensionIcon } from './icons';
import { SimpleSidebarWidget } from './chat/sidebar-widget';

/**
 * Registers commands for the extension
 */
export function registerCommands(
  app: JupyterFrontEnd,
  palette: ICommandPalette,
  launcher: ILauncher,
  sidebarWidget: SimpleSidebarWidget
): void {
  // Add command to toggle the sidebar
  app.commands.addCommand('simple-extension:toggle-sidebar', {
    label: 'Toggle AI Assistant Sidebar',
    icon: extensionIcon,
    execute: () => {
      if (sidebarWidget.isAttached) {
        sidebarWidget.parent = null;
      } else {
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