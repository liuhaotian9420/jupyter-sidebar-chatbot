"""
Kernel Manager Module

This module handles the management of IPython kernels using jupyter_client.
It provides functionality to start, stop, and interact with kernels.
"""

import os
import json
import logging
from typing import Dict, Any, Optional, Tuple

from jupyter_client import KernelManager
from jupyter_client.kernelspec import KernelSpecManager

logger = logging.getLogger(__name__)

class LLMExtKernelManager:
    """
    Manager class for handling IPython kernels for the LLM extension.
    
    This class provides methods to start, stop, and interact with 
    kernels for code execution in an isolated environment.
    """
    
    def __init__(self, kernel_name: str = "python3"):
        """
        Initialize the kernel manager
        
        Args:
            kernel_name: Name of the kernel to use
        """
        self.kernel_name = kernel_name
        self.kernel_manager = None
        self.kernel_client = None
        self._initialize_kernel()
    
    def _initialize_kernel(self) -> None:
        """Initialize the kernel manager and client"""
        try:
            # Create kernel manager
            self.kernel_manager = KernelManager(kernel_name=self.kernel_name)
            self.kernel_manager.start_kernel()
            
            # Get kernel client
            self.kernel_client = self.kernel_manager.client()
            self.kernel_client.start_channels()
            
            logger.info(f"Kernel {self.kernel_name} started successfully")
        except Exception as e:
            logger.error(f"Failed to start kernel: {str(e)}")
            raise
    
    def execute_code(self, code: str) -> Dict[str, Any]:
        """
        Execute code in the kernel
        
        Args:
            code: Python code to execute
            
        Returns:
            Dictionary containing execution results
        """
        if not self.kernel_client:
            raise RuntimeError("Kernel client not initialized")
            
        # Send code for execution
        msg_id = self.kernel_client.execute(code)
        
        # Collect outputs
        outputs = []
        errors = []
        
        while True:
            try:
                msg = self.kernel_client.get_iopub_msg(timeout=10)
                msg_type = msg['header']['msg_type']
                content = msg['content']
                
                if msg_type == 'execute_result':
                    outputs.append(content['data'].get('text/plain', ''))
                elif msg_type == 'display_data':
                    outputs.append(content['data'].get('text/plain', ''))
                elif msg_type == 'stream':
                    if content['name'] == 'stdout':
                        outputs.append(content['text'])
                    elif content['name'] == 'stderr':
                        errors.append(content['text'])
                elif msg_type == 'error':
                    errors.append('\n'.join(content['traceback']))
                
                # Check if execution is complete
                if msg_type == 'status' and content['execution_state'] == 'idle':
                    break
                    
            except Exception as e:
                logger.error(f"Error while getting kernel message: {str(e)}")
                break
        
        return {
            "status": "error" if errors else "success",
            "stdout": '\n'.join(outputs),
            "stderr": '\n'.join(errors),
            "result": outputs[-1] if outputs else None
        }
    
    def shutdown(self) -> None:
        """Shutdown the kernel"""
        if self.kernel_client:
            self.kernel_client.stop_channels()
        
        if self.kernel_manager:
            self.kernel_manager.shutdown_kernel()
            logger.info("Kernel shut down")
    
    def __del__(self):
        """Clean up resources when object is destroyed"""
        self.shutdown()
        
    @staticmethod
    def list_available_kernels() -> Dict[str, Any]:
        """
        List all available kernels in the system
        
        Returns:
            Dictionary of available kernels and their specs
        """
        kernel_spec_manager = KernelSpecManager()
        return kernel_spec_manager.get_all_specs() 