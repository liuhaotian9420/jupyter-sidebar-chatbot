import { JupyterFrontEnd } from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils';
import { ILauncher } from '@jupyterlab/launcher';
import { SimpleSidebarWidget } from './chat/sidebar-widget';
/**
 * Registers commands for the extension
 */
export declare function registerCommands(app: JupyterFrontEnd, palette: ICommandPalette, launcher: ILauncher, sidebarWidget: SimpleSidebarWidget): void;
