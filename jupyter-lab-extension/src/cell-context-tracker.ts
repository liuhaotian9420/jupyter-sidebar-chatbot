import { JupyterFrontEnd } from '@jupyterlab/application';
import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';
import { Cell } from '@jupyterlab/cells';
import { IDisposable } from '@lumino/disposable';
import { EditorView } from '@codemirror/view';
import { ICellContext } from './types';

/**
 * Tracks cell context and cursor position within Jupyter notebooks
 */
export class CellContextTracker implements IDisposable {
  private app: JupyterFrontEnd;
  private notebookTracker: INotebookTracker;
  private activeCellEditorNode: HTMLElement | null = null;
  private lastCellContext: ICellContext | null = null;
  private _isDisposed: boolean = false;

  constructor(app: JupyterFrontEnd, notebookTracker: INotebookTracker) {
    this.app = app;
    this.notebookTracker = notebookTracker;
    this.setupTrackers();
  }

  /**
   * Whether this object has been disposed
   */
  get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * Sets up all the necessary event trackers
   */
  private setupTrackers(): void {
    // Handle active cell changes
    this.notebookTracker.activeCellChanged.connect(this.setupCellListeners, this);

    // Handle notebook changes
    this.notebookTracker.currentChanged.connect(this.handleNotebookChange, this);
  }

  /**
   * Handles notebook changes
   */
  private handleNotebookChange(tracker: INotebookTracker, panel: NotebookPanel | null): void {
    this.cleanupPreviousListeners();
    
    if (panel && panel.content) {
      const cell = panel.content.activeCell;
      this.setupCellListeners(tracker, cell);
    }
  }

  /**
   * Sets up event listeners on the active cell
   */
  private setupCellListeners(_tracker: INotebookTracker, cell: Cell | null): void {
    if (!cell) return;
    
    this.cleanupPreviousListeners();
    
    if (cell.editor) {
      try {
        const cellNode = cell.node;
        const editorNode = cellNode.querySelector('.jp-Editor') || 
                          cellNode.querySelector('.jp-InputArea-editor');
        
        if (editorNode) {
          this.activeCellEditorNode = editorNode as HTMLElement;
          
          // Add event listeners for key and mouse events
          editorNode.addEventListener('keydown', this.handleEditorEvent);
          editorNode.addEventListener('mouseup', this.handleEditorEvent);
          
          // Try to capture immediate context if EditorView available
          const view = (cell.editor as any).editor;
          if (view) {
            this.lastCellContext = this.getCmContext(view);
          }
        }
      } catch (error) {
        console.error("Error setting up cell listeners:", error);
      }
    }
  }

  /**
   * Cleans up event listeners from the previous active cell
   */
  private cleanupPreviousListeners(): void {
    if (this.activeCellEditorNode) {
      this.activeCellEditorNode.removeEventListener('keydown', this.handleEditorEvent);
      this.activeCellEditorNode.removeEventListener('mouseup', this.handleEditorEvent);
      this.activeCellEditorNode = null;
    }
  }

  /**
   * Handles editor events (keydown, mouseup)
   */
  private handleEditorEvent = (event: Event): void => {
    try {
      // Get the current active cell from the tracker
      const cell = this.notebookTracker.activeCell;
      if (!cell || !cell.editor) return;
      
      // Find the inner EditorView instance
      const editor = cell.editor;
      const view = (editor as any).editor;
      if (!view) return;
      
      // Get and store the cursor context
      this.lastCellContext = this.getCmContext(view);
    } catch (error) {
      console.error("Error in editor event handler:", error);
    }
  };

  /**
   * Gets context information from CodeMirror EditorView
   */
  private getCmContext(view: EditorView): ICellContext {
    const state = view.state;
    const offset = state.selection.main.head;
    const fullText = state.doc.toString();
    const line = state.doc.lineAt(offset);
    const position = { 
      line: line.number - 1, 
      column: offset - line.from,
      offset: offset
    };

    const contextRadius = 100;
    const start = Math.max(0, offset - contextRadius);
    const end = Math.min(fullText.length, offset + contextRadius);

    return {
      text: fullText,
      position: position,
      contextBefore: fullText.substring(start, offset),
      contextAfter: fullText.substring(offset, end)
    };
  }

  /**
   * Gets the current cell context
   */
  public getCurrentCellContext(): ICellContext | null {
    return this.lastCellContext;
  }

  /**
   * Disposes all resources
   */
  public dispose(): void {
    if (this._isDisposed) {
      return;
    }
    this._isDisposed = true;
    this.cleanupPreviousListeners();
    this.notebookTracker.activeCellChanged.disconnect(this.setupCellListeners, this);
    this.notebookTracker.currentChanged.disconnect(this.handleNotebookChange, this);
  }
} 