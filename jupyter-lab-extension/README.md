# Jupyter AI Assistant Extension

A modular JupyterLab extension that provides an AI chat interface with cell context tracking.

## Features

- Chat interface with markdown support
- Cell context tracking
- Directory listing
- Modular architecture for extensibility

## Project Structure

The extension is organized into modular components:

```
jupyter-lab-extension/
├── src/
│   ├── index.ts               # Main entry point
│   ├── icons.ts               # Icon definitions
│   ├── types.ts               # Type definitions
│   ├── globals.ts             # Global state management
│   ├── cell-context-tracker.ts # Cell context tracking
│   ├── sidebar-widget.ts      # Chat sidebar UI
│   └── commands.ts            # Command registrations
├── style/
│   └── index.css              # Stylesheet
└── package.json               # Package configuration
```

## Development

### Installation

```bash
# Install dependencies
jlpm

# Build the extension
jlpm build

# Install the extension for development
jupyter labextension install . --no-build

# Watch source for changes
jlpm watch
```

### Building

```bash
# Build the extension
jlpm build

# Rebuild on changes
jlpm watch
```

## Extension Points

The modular architecture allows for easy extension:

1. `globals.ts` - Shared state across components
2. `cell-context-tracker.ts` - Tracks cell content and cursor position
3. `sidebar-widget.ts` - Main UI component

To add a new feature, create a dedicated module and integrate it with the existing components.

## Backend Integration

This extension is designed to connect to a FastAPI backend service for LLM integration, as described in PROJECT.md. Future work will include:

1. API client module for backend communication
2. Sidecar kernel execution
3. LLM-powered code assistance 