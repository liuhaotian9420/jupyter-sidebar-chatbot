# Documentation for `jupyter-lab-extension/src/cell-context-tracker.ts`

This file defines the `CellContextTracker` class, responsible for monitoring the currently active notebook and cell within the JupyterLab environment.

## Overview

The `CellContextTracker` plays a crucial role in providing contextual information to the LLM. It listens to changes in the active cell within the currently focused notebook and provides methods to retrieve relevant information about that cell.

## Key Components

### Class Definition

```typescript
import { JupyterFrontEnd } from '@jupyterlab/application';
import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';
import { Cell, CodeCell, ICellModel } from '@jupyterlab/cells';
import { IObservableMap } from '@jupyterlab/observables';
import { IDisposable } from '@lumino/disposable';

export class CellContextTracker implements IDisposable {
    private _app: JupyterFrontEnd;
    private _notebookTracker: INotebookTracker;
    private _currentActiveCell: Cell | null = null;
    private _currentNotebookPanel: NotebookPanel | null = null;
    private _activeCellChangedSignal: AbortController | null = null;
    private _isDisposed = false;

    constructor(app: JupyterFrontEnd, notebookTracker: INotebookTracker) {
        this._app = app;
        this._notebookTracker = notebookTracker;

        // Connect signals
        this._notebookTracker.currentChanged.connect(this._onCurrentNotebookChanged, this);
        this._notebookTracker.activeCellChanged.connect(this._onActiveCellChanged, this);

        // Initialize with the current state
        this._onCurrentNotebookChanged(this._notebookTracker, this._notebookTracker.currentWidget);
        if (this._notebookTracker.currentWidget) {
            this._onActiveCellChanged(this._notebookTracker, this._notebookTracker.activeCell);
        }
    }

    // --- Private Signal Handlers ---
    private _onCurrentNotebookChanged(...): void { /* ... */ }
    private _onActiveCellChanged(...): void { /* ... */ }
    private _connectMetadataSignal(): void { /* ... */ }
    private _handleMetadataChange(...): void { /* ... */ }

    // --- Public Accessor Methods ---
    get currentActiveCell(): Cell | null { /* ... */ }
    get currentNotebookPanel(): NotebookPanel | null { /* ... */ }
    getCurrentCellContent(): string | null { /* ... */ }
    getSelectedText(): string | null { /* ... */ }

    // --- Dispose Method ---
    get isDisposed(): boolean { /* ... */ }
    dispose(): void { /* ... */ }
}
```

### Constructor Logic

1.  **Initialization:** Stores references to the `JupyterFrontEnd` application instance (`_app`) and the `INotebookTracker` (`_notebookTracker`).
2.  **Signal Connections:**
    *   Connects to the `currentChanged` signal of the `_notebookTracker`. This signal fires when the user switches focus between different notebook panels. The `_onCurrentNotebookChanged` method is called.
    *   Connects to the `activeCellChanged` signal of the `_notebookTracker`. This signal fires when the active cell within the current notebook changes. The `_onActiveCellChanged` method is called.
3.  **Initial State:** Calls the signal handlers (`_onCurrentNotebookChanged` and potentially `_onActiveCellChanged`) immediately to set the initial state based on the notebook/cell active when the tracker is created.

### Signal Handlers (Private Methods)

-   **`_onCurrentNotebookChanged(tracker, panel)`:**
    *   Updates the internal `_currentNotebookPanel` reference to the newly focused `NotebookPanel`.
    *   If a new panel is active, it calls `_onActiveCellChanged` to update the active cell reference based on the new notebook's state.
    *   It might also disconnect previous signal listeners (like metadata change listeners) from the old notebook/cell and connect new ones.
-   **`_onActiveCellChanged(tracker, cell)`:**
    *   Updates the internal `_currentActiveCell` reference.
    *   Potentially disconnects signals from the previously active cell and connects signals (e.g., metadata changes) to the new active cell using `_connectMetadataSignal`.
-   **`_connectMetadataSignal()` / `_handleMetadataChange()`:** (Implementation details might vary)
    *   These methods likely handle listening to changes in the active cell's metadata. This could be used, for example, to track if a cell has been marked specifically for the LLM extension.

### Public Accessor Methods

-   **`get currentActiveCell(): Cell | null`:** Returns the currently tracked active cell object, or `null` if no notebook or cell is active.
-   **`get currentNotebookPanel(): NotebookPanel | null`:** Returns the currently tracked active notebook panel object, or `null`.
-   **`getCurrentCellContent(): string | null`:** Retrieves the complete text content of the `currentActiveCell`. Returns `null` if no cell is active.
-   **`getSelectedText(): string | null`:** If the `currentActiveCell` is a `CodeCell`, this method retrieves the currently selected text within its editor. Returns `null` if no cell is active, it's not a code cell, or no text is selected.

### Disposable Interface

-   **`get isDisposed(): boolean`:** Returns `true` if the `dispose` method has been called.
-   **`dispose(): void`:** Cleans up resources when the tracker is no longer needed. This involves disconnecting all connected signals (`currentChanged`, `activeCellChanged`, metadata signals) to prevent memory leaks.

## Role in the Application

The `CellContextTracker` acts as the extension's sensor within the JupyterLab notebook environment. It provides essential context (active cell, selected text) needed by other components, particularly the `PopupMenuManager` (to offer relevant code/cell context actions) and potentially the `MessageHandler` (to automatically include cell content when sending messages). 