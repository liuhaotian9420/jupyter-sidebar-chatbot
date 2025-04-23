# Jupyter LLM Extension Documentation

This directory contains the detailed documentation for the `jupyter-llm-ext` project, covering both the backend service and the JupyterLab frontend extension.

## Overview

The documentation is organized as follows:

-   **This README:** Provides high-level diagrams and links to detailed documentation for specific modules.
-   **Backend Documentation:** Details about the FastAPI mock server (`backend/src/main.py`).
-   **Frontend Documentation:** Detailed explanations of the various TypeScript modules within the `jupyter-lab-extension/src/` directory, broken down by their function (core, handlers, state, UI, utils).

## Project Structure

This diagram shows the high-level directory structure of the project:

```mermaid
graph TD
    A[jupyter-llm-ext] --> B[backend];
    A --> C[jupyter-lab-extension];
    A --> D[docs];
    A --> E[Other Root Files];

    B --> B1[src];
    B1 --> B1a[main.py];
    B1 --> B1b[Images];

    C --> C1[src];
    C --> C2[style];
    C --> C3[lib];
    C --> C4[Config Files - package.json, tsconfig.json];

    C1 --> Ca[core];
    C1 --> Cb[handlers];
    C1 --> Cc[state];
    C1 --> Cd[ui];
    C1 --> Ce[utils];
    C1 --> Cf[Top-level Files];

    D --> Da[*.md Generated Docs];
    D --> Db[README.md];

    subgraph Backend Service
        B1a
        B1b
    end

    subgraph Frontend Extension Source
        Ca
        Cb
        Cc
        Cd
        Ce
        Cf
    end

    subgraph Documentation
        Da
        Db
    end
```

## Frontend Component Interactions

This diagram illustrates how the major components within the JupyterLab frontend extension interact with each other:

```mermaid
graph TD
    subgraph Core Widget
        SW[SimpleSidebarWidget]
    end

    subgraph UI Management
        UM[UIManager]
        LB[layout-builder.ts]
        MR[MessageRenderer]
        SM[settings-modal.ts]
        DE[dom-elements.ts]
        CRW[code-ref-widget.ts]
        IC[icons.ts]
    end

    subgraph State Management
        CS[ChatState]
        SS[SettingsState]
    end

    subgraph Handlers
        MH[MessageHandler]
        IH[InputHandler]
        HH[HistoryHandler]
        SetH[SettingsHandler]
        SH[ShortcutHandler]
        PMM[PopupMenuManager]
    end

    subgraph Core Services
        AC[ApiClient]
        GL[globals.ts]
        CCT[CellContextTracker]
    end

    subgraph Utilities
        Clip[clipboard.ts]
        High[highlighting.ts]
        MD[markdown-config.ts]
        NI[notebook-integration.ts]
    end

    subgraph JupyterLab Services
        JLabApp[JupyterFrontEnd]
        DocMan[IDocumentManager]
        NotebookTrack[INotebookTracker]
        CmdPalette[ICommandPalette]
    end

    %% Connections
    SW --> UM
    SW --> MH
    SW --> IH
    SW --> HH
    SW --> SetH
    SW --> SH
    SW --> AC
    SW --> CS
    SW --> SS
    SW --> CCT
    SW --> DocMan

    UM --> LB
    UM --> MR
    UM --> SM
    UM --> DE
    UM --> CRW
    UM --> IC
    UM --> HH
    UM --> IH
    UM --> SetH

    MH --> AC
    MH --> CS
    MH --> MR
    MH --> UM

    IH --> PMM
    IH --> CRW
    IH --> UM
    IH --> MH

    HH --> CS
    HH --> UM
    HH --> MR

    SetH --> SS
    SetH --> SM
    SetH --> UM
    SetH --> AC

    SH --> PMM
    SH --> IH

    PMM --> DocMan
    PMM --> CCT
    PMM --> IH

    MR --> MD
    MR --> High
    MR --> DE
    MR --> Clip
    MR --> NI

    AC --> SS

    CCT --> NotebookTrack

    SW -.-> JLabApp
    SW -.-> CmdPalette
```

## Overall System Diagram

This diagram provides a simplified view of how the user interface, frontend extension logic, and backend service interact:

```mermaid
graph TD
    subgraph User Interface
        JL[JupyterLab Shell] --> SW[SimpleSidebarWidget]
        SW --> CCT[CellContextTracker]
        SW --> PMM[PopupMenuManager]
        SW --> NB[Notebook Interaction]
        CCT --> ActiveCell[Active Cell]
        PMM --> Files[File System]
        NB --> ActiveCell
    end

    subgraph Frontend Extension Logic
        SW --> MH[MessageHandler]
        SW --> IH[InputHandler]
        SW --> UI[UIManager]
        MH --> AC[ApiClient]
        IH --> PMM
        UI --> SW
    end

    subgraph Backend Service
        BE[main.py]
        BE --> RespStream[Response Stream]
        BE --> StaticImg[Static Images]
    end

    %% Interactions
    AC -->|POST /chat| BE
    BE -->|StreamingResponse| AC
    UI -->|GET /images| StaticImg

    style BE fill:#f9f,stroke:#333,stroke-width:2px
    style SW fill:#ccf,stroke:#333,stroke-width:2px
```

## Detailed Documentation

### Backend

-   [`backend/src/main.py`](./backend_main.md)

### Frontend (`jupyter-lab-extension/src/`)

**Top Level:**
-   [`index.ts`](./frontend_index.md) (Entry Point)
-   [`sidebar-widget.ts`](./frontend_sidebar_widget.md) (Main Widget)
-   [`commands.ts`](./frontend_commands.md)
-   [`cell-context-tracker.ts`](./frontend_cell_context_tracker.md)
-   [`types.ts`](./frontend_types.md)

**Core (`core/`):**
-   [`api-client.ts`](./frontend_core_api_client.md)
-   [`globals.ts`](./frontend_core_globals.md)
-   [`icons.ts`](./frontend_core_icons.md)

**Handlers (`handlers/`):**
-   [`history-handler.ts`](./frontend_handlers_history_handler.md)
-   [`input-handler.ts`](./frontend_handlers_input_handler.md)
-   [`message-handler.ts`](./frontend_handlers_message_handler.md)
-   [`popup-menu-manager.ts`](./frontend_handlers_popup_menu_manager.md)
-   [`settings-handler.ts`](./frontend_handlers_settings_handler.md)
-   [`shortcut-handler.ts`](./frontend_handlers_shortcut_handler.md)

**State (`state/`):**
-   [`chat-state.ts`](./frontend_state_chat_state.md)
-   [`settings-state.ts`](./frontend_state_settings_state.md)

**UI (`ui/`):**
-   [`code-ref-widget.ts`](./frontend_ui_code_ref_widget.md)
-   [`dom-elements.ts`](./frontend_ui_dom_elements.md)
-   [`layout-builder.ts`](./frontend_ui_layout_builder.md)
-   [`message-renderer.ts`](./frontend_ui_message_renderer.md)
-   [`settings-modal.ts`](./frontend_ui_settings_modal.md)
-   [`ui-manager.ts`](./frontend_ui_ui_manager.md)

**Utils (`utils/`):**
-   [`clipboard.ts`](./frontend_utils_clipboard.md)
-   [`highlighting.ts`](./frontend_utils_highlighting.md)
-   [`markdown-config.ts`](./frontend_utils_markdown_config.md)
-   [`notebook-integration.ts`](./frontend_utils_notebook_integration.md) 