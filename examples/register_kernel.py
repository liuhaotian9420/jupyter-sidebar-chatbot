import os
import json
import sys
import shutil
from pathlib import Path

def register_kernel():
    """Register the sample kernel with Jupyter."""
    # Get the Jupyter data directory
    try:
        import jupyter_core.paths as jupyter_paths
        jupyter_data_dir = jupyter_paths.jupyter_data_dir()
    except ImportError:
        print("Error: jupyter_core package is required")
        return False
    
    # Source kernel directory
    src_kernel_dir = os.path.join(os.getcwd(), "examples", "kernels", "sample_kernel")
    
    # Create the destination directory
    kernels_dir = os.path.join(jupyter_data_dir, "kernels")
    dest_kernel_dir = os.path.join(kernels_dir, "sample_kernel")
    
    # Make sure the kernels directory exists
    os.makedirs(kernels_dir, exist_ok=True)
    
    # If destination exists, remove it
    if os.path.exists(dest_kernel_dir):
        shutil.rmtree(dest_kernel_dir)
    
    # Create the destination directory
    os.makedirs(dest_kernel_dir, exist_ok=True)
    
    # Copy the kernel.json file
    shutil.copy(os.path.join(src_kernel_dir, "kernel.json"), os.path.join(dest_kernel_dir, "kernel.json"))
    
    print(f"Kernel registered at: {dest_kernel_dir}")
    return True

if __name__ == "__main__":
    success = register_kernel()
    if success:
        print("Kernel registration successful!")
        print("You can now run Jupyter Kernel Gateway with:")
        print("jupyter kernelgateway --KernelGatewayApp.api=kernel_gateway.notebook_http --KernelGatewayApp.seed_uri=examples/sample_notebook.ipynb --port=10100")
    else:
        print("Kernel registration failed.")
        sys.exit(1) 