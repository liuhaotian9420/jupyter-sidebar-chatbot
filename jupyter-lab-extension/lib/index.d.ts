import { JupyterFrontEndPlugin } from '@jupyterlab/application';
import '../style/index.css';
export { ApiClient } from './api-client';
/**
 * Initialization data for the jupyter-simple-extension extension.
 */
declare const plugin: JupyterFrontEndPlugin<void>;
export default plugin;
