#!/usr/bin/env python
"""
Launch script for the Jupyter LLM Extension.

This script launches both Jupyter Lab/Notebook and the sidecar application.
"""

import os
import sys
import time
import subprocess
import argparse
import webbrowser
import logging
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def launch_jupyter(jupyter_type="lab", port=8888):
    """
    Launch Jupyter Lab or Notebook.
    
    Args:
        jupyter_type: 'lab' or 'notebook'
        port: Port to run Jupyter on
    
    Returns:
        The process object
    """
    cmd = ["jupyter", jupyter_type, f"--port={port}"]
    logger.info(f"Launching Jupyter {jupyter_type} on port {port}")
    
    # Start process in the background
    process = subprocess.Popen(
        cmd, 
        stdout=subprocess.PIPE, 
        stderr=subprocess.PIPE,
        universal_newlines=True
    )
    
    # Wait for Jupyter to start
    time.sleep(2)
    
    if process.poll() is not None:
        # Process terminated early
        stdout, stderr = process.communicate()
        logger.error(f"Failed to start Jupyter {jupyter_type}:")
        logger.error(f"STDOUT: {stdout}")
        logger.error(f"STDERR: {stderr}")
        sys.exit(1)
    
    return process

def launch_sidecar(port=8000):
    """
    Launch the sidecar application.
    
    Args:
        port: Port to run the sidecar on
    
    Returns:
        The process object
    """
    # Get the path to the backend app.py file
    backend_dir = Path(__file__).parent / "backend" / "src"
    app_path = backend_dir / "app.py"
    
    if not app_path.exists():
        logger.error(f"Cannot find backend app at {app_path}")
        sys.exit(1)
    
    cmd = [sys.executable, str(app_path)]
    logger.info(f"Launching sidecar application on port {port}")
    
    # Start process in the background
    process = subprocess.Popen(
        cmd, 
        stdout=subprocess.PIPE, 
        stderr=subprocess.PIPE,
        universal_newlines=True
    )
    
    # Wait for the sidecar to start
    time.sleep(2)
    
    if process.poll() is not None:
        # Process terminated early
        stdout, stderr = process.communicate()
        logger.error("Failed to start sidecar application:")
        logger.error(f"STDOUT: {stdout}")
        logger.error(f"STDERR: {stderr}")
        sys.exit(1)
    
    return process

def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="Launch Jupyter LLM Extension")
    parser.add_argument(
        "--jupyter", 
        choices=["lab", "notebook"], 
        default="lab",
        help="Type of Jupyter interface to launch (default: lab)"
    )
    parser.add_argument(
        "--jupyter-port", 
        type=int, 
        default=8888,
        help="Port for Jupyter (default: 8888)"
    )
    parser.add_argument(
        "--sidecar-port", 
        type=int, 
        default=8000,
        help="Port for sidecar application (default: 8000)"
    )
    parser.add_argument(
        "--no-browser", 
        action="store_true",
        help="Don't open a browser automatically"
    )
    
    args = parser.parse_args()
    
    # Launch Jupyter
    jupyter_process = launch_jupyter(args.jupyter, args.jupyter_port)
    
    # Launch sidecar
    sidecar_process = launch_sidecar(args.sidecar_port)
    
    # Open browser
    if not args.no_browser:
        webbrowser.open(f"http://localhost:{args.jupyter_port}")
    
    logger.info("Both Jupyter and the sidecar application are running.")
    logger.info(f"Jupyter is available at http://localhost:{args.jupyter_port}")
    logger.info(f"Sidecar API is available at http://localhost:{args.sidecar_port}")
    logger.info("Press Ctrl+C to terminate both services.")
    
    try:
        # Keep the script running until killed
        jupyter_process.wait()
    except KeyboardInterrupt:
        logger.info("Terminating services...")
        jupyter_process.terminate()
        sidecar_process.terminate()
    
    logger.info("Services terminated.")

if __name__ == "__main__":
    main() 