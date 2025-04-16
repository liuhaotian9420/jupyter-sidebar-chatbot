# Setup script for creating a Python environment with uv for the Jupyter LLM Extension

# Check if uv is installed
if (-not (Get-Command "uv" -ErrorAction SilentlyContinue)) {
    Write-Host "uv is not installed. Installing uv..."
    pip install uv
}

# Create a virtual environment
Write-Host "Creating virtual environment with uv..."
uv venv .venv

# Activate the virtual environment
Write-Host "Activating virtual environment..."
if (Test-Path ".venv\Scripts\Activate.ps1") {
    & .venv\Scripts\Activate.ps1
} else {
    Write-Host "Failed to find activation script."
    exit 1
}

# Install dependencies using Tsinghua mirror
Write-Host "Installing dependencies from Tsinghua mirror..."
uv pip install -r requirements.txt --index-url https://mirrors.tuna.tsinghua.edu.cn/pypi/web/simple

# Install development dependencies
Write-Host "Installing development dependencies from Tsinghua mirror..."
uv pip install pytest httpx --index-url https://mirrors.tuna.tsinghua.edu.cn/pypi/web/simple

# Install the package in development mode
Write-Host "Installing package in development mode..."
uv pip install -e . --index-url https://mirrors.tuna.tsinghua.edu.cn/pypi/web/simple

Write-Host "Environment setup complete. Activate it with:"
Write-Host ".venv\Scripts\Activate.ps1" 