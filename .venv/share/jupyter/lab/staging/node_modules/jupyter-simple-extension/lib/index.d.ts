import { JupyterFrontEndPlugin } from '@jupyterlab/application';
export { ApiClient } from './api-client';
/**
 * Initialization data for the jupyter-simple-extension extension.
 * This plugin integrates a custom sidebar with JupyterLab for enhanced functionality.
 */
declare const plugin: JupyterFrontEndPlugin<void>;
export default plugin;
