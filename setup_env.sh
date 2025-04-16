#!/bin/bash
# Setup script for creating a Python environment with uv for the Jupyter LLM Extension

# Check if uv is installed
if ! command -v uv &> /dev/null
then
    echo "uv is not installed. Installing uv..."
    pip install uv
fi

# Create a virtual environment
echo "Creating virtual environment with uv..."
uv venv .venv

# Activate the virtual environment
echo "Activating virtual environment..."
if [ -f ".venv/bin/activate" ]; then
    source .venv/bin/activate
else
    echo "Failed to find activation script."
    exit 1
fi

# Install dependencies using Tsinghua mirror
echo "Installing dependencies from Tsinghua mirror..."
uv pip install -r requirements.txt --index-url https://mirrors.tuna.tsinghua.edu.cn/pypi/web/simple

# Install development dependencies
echo "Installing development dependencies from Tsinghua mirror..."
uv pip install pytest httpx --index-url https://mirrors.tuna.tsinghua.edu.cn/pypi/web/simple

# Install the package in development mode
echo "Installing package in development mode..."
uv pip install -e . --index-url https://mirrors.tuna.tsinghua.edu.cn/pypi/web/simple

echo "Environment setup complete. Activate it with:"
echo "source .venv/bin/activate" 