# Documentation for `jupyter-lab-extension/src/index.ts`

This file is the primary entry point for the `jupyter-simple-extension` JupyterLab extension. It defines the plugin and orchestrates the initialization of the extension's core components when JupyterLab starts.

## Overview

The main purpose of this file is to define and export the `JupyterFrontEndPlugin`. The `activate` function within this plugin is responsible for:

1.  **Initialization:** Setting up necessary global states and services.
2.  **UI Setup:** Creating and adding the main sidebar widget (`SimpleSidebarWidget`) to the JupyterLab shell.
3.  **Command Registration:** Registering commands that can be accessed through the command palette or shortcuts.
4.  **Context Tracking:** Initializing the `CellContextTracker` to monitor notebook interactions.
5.  **CSS Loading:** Importing the main CSS file (`../style/index.css`) to apply styling.

## Key Components

### Plugin Definition

```typescript
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyter-simple-extension:plugin',
  autoStart: true,
  requires: [ILauncher, ICommandPalette, INotebookTracker, IDocumentManager],
  activate: (
    jupyterApp: JupyterFrontEnd,
    launcher: ILauncher,
    palette: ICommandPalette,
    tracker: INotebookTracker,
    docManager: IDocumentManager
  ) => {
    // Activation logic...
  }
};

export default plugin;
```

-   **`id`:** A unique identifier for the plugin.
-   **`autoStart: true`:** Ensures the plugin is activated automatically when JupyterLab loads.
-   **`requires`:** Specifies the core JupyterLab services (tokens) that this plugin depends on. These services are passed as arguments to the `activate` function.
    -   `ILauncher`: Used to add commands to the launcher.
    -   `ICommandPalette`: Used to add commands to the command palette.
    -   `INotebookTracker`: Used to track the active notebook and cell.
    -   `IDocumentManager`: Used for document-related operations (e.g., file browsing).
-   **`activate` Function:** This is the core function executed when the plugin starts. It receives instances of the required services.

### Activation Logic

Inside the `activate` function:

1.  **Logging:** Logs a message to the console indicating the extension is active.
    ```typescript
    console.log('JupyterLab extension jupyter-simple-extension is activated!');
    ```
2.  **Global Initialization:** Calls `initGlobals` to store references to the `JupyterFrontEnd` application instance and the `INotebookTracker`.
    ```typescript
    initGlobals(jupyterApp, tracker);
    ```
3.  **Cell Context Tracking:** Creates an instance of `CellContextTracker`, passing the application instance and notebook tracker, and stores it in the global state.
    ```typescript
    globals.cellContextTracker = new CellContextTracker(jupyterApp, tracker);
    ```
4.  **Sidebar Widget Creation & Addition:** Instantiates the `SimpleSidebarWidget` (passing the `IDocumentManager`) and adds it to the left area of the JupyterLab shell.
    ```typescript
    const sidebarWidget = new SimpleSidebarWidget(docManager);
    jupyterApp.shell.add(sidebarWidget, 'left', { rank: 9999 }); // High rank to appear lower
    ```
5.  **Command Registration:** Calls `registerCommands` to set up all the commands used by the extension, passing references to the app, palette, launcher, and the sidebar widget.
    ```typescript
    registerCommands(jupyterApp, palette, launcher, sidebarWidget);
    ```

### Exports

```typescript
export { ApiClient } from './core/api-client';
export default plugin;
```

-   Exports the `ApiClient` class, potentially for use in other extensions or for testing.
-   Exports the `plugin` definition as the default export, which is required by JupyterLab to load the extension.

### Imports

-   Imports necessary types and interfaces from `@jupyterlab` modules.
-   Imports local components: `SimpleSidebarWidget`, `initGlobals`, `globals`, `registerCommands`, `CellContextTracker`.
-   Imports the main CSS file: `../style/index.css`. 