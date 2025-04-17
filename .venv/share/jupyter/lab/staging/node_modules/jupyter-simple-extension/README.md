# jupyter-simple-extension

A simple JupyterLab extension that adds a launcher item. When clicked, it displays a dialog with a greeting message.

## Prerequisites

* JupyterLab >= 4.0.0

## Installation

```bash
pip install jupyter-simple-extension
```

## Development

### Development install

Note: You will need NodeJS to build the extension package.

```bash
# Clone the repo to your local environment
# Install package in development mode
pip install -e .

# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite

# Rebuild extension Typescript source after making changes
jlpm run build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to see your changes reflected in JupyterLab automatically:

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm run watch
```

```bash
# Run JupyterLab in another terminal
jupyter lab
```

### Uninstall

```bash
pip uninstall jupyter-simple-extension
``` 