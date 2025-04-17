import { JupyterFrontEnd } from '@jupyterlab/application';
import { INotebookTracker } from '@jupyterlab/notebook';
import { IGlobalReferences } from './types';

/**
 * Global references to key components in the application
 */
export const globals: IGlobalReferences = {};

/**
 * Initialize global references
 */
export function initGlobals(
  app: JupyterFrontEnd,
  notebookTracker: INotebookTracker
): void {
  globals.app = app;
  globals.notebookTracker = notebookTracker;
} 