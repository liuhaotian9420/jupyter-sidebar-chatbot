import { JupyterFrontEnd } from '@jupyterlab/application';
import { INotebookTracker } from '@jupyterlab/notebook';
import { IDisposable } from '@lumino/disposable';
import { ICellContext } from './types';
/**
 * Tracks cell context and cursor position within Jupyter notebooks
 */
export declare class CellContextTracker implements IDisposable {
    private notebookTracker;
    private activeCellEditorNode;
    private lastCellContext;
    private _isDisposed;
    constructor(app: JupyterFrontEnd, notebookTracker: INotebookTracker);
    /**
     * Whether this object has been disposed
     */
    get isDisposed(): boolean;
    /**
     * Sets up all the necessary event trackers
     */
    private setupTrackers;
    /**
     * Handles notebook changes
     */
    private handleNotebookChange;
    /**
     * Sets up event listeners on the active cell
     */
    private setupCellListeners;
    /**
     * Cleans up event listeners from the previous active cell
     */
    private cleanupPreviousListeners;
    /**
     * Handles editor events (keydown, mouseup)
     */
    private handleEditorEvent;
    /**
     * Gets context information from CodeMirror EditorView
     */
    private getCmContext;
    /**
     * Gets the current cell context
     */
    getCurrentCellContext(): ICellContext | null;
    /**
     * Disposes all resources
     */
    dispose(): void;
}
