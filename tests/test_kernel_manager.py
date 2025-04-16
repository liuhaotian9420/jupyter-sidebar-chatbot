"""
Tests for the kernel_manager module.
"""

import unittest
from unittest.mock import MagicMock, patch
import sys
import os

# Add the src directory to the path so we can import the module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend/src')))

from kernel_manager import LLMExtKernelManager

class TestLLMExtKernelManager(unittest.TestCase):
    """Test cases for the LLMExtKernelManager class."""
    
    @patch('kernel_manager.KernelManager')
    def test_initialization(self, mock_kernel_manager):
        """Test that the kernel manager is initialized correctly."""
        # Setup mock
        mock_instance = mock_kernel_manager.return_value
        mock_instance.client.return_value = MagicMock()
        
        # Initialize the kernel manager
        km = LLMExtKernelManager(kernel_name="python3")
        
        # Assert the kernel manager was created with the correct kernel name
        mock_kernel_manager.assert_called_once_with(kernel_name="python3")
        
        # Assert that the kernel was started
        mock_instance.start_kernel.assert_called_once()
        
        # Assert that the client was obtained and started
        mock_instance.client.assert_called_once()
        mock_instance.client.return_value.start_channels.assert_called_once()
    
    @patch('kernel_manager.KernelManager')
    def test_execute_code_success(self, mock_kernel_manager):
        """Test that code execution works correctly."""
        # Setup mocks
        mock_instance = mock_kernel_manager.return_value
        mock_client = MagicMock()
        mock_instance.client.return_value = mock_client
        
        # Setup mock responses for get_iopub_msg
        mock_client.get_iopub_msg.side_effect = [
            {
                'header': {'msg_type': 'stream'},
                'content': {'name': 'stdout', 'text': 'Hello, world!'}
            },
            {
                'header': {'msg_type': 'execute_result'},
                'content': {'data': {'text/plain': '42'}}
            },
            {
                'header': {'msg_type': 'status'},
                'content': {'execution_state': 'idle'}
            }
        ]
        
        # Initialize the kernel manager
        km = LLMExtKernelManager(kernel_name="python3")
        
        # Execute code
        result = km.execute_code('print("Hello, world!")\n42')
        
        # Assert that execute was called with the correct code
        mock_client.execute.assert_called_once_with('print("Hello, world!")\n42')
        
        # Assert the result contains the expected values
        self.assertEqual(result['status'], 'success')
        self.assertEqual(result['stdout'], 'Hello, world!\n42')
        self.assertEqual(result['stderr'], '')
        self.assertEqual(result['result'], '42')
    
    @patch('kernel_manager.KernelManager')
    def test_execute_code_error(self, mock_kernel_manager):
        """Test that code execution handles errors correctly."""
        # Setup mocks
        mock_instance = mock_kernel_manager.return_value
        mock_client = MagicMock()
        mock_instance.client.return_value = mock_client
        
        # Setup mock responses for get_iopub_msg
        mock_client.get_iopub_msg.side_effect = [
            {
                'header': {'msg_type': 'error'},
                'content': {'traceback': ['Traceback...', 'NameError: name "undefined_var" is not defined']}
            },
            {
                'header': {'msg_type': 'status'},
                'content': {'execution_state': 'idle'}
            }
        ]
        
        # Initialize the kernel manager
        km = LLMExtKernelManager(kernel_name="python3")
        
        # Execute code
        result = km.execute_code('print(undefined_var)')
        
        # Assert that execute was called with the correct code
        mock_client.execute.assert_called_once_with('print(undefined_var)')
        
        # Assert the result contains the expected values
        self.assertEqual(result['status'], 'error')
        self.assertEqual(result['stdout'], '')
        self.assertEqual(result['stderr'], 'Traceback...\nNameError: name "undefined_var" is not defined')
        self.assertIsNone(result['result'])
    
    @patch('kernel_manager.KernelManager')
    def test_shutdown(self, mock_kernel_manager):
        """Test that the kernel is shutdown correctly."""
        # Setup mocks
        mock_instance = mock_kernel_manager.return_value
        mock_client = MagicMock()
        mock_instance.client.return_value = mock_client
        
        # Initialize the kernel manager
        km = LLMExtKernelManager(kernel_name="python3")
        
        # Shutdown the kernel
        km.shutdown()
        
        # Assert that the client channels were stopped
        mock_client.stop_channels.assert_called_once()
        
        # Assert that the kernel was shutdown
        mock_instance.shutdown_kernel.assert_called_once()
    
    @patch('kernel_manager.KernelSpecManager')
    def test_list_available_kernels(self, mock_kernel_spec_manager):
        """Test that listing available kernels works correctly."""
        # Setup mock
        mock_instance = mock_kernel_spec_manager.return_value
        mock_instance.get_all_specs.return_value = {'python3': {}}
        
        # List available kernels
        kernels = LLMExtKernelManager.list_available_kernels()
        
        # Assert that get_all_specs was called
        mock_instance.get_all_specs.assert_called_once()
        
        # Assert the result contains the expected values
        self.assertEqual(kernels, {'python3': {}})

if __name__ == '__main__':
    unittest.main() 